import type { PregnancyProfile } from "@/types/pregnancy";

/**
 * Meal-plan prompts are authored in English first, then localized for Vietnamese UI.
 * specialNotes should be returned in the requested locale.
 */
export function buildMealPlanPrompt(profile: PregnancyProfile): string {
  return [
    "You are a pregnancy nutrition reference assistant.",
    "Draft English-first guidance for a 7-day Vietnamese-style pregnancy meal plan, then adapt wording to the requested locale.",
    "Stay safety-focused and do not provide medical diagnoses.",
    "Use only the profile fields below:",
    JSON.stringify({
      residenceCountry: profile.residenceCountry ?? "VN",
      pregnancyWeek: profile.pregnancyWeek,
      pregnancyType: profile.pregnancyType,
      healthConditions: profile.healthConditions,
      cuisinePreferences: profile.cuisinePreferences,
      budget: profile.budget,
      cookingTime: profile.cookingTime,
      goals: profile.goals,
      allergies: profile.allergies,
      dislikedFoods: profile.dislikedFoods
    })
  ].join("\n");
}
