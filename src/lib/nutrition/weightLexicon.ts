/**
 * Shared weight-control and satiety lexicon for planner copy and blog copy.
 * Match the NFC string and an accent-folded copy so unaccented and NFD text hit too.
 * A hyphen or underscore is part of a code token (w-full, fast_weight_gain), not copy.
 */

const EDGE = "[\\p{L}\\p{N}_-]";

export type WeightLexiconPhrase = {
  name: string;
  /** Accent-folded source, without anchors. */
  source: string;
};

export const WEIGHT_LEXICON: readonly WeightLexiconPhrase[] = [
  { name: "giảm cân", source: "giam can" },
  { name: "lấy lại vóc dáng", source: "lay lai voc dang" },
  { name: "eo thon", source: "eo thon" },
  { name: "giảm béo", source: "giam beo" },
  { name: "đốt mỡ", source: "dot mo" },
  { name: "thon gọn", source: "thon gon" },
  { name: "kiểm soát cân", source: "kiem soat can" },
  { name: "khẩu phần", source: "khau phan" },
  { name: "no lâu", source: "no lau" },
  { name: "no ăn lâu", source: "no an lau" },
  { name: "no dai", source: "no dai" },
  { name: "chắc bụng", source: "chac bung" },
  { name: "đỡ đói", source: "do doi" },
  { name: "cảm giác no", source: "cam giac no" },
  { name: "ít calo", source: "it calo" },
  { name: "giữ dáng", source: "giu dang" },
  { name: "bữa nhỏ", source: "bua nho" },
  { name: "nhiều bữa nhỏ", source: "nhieu bua nho" },
  { name: "lượng nhỏ", source: "luong nho" },
  { name: "ăn ít", source: "an it" },
  { name: "thèm ăn", source: "them an" },
  { name: "weight", source: "weight" },
  { name: "weight loss", source: "weight[\\s-]*loss" },
  { name: "weight control", source: "weight control" },
  { name: "weight management", source: "weight management" },
  { name: "lose weight", source: "lose weight" },
  { name: "losing weight", source: "losing weight" },
  { name: "lost weight", source: "lost weight" },
  { name: "healthy weight", source: "healthy weight" },
  { name: "support healthy weight", source: "support healthy weight" },
  { name: "shed pounds", source: "shed pounds" },
  { name: "slim down", source: "slim down" },
  { name: "slim", source: "slims?" },
  { name: "slimming", source: "slimming" },
  { name: "slimmer", source: "slimmer" },
  { name: "burn fat", source: "burn fat" },
  { name: "portion", source: "portions?" },
  { name: "full(er)", source: "full(?:er)?" },
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

/**
 * Blog prose uses this subset. Bare weight, portion, full, hunger, and appetite
 * stay on the planner list because clinical posts use them for fetal growth and symptoms.
 */
const BLOG_PHRASE_NAMES = new Set([
  "giảm cân",
  "lấy lại vóc dáng",
  "eo thon",
  "giảm béo",
  "đốt mỡ",
  "thon gọn",
  "kiểm soát cân",
  "no lâu",
  "chắc bụng",
  "đỡ đói",
  "cảm giác no",
  "weight loss",
  "weight control",
  "weight management",
  "lose weight",
  "losing weight",
  "lost weight",
  "healthy weight",
  "support healthy weight",
  "shed pounds",
  "slim down",
  "slim",
  "slimming",
  "slimmer",
  "burn fat",
  "fuller",
  "filling",
  "fullness",
  "feel full",
  "stay full",
  "satiety",
  "low calorie",
  "low in calories",
  "curb appetite",
  "prevent hunger"
]);

export const BLOG_WEIGHT_LEXICON: readonly WeightLexiconPhrase[] = WEIGHT_LEXICON.filter((phrase) => BLOG_PHRASE_NAMES.has(phrase.name));

/** NFC, then strip marks. đ/Đ fold to d so unaccented text matches. */
export function foldLexiconText(value: string): string {
  return value.normalize("NFC").normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
}

function phrasePattern(source: string): RegExp {
  return new RegExp(`(?<!${EDGE})(?:${source})(?!${EDGE})`, "gu");
}

/**
 * "thèm ăn" is the craving phrase. Accented and NFD forms match, and so does the
 * unaccented full phrase. English "them an <word>" does not.
 * Folding starts from NFC, and these letters stay one-to-one, so indexes align.
 */
function isCravingThemAn(text: string, index: number, length: number): boolean {
  const nfc = text.normalize("NFC");
  const slice = nfc.slice(index, index + length).toLowerCase();
  if (slice.includes("thèm")) return true;
  return !/^\s+\p{L}/u.test(nfc.slice(index + length));
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
  const folded = foldLexiconText(text);
  const hits: WeightLexiconHit[] = [];
  for (const phrase of phrases) {
    const pattern = phrasePattern(phrase.source);
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(folded))) {
      if (match[0].length === 0) {
        pattern.lastIndex += 1;
        continue;
      }
      if (phrase.name === "thèm ăn" && !isCravingThemAn(text, match.index, match[0].length)) continue;
      if (!insideAllowed(folded, match.index, match[0].length, allowedContexts)) {
        hits.push({ name: phrase.name, index: match.index, length: match[0].length });
      }
    }
  }
  return hits;
}
