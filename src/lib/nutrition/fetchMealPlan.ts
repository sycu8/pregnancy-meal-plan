import type { Locale } from "@/lib/i18n";
import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";

export type GenerateMealPlanRequest = {
  profile: PregnancyProfile;
  locale?: Locale;
  regenerate?: { day: number; mealSlot: keyof MealPlan["days"][number]; existingPlan: MealPlan };
  turnstileToken?: string;
};

export type GenerateMealPlanResponse = { plan: MealPlan } | { error: string };

async function postGenerateMealPlan(body: GenerateMealPlanRequest): Promise<GenerateMealPlanResponse> {
  const response = await fetch("/api/generate-meal-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept-Language": body.locale ?? "vi" },
    body: JSON.stringify(body)
  });
  const data = (await response.json()) as GenerateMealPlanResponse;
  if (!response.ok) {
    return { error: "error" in data ? data.error : "Request failed" };
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
      if ("plan" in result) return result.plan;
      if (attempt === 0) continue;
      throw new Error(result.error);
    } catch {
      if (attempt === 1) break;
    }
  }

  return ruleBasedMealPlanner(profile, locale);
}
