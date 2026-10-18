import type { Locale } from "@/lib/i18n";
import { NOTE_IDS } from "@/lib/nutrition/noteLibrary";
import type { PregnancyProfile } from "@/types/pregnancy";

/** The stored goal is a plate style. The model only sees that label, then picks ids. */
function goalsForPrompt(goals: readonly string[]): string[] {
  return goals.map((goal) => (goal === "weight_control" ? "plates with vegetables and lean protein" : goal));
}

function trimesterForPrompt(week: number): "first" | "second" | "third" {
  if (week <= 13) return "first";
  if (week <= 27) return "second";
  return "third";
}

/**
 * Ask only for library ids. The server renders the sentences.
 * Ingredient names are the only legal food slot.
 */
export function buildMealPlanPrompt(
  profile: PregnancyProfile,
  locale: Locale = "vi",
  ingredients: readonly string[] = []
): string {
  return [
    "You pick note ids. Do not write a meal plan, a menu, recipes, or sentences.",
    'Return exactly one JSON object and nothing else: {"notes":[{"id":"..."}]}.',
    "Choose 2 or 3 ids from this list:",
    NOTE_IDS.join(", "),
    'At most one object may include "food". Copy that food from this ingredient list and from nowhere else:',
    JSON.stringify(ingredients),
    "If no id fits, return {\"notes\":[]}.",
    "Do not add medical diagnoses and do not restate warnings already shown in the app.",
    "Use only the profile fields below:",
    JSON.stringify({
      locale,
      residenceCountry: profile.residenceCountry ?? "VN",
      pregnancyWeek: profile.pregnancyWeek,
      trimester: trimesterForPrompt(profile.pregnancyWeek),
      pregnancyType: profile.pregnancyType,
      healthConditions: profile.healthConditions,
      cuisinePreferences: profile.cuisinePreferences,
      budget: profile.budget,
      cookingTime: profile.cookingTime,
      goals: goalsForPrompt(profile.goals),
      allergies: profile.allergies,
      dislikedFoods: profile.dislikedFoods
    })
  ].join("\n");
}
