import type { Locale } from "@/lib/i18n";
import { premiumTierHeader } from "@/lib/premium/tier";
import { authHeaders } from "@/lib/storage/authSession";
import { syncUsageFromServer } from "@/lib/premium/usage";
import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import { localizeMealPlanForLocale } from "@/lib/nutrition/localizeMealPlan";
import {
  AI_UNAVAILABLE_CODE,
  classifyMealPlanStatus,
  isAbortError,
  isNetworkError,
  isTimeoutError,
  leaksProviderDetail,
  looksLikeHtmlError,
  mealPlanErrorAction,
  mealPlanErrorMessage,
  mealPlanKindFromCode,
  type MealPlanErrorKind
} from "@/lib/nutrition/aiUnavailable";

export type GenerateMealPlanRequest = {
  profile: PregnancyProfile;
  locale?: Locale;
  regenerate?: { day: number; mealSlot: keyof MealPlan["days"][number]; existingPlan: MealPlan };
  turnstileToken?: string;
};

export type AiQuotaScope = "device" | "ip" | "account";

export type GenerateMealPlanResponse =
  | { plan: MealPlan; usage?: { aiPlansUsed?: number; aiPlansLimit?: number; mealSwapsUsed?: number; mealSwapsLimit?: number } }
  | {
      error: string;
      code?: string;
      scope?: AiQuotaScope;
      usage?: { aiPlansUsed?: number; aiPlansLimit?: number; mealSwapsUsed?: number; mealSwapsLimit?: number };
    };

export class MealPlanRequestError extends Error {
  readonly kind: MealPlanErrorKind;
  readonly action: "ai" | "retry" | "recheck";

  constructor(locale: Locale, kind: MealPlanErrorKind) {
    super(mealPlanErrorMessage(locale, kind));
    this.name = "MealPlanRequestError";
    this.kind = kind;
    this.action = mealPlanErrorAction(kind);
  }
}

export class MealPlanAiError extends MealPlanRequestError {
  readonly code = AI_UNAVAILABLE_CODE;

  constructor(locale: Locale) {
    super(locale, "ai");
    this.name = "MealPlanAiError";
  }
}

function failureFor(locale: Locale, kind: MealPlanErrorKind) {
  return kind === "ai" ? new MealPlanAiError(locale) : new MealPlanRequestError(locale, kind);
}

export function mealSwapErrorMessage(locale: Locale): string {
  return locale === "vi" ? "Không đổi được món. Hãy thử lại." : "Could not swap meal";
}

export class MealSwapError extends Error {
  /** Client errors are shown as-is. Transport failures may still use a local swap. */
  readonly allowLocalFallback: boolean;

  constructor(locale: Locale, allowLocalFallback = false) {
    super(mealSwapErrorMessage(locale));
    this.name = "MealSwapError";
    this.allowLocalFallback = allowLocalFallback;
  }
}

function swapFailure(locale: Locale, allowLocalFallback = false) {
  return new MealSwapError(locale, allowLocalFallback);
}

function usageHeaders() {
  return {
    ...premiumTierHeader(),
    ...authHeaders()
  };
}

function parseMealPlanBody(raw: string): GenerateMealPlanResponse | null {
  if (!raw.trim() || looksLikeHtmlError(raw)) return null;
  try {
    return JSON.parse(raw) as GenerateMealPlanResponse;
  } catch {
    return null;
  }
}

async function postGenerateMealPlan(body: GenerateMealPlanRequest): Promise<{ status: number; data: GenerateMealPlanResponse }> {
  const locale = body.locale ?? "vi";
  const response = await fetch("/api/generate-meal-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": locale,
      ...usageHeaders()
    },
    body: JSON.stringify(body)
  });
  const raw = await response.text();
  const data = parseMealPlanBody(raw);
  if (!response.ok || !data || looksLikeHtmlError(raw) || !("plan" in data)) {
    const status = !response.ok ? response.status : 502;
    const kind =
      mealPlanKindFromCode(data && "code" in data ? data.code : undefined) ??
      (looksLikeHtmlError(raw) && status >= 500 && status !== 502 ? "server" : classifyMealPlanStatus(status));
    const usage = data && "usage" in data ? data.usage : undefined;
    const original = data && "error" in data && typeof data.error === "string" ? data.error : undefined;
    const scope = data && "scope" in data && (data.scope === "device" || data.scope === "ip" || data.scope === "account") ? data.scope : undefined;
    const keepUsageMessage =
      status === 429 && Boolean(usage) && Boolean(original) && !looksLikeHtmlError(original) && !leaksProviderDetail(original);
    return {
      status,
      data: {
        error: keepUsageMessage && original ? original : mealPlanErrorMessage(locale, kind),
        code: kind === "ai" ? AI_UNAVAILABLE_CODE : kind,
        ...(scope ? { scope } : {}),
        usage
      }
    };
  }
  return { status: response.status, data };
}

function isPremiumLimitResponse(status: number, data: GenerateMealPlanResponse) {
  return status === 429 && "usage" in data && Boolean(data.usage);
}

function applyUsageFromResponse(data: GenerateMealPlanResponse) {
  if (!("usage" in data) || !data.usage) return;
  syncUsageFromServer({
    aiPlansUsed: data.usage.aiPlansUsed,
    mealSwapsUsed: data.usage.mealSwapsUsed
  });
}

export class PremiumLimitError extends Error {
  readonly scope?: AiQuotaScope;

  constructor(message: string, scope?: AiQuotaScope) {
    super(message);
    this.name = "PremiumLimitError";
    this.scope = scope;
  }
}

/** Client helper: API first with one retry, then local rule-based fallback for a complete plan only. */
export async function fetchMealPlan(
  profile: PregnancyProfile,
  locale: Locale = "vi",
  options?: {
    regenerate?: { day: number; mealSlot: keyof MealPlan["days"][number]; existingPlan: MealPlan };
    turnstileToken?: string;
  }
): Promise<MealPlan> {
  const body: GenerateMealPlanRequest = {
    profile,
    locale,
    turnstileToken: options?.turnstileToken
  };
  if (options?.regenerate) {
    body.regenerate = options.regenerate;
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { status, data } = await postGenerateMealPlan(body);

      if ("plan" in data) {
        applyUsageFromResponse(data);
        return localizeMealPlanForLocale(data.plan, locale);
      }

      applyUsageFromResponse(data);

      if (isPremiumLimitResponse(status, data)) {
        const message = "error" in data && typeof data.error === "string" && data.error.trim() ? data.error : "Daily limit reached";
        const scope = "scope" in data && (data.scope === "device" || data.scope === "ip" || data.scope === "account") ? data.scope : undefined;
        throw new PremiumLimitError(message, scope);
      }

      const kind =
        ("code" in data ? mealPlanKindFromCode(data.code) : null) ?? classifyMealPlanStatus(status);
      const retryable = kind === "server" || kind === "ai";
      const swapFailFast = kind === "invalid" || kind === "turnstile" || kind === "rate_limit";
      if (options?.regenerate) {
        if (swapFailFast) throw swapFailure(locale);
        if (attempt === 1) throw swapFailure(locale, true);
      } else if (!retryable || attempt === 1) {
        throw failureFor(locale, kind);
      }
    } catch (error) {
      if (error instanceof PremiumLimitError || error instanceof MealPlanRequestError || error instanceof MealSwapError) {
        throw error;
      }
      if (isTimeoutError(error) || isNetworkError(error)) {
        if (attempt === 1) {
          throw options?.regenerate ? swapFailure(locale, true) : failureFor(locale, "ai");
        }
      } else if (isAbortError(error)) {
        throw options?.regenerate ? swapFailure(locale) : failureFor(locale, "aborted");
      } else if (attempt === 1) {
        throw options?.regenerate ? swapFailure(locale, true) : failureFor(locale, "server");
      }
    }
  }

  if (options?.regenerate) {
    throw swapFailure(locale, true);
  }

  return localizeMealPlanForLocale(ruleBasedMealPlanner(profile, locale), locale);
}

/** Local plan without calling the API (does not consume daily API quota). */
export function createLocalMealPlan(profile: PregnancyProfile, locale: Locale = "vi") {
  return localizeMealPlanForLocale(ruleBasedMealPlanner(profile, locale), locale);
}
