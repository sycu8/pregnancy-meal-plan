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
  aiUnavailableMessage,
  clientVisibleMealPlanError,
  leaksProviderDetail,
  looksLikeHtmlError
} from "@/lib/nutrition/aiUnavailable";

export type GenerateMealPlanRequest = {
  profile: PregnancyProfile;
  locale?: Locale;
  regenerate?: { day: number; mealSlot: keyof MealPlan["days"][number]; existingPlan: MealPlan };
  turnstileToken?: string;
};

export type GenerateMealPlanResponse =
  | { plan: MealPlan; usage?: { aiPlansUsed?: number; aiPlansLimit?: number; mealSwapsUsed?: number; mealSwapsLimit?: number } }
  | {
      error: string;
      code?: string;
      usage?: { aiPlansUsed?: number; aiPlansLimit?: number; mealSwapsUsed?: number; mealSwapsLimit?: number };
    };

export class MealPlanAiError extends Error {
  readonly code = AI_UNAVAILABLE_CODE;

  constructor(locale: Locale) {
    super(aiUnavailableMessage(locale));
    this.name = "MealPlanAiError";
  }
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
  if (!data || looksLikeHtmlError(raw)) {
    return {
      status: response.ok ? 502 : response.status,
      data: { error: aiUnavailableMessage(locale), code: AI_UNAVAILABLE_CODE }
    };
  }
  if (!response.ok) {
    const usage = "usage" in data ? data.usage : undefined;
    const rawError = "error" in data ? data.error : undefined;
    return {
      status: response.status,
      data: {
        error: clientVisibleMealPlanError(locale, rawError, response.status),
        code: "code" in data && data.code ? data.code : response.status === 502 ? AI_UNAVAILABLE_CODE : undefined,
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
  constructor(message: string) {
    super(message);
    this.name = "PremiumLimitError";
  }
}

/** Client helper: API first with one retry, then local rule-based fallback for full plans only. */
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
        if (options?.regenerate) {
          throw new PremiumLimitError("error" in data ? data.error : "Daily limit reached");
        }
        return localizeMealPlanForLocale(ruleBasedMealPlanner(profile, locale), locale);
      }

      if (attempt === 1) {
        const rawError = "error" in data ? data.error : undefined;
        const unavailable =
          status === 502 ||
          ("code" in data && data.code === AI_UNAVAILABLE_CODE) ||
          looksLikeHtmlError(rawError);
        if (unavailable && !options?.regenerate) {
          throw new MealPlanAiError(locale);
        }
        throw new Error(
          options?.regenerate
            ? locale === "vi"
              ? "Không đổi được món. Hãy thử lại."
              : "Could not swap meal"
            : clientVisibleMealPlanError(locale, rawError, status)
        );
      }
    } catch (error) {
      if (error instanceof PremiumLimitError || error instanceof MealPlanAiError) {
        throw error;
      }
      if (attempt === 1) {
        const raw = error instanceof Error ? error.message : "";
        if (!options?.regenerate && (error instanceof TypeError || looksLikeHtmlError(raw) || leaksProviderDetail(raw))) {
          throw new MealPlanAiError(locale);
        }
        if (error instanceof Error) throw error;
        break;
      }
    }
  }

  if (options?.regenerate) {
    throw new Error(locale === "vi" ? "Không đổi được món. Hãy thử lại." : "Could not swap meal");
  }

  return localizeMealPlanForLocale(ruleBasedMealPlanner(profile, locale), locale);
}

/** Full plan without calling the API (does not consume daily API quota). */
export function createLocalMealPlan(profile: PregnancyProfile, locale: Locale = "vi") {
  return localizeMealPlanForLocale(ruleBasedMealPlanner(profile, locale), locale);
}
