import type { Locale } from "@/lib/i18n";
import type { HealthCondition, PregnancyProfile } from "@/types/pregnancy";
import { getConditionSpecificWarnings, getGeneralPregnancyFoodWarnings } from "@/lib/nutrition/safetyRules";

const NEGATION =
  /\b(?:avoid|don't|do not|never|without|limit|skip|no)\b|tránh|không|hạn chế|đừng|bớt|giảm/i;

type DenyRule = {
  applies: (profile: PregnancyProfile) => boolean;
  pattern: RegExp;
  /** A note that tells the reader to avoid the match is kept. */
  keepWhenNegated?: boolean;
};

function hasCondition(profile: PregnancyProfile, condition: HealthCondition): boolean {
  return profile.healthConditions.includes(condition);
}

function isGlucoseConcern(profile: PregnancyProfile): boolean {
  return hasCondition(profile, "gestational_diabetes") || profile.goals.includes("blood_sugar_control");
}

/**
 * Notes that contradict a selected condition. Patterns stay tight so a safe
 * sentence is not dropped because it shares one word with the warning.
 */
const CONDITION_DENY_RULES: DenyRule[] = [
  {
    applies: isGlucoseConcern,
    pattern: /nhiều trái cây|lots of fruit|plenty of fruit|eat more fruit|\bmore fruit\b/i
  },
  {
    applies: isGlucoseConcern,
    pattern: /phở|\bpho\b|cơm tấm|com tam|cơm tam|trà sữa/i
  },
  {
    applies: isGlucoseConcern,
    pattern: /nước ép|nước ngọt|\bjuice\b|\bsugary\b/i,
    keepWhenNegated: true
  },
  {
    applies: (profile) => hasCondition(profile, "anemia") || profile.goals.includes("increase_iron_calcium_protein"),
    pattern:
      /(?:tea|coffee|trà|cà phê).{0,48}(?:meal|breakfast|lunch|dinner|bữa)|(?:meal|breakfast|lunch|dinner|bữa).{0,48}(?:tea|coffee|trà|cà phê)|uống trà|uống cà phê|drink tea|drink coffee/i,
    keepWhenNegated: true
  },
  {
    applies: (profile) => hasCondition(profile, "hypertension") || hasCondition(profile, "edema"),
    pattern: /\b(?:add|extra|more) salt\b|thêm muối|nêm mặn/i,
    keepWhenNegated: true
  },
  {
    applies: (profile) =>
      hasCondition(profile, "fast_weight_gain") || hasCondition(profile, "large_fetus") || profile.goals.includes("weight_control"),
    pattern: /\b(?:sugary drinks|sweets)\b|nước ngọt|đồ ngọt/i,
    keepWhenNegated: true
  },
  {
    applies: (profile) => hasCondition(profile, "reflux"),
    pattern: /lie down after|nằm ngay sau khi ăn|nằm ngay sau ăn/i,
    keepWhenNegated: true
  }
];

/** Contradicts the pregnancy food-safety warnings, for every plan. */
const FOOD_SAFETY_DENY_RULES: DenyRule[] = [
  {
    applies: () => true,
    pattern: /avoid overcook|don'?t overcook|do not overcook|tránh nấu quá chín|đừng nấu quá chín|đừng nấu chín|không nên nấu chín/i
  },
  {
    applies: () => true,
    pattern: /pickled|dưa muối/i,
    keepWhenNegated: true
  },
  {
    applies: () => true,
    pattern: /sashimi|unpasteuri[sz]ed|unpasteuri[sz]e|chưa tiệt trùng|\b(?:raw|undercooked)\b|đồ sống|\bđồ tái\b/i,
    keepWhenNegated: true
  },
  {
    applies: () => true,
    pattern: /swordfish|king mackerel|cá kiếm|cá mập|cá thu vua|\bshark\b/i,
    keepWhenNegated: true
  }
];

function recommendsFishWithoutMercuryCaveat(note: string): boolean {
  if (!/omega-?3|cá hồi|\bfatty fish\b|ăn thêm cá|eat more fish/i.test(note)) return false;
  return !/low-?mercury|low mercury|ít thủy ngân|thủy ngân thấp|lower-mercury/i.test(note);
}

function matchesRule(note: string, rule: DenyRule): boolean {
  if (!rule.pattern.test(note)) return false;
  if (rule.keepWhenNegated && NEGATION.test(note)) return false;
  return true;
}

/** Drop model notes that contradict a selected condition or pregnancy food safety. */
export function filterSafeAiNotes(notes: readonly string[], profile: PregnancyProfile): string[] {
  const rules = [...CONDITION_DENY_RULES, ...FOOD_SAFETY_DENY_RULES].filter((rule) => rule.applies(profile));
  return notes.filter((note) => !recommendsFishWithoutMercuryCaveat(note) && !rules.some((rule) => matchesRule(note, rule)));
}

/**
 * Hard rules appended after the profile. Condition lines are the app's own
 * warnings, so the model is told the same thing the result page shows.
 */
export function pregnancyNoteHardRules(profile: PregnancyProfile, locale: Locale): string {
  const conditionRules = getConditionSpecificWarnings(profile, locale);
  const foodRules = getGeneralPregnancyFoodWarnings(locale).slice(0, 3);
  const extra =
    locale === "vi"
      ? [
          "Không khuyên đồ muối chua hoặc dưa muối.",
          "Không viết rằng nên tránh nấu quá chín. Hãy nói nấu chín kỹ.",
          "Nếu nhắc omega-3 hoặc cá, phải nói chọn cá ít thủy ngân và nấu chín kỹ."
        ]
      : [
          "Do not recommend pickled foods.",
          "Do not say to avoid overcooking. Say to cook food thoroughly.",
          "Any note about omega-3 or fish must say to choose low-mercury fish and cook it thoroughly.",
          "Do not recommend unpasteurised or raw foods."
        ];

  return [
    "Hard rules you must follow. Do not contradict them:",
    ...conditionRules.map((rule) => `- ${rule}`),
    ...foodRules.map((rule) => `- ${rule}`),
    ...extra.map((rule) => `- ${rule}`)
  ].join("\n");
}
