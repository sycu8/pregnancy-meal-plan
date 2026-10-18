/**
 * Shared weight-control and satiety lexicon for planner copy and blog copy.
 * Match the NFC string and an accent-folded copy so unaccented and NFD text hit too.
 * A hyphen or underscore is part of a code token (w-full, fast_weight_gain), not copy.
 */

const EDGE = "[\\p{L}\\p{N}_-]";

export type WeightLexiconPhrase = {
  name: string;
  /** Accent-folded source, without anchors. Ignored when nfcSource is set. */
  source: string;
  /**
   * Match this pattern on NFC text instead of the accent-folded copy.
   * Used when folding would collide with a different word.
   */
  nfcSource?: string;
};

export const WEIGHT_LEXICON: readonly WeightLexiconPhrase[] = [
  { name: "giảm cân", source: "giam can" },
  { name: "lấy lại vóc dáng", source: "lay lai voc dang" },
  { name: "eo thon", source: "eo thon" },
  { name: "giảm béo", source: "giam beo" },
  { name: "đốt mỡ", source: "dot mo" },
  { name: "thon gọn", source: "thon gon" },
  {
    name: "kiểm soát",
    // Glucose control, the CDC name, and disease control are not weight-control copy.
    source: "(?<!khong )(?<!kho )(?<!ztna )kiem soat(?!\\s+(?:va\\s+phong|duong|muc\\s+duong|benh|chat\\s+luong|luong|tieu|truc|tinh\\s+trang|hieu\\s+qua|gdm|carbohydrate|carb|phan\\s+an|nhieu))"
  },
  { name: "kiểm soát cân", source: "kiem soat can" },
  {
    name: "khẩu phần",
    // A serving size in a recipe is not portion-control advice.
    source: "(?:kiem soat|chia) khau phan"
  },
  {
    name: "no lâu",
    source: "no lau",
    // Never fold-match: `nó` folds to `no` and would collide with `no lâu`.
    nfcSource: "no lâu|no lau"
  },
  { name: "no ăn lâu", source: "no an lau" },
  { name: "no dai", source: "no dai" },
  { name: "chắc bụng", source: "chac bung" },
  { name: "đỡ đói", source: "do doi" },
  { name: "cảm giác no", source: "cam giac no" },
  { name: "ít calo", source: "it calo" },
  { name: "giữ dáng", source: "giu dang" },
  { name: "bữa nhỏ", source: "bua nho" },
  { name: "nhiều bữa nhỏ", source: "nhieu bua nho" },
  {
    name: "lượng nhỏ",
    // "một lượng nhỏ omega-3" describes a nutrient amount, not a diet limit.
    source: "(?<!mot )luong nho"
  },
  {
    name: "ăn ít",
    // "ăn ít nhất" is "at least"; "ăn ít muối" is sodium guidance.
    source: "an it(?!\\s+(?:nhat|muoi|duong|ngot|salt|sugar|sweet))"
  },
  { name: "thèm ăn", source: "them an(?!\\s+(?:dat|bot))" },
  { name: "weight", source: "weight" },
  { name: "weight loss", source: "weight[\\s-]*loss" },
  { name: "weight control", source: "weight control" },
  { name: "weight management", source: "weight management" },
  { name: "lose weight", source: "lose weight" },
  { name: "losing weight", source: "losing weight" },
  { name: "lost weight", source: "lost weight" },
  { name: "healthy weight", source: "healthy weight(?!\\s+gain)" },
  { name: "support healthy weight", source: "support healthy weight" },
  { name: "shed pounds", source: "shed pounds" },
  { name: "slim down", source: "slim down" },
  { name: "slim", source: "slims?" },
  { name: "slimming", source: "slimming" },
  { name: "slimmer", source: "slimmer" },
  { name: "burn fat", source: "burn fat" },
  {
    name: "portion",
    source: "portion control|control(?:ling)? portions?|keep (?:the |your )?portions? (?:moderate|modest)|portions? (?:moderate|modest)"
  },
  {
    name: "full(er)",
    // Satiety frames only. "full thaw", "full panel", and "full meals" are not this phrase.
    source: "fuller|(?:keep|keeps|keeping|stay|stays|staying|feel|feels|feeling) (?:you )?full"
  },
  { name: "fuller", source: "fuller" },
  { name: "filling", source: "filling" },
  { name: "fullness", source: "fullness" },
  { name: "feel full", source: "feel full" },
  { name: "stay full", source: "stay full" },
  { name: "hearty", source: "hearty" },
  { name: "satisfying", source: "satisfying" },
  { name: "satisfied", source: "satisfied" },
  { name: "satiated", source: "satiated" },
  { name: "satiety", source: "satiety" },
  { name: "calorie deficit", source: "calorie deficit" },
  { name: "low calorie", source: "low[\\s-]calorie" },
  { name: "low in calories", source: "low in calories" },
  { name: "appetite", source: "appetite" },
  { name: "curb appetite", source: "curb appetite" },
  { name: "hunger", source: "hunger" },
  { name: "prevent hunger", source: "prevent hunger" },
  { name: "cravings", source: "cravings?" },
  { name: "eat less", source: "eat less" },
  { name: "smaller plate", source: "smaller plate" },
  { name: "several small meals", source: "several small meals" }
];

export type WeightLexiconHit = {
  name: string;
  /** Index in the accent-folded string. */
  index: number;
  length: number;
};

/** NFC, then strip marks. đ/Đ fold to d so unaccented text matches. */
export function foldLexiconText(value: string): string {
  return value.normalize("NFC").normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
}

function phrasePattern(source: string): RegExp {
  return new RegExp(`(?<!${EDGE})(?:${source})(?!${EDGE})`, "gu");
}

/** Pregnancy weight-gain, birth weight, and measurement uses are not weight-loss copy. */
function neutralWeightUse(folded: string, index: number, length: number): boolean {
  const after = folded.slice(index + length, index + length + 48);
  const before = folded.slice(Math.max(0, index - 24), index);
  if (/^\s*[:(\/<,;]/.test(after)) return true;
  if (/^\s+(?:gain|gains|gained|gaining|loss|losses|trend|trends|target|targets|falter|faltering|matter|matters|range|ranges|alone|by|rapidly|rises|rising|with|should|or|must|help|set|preferences)\b/.test(after)) {
    return true;
  }
  return /(?:birth|fetal|body|track|tracking)\s+$/.test(before) || /\.$/.test(before);
}

/** Symptom and pica wording shares a lexicon stem without giving diet advice. */
function neutralSymptomUse(name: string, folded: string, index: number, length: number): boolean {
  const window = folded.slice(Math.max(0, index - 48), index + length + 48);
  if (name === "appetite") {
    return /loss of appetite|of appetite|appetite is low|appetite returns|appetite day|better appetite|variable appetite|to appetite/.test(window);
  }
  if (name === "hunger") {
    return /eat to hunger|thirst or hunger|or hunger/.test(window);
  }
  if (name === "cravings" || name === "thèm ăn") {
    return /\bpica\b|non-food|non food|an dat|dat, bot/.test(window);
  }
  return false;
}

function insideAllowed(folded: string, index: number, length: number, allowedContexts: readonly string[]): boolean {
  return allowedContexts.some((context) => {
    const foldedContext = foldLexiconText(context);
    let from = 0;
    while (from <= folded.length) {
      const at = folded.indexOf(foldedContext, from);
      if (at < 0) return false;
      if (index >= at && index + length <= at + foldedContext.length) return true;
      from = at + 1;
    }
    return false;
  });
}

/**
 * Match the accent-folded copy of NFC text, so accented, unaccented, and NFD forms hit once.
 * Indexes refer to the folded string. Allowed contexts are symptom lines, not advice.
 */
export function findWeightLexiconHits(
  text: string,
  phrases: readonly WeightLexiconPhrase[] = WEIGHT_LEXICON,
  allowedContexts: readonly string[] = []
): WeightLexiconHit[] {
  const nfc = text.normalize("NFC");
  const folded = foldLexiconText(text);
  const hits: WeightLexiconHit[] = [];
  for (const phrase of phrases) {
    const haystack = phrase.nfcSource ? nfc.toLowerCase() : folded;
    const pattern = phrasePattern(phrase.nfcSource ?? phrase.source);
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(haystack))) {
      if (match[0].length === 0) {
        pattern.lastIndex += 1;
        continue;
      }
      const index = phrase.nfcSource ? foldLexiconText(nfc.slice(0, match.index)).length : match.index;
      const length = phrase.nfcSource ? foldLexiconText(match[0]).length : match[0].length;
      if (phrase.name === "weight" && neutralWeightUse(folded, index, length)) continue;
      if (neutralSymptomUse(phrase.name, folded, index, length)) continue;
      if (!insideAllowed(folded, index, length, allowedContexts)) {
        hits.push({ name: phrase.name, index, length });
      }
    }
  }
  return hits;
}
