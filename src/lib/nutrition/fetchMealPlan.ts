import type { Locale } from "@/lib/i18n";
import { premiumTierHeader } from "@/lib/premium/tier";
import { recordAiPlanUsage, recordMealSwapUsage, syncUsageFromServer } from "@/lib/premium/usage";
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

async function postGenerateMealPlan(body: GenerateMealPlanRequest): Promise<GenerateMealPlanResponse> {
  const response = await fetch("/api/generate-meal-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": body.locale ?? "vi",
      ...premiumTierHeader()
    },
    body: JSON.stringify(body)
  });
  const data = (await response.json()) as GenerateMealPlanResponse;
  if (!response.ok) {
    return { error: "error" in data ? data.error : "Request failed", usage: "usage" in data ? data.usage : undefined };
  }
  return data;
}

/** Client helper: API first with one retry, then local rule-based fallback. */
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
      const result = await postGenerateMealPlan(body);
      if ("plan" in result) {
        if (result.usage) {
          syncUsageFromServer({
            aiPlansUsed: result.usage.aiPlansUsed,
            mealSwapsUsed: result.usage.mealSwapsUsed
          });
        } else if (options?.regenerate) {
          recordMealSwapUsage();
        } else {
          recordAiPlanUsage();
        }
        return result.plan;
      }

      if (result.usage) {
        syncUsageFromServer({
          aiPlansUsed: result.usage.aiPlansUsed,
          mealSwapsUsed: result.usage.mealSwapsUsed
        });
      }

      if (result.usage || attempt === 1) {
        throw new Error(result.error);
      }
    } catch (error) {
      if (error instanceof Error && (error.message.includes("lượt") || error.message.includes("limit") || error.message.includes("Daily"))) {
        throw error;
      }
      if (attempt === 1) break;
    }
  }

  if (options?.regenerate) {
    throw new Error("Could not swap meal");
  }

  recordAiPlanUsage();
  return ruleBasedMealPlanner(profile, locale);
}
