import type { PregnancyProfile } from "@/types/pregnancy";

/**
 * Meal-plan prompts are authored in English first, then localized for Vietnamese UI.
 * specialNotes MUST match the requested locale — Vietnamese for locale=vi, English for locale=en.
 */
export function buildMealPlanPrompt(profile: PregnancyProfile): string {
  return [
    "You are a pregnancy nutrition reference assistant.",
    "Draft English-first guidance for a 7-day Vietnamese-style pregnancy meal plan, then translate the final wording to the requested locale.",
    "If Locale is vi, every specialNotes string MUST be written in Vietnamese (no English leftovers).",
    "If Locale is en, every specialNotes string MUST be written in English.",
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
