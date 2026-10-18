import type { Locale } from "@/lib/i18n";
import type { HealthCondition, PregnancyProfile } from "@/types/pregnancy";
import { getConditionSpecificWarnings, getGeneralPregnancyFoodWarnings } from "@/lib/nutrition/safetyRules";

type DenyRule = {
  applies: (profile: PregnancyProfile) => boolean;
  /** Used when the note itself contains Vietnamese diacritics. */
  accented: string;
  /** Used only when the note has no diacritics, so teen-code still matches. */
  plain: string;
  /** A real portion limit can keep a fruit or sugary-drink mention. */
  portion?: boolean;
  /** The phrase is the bad advice, including "avoid overcooking". */
  ignoreNegation?: boolean;
};

function hasCondition(profile: PregnancyProfile, condition: HealthCondition): boolean {
  return profile.healthConditions.includes(condition);
}

function isGlucoseConcern(profile: PregnancyProfile): boolean {
  return hasCondition(profile, "gestational_diabetes") || profile.goals.includes("blood_sugar_control");
}

/** Strip accents. Used for unaccented notes and for paraphrase tokens, not for accented deny matches. */
export function foldNote(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
}

function hasDiacritics(text: string): boolean {
  return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(text);
}

function word(phrase: string): string {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `(?<![\\p{L}\\p{N}])(?:${escaped})(?![\\p{L}\\p{N}])`;
}

function words(phrases: readonly string[]): string {
  return phrases.map(word).join("|");
}

const EN_FRUIT = [
  "fruits?",
  "dried fruits?",
  "bananas?",
  "mango(?:es)?",
  "watermelons?",
  "jackfruits?",
  "durians?",
  "longans?",
  "lychees?",
  "litchis?",
  "papayas?",
  "rambutans?",
  "mangosteens?",
  "dragon fruits?",
  "guavas?",
  "grapes?",
  "apples?",
  "pears?",
  "pineapples?",
  "oranges?",
  "pomelos?",
  "cantaloupes?",
  "plums?",
  "peaches?",
  "sapodillas?",
  "custard apples?"
]
  .map((phrase) => `(?<![\\p{L}\\p{N}])(?:${phrase})(?![\\p{L}\\p{N}])`)
  .join("|");

const VI_FRUIT = [
  "trái cây",
  "hoa quả",
  "sầu riêng",
  "dưa hấu",
  "dưa lưới",
  "thanh long",
  "chôm chôm",
  "măng cụt",
  "mãng cầu",
  "hồng xiêm",
  "vú sữa",
  "đu đủ",
  "chuối",
  "xoài",
  "nhãn",
  "vải",
  "mít",
  "ổi",
  "nho",
  "táo",
  "lê",
  "dứa",
  "thơm",
  "quýt",
  "bưởi",
  "mận",
  "khế"
];

const VI_FRUIT_PLAIN = [
  "trai cay",
  "hoa qua",
  "sau rieng",
  "dua hau",
  "dua luoi",
  "thanh long",
  "chom chom",
  "mang cut",
  "mang cau",
  "hong xiem",
  "vu sua",
  "du du",
  "xoai"
];

/** Bare quả/trái, plus guarded unaccented forms that must not match quá, chuỗi, or trà. */
const BARE_FRUIT_ACCENTED = "(?<!kết\\s)(?<![\\p{L}\\p{N}])quả(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])trái(?![\\p{L}\\p{N}])";
const BARE_FRUIT_PLAIN =
  "(?<!ket\\s)(?<![\\p{L}\\p{N}])qua(?![\\p{L}\\p{N}])(?!\\s+(?:nhieu|muc|trinh|han))|(?<![\\p{L}\\p{N}])trai(?![\\p{L}\\p{N}])(?!\\s+nghiem)";
const GUARDED_PLAIN_FRUIT =
  "(?<![\\p{L}\\p{N}])chuoi(?![\\p{L}\\p{N}])(?!\\s+bua)|(?<![\\p{L}\\p{N}])mit(?![\\p{L}\\p{N}])|(?:an|them|nhieu|qua|trai|chum)\\s+(?:nhan|vai|nho|tao|oi)";

const FRUIT_ACCENTED = `${EN_FRUIT}|${words(VI_FRUIT)}|${BARE_FRUIT_ACCENTED}`;
const FRUIT_PLAIN = `${EN_FRUIT}|${words(VI_FRUIT_PLAIN)}|${GUARDED_PLAIN_FRUIT}|${BARE_FRUIT_PLAIN}`;

const EN_SWEET = ["juices?", "smoothies?", "honey", "desserts?", "sugary drinks?", "soft drinks?", "soda", "sugar cane", "white rice"]
  .map((phrase) => `(?<![\\p{L}\\p{N}])(?:${phrase})(?![\\p{L}\\p{N}])`)
  .join("|");
const VI_SWEET = [
  "nước ép",
  "nước ngọt",
  "nước mía",
  "sinh tố",
  "mật ong",
  "cơm trắng",
  "bánh mì trắng",
  "bánh ngọt",
  "sữa đặc",
  "trà sữa",
  "cơm tấm",
  "đồ ngọt"
];
const VI_SWEET_PLAIN = [
  "nuoc ep",
  "nuoc ngot",
  "nuoc mia",
  "sinh to",
  "mat ong",
  "com trang",
  "banh mi trang",
  "banh ngot",
  "sua dac",
  "tra sua",
  "com tam",
  "do ngot"
];
/** chè / phở / xôi, without folding chế, phổ, phô, or chuỗi into them. */
const FOLD_SENSITIVE_ACCENTED = `${word("chè")}|${word("xôi")}|${word("phở")}`;
const FOLD_SENSITIVE_PLAIN =
  "(?<!han\\s)(?<![\\p{L}\\p{N}])che(?![\\p{L}\\p{N}])(?!\\s+bien)|(?<![\\p{L}\\p{N}])xoi(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])pho(?![\\p{L}\\p{N}])(?!\\s+(?:mai|bien))";

const SWEET_ACCENTED = `${EN_SWEET}|${words(VI_SWEET)}|${FOLD_SENSITIVE_ACCENTED}`;
const SWEET_PLAIN = `${EN_SWEET}|${words(VI_SWEET_PLAIN)}|${FOLD_SENSITIVE_PLAIN}`;

const CONDITION_DENY_RULES: DenyRule[] = [
  { applies: isGlucoseConcern, accented: FRUIT_ACCENTED, plain: FRUIT_PLAIN, portion: true },
  { applies: isGlucoseConcern, accented: SWEET_ACCENTED, plain: SWEET_PLAIN, portion: true },
  {
    applies: (profile) => hasCondition(profile, "anemia") || profile.goals.includes("increase_iron_calcium_protein"),
    accented:
      "(?<![\\p{L}\\p{N}])(?:trà|cà phê|tea|coffee)(?![\\p{L}\\p{N}]).{0,48}(?<![\\p{L}\\p{N}])(?:bữa|meal|breakfast|lunch|dinner)(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])(?:bữa|meal|breakfast|lunch|dinner)(?![\\p{L}\\p{N}]).{0,48}(?<![\\p{L}\\p{N}])(?:trà|cà phê|tea|coffee)(?![\\p{L}\\p{N}])|uống trà|uống cà phê|drink tea|drink coffee",
    plain:
      "(?<![\\p{L}\\p{N}])(?:tra|ca phe|tea|coffee)(?![\\p{L}\\p{N}]).{0,48}(?<![\\p{L}\\p{N}])(?:bua|meal|breakfast|lunch|dinner)(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])(?:bua|meal|breakfast|lunch|dinner)(?![\\p{L}\\p{N}]).{0,48}(?<![\\p{L}\\p{N}])(?:tra|ca phe|tea|coffee)(?![\\p{L}\\p{N}])|uong tra|uong ca phe|drink tea|drink coffee"
  },
  {
    applies: (profile) => hasCondition(profile, "hypertension") || hasCondition(profile, "edema"),
    accented: "add extra salt|add more salt|thêm muối|nêm mặn",
    plain: "add extra salt|add more salt|them muoi|nem man"
  },
  {
    applies: (profile) =>
      hasCondition(profile, "fast_weight_gain") || hasCondition(profile, "large_fetus") || profile.goals.includes("weight_control"),
    accented: "sugary drinks|sweets|nước ngọt|đồ ngọt",
    plain: "sugary drinks|sweets|nuoc ngot|do ngot"
  },
  {
    applies: (profile) => hasCondition(profile, "reflux"),
    accented: "lie down after|nằm ngay sau khi ăn|nằm ngay sau ăn",
    plain: "lie down after|nam ngay sau khi an|nam ngay sau an"
  }
];

const FOOD_SAFETY_DENY_RULES: DenyRule[] = [
  {
    applies: () => true,
    ignoreNegation: true,
    accented: "avoid overcook|don't overcook|do not overcook|tránh nấu quá chín|đừng nấu quá chín|đừng nấu chín|không nên nấu chín",
    plain: "avoid overcook|don't overcook|do not overcook|tranh nau qua chin|dung nau qua chin|dung nau chin|khong nen nau chin"
  },
  {
    applies: () => true,
    accented:
      `pickled|${word("dưa muối")}|${word("muối chua")}|(?<![\\p{L}\\p{N}])kim[\\s-]*chi(?![\\p{L}\\p{N}])|${word("đồ chua")}|${word("lên men")}|fermented(?!\\s+(?:dairy|milk|yogurt))|${word("nem chua")}`,
    plain: `pickled|${word("dua muoi")}|${word("muoi chua")}|(?<![\\p{L}\\p{N}])kim[\\s-]*chi(?![\\p{L}\\p{N}])|(?<!sua\\s)${word("do chua")}|${word("len men")}|fermented(?!\\s+(?:dairy|milk|yogurt))|${word("nem chua")}`
  },
  {
    applies: () => true,
    accented:
      "sashimi|sushi|unpasteuri[sz]ed|unpasteuri[sz]e|chưa tiệt trùng|(?<![\\p{L}\\p{N}])raw(?![\\p{L}\\p{N}])|undercooked|cá sống|thịt sống|trứng sống|đồ sống|đồ tái|hải sản sống",
    plain:
      "sashimi|sushi|unpasteuri[sz]ed|unpasteuri[sz]e|chua tiet trung|(?<![\\p{L}\\p{N}])raw(?![\\p{L}\\p{N}])|undercooked|ca song|thit song|trung song|do song|do tai|hai san song"
  },
  {
    applies: () => true,
    accented: "soft cheese|phô mai mềm|brie|camembert",
    plain: "soft cheese|pho mai mem|brie|camembert"
  },
  {
    applies: () => true,
    accented: "soft[\\s-]?boiled|runny[\\s-]?yolk|runny egg|lòng đào|lòng đỏ còn chảy",
    plain: "soft[\\s-]?boiled|runny[\\s-]?yolk|runny egg|long dao|long do con chay"
  },
  { applies: () => true, accented: "gỏi cá|nem chua", plain: "goi ca|nem chua" },
  {
    applies: () => true,
    accented: "animal liver|(?<![\\p{L}\\p{N}])liver(?![\\p{L}\\p{N}])|gan động vật|ăn gan",
    plain: "animal liver|(?<![\\p{L}\\p{N}])liver(?![\\p{L}\\p{N}])|gan dong vat|an gan"
  },
  {
    applies: () => true,
    accented: "rare steak|steak tái|bò tái|thịt tái",
    plain: "rare steak|steak tai|bo tai|thit tai"
  },
  {
    applies: () => true,
    accented: "(?<![\\p{L}\\p{N}])(?:alcohol|wine|beer|rượu|bia)(?![\\p{L}\\p{N}])",
    plain: "(?<![\\p{L}\\p{N}])(?:alcohol|wine|beer|ruou|bia)(?![\\p{L}\\p{N}])"
  },
  { applies: () => true, accented: "(?<![\\p{L}\\p{N}])tuna(?![\\p{L}\\p{N}])|cá ngừ", plain: "(?<![\\p{L}\\p{N}])tuna(?![\\p{L}\\p{N}])|ca ngu" },
  {
    applies: () => true,
    accented: "swordfish|king mackerel|cá kiếm|cá mập|cá thu vua|shark",
    plain: "swordfish|king mackerel|ca kiem|ca map|ca thu vua|shark"
  }
];

const LIMITER =
  /(?:^|[^\p{L}\p{N}])(?:instead of|thay vì|thay vi|thay cho|không nên|khong nen|không ăn|khong an|hạn chế|han che|giới hạn|gioi han|avoid|don't|do not|never|without|limited|limit|skip|tránh|tranh|không|khong|đừng|giảm|giam|bớt|đổi|doi|over)(?=$|[^\p{L}\p{N}])/giu;

const RECOMMEND_BREAK =
  /(?:^|[^\p{L}\p{N}])(?:and|va|và|,)\s+(?:eat|eats|enjoy|try|tries|have|drink|drinks|add|choose|prioritize|incorporate|include|uống|uong|ăn|thử|thu|thưởng|thuong|nên|nen)\b/iu;

/**
 * A limiter governs the matched food when it introduces that food or a list of foods.
 * "in moderation" is not a limiter. "over" and "instead of" cover the following phrase.
 */
function limiterGoverns(before: string): boolean {
  const matches = [...before.matchAll(new RegExp(LIMITER.source, "giu"))];
  if (matches.length === 0) return false;
  const last = matches[matches.length - 1];
  const gap = before.slice((last.index ?? 0) + last[0].length);
  if (/[.!?;]/.test(gap) || RECOMMEND_BREAK.test(gap)) return false;
  const wordsInGap = gap.trim().split(/\s+/).filter(Boolean);
  const shortScope = /over|instead of|thay/i.test(last[0]);
  return wordsInGap.length <= (shortScope ? 6 : 20);
}

function portionLimits(before: string): boolean {
  const tail = before.slice(-72);
  return (
    /(?:small|limited|nhỏ|nho)\s+(?:[\p{L}\p{N}]+\s+){0,3}(?:serving|portion|amount|piece|plate|phần|phan|miếng|mieng)?\s*(?:of\s+)?$/iu.test(tail) ||
    /(?:một phần nhỏ|mot phan nho|phần nhỏ|phan nho|một ít|mot it|no more than|không quá|khong qua|tối đa|toi da|chỉ một|chi mot|one small|half an|half a|nửa phần|nua phan)\s*$/iu.test(tail)
  );
}

function ruleHits(note: string, rule: DenyRule): boolean {
  const plain = !hasDiacritics(note);
  const text = plain ? foldNote(note) : note.toLowerCase();
  const pattern = plain ? rule.plain : rule.accented;
  for (const match of text.matchAll(new RegExp(pattern, "giu"))) {
    if (rule.ignoreNegation) return true;
    const before = text.slice(Math.max(0, (match.index ?? 0) - 96), match.index ?? 0);
    if (limiterGoverns(before)) continue;
    if (rule.portion && portionLimits(before)) continue;
    return true;
  }
  return false;
}

function recommendsFishWithoutMercuryCaveat(note: string): boolean {
  const plain = !hasDiacritics(note);
  const text = plain ? foldNote(note) : note.toLowerCase();
  if (!/(?:omega-?3|cá hồi|ca hoi|fatty fish|ăn thêm cá|an them ca|eat more fish)/iu.test(text)) return false;
  return !/(?:low-?mercury|low mercury|ít thủy ngân|it thuy ngan|thủy ngân thấp|thuy ngan thap|lower-mercury)/iu.test(text);
}

/** Drop model notes that contradict a selected condition or pregnancy food safety. */
export function filterSafeAiNotes(notes: readonly string[], profile: PregnancyProfile): string[] {
  const rules = [...CONDITION_DENY_RULES, ...FOOD_SAFETY_DENY_RULES].filter((rule) => rule.applies(profile));
  return notes.filter((note) => !recommendsFishWithoutMercuryCaveat(note) && !rules.some((rule) => ruleHits(note, rule)));
}

const META_PREFIX =
  /^(?:quy tac|rules for you|hard rules|luu y|note|khong khuyen|khong viet|do not recommend|do not say|do not restate)\b/;

const STOP = new Set([
  "a", "an", "the", "and", "or", "to", "of", "in", "on", "for", "with", "your", "you", "if", "it", "is", "are", "be", "as",
  "at", "by", "from", "that", "this", "into", "about", "than", "its", "va", "hoac", "cho", "voi", "cac", "mot",
  "nhung", "la", "de", "neu", "ban", "khi", "cua", "nhu", "hay", "ve", "roi", "nhe", "rat", "se", "da", "duoc", "can",
  "nen", "trong", "giua", "sau", "truoc", "moi", "ngay", "such", "also"
]);

const BIGRAMS: Record<string, string> = {
  caphe: "coffee",
  thuyngan: "mercury",
  tiettrung: "pasteur",
  tinhbot: "carb",
  bacsi: "clinician",
  nuocep: "juice",
  nuocngot: "sugarydrink",
  haisan: "seafood",
  phomai: "cheese",
  traicay: "fruit",
  hoaqua: "fruit"
};

const CONCEPTS: Record<string, string> = {
  cook: "cook",
  cooked: "cook",
  cooking: "cook",
  nau: "cook",
  chin: "cook",
  thoroughly: "cook",
  meat: "meat",
  thit: "meat",
  egg: "egg",
  eggs: "egg",
  trung: "egg",
  mercury: "mercury",
  low: "low",
  lower: "low",
  pasteurized: "pasteur",
  unpasteurized: "pasteur",
  unpasteurised: "pasteur",
  pasteurised: "pasteur",
  milk: "milk",
  sua: "milk",
  cheese: "cheese",
  juice: "juice",
  juices: "juice",
  sugary: "sugary",
  sweet: "sugary",
  sweets: "sugary",
  drink: "drink",
  drinks: "drink",
  uong: "drink",
  carbohydrate: "carb",
  carbohydrates: "carb",
  carbs: "carb",
  carb: "carb",
  slow: "slow",
  cham: "slow",
  clinician: "clinician",
  doctor: "clinician",
  meal: "meal",
  meals: "meal",
  bua: "meal",
  split: "split",
  chia: "split",
  small: "small",
  smaller: "small",
  nho: "small",
  portion: "portion",
  portions: "portion",
  avoid: "avoid",
  tranh: "avoid",
  raw: "raw",
  undercooked: "raw",
  seafood: "seafood",
  fish: "fish",
  ca: "fish",
  prioritize: "prioritize"
};

function contentTokens(text: string): string[] {
  const parts = foldNote(text).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    const pair = parts[index + 1] ? `${parts[index]}${parts[index + 1]}` : "";
    const bigram = BIGRAMS[pair];
    if (bigram) {
      tokens.push(bigram);
      index += 1;
      continue;
    }
    const wordToken = parts[index];
    if (STOP.has(wordToken)) continue;
    const concept = CONCEPTS[wordToken];
    if (!concept && wordToken.length < 3) continue;
    tokens.push(concept ?? wordToken);
  }
  return tokens;
}

function unique(tokens: readonly string[]): string[] {
  return [...new Set(tokens)];
}

/** True when the note mostly restates warnings the app already shows. */
function echoesText(note: string, canonical: readonly string[]): boolean {
  const noteTokens = unique(contentTokens(note));
  if (noteTokens.length < 2) return false;
  const corpus = new Set<string>();
  for (const warning of canonical) {
    const warningTokens = unique(contentTokens(warning));
    for (const token of warningTokens) corpus.add(token);
    let sharedWithOne = 0;
    const warningSet = new Set(warningTokens);
    for (const token of noteTokens) if (warningSet.has(token)) sharedWithOne += 1;
    if (sharedWithOne >= 3 && sharedWithOne / noteTokens.length >= 0.72) return true;
  }
  const shared = noteTokens.filter((token) => corpus.has(token)).length;
  const fresh = noteTokens.length - shared;
  if (shared >= 3 && fresh === 0) return true;
  return noteTokens.length >= 4 && shared >= 3 && fresh <= 1;
}

function isMeta(note: string): boolean {
  return META_PREFIX.test(foldNote(note).replace(/^[^a-z0-9]+/, "").trim());
}

/** Drop notes that restate the safety panel, a condition warning, or a meta instruction. */
export function filterEchoedAiNotes(notes: readonly string[], profile: PregnancyProfile, locale: Locale): string[] {
  const canonical = [...getConditionSpecificWarnings(profile, locale), ...getGeneralPregnancyFoodWarnings(locale)];
  return notes.filter((note) => !isMeta(note) && !echoesText(note, canonical));
}
