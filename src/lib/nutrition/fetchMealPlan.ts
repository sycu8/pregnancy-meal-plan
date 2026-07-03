import type { Locale } from "@/lib/i18n";
import { getUsageDateKey } from "@/lib/premium/dateKey";
import { premiumTierHeader } from "@/lib/premium/tier";
import { authHeaders } from "@/lib/storage/authSession";
import { syncUsageFromServer } from "@/lib/premium/usage";
import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";

export type GenerateMealPlanRequest = {
  profile: PregnancyProfile;
  locale?: Locale;
  regenerate?: { day: number; mealSlot: keyof MealPlan["days"][number]; existingPlan: MealPlan };
  turnstileToken?: string;
};

export type GenerateMealPlanResponse =
  | { plan: MealPlan; usage?: { aiPlansUsed?: number; aiPlansLimit?: number; mealSwapsUsed?: number; mealSwapsLimit?: number } }
  | { error: string; usage?: { aiPlansUsed?: number; aiPlansLimit?: number; mealSwapsUsed?: number; mealSwapsLimit?: number } };

function usageHeaders() {
  return {
    ...premiumTierHeader(),
    ...authHeaders(),
    "x-usage-date": getUsageDateKey()
  };
}

async function postGenerateMealPlan(body: GenerateMealPlanRequest): Promise<{ status: number; data: GenerateMealPlanResponse }> {
  const response = await fetch("/api/generate-meal-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": body.locale ?? "vi",
      ...usageHeaders()
    },
    body: JSON.stringify(body)
  });
  const data = (await response.json()) as GenerateMealPlanResponse;
  if (!response.ok) {
    return {
      status: response.status,
      data: { error: "error" in data ? data.error : "Request failed", usage: "usage" in data ? data.usage : undefined }
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
        return data.plan;
      }

      applyUsageFromResponse(data);

      if (isPremiumLimitResponse(status, data)) {
        if (options?.regenerate) {
          throw new PremiumLimitError("error" in data ? data.error : "Daily limit reached");
        }
        return ruleBasedMealPlanner(profile, locale);
      }

      if (attempt === 1) {
        throw new Error("error" in data ? data.error : "Request failed");
      }
    } catch (error) {
      if (error instanceof PremiumLimitError) {
        throw error;
      }
      if (error instanceof Error && attempt === 1) {
        throw error;
      }
      if (attempt === 1) break;
    }
  }

  if (options?.regenerate) {
    throw new Error("Could not swap meal");
  }

  return ruleBasedMealPlanner(profile, locale);
}

/** Full plan without calling the API (does not consume daily API quota). */
export function createLocalMealPlan(profile: PregnancyProfile, locale: Locale = "vi") {
  return ruleBasedMealPlanner(profile, locale);
}
