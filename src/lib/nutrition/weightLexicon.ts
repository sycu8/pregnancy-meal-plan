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
    name: "chống đói",
    source: "chong doi",
    // Never fold-match: `chống đối` folds to `chong doi`.
    nfcSource: "chống đói|chong doi"
  },
  { name: "giảm khẩu phần", source: "giam khau phan" },
  { name: "giảm mỡ bụng", source: "giam mo bung" },
  {
    name: "mỡ bụng",
    source: "mo bung",
    // Never fold-match: `mổ bụng` folds to `mo bung`.
    nfcSource: "mỡ bụng|mo bung"
  },
  { name: "pre-baby body", source: "pre-baby body" },
  // "liều lượng an toàn" is a dose phrase, not an intake limit.
  { name: "lượng ăn", source: "luong an(?!\\s+toan)" },
  {
    name: "cơn đói",
    source: "con doi",
    // Never fold-match: `con đòi` and `còn đói` fold to `con doi`.
    nfcSource: "cơn đói|con doi"
  },
  // Explicit weight-control phrases. Bare "kiểm soát" is not a hit.
  { name: "kiểm soát cân", source: "kiem soat can" },
  { name: "kiểm soát tăng cân", source: "kiem soat tang can" },
  { name: "kiểm soát cân nặng", source: "kiem soat can nang" },
  { name: "kiểm soát ăn uống", source: "kiem soat an uong" },
  { name: "kiểm soát calo", source: "kiem soat calo" },
  { name: "kiểm soát lượng calo", source: "kiem soat luong calo" },
  { name: "kiểm soát lượng ăn", source: "kiem soat luong an" },
  { name: "kiểm soát lượng thức ăn", source: "kiem soat luong thuc an" },
  { name: "kiểm soát khẩu phần", source: "kiem soat khau phan" },
  { name: "kiểm soát vòng eo", source: "kiem soat vong eo" },
  {
    name: "kiểm soát cơn đói",
    source: "kiem soat con doi",
    // Same accent boundary as `cơn đói`: `còn đói` / `con đòi` must not fold-match.
    nfcSource: "kiểm soát cơn đói|kiem soat con doi"
  },
  { name: "kiểm soát cơn thèm", source: "kiem soat con them" },
  { name: "kiểm soát calories", source: "kiem soat (?:luong )?calories?" },
  { name: "kiểm soát mức tăng cân", source: "kiem soat muc tang can" },
  { name: "kiểm soát trọng lượng", source: "kiem soat trong luong" },
  { name: "kiểm soát chế độ ăn", source: "kiem soat (?:che do|viec) an" },
  // Weight-sense fat. "mỡ máu" stays allowed. "mỡ mau chóng" is still weight wording.
  { name: "kiểm soát mỡ", source: "kiem soat mo(?!\\s+mau(?!\\s+chong))" },
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
  // "thèm ăn đất/bột" is pica. "thêm an toàn" is "safer", not a craving.
  { name: "thèm ăn", source: "them an(?!\\s+(?:dat|bot|toan))" },
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
  "chống đói",
  "giảm khẩu phần",
  "giảm mỡ bụng",
  "mỡ bụng",
  "pre-baby body",
  "lượng ăn",
  "cơn đói",
  "kiểm soát cân",
  "kiểm soát tăng cân",
  "kiểm soát cân nặng",
  "kiểm soát ăn uống",
  "kiểm soát calo",
  "kiểm soát lượng calo",
  "kiểm soát lượng ăn",
  "kiểm soát lượng thức ăn",
  "kiểm soát khẩu phần",
  "kiểm soát vòng eo",
  "kiểm soát cơn đói",
  "kiểm soát cơn thèm",
  "kiểm soát calories",
  "kiểm soát mức tăng cân",
  "kiểm soát trọng lượng",
  "kiểm soát chế độ ăn",
  "kiểm soát mỡ",
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

/** NFC, then strip marks. đ/Đ fold to d so unaccented text matches. Any whitespace run, including tabs and NBSP, collapses first. */
export function foldLexiconText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .normalize("NFC")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

function phrasePattern(source: string): RegExp {
  return new RegExp(`(?<!${EDGE})(?:${source})(?!${EDGE})`, "gu");
}

/** Vietnamese alphabet after accent-fold. f, j, w, and z are not Vietnamese letters. */
const VIETNAMESE_LETTER = /[abcdeghiklmnopqrstuvxy]/i;

const ENGLISH_VERB_BASES = [
  "give", "tell", "ask", "use", "make", "get", "let", "send", "show", "bring", "offer", "hand", "teach", "buy",
  "call", "help", "leave", "pay", "lend", "promise", "warn", "remind", "allow", "want", "need", "see", "hear",
  "find", "keep", "take", "write", "read", "have", "put", "set", "serve", "pass", "feed", "save", "spare",
  "eat",
  "grant", "throw", "toss", "email", "text", "invite", "thank", "wish", "cause", "watch", "follow", "meet",
  "join", "sell", "owe", "deny", "refuse", "permit", "forbid", "advise", "recommend", "encourage", "force",
  "order", "beg", "expect", "prefer", "love", "hate", "like", "know", "believe", "consider", "imagine",
  "remember", "forget", "notice", "feel", "seem", "look", "sound", "become", "start", "stop", "try", "fail",
  "manage", "decide", "choose", "pick", "select", "provide", "supply", "assign", "award", "introduce",
  "present", "suggest", "mention", "describe", "explain", "announce", "declare", "name", "treat", "regard",
  "view", "observe", "catch", "lose", "miss", "charge", "bill", "tip", "borrow", "mail", "ship", "drop",
  "push", "pull", "hold", "grab", "fetch", "carry", "deliver", "return", "share", "split", "message"
];

const ENGLISH_VERB_IRREGULARS = [
  "gave", "given", "told", "made", "got", "gotten", "sent", "brought", "taught", "bought", "left", "paid",
  "lent", "saw", "seen", "heard", "found", "kept", "took", "taken", "wrote", "written", "had", "did", "done",
  "ate", "eaten", "fed", "threw", "thrown", "met", "sold", "chose", "chosen", "felt", "became", "held",
  "caught", "lost", "are", "was", "were", "been", "being", "could", "will", "would", "shall", "should",
  "might", "must"
];

function englishVerbForms(base: string): string[] {
  const forms = new Set<string>([base]);
  if (/(?:s|x|z|ch|sh)$/.test(base)) forms.add(`${base}es`);
  else if (/[^aeiou]y$/.test(base)) forms.add(`${base.slice(0, -1)}ies`);
  else forms.add(`${base}s`);
  if (base.endsWith("e")) {
    forms.add(`${base}d`);
    forms.add(`${base.slice(0, -1)}ing`);
  } else if (/[^aeiou]y$/.test(base)) {
    forms.add(`${base.slice(0, -1)}ied`);
    forms.add(`${base}ing`);
  } else {
    forms.add(`${base}ed`);
    forms.add(`${base}ing`);
  }
  return [...forms];
}

const ENGLISH_VERBS = new Set<string>([
  ...ENGLISH_VERB_BASES.flatMap(englishVerbForms),
  ...ENGLISH_VERB_IRREGULARS
]);
// These fold from common unaccented Vietnamese words (đó, cân, máy, ấm), so they never skip a craving.
for (const foldedVietnamese of ["do", "can", "may", "am", "is", "buy", "get", "got", "let", "met", "pay", "put", "set", "tip", "try"]) {
  ENGLISH_VERBS.delete(foldedVietnamese);
}
ENGLISH_VERBS.add("plants");

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

/**
 * English "give them an apple" shares the folded craving stem.
 * The article "an" is not a hit; the verb in front of "them an" is.
 */
function englishThemAn(folded: string, index: number): boolean {
  const before = folded.slice(Math.max(0, index - 24), index);
  return /(?:give|eat|ask|tell|show|offer|hand|pass|bring|get|for|feed)\s+$/.test(before);
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

/** A diacritic or đ is checked on the raw token, before accent-folding. */
function hasDiacriticOrD(token: string): boolean {
  return /đ/i.test(token) || /\p{M}/u.test(token.normalize("NFD"));
}

/**
 * "thèm ăn" / "thêm ăn" is the craving phrase. Accented and NFD forms always match.
 * Unaccented "them an" matches too, including "them an" plus a following word.
 * A preceding word with a diacritic or đ never skips the phrase.
 * Otherwise skip only when that token has no Vietnamese letters, or is an English verb.
 * Folding starts from NFC, and these letters stay one-to-one, so indexes align.
 */
function isCravingThemAn(text: string, index: number, length: number): boolean {
  const nfc = text.normalize("NFC");
  const slice = nfc.slice(index, index + length);
  if (/thèm/i.test(slice)) return true;
  const previous = nfc.slice(0, index).match(/(\S+)\s*$/)?.[1] ?? "";
  const raw = previous.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  if (!raw) return true;
  if (hasDiacriticOrD(raw)) return true;
  const token = foldLexiconText(raw);
  if (!VIETNAMESE_LETTER.test(token) || ENGLISH_VERBS.has(token)) return false;
  return true;
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
  const normalized = text.replace(/\s+/g, " ");
  const nfc = normalized.normalize("NFC");
  const folded = foldLexiconText(normalized);
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
      if (phrase.name === "thèm ăn" && englishThemAn(folded, index)) continue;
      if (phrase.name === "thèm ăn" && !isCravingThemAn(nfc, index, length)) continue;
      if (neutralSymptomUse(phrase.name, folded, index, length)) continue;
      if (!insideAllowed(folded, index, length, allowedContexts)) {
        hits.push({ name: phrase.name, index, length });
      }
    }
  }
  return hits;
}
