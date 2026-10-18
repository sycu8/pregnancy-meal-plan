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
  { name: "kiểm soát", source: "kiem soat" },
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
  index: number;
};

/** NFC, then strip marks. đ/Đ fold to d so unaccented text matches. */
export function foldLexiconText(value: string): string {
  return value.normalize("NFC").normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
}

function phrasePattern(source: string): RegExp {
  return new RegExp(`(?<!${EDGE})(?:${source})(?!${EDGE})`, "u");
}

/**
 * Hits on the original NFC text and on the accent-folded copy.
 * Folded indexes refer to the folded string.
 */
export function findWeightLexiconHits(text: string, phrases: readonly WeightLexiconPhrase[] = WEIGHT_LEXICON): WeightLexiconHit[] {
  const folded = foldLexiconText(text);
  const hits: WeightLexiconHit[] = [];
  for (const phrase of phrases) {
    const match = phrasePattern(phrase.source).exec(folded);
    if (match) hits.push({ name: phrase.name, index: match.index });
  }
  return hits;
}
