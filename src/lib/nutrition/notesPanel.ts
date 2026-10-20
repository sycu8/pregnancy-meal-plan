import type { PregnancyProfile } from "@/types/pregnancy";
import { getConditionSpecificWarnings } from "@/lib/nutrition/safetyRules";

export type NotesPanelKind = "conditions" | "general";

/**
 * General nutrition notes must not use the selected-conditions heading when
 * the profile has no condition and no condition warning. An empty list still
 * uses the conditions heading so the existing empty-state copy stays put.
 */
export function notesPanelKind(
  profile: Pick<PregnancyProfile, "healthConditions" | "goals">,
  noteCount: number
): NotesPanelKind {
  const selected = profile.healthConditions.some((condition) => condition !== "none");
  const warnings = getConditionSpecificWarnings(
    { healthConditions: profile.healthConditions, goals: profile.goals } as PregnancyProfile,
    "en"
  );
  if (!selected && warnings.length === 0 && noteCount > 0) return "general";
  return "conditions";
}
