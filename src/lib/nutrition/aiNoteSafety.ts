import type { Locale } from "@/lib/i18n";
import type { HealthCondition, PregnancyProfile } from "@/types/pregnancy";
import { getConditionSpecificWarnings, getGeneralPregnancyFoodWarnings } from "@/lib/nutrition/safetyRules";

type DenyRule = {
  applies: (profile: PregnancyProfile) => boolean;
  /** Matched against the accent-folded note. */
  pattern: RegExp;
  /** Fruit mentions that limit the portion stay. Other matches do not get this escape. */
  portionEscape?: boolean;
  /** The phrase is the bad advice itself, including when it says "avoid overcooking". */
  ignoreNegation?: boolean;
};

function hasCondition(profile: PregnancyProfile, condition: HealthCondition): boolean {
  return profile.healthConditions.includes(condition);
}

function isGlucoseConcern(profile: PregnancyProfile): boolean {
  return hasCondition(profile, "gestational_diabetes") || profile.goals.includes("blood_sugar_control");
}

/** Strip Vietnamese accents so "trái cây" and "trai cay" share one pattern. Length stays 1:1. */
export function foldNote(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
}

const FRUIT =
  /\b(?:fruits?|dried fruits?|bananas?|mango(?:es)?)\b|trai cay|hoa qua|\b(?:chuoi|xoai)\b/;

const GDM_SWEETS =
  /\b(?:juices?|smoothie|smoothies|honey|desserts?|che)\b|nuoc ep|nuoc ngot|nuoc mia|sinh to|mat ong|com trang|white rice|banh mi trang|banh ngot|\bxoi\b|sua dac|tra sua|\bpho\b|com tam/;

const CONDITION_DENY_RULES: DenyRule[] = [
  { applies: isGlucoseConcern, pattern: FRUIT, portionEscape: true },
  { applies: isGlucoseConcern, pattern: GDM_SWEETS },
  {
    applies: (profile) => hasCondition(profile, "anemia") || profile.goals.includes("increase_iron_calcium_protein"),
    pattern:
      /\b(?:tea|coffee|tra|ca phe)\b.{0,48}\b(?:meal|breakfast|lunch|dinner|bua)\b|\b(?:meal|breakfast|lunch|dinner|bua)\b.{0,48}\b(?:tea|coffee|tra|ca phe)\b|uong tra|uong ca phe|drink tea|drink coffee/
  },
  {
    applies: (profile) => hasCondition(profile, "hypertension") || hasCondition(profile, "edema"),
    pattern: /\b(?:add|extra|more) salt\b|them muoi|nem man/
  },
  {
    applies: (profile) =>
      hasCondition(profile, "fast_weight_gain") || hasCondition(profile, "large_fetus") || profile.goals.includes("weight_control"),
    pattern: /\b(?:sugary drinks|sweets)\b|nuoc ngot|do ngot/
  },
  {
    applies: (profile) => hasCondition(profile, "reflux"),
    pattern: /lie down after|nam ngay sau khi an|nam ngay sau an/
  }
];

const FOOD_SAFETY_DENY_RULES: DenyRule[] = [
  {
    applies: () => true,
    ignoreNegation: true,
    pattern: /avoid overcook|don't overcook|do not overcook|tranh nau qua chin|dung nau qua chin|dung nau chin|khong nen nau chin/
  },
  { applies: () => true, pattern: /pickled|dua muoi|muoi chua|kimchi|fermented|len men/ },
  {
    applies: () => true,
    pattern: /sashimi|sushi|unpasteuri[sz]ed|unpasteuri[sz]e|chua tiet trung|\b(?:raw|undercooked)\b|do song|\bdo tai\b/
  },
  { applies: () => true, pattern: /soft cheese|pho mai mem|\bbrie\b|camembert/ },
  { applies: () => true, pattern: /runny yolk|runny egg|long dao/ },
  { applies: () => true, pattern: /goi ca|nem chua/ },
  { applies: () => true, pattern: /animal liver|\bliver\b|gan dong vat|\ban gan\b/ },
  { applies: () => true, pattern: /rare steak|steak tai|\bbo tai\b|\bthit tai\b/ },
  { applies: () => true, pattern: /\b(?:alcohol|wine|beer|ruou|bia)\b/ },
  { applies: () => true, pattern: /\btuna\b|ca ngu/ },
  { applies: () => true, pattern: /swordfish|king mackerel|ca kiem|ca map|ca thu vua|\bshark\b/ }
];

const NEGATION =
  /(?:^|[^\p{L}\p{N}])(?:avoid|don't|do not|never|without|limit|skip|no|tránh|không nên|không|hạn chế|đừng|bớt|giảm)(?=$|[^\p{L}\p{N}])/giu;

const BREAKS_NEGATION =
  /\b(?:and|va|,)\s+(?:eat|eats|enjoy|try|tries|have|drink|drinks|add|choose|prioritize|incorporate|include|uong|an|thu|them|nen)\b/;

/**
 * The negation has to govern the matched term. A "no" or "avoid" later in the
 * sentence, or one that introduces a different food, does not keep the note.
 * Checked on the original text so "bột" is not treated as "bớt".
 */
function negationGoverns(before: string): boolean {
  const matches = [...before.matchAll(new RegExp(NEGATION.source, "giu"))];
  if (matches.length === 0) return false;
  const last = matches[matches.length - 1];
  const after = before.slice((last.index ?? 0) + last[0].length);
  if (BREAKS_NEGATION.test(foldNote(after))) return false;
  const words = after.trim().split(/\s+/).filter(Boolean);
  return words.length <= 4;
}

function portionLimitsFruit(before: string): boolean {
  const tail = before.slice(-48);
  return (
    /(?:small|limited)\s+(?:\w+\s+){0,2}$/.test(tail) ||
    /(?:small|limited)\s+(?:piece|serving|amount|portion)\s+(?:of\s+)?$/.test(tail) ||
    /(?:limit|han che|gioi han|mot phan nho|phan nho|mot it|vua phai|one small|in moderation)\s*$/.test(tail)
  );
}

function ruleHits(note: string, rule: DenyRule): boolean {
  const folded = foldNote(note);
  const re = new RegExp(rule.pattern.source, "g");
  for (const match of folded.matchAll(re)) {
    if (rule.ignoreNegation) return true;
    const before = note.slice(Math.max(0, (match.index ?? 0) - 80), match.index ?? 0);
    if (negationGoverns(before)) continue;
    if (rule.portionEscape && portionLimitsFruit(foldNote(before))) continue;
    return true;
  }
  return false;
}

function recommendsFishWithoutMercuryCaveat(note: string): boolean {
  const folded = foldNote(note);
  if (!/omega-?3|ca hoi|\bfatty fish\b|an them ca|eat more fish/.test(folded)) return false;
  return !/low-?mercury|low mercury|it thuy ngan|thuy ngan thap|lower-mercury/.test(folded);
}

/** Drop model notes that contradict a selected condition or pregnancy food safety. */
export function filterSafeAiNotes(notes: readonly string[], profile: PregnancyProfile): string[] {
  const rules = [...CONDITION_DENY_RULES, ...FOOD_SAFETY_DENY_RULES].filter((rule) => rule.applies(profile));
  return notes.filter((note) => !recommendsFishWithoutMercuryCaveat(note) && !rules.some((rule) => ruleHits(note, rule)));
}

function extraRuleLines(locale: Locale): string[] {
  return locale === "vi"
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
}

const META_PREFIX = /^(?:khong khuyen|khong viet|do not recommend|do not say|rules for you|hard rules)\b/;

function normalizeNote(text: string): string {
  return foldNote(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function echoesText(note: string, canonical: readonly string[]): boolean {
  const norm = normalizeNote(note);
  if (norm.length < 12) return false;
  const tokens = new Set(norm.split(" ").filter((token) => token.length > 1));
  for (const warning of canonical) {
    const other = normalizeNote(warning);
    if (!other) continue;
    if (norm === other) return true;
    const shorter = norm.length < other.length ? norm : other;
    const longer = norm.length < other.length ? other : norm;
    if (shorter.length >= 24 && longer.includes(shorter)) return true;
    const otherTokens = new Set(other.split(" ").filter((token) => token.length > 1));
    let shared = 0;
    for (const token of tokens) if (otherTokens.has(token)) shared += 1;
    const union = tokens.size + otherTokens.size - shared;
    if (union >= 5 && shared / union >= 0.72) return true;
  }
  return false;
}

/** Drop copies of the safety panel, condition warnings, and prompt instructions. */
export function filterEchoedAiNotes(notes: readonly string[], profile: PregnancyProfile, locale: Locale): string[] {
  const canonical = [
    ...getConditionSpecificWarnings(profile, locale),
    ...getGeneralPregnancyFoodWarnings(locale),
    ...extraRuleLines(locale)
  ];
  return notes.filter((note) => !META_PREFIX.test(foldNote(note).trim()) && !echoesText(note, canonical));
}

/**
 * Rules for the model only. They are the app's own warnings, and the model
 * is told not to copy them into specialNotes.
 */
export function pregnancyNoteHardRules(profile: PregnancyProfile, locale: Locale): string {
  const conditionRules = getConditionSpecificWarnings(profile, locale);
  const foodRules = getGeneralPregnancyFoodWarnings(locale).slice(0, 3);
  return [
    "Rules for you — do not repeat them as notes. Do not contradict them:",
    ...conditionRules.map((rule) => `- ${rule}`),
    ...foodRules.map((rule) => `- ${rule}`),
    ...extraRuleLines(locale).map((rule) => `- ${rule}`)
  ].join("\n");
}
