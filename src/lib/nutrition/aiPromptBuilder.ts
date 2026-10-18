import type { Locale } from "@/lib/i18n";
import type { PregnancyProfile } from "@/types/pregnancy";

/**
 * Ask only for a few new notes. Pasting the safety panel or condition warnings
 * makes the model restate them. specialNotes MUST match the requested locale.
 */
export function buildMealPlanPrompt(profile: PregnancyProfile, locale: Locale = "vi"): string {
  const language = locale === "vi" ? "Vietnamese" : "English";
  return [
    "You write short pregnancy nutrition notes. Do not write a meal plan, a menu, recipes, or a day-by-day schedule.",
    'Return exactly one JSON object and nothing else: {"specialNotes":[{"text":"...","kind":"portion|swap|timing|prep|other","foods":["..."]}]}.',
    `specialNotes must contain 3 to 5 items in ${language} only.`,
    "Each text is one new practical sentence: a portion, a swap, a time of day, or a prep step.",
    "Do not restate food-safety rules, condition warnings, mercury or fish rules, or anything the app already tells the user.",
    "If you have no new practical note, return {\"specialNotes\":[]}.",
    "Do not provide medical diagnoses and do not tell the user to ask a clinician.",
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
