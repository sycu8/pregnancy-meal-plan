import type { Locale } from "@/lib/i18n";
import type { PregnancyProfile } from "@/types/pregnancy";

/**
 * Ask only for a few short notes. A prompt that requests a 7-day plan makes the
 * model write until max_tokens and the JSON comes back truncated.
 * specialNotes MUST match the requested locale — Vietnamese for locale=vi, English for locale=en.
 */
export function buildMealPlanPrompt(profile: PregnancyProfile, locale: Locale = "vi"): string {
  const language = locale === "vi" ? "Vietnamese" : "English";
  return [
    "You write short pregnancy nutrition notes. Do not write a meal plan, a menu, recipes, or a day-by-day schedule.",
    `Return exactly one JSON object and nothing else: {"specialNotes":["..."]}.`,
    `specialNotes must contain 3 to 5 short sentences in ${language} only.`,
    "Each note is one sentence. Do not provide medical diagnoses.",
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
