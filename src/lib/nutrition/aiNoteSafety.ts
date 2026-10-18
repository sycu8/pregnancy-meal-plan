import type { Locale } from "@/lib/i18n";
import type { HealthCondition, PregnancyProfile } from "@/types/pregnancy";
import { getConditionSpecificWarnings, getGeneralPregnancyFoodWarnings } from "@/lib/nutrition/safetyRules";
import { prepareNote } from "@/lib/nutrition/teenNote";
import { reviewWeightLossNote } from "@/lib/nutrition/weightLossReview";

type HitContext = { note: string; before: string; after: string };

type DenyRule = {
  applies: (profile: PregnancyProfile) => boolean;
  /** Matched on NFC text so a decomposed word still hits the accented keyword. */
  accented: string;
  /** Matched on the folded note. A hit whose original letters still carry a diacritic is ignored. */
  plain: string;
  /** A real portion limit, before or after the food, can keep this mention. */
  portion?: boolean;
  /** The phrase is the bad advice, including "avoid overcooking". */
  ignoreNegation?: boolean;
  /** Safe exception, such as reheated deli meat or a small cooked portion of liver. */
  spare?: (ctx: HitContext) => boolean;
};

function hasCondition(profile: PregnancyProfile, condition: HealthCondition): boolean {
  return profile.healthConditions.includes(condition);
}

function isGlucoseConcern(profile: PregnancyProfile): boolean {
  return hasCondition(profile, "gestational_diabetes") || profile.goals.includes("blood_sugar_control");
}

/** Strip accents for teen-code and for paraphrase tokens. Callers NFC the note first so indexes stay aligned. */
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
  "longans?",
  "lychees?",
  "litchis?",
  "papayas?",
  "rambutans?",
  "mangosteens?",
  "dragon fruits?",
  "grapes?",
  "pineapples?",
  "cantaloupes?",
  "sapodillas?",
  "custard apples?"
]
  .map((phrase) => `(?<![\\p{L}\\p{N}])(?:${phrase})(?![\\p{L}\\p{N}])`)
  .join("|");

const VI_FRUIT = [
  "trái cây",
  "hoa quả",
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
  "vải",
  "mít",
  "nho",
  "dứa",
  "thơm",
  "khế"
];

const VI_FRUIT_PLAIN = [
  "trai cay",
  "hoa qua",
  "dua hau",
  "dua luoi",
  "thanh long",
  "chom chom",
  "mang cut",
  "mang cau",
  "hong xiem",
  "vu sua",
  "du du",
  "xoai",
  "thom",
  "khe"
];

/** Bare quả/trái, plus guarded unaccented forms that must not match quá, chuỗi, or trà. */
const BARE_FRUIT_ACCENTED = "(?<!kết\\s)(?<![\\p{L}\\p{N}])quả(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])trái(?![\\p{L}\\p{N}])";
const BARE_FRUIT_PLAIN =
  "(?<!ket\\s)(?<![\\p{L}\\p{N}])qua(?![\\p{L}\\p{N}])(?!\\s+(?:nhieu|muc|trinh|han))|(?<![\\p{L}\\p{N}])trai(?![\\p{L}\\p{N}])(?!\\s+nghiem)";
const GUARDED_PLAIN_FRUIT =
  "(?<![\\p{L}\\p{N}])chuoi(?![\\p{L}\\p{N}])(?!\\s+bua)|(?<![\\p{L}\\p{N}])mit(?![\\p{L}\\p{N}])|(?:an|them|nhieu|qua|trai|chum)\\s+(?:vai|nho)|(?<![\\p{L}\\p{N}])(?:nho den|nho do|nho xanh|nho tuoi|vai thieu|vai tuoi|vai chin)(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])(?:traicay|hoaqua|duahau|thanhlong|chomchom)(?![\\p{L}\\p{N}])";
/** Bare nhãn is a nutrition label. Only a fruit context or "nhãn tươi" is the longan. */
const LONGAN_ACCENTED =
  "(?:(?<![\\p{L}\\p{N}])(?:quả|trái|ăn|nải|chùm)(?![\\p{L}\\p{N}])\\s+nhãn)|(?<![\\p{L}\\p{N}])nhãn tươi(?![\\p{L}\\p{N}])";
const LONGAN_PLAIN =
  "(?:(?<![\\p{L}\\p{N}])(?:qua|trai|an|them|nhieu|chum|nai)(?![\\p{L}\\p{N}])\\s+nhan)|(?<![\\p{L}\\p{N}])nhan tuoi(?![\\p{L}\\p{N}])";

const FRUIT_ACCENTED = `${EN_FRUIT}|${words(VI_FRUIT)}|${LONGAN_ACCENTED}|${BARE_FRUIT_ACCENTED}`;
const FRUIT_PLAIN = `${EN_FRUIT}|${words(VI_FRUIT_PLAIN)}|${LONGAN_PLAIN}|${GUARDED_PLAIN_FRUIT}|${BARE_FRUIT_PLAIN}`;

const EN_SWEET = ["juices?", "smoothies?", "honey", "desserts?", "sugary drinks?", "soft drinks?", "soda", "sugar cane", "white rice", "milk teas?", "bubble teas?", "colas?", "energy drinks?", "syrups?", "sweet teas?", "sweet foods?", "ice creams?", "chocolates?", "candies", "candy", "puddings?", "flans?", "donuts?", "doughnuts?", "cookies?", "cakes?", "pepsi", "fanta", "sprite", "sting", "coca cola", "red bull", "redbull", "mirinda"]
  .map((phrase) => `(?<![\\p{L}\\p{N}])(?:${phrase})(?![\\p{L}\\p{N}])`)
  .join("|") + "|(?<![\\p{L}\\p{N}])(?:7up|7-up|coca-cola)(?![\\p{L}\\p{N}])";
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
  "trà đào",
  "nước có ga",
  "nước đường",
  "nước tăng lực",
  "siro",
  "cơm tấm",
  "đồ ngọt",
  "trà tắc",
  "trà vải",
  "nước sâm",
  "kẹo",
  "sô cô la",
  "bánh kem",
  "bò húc",
  "trà chanh"
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
  "tra dao",
  "nuoc co ga",
  "nuoc duong",
  "nuoc tang luc",
  "siro",
  "com tam",
  "do ngot",
  "tra tac",
  "tra vai",
  "nuoc sam",
  "keo",
  "so co la",
  "banh kem",
  "bo huc",
  "tra chanh",
  "nuocep",
  "nuocngot",
  "nuocmia",
  "trasua",
  "sinhto"
];
/**
 * chè / phở / xôi / English pho stay high-GI. The plain pho guard skips phô mai and phổ biến.
 * A decomposed phở is NFC'd before the accented pattern runs.
 */
const FOLD_SENSITIVE_ACCENTED = `${word("chè")}|${word("xôi")}|${word("phở")}`;
const FOLD_SENSITIVE_PLAIN =
  "(?<!han\\s)(?<![\\p{L}\\p{N}])che(?![\\p{L}\\p{N}])(?!\\s+bien)|(?<![\\p{L}\\p{N}])xoi(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])pho(?![\\p{L}\\p{N}])(?!\\s+(?:mai|bien))";

const SWEET_ACCENTED = `${EN_SWEET}|${words(VI_SWEET)}|${word("kem")}|${FOLD_SENSITIVE_ACCENTED}`;
const SWEET_PLAIN = `${EN_SWEET}|${words(VI_SWEET_PLAIN)}|${FOLD_SENSITIVE_PLAIN}`;

function isCooked(note: string): boolean {
  const folded = foldNote(prepareNote(note).text);
  return /(?<![a-z-])(?:cooked|grilled|baked|steamed|sauteed|stir-fried|stir fried|pan-fried)(?![a-z])|nau chin|(?<![a-z])(?:hap|nuong|grill|xao|chien)(?![a-z])/iu.test(folded);
}

function isReheated(note: string): boolean {
  const folded = foldNote(prepareNote(note).text);
  if (/(?:chua|khong|without|not)\s+(?:lam nong|ham nong|nau chin|reheat|hap nong)/.test(folded)) return false;
  return /reheat|steaming hot|lam nong|ham nong|hap nong|heated until|nau chin/.test(folded);
}

/** Cooked sprouts can stay. Alfalfa and a raw attribute cannot. */
function cookedSprouts(ctx: HitContext): boolean {
  const folded = foldNote(prepareNote(ctx.note).text);
  if (/(?<![a-z])alfalfa(?![a-z])/iu.test(folded)) return false;
  if (/(?<![a-z])(?:raw|song)(?![a-z])/iu.test(folded)) return false;
  return isCooked(ctx.note);
}

function limitedAndCooked(ctx: HitContext): boolean {
  if (!isCooked(ctx.note)) return false;
  const prefixes = [ctx.before, foldNote(ctx.before)];
  const suffixes = [ctx.after, foldNote(ctx.after)];
  return prefixes.some((text) => portionLimits(text)) || suffixes.some((text) => portionLimitsAfter(text));
}

const CONDITION_DENY_RULES: DenyRule[] = [
  { applies: isGlucoseConcern, accented: FRUIT_ACCENTED, plain: FRUIT_PLAIN, portion: true },
  { applies: isGlucoseConcern, accented: SWEET_ACCENTED, plain: SWEET_PLAIN, portion: true },
  {
    applies: isGlucoseConcern,
    accented: `${word("sầu riêng")}|(?<![\\p{L}\\p{N}])durians?(?![\\p{L}\\p{N}])`,
    plain: `${word("sau rieng")}|(?<![\\p{L}\\p{N}])durians?(?![\\p{L}\\p{N}])`
  },
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

const SKIP_MEAL =
  "(?<![\\p{L}\\p{N}])skip(?:s|ping)?\\s+(?:meals?|breakfast|lunch|dinner)(?![\\p{L}\\p{N}])";
const EAT_LESS =
  "(?<![\\p{L}\\p{N}])eat(?:ing)?\\s+less(?!\\s+(?:sugar|sweet|sweets|candy|candies|junk|soda|fried))";
const CUT_CARB =
  "(?<![\\p{L}\\p{N}])(?:cut|cutting|no|zero)\\s+(?:carbs?|carbohydrates)(?![\\p{L}\\p{N}])";
const BARE_FAST =
  "(?<![\\p{L}\\p{N}])fast(?![\\p{L}\\p{N}])(?!\\s+(?:food|weight|gain))";
const CALORIE_CAP = "(?<![\\p{L}\\p{N}])\\d{3,4}\\s*(?:kcal|calories|calo)(?![\\p{L}\\p{N}])";

/** Weight-loss advice is the phrase itself. A real negation ("không nhịn ăn", "should not fast") still keeps the note. */
const DIET_ACCENTED = [
  words([
    "nhịn ăn",
    "bỏ bữa",
    "giảm cân",
    "giảm béo",
    "đốt mỡ",
    "giữ dáng",
    "eo thon",
    "ăn ít lại",
    "thanh lọc",
    "giải độc",
    "cắt tinh bột",
    "giảm tinh bột",
    "đếm calo",
    "cắt calo"
  ]),
  words([
    "lose weight",
    "weight loss",
    "losing weight",
    "calorie deficit",
    "cut calories",
    "cutting calories",
    "count calories",
    "counting calories",
    "calorie cap",
    "calorie limit",
    "dieting",
    "slim down",
    "slimming",
    "fat burning",
    "fat-burning",
    "burn fat",
    "low carb",
    "low-carb",
    "keto",
    "ketogenic",
    "detox",
    "intermittent fasting",
    "fasting"
  ]),
  SKIP_MEAL,
  EAT_LESS,
  CUT_CARB,
  BARE_FAST,
  CALORIE_CAP
].join("|");

const DIET_PLAIN = [
  words([
    "nhin an",
    "bo bua",
    "giam can",
    "giam beo",
    "dot mo",
    "giu dang",
    "eo thon",
    "an it lai",
    "thanh loc",
    "giai doc",
    "cat tinh bot",
    "giam tinh bot",
    "dem calo",
    "cat calo"
  ]),
  words([
    "lose weight",
    "weight loss",
    "losing weight",
    "calorie deficit",
    "cut calories",
    "cutting calories",
    "count calories",
    "counting calories",
    "calorie cap",
    "calorie limit",
    "dieting",
    "slim down",
    "slimming",
    "fat burning",
    "fat-burning",
    "burn fat",
    "low carb",
    "low-carb",
    "keto",
    "ketogenic",
    "detox",
    "intermittent fasting",
    "fasting"
  ]),
  SKIP_MEAL,
  EAT_LESS,
  CUT_CARB,
  BARE_FAST,
  CALORIE_CAP
].join("|");

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
      "sashimi|sushi|unpasteuri[sz]ed|unpasteuri[sz]e|non-?pasteuri[sz]ed|(?:not|n't)\\s+been\\s+pasteuri[sz]ed|not\\s+pasteuri[sz]ed|under-?cooked|(?<![\\p{L}\\p{N}])raw(?![\\p{L}\\p{N}])|raw milk|farm[-\\s]?fresh\\s+milk|farm\\s+milk|milk\\s+from\\s+the\\s+farm|fresh\\s+from\\s+the\\s+cow|straight\\s+from\\s+the\\s+cow|sữa sống|sữa mới vắt|sữa tươi sống|sữa bò sống|sữa nông trại|chưa tiệt trùng|chưa thanh trùng|(?:chưa\\s+(?:[\\p{L}\\p{N}]+\\s+){0,3}(?:tiệt trùng|thanh trùng))|cá sống|thịt sống|trứng sống|đồ sống|đồ tái|hải sản sống",
    plain:
      "sashimi|sushi|unpasteuri[sz]ed|unpasteuri[sz]e|non-?pasteuri[sz]ed|(?:not|n't)\\s+been\\s+pasteuri[sz]ed|not\\s+pasteuri[sz]ed|under-?cooked|(?<![\\p{L}\\p{N}])raw(?![\\p{L}\\p{N}])|raw milk|farm[-\\s]?fresh\\s+milk|farm\\s+milk|milk\\s+from\\s+the\\s+farm|fresh\\s+from\\s+the\\s+cow|straight\\s+from\\s+the\\s+cow|sua song|sua moi vat|sua tuoi song|sua bo song|sua nong trai|chua tiet trung|chua thanh trung|(?:chua\\s+(?:[a-z0-9]+\\s+){0,3}(?:tiet trung|thanh trung))|ca song|thit song|trung song|do song|do tai|hai san song"
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
    accented:
      "animal liver|(?<![\\p{L}\\p{N}])liver(?![\\p{L}\\p{N}])|gan động vật|(?<![\\p{L}\\p{N}])gan(?![\\p{L}\\p{N}])|ăn gan",
    plain: "animal liver|(?<![\\p{L}\\p{N}])liver(?![\\p{L}\\p{N}])|gan dong vat|(?<![\\p{L}\\p{N}])gan(?![\\p{L}\\p{N}])|an gan",
    spare: limitedAndCooked
  },
  {
    applies: () => true,
    accented: "rare steak|steak tái|bò tái|thịt tái",
    plain: "rare steak|steak tai|bo tai|thit tai"
  },
  {
    applies: () => true,
    accented:
      "(?<![\\p{L}\\p{N}])(?:alcohol|wines?|beers?|rượu|bia|cocktails?|soju|liquors?|spirits|boozes?|whisk(?:e)?ys?|vodkas?|rums?|gins?|champagnes?|ciders?|brand(?:y|ies)|tequilas?|bourbons?|scotch(?:es)?|liqueurs?|sangrias?|martinis?|ales?|lagers?|proseccos?)(?![\\p{L}\\p{N}])",
    plain:
      "(?<![\\p{L}\\p{N}])(?:alcohol|wines?|beers?|ruou|bia|vang|cocktails?|soju|liquors?|spirits|boozes?|whisk(?:e)?ys?|vodkas?|rums?|gins?|champagnes?|ciders?|brand(?:y|ies)|tequilas?|bourbons?|scotch(?:es)?|liqueurs?|sangrias?|martinis?|ales?|lagers?|proseccos?)(?![\\p{L}\\p{N}])"
  },
  {
    applies: () => true,
    accented: `${words(["pâté", "patê", "pate", "giò lụa", "xúc xích", "thịt nguội", "cold cuts", "salami"])}|(?<![\\p{L}\\p{N}])deli meats?(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])sausages?(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])ham(?![\\p{L}\\p{N}])`,
    plain: `${words(["pate", "gio lua", "xuc xich", "thit nguoi", "cold cuts", "salami"])}|(?<![\\p{L}\\p{N}])deli meats?(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])sausages?(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])ham(?![\\p{L}\\p{N}])`,
    spare: (ctx) => isReheated(ctx.note)
  },
  {
    applies: () => true,
    accented: `${words(["giá sống", "giá đỗ", "rau mầm", "mầm sống", "bean sprouts", "raw sprouts", "sprouted"])}|(?<![\\p{L}\\p{N}])alfalfa(?:\\s+sprouts)?(?![\\p{L}\\p{N}])`,
    plain: `${words(["gia song", "gia do", "rau mam", "mam song", "bean sprouts", "raw sprouts", "sprouted"])}|(?<![\\p{L}\\p{N}])alfalfa(?:\\s+sprouts)?(?![\\p{L}\\p{N}])`,
    spare: cookedSprouts
  },
  {
    applies: () => true,
    accented: `${word("tiết canh")}|blood soup|blood pudding|duck blood|pig blood|pork blood`,
    plain: `${word("tiet canh")}|blood soup|blood pudding|duck blood|pig blood|pork blood`
  },
  {
    applies: () => true,
    accented: `${words(["thuốc nam", "thuốc bắc", "ngải cứu", "trà thảo mộc", "thảo dược"])}|herbal teas?|herbal remedies|herbal remedy|herbal medicines?|mugwort`,
    plain: `${words(["thuoc nam", "thuoc bac", "ngai cuu", "ngai cu", "tra thao moc", "thao duoc"])}|herbal teas?|herbal remedies|herbal remedy|herbal medicines?|mugwort`
  },
  {
    applies: () => true,
    accented: `${words(["đu đủ xanh"])}|green papayas?|unripe papayas?`,
    plain: `${words(["du du xanh"])}|green papayas?|unripe papayas?`
  },
  {
    applies: () => true,
    accented: DIET_ACCENTED,
    plain: DIET_PLAIN
  },
  { applies: () => true, accented: "(?<![\\p{L}\\p{N}])tuna(?![\\p{L}\\p{N}])|cá ngừ", plain: "(?<![\\p{L}\\p{N}])tuna(?![\\p{L}\\p{N}])|ca ngu" },
  {
    applies: () => true,
    accented: "swordfish|king mackerel|cá kiếm|cá mập|cá thu vua|shark",
    plain: "swordfish|king mackerel|ca kiem|ca map|ca thu vua|shark"
  }
];

const LIMITER =
  /(?:^|[^\p{L}\p{N}])(?:instead of|replace|swap|thay thế|thay the|thay vì|thay vi|thay cho|thay|không nên|khong nen|không ăn|khong an|ko ăn|ko an|không được|khong duoc|không cho|khong cho|hạn chế|han che|giới hạn|gioi han|avoid|don't|do not|should not|shouldn't|shouldnt|must not|mustn't|mustnt|ought not|never|without|limited|limit|skip|tránh|tranh|không|khong|ko|đừng|dung|giảm|giam|bớt|đổi|doi|over|no)(?=$|[^\p{L}\p{N}])/giu;

/** "don't limit" and "không cần hạn chế" cancel the limiter; they are not a portion cap. */
const NEGATED_LIMITER =
  /(?:don't(?:\s+(?:need|have)\s+to)?|do not(?:\s+(?:need|have)\s+to)?|you need not|no need to|(?:không|khong|ko)\s+(?:nhất thiết|nhat thiet)(?:\s+(?:phải|phai))?|(?:không|khong|ko)\s+(?:cần thiết|can thiet)(?:\s+(?:phải|phai))?|(?:không|khong|ko)(?:\s+(?:cần|can))?(?:\s+(?:phải|phai))?)\s+(?:hạn chế|han che|giới hạn|gioi han|limit(?:ed|ing)?|kiêng|kieng|abstain|restrict)|(?:there(?:'s| is)\s+)?no limit on|(?:không|khong|ko)\s+(?:giới hạn|gioi han)/giu;

/** "don't avoid" and "không phải kiêng" still recommend the food. */
const NEGATED_AVOIDANCE =
  /(?:don't(?:\s+(?:have|need)\s+to)?|do not(?:\s+(?:have|need)\s+to)?|no need to|not|(?:không|khong|ko)(?:\s+(?:cần|can))?(?:\s+(?:phải|phai))?)\s+(?:avoid|tránh|tranh|skip|kiêng|kieng|abstain|restrict)/giu;

const RECOMMEND_BREAK =
  /(?:^|[^\p{L}\p{N}])(?:and|va|và|,)\s+(?:eat|eats|enjoy|try|tries|have|drink|drinks|add|choose|prioritize|incorporate|include|uống|uong|ăn|thử|thu|thưởng|thuong|nên|nen)\b/iu;

/** Negation does not cross a contrast, an exception, or a new clause. */
const SCOPE_BREAK =
  /(?:^|[^\p{L}\p{N}])(?:but|nhưng|nhung|mà|ma|except|ngoại trừ|ngoai tru|trừ|tru)(?=$|[^\p{L}\p{N}])/iu;

/** "replace X with Y" governs X, not the food after with/for/sang. */
const SWAP_DESTINATION =
  /(?:^|[^\p{L}\p{N}])(?:with|for|bằng|bang|sang|thành|thanh|lấy|lay)(?=$|[^\p{L}\p{N}])/iu;

/**
 * A limiter governs the matched food when it introduces that food or a list of foods.
 * "in moderation" is not a limiter. "over" and "instead of" cover the following phrase.
 */
function withoutNegatedLimiters(text: string): string {
  return text
    .replace(NEGATED_LIMITER, (match) => " ".repeat(match.length))
    .replace(NEGATED_AVOIDANCE, (match) => " ".repeat(match.length));
}

function limiterGoverns(before: string, nfcBefore?: string): boolean {
  const stripped = withoutNegatedLimiters(before);
  const matches = [...stripped.matchAll(new RegExp(LIMITER.source, "giu"))].filter((match) => {
    if (!nfcBefore || nfcBefore.length !== stripped.length) return true;
    const token = match[0].replace(/^[^\p{L}\p{N}]+/u, "").toLowerCase();
    if (token !== "no") return true;
    const start = match.index ?? 0;
    const slice = nfcBefore.slice(start, start + match[0].length);
    return !hasDiacritics(slice) && !/\p{M}/u.test(slice);
  });
  if (matches.length === 0) return false;
  const last = matches[matches.length - 1];
  const gap = stripped.slice((last.index ?? 0) + last[0].length);
  if (/[.!?;]/.test(gap) || SCOPE_BREAK.test(gap) || RECOMMEND_BREAK.test(gap)) return false;
  if (/replace|swap|thay|đổi|doi/i.test(last[0]) && SWAP_DESTINATION.test(gap)) return false;
  const wordsInGap = gap.trim().split(/\s+/).filter(Boolean);
  const shortScope = /over|instead of|thay|replace|swap/i.test(last[0]);
  return wordsInGap.length <= (shortScope ? 6 : 20);
}

function portionLimits(before: string): boolean {
  const tail = before.slice(-72);
  return (
    /(?:^|[^\p{L}\p{N}])(?:small|limited|nhỏ|nho)\s+(?:[\p{L}\p{N}]+\s+){0,3}(?:serving|portion|amount|piece|plate|phần|phan|miếng|mieng)?\s*(?:of\s+)?$/iu.test(tail) ||
    /(?:một phần nhỏ|mot phan nho|phần nhỏ|phan nho|một ít|mot it|no more than|không quá|khong qua|tối đa|toi da|chỉ một|chi mot|one small|half an|half a|nửa phần|nua phan)\s*$/iu.test(tail)
  );
}

const PORTION_CUE =
  /(?:\d+\s?(?:g|gram|grams|ml)\b)|(?<![\\p{L}\\p{N}])(?:small|limited|nhỏ|nho|vài|vai|một ít|mot it|một chút|mot chut|một miếng|mot mieng|một lát|mot lat|one|half|nửa|nua|no more than|không quá|khong qua|tối đa|toi da|chỉ|chi|up to|a few)\s+(?:[\p{L}\p{N}]+\s+){0,4}(?:serving|servings|portion|portions|amount|piece|pieces|plate|plates|bowl|bowls|cup|cups|slice|slices|handful|phần|phan|miếng|mieng|chén|chen|bát|bat|lát|lat|nắm|nam|thìa|thia)\b|(?:một phần nhỏ|mot phan nho|phần nhỏ|phan nho|one small|half an|half a|nửa phần|nua phan|a few|(?:một|mot)\s+(?:tô|to))\b/iu;

function portionLimitsAfter(after: string): boolean {
  const clause = (after.split(/(?:[.!?;]|(?:^|[^\p{L}\p{N}])(?:but|nhưng|nhung|mà|ma)(?=$|[^\p{L}\p{N}]))/iu)[0] ?? "").slice(0, 96);
  return PORTION_CUE.test(clause);
}

function afterClause(after: string): string {
  return (after.split(/(?:[.!?;]|(?:^|[^\p{L}\p{N}])(?:but|nhưng|nhung|mà|ma)(?=$|[^\p{L}\p{N}]))/iu)[0] ?? "").slice(0, 80);
}

/** "thì không được" and "is not allowed" reject the food, so the hit stays off the plate. */
function deniedAfter(after: string): boolean {
  const clause = afterClause(after);
  return /(?:thì|thi)\s+(?:không|khong|ko|chưa|chua)\s+(?:được|duoc|ổn|on|ngon|sao)|(?:\bis\b|\bare\b)\s+not\s+(?:fine|ok|okay|alright|safe|allowed)|(?:\bnot\b|\bnever\b)\s+allowed/iu.test(clause);
}

/** "pate thì được" and "pâté is fine" endorse the food the earlier limiter seemed to cover. */
function endorsedAfter(after: string): boolean {
  const clause = afterClause(after);
  if (/(?:không|khong|ko|chưa|chua)\s+(?:được|duoc|ổn|on|ngon|sao)|(?:\bnot\b|\bnever\b)\s+(?:fine|ok|okay|alright|safe|allowed)/iu.test(clause)) {
    return false;
  }
  return /(?:thì|thi)\s+(?:được|duoc|ổn|on|ngon)|(?:vẫn|van)\s+(?:được|duoc|ăn|an|ổn|on)|(?:có thể|co the)|(?:cũng|cung)\s+(?:được|duoc)|(?:không|khong|ko)\s+(?:sao|vấn đề|van de)|(?:\bis\b|\bare\b)\s+(?:fine|ok|okay|alright|safe|allowed)|(?:\bokay\b|\bok\b|\bfine\b)\s+to|\byou can\b/iu.test(clause);
}

/** True when the folded hit still has a diacritic in the original, so chế did not become chè. */
function nfcRangeForFold(nfc: string, foldStart: number, foldLength: number): { start: number; end: number } | null {
  let foldIndex = 0;
  let start = -1;
  let end = 0;
  for (let index = 0; index < nfc.length; index += 1) {
    const width = foldNote(nfc[index]).length;
    if (width === 0) {
      if (start >= 0) end = index + 1;
      continue;
    }
    if (start < 0 && foldIndex + width > foldStart) start = index;
    foldIndex += width;
    if (start >= 0 && foldIndex >= foldStart + foldLength) {
      end = index + 1;
      break;
    }
  }
  if (start < 0) return null;
  return { start, end };
}

function foldedHitHasDiacritic(nfc: string, foldStart: number, foldLength: number): boolean {
  const range = nfcRangeForFold(nfc, foldStart, foldLength);
  if (!range) return false;
  const slice = nfc.slice(range.start, range.end);
  return hasDiacritics(slice) || /\p{M}/u.test(slice);
}

function foldedHitIsTeen(nfc: string, foldStart: number, foldLength: number, teenAt: readonly boolean[]): boolean {
  const range = nfcRangeForFold(nfc, foldStart, foldLength);
  if (!range) return false;
  return teenAt.slice(range.start, range.end).some(Boolean);
}

function scanRule(text: string, pattern: string, rule: DenyRule, nfc: string, folded: boolean, teenAt: readonly boolean[]): boolean {
  for (const match of text.matchAll(new RegExp(pattern, "giu"))) {
    const start = match.index ?? 0;
    if (folded && foldedHitHasDiacritic(nfc, start, match[0].length) && !foldedHitIsTeen(nfc, start, match[0].length, teenAt)) continue;
    if (rule.ignoreNegation) return true;
    const from = Math.max(0, start - 96);
    const before = text.slice(from, start);
    const after = text.slice(start + match[0].length, start + match[0].length + 80);
    const nfcBefore = folded ? nfc.slice(from, start) : undefined;
    if ((limiterGoverns(before, nfcBefore) || deniedAfter(after)) && !endorsedAfter(after)) continue;
    if (rule.spare?.({ note: nfc, before, after })) continue;
    if (rule.portion && (portionLimits(before) || portionLimitsAfter(after))) continue;
    return true;
  }
  return false;
}

function ruleHits(note: string, rule: DenyRule): boolean {
  const prepared = prepareNote(note);
  const nfc = prepared.text;
  const accented = nfc.toLowerCase();
  const folded = foldNote(nfc);
  if (scanRule(accented, rule.accented, rule, nfc, false, prepared.teenAt)) return true;
  return scanRule(folded, rule.plain, rule, nfc, true, prepared.teenAt);
}

const SHELLFISH =
  /(?<![a-z])(?:oysters?|clams?|mussels?|shellfish|scallops?|prawns?|shrimps?|crabs?|hau|tom|ngheu|vem|hen|oc)(?![a-z])|so huyet|half[-\s]shell/giu;
const ALWAYS_RAW_SHELLFISH = /(?<![a-z])(?:oysters?|hau)(?![a-z])|so huyet|half[-\s]shell/giu;
const RAW_SHELLFISH_ATTR =
  /(?<![a-z])(?:raw|undercooked|under-cooked|song|tai)(?![a-z])|chua chin|tuoi song|half[-\s]shell/giu;

const CLAUSE_SPLIT =
  /[.!?;]|(?:^|[^\p{L}\p{N}])(?:but|nhưng|nhung|mà|ma)(?=$|[^\p{L}\p{N}])/giu;

function clauseRangesOf(text: string): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  let start = 0;
  for (const match of text.matchAll(CLAUSE_SPLIT)) {
    const at = match.index ?? 0;
    if (at > start) ranges.push({ start, end: at });
    start = at + match[0].length;
  }
  if (start < text.length) ranges.push({ start, end: text.length });
  return ranges.filter((range) => text.slice(range.start, range.end).trim().length > 0);
}

/**
 * Oysters and sò huyết drop unless that clause is cooked and not raw.
 * Other shellfish drop only when the same clause calls them raw.
 * A later cooked clause does not rescue an earlier raw one, and the reverse stays.
 */
function recommendsRawShellfish(note: string): boolean {
  const folded = foldNote(prepareNote(note).text);
  const alwaysRaw = new RegExp(ALWAYS_RAW_SHELLFISH.source, "iu");
  for (const range of clauseRangesOf(folded)) {
    const clause = folded.slice(range.start, range.end);
    const rawInClause = new RegExp(RAW_SHELLFISH_ATTR.source, "iu").test(clause);
    const cookedClause = isCooked(clause);
    for (const match of clause.matchAll(new RegExp(SHELLFISH.source, "giu"))) {
      const token = match[0];
      const always = alwaysRaw.test(token);
      if (always) {
        if (cookedClause && !rawInClause) continue;
      } else if (!rawInClause) {
        continue;
      }
      const absStart = range.start + (match.index ?? 0);
      const before = folded.slice(Math.max(0, absStart - 96), absStart);
      const after = folded.slice(absStart + token.length, absStart + token.length + 80);
      if ((limiterGoverns(before) || deniedAfter(after)) && !endorsedAfter(after)) continue;
      return true;
    }
  }
  return false;
}

function recommendsFishWithoutMercuryCaveat(note: string): boolean {
  const text = foldNote(prepareNote(note).text);
  if (!/(?:omega-?3|ca hoi|salmon|fatty fish|an them ca|eat more fish)/iu.test(text)) return false;
  if (/(?:low-?mercury|low mercury|it thuy ngan|thuy ngan thap|lower-mercury)/iu.test(text)) return false;
  const salmon = /(?:ca hoi|salmon)/iu.test(text);
  const raw = /(?:sashimi|(?<![a-z])raw(?![a-z])|(?<![a-z])song(?![a-z]))/iu.test(text);
  const cooked = isCooked(note);
  return !(salmon && cooked && !raw);
}

const DANGLING_END = /(?:^|[^\p{L}\p{N}])(?:and|or|with|và|va|hoặc|hoac|cho|với|voi)\s*$/iu;

/** A cut-off model fragment has no ending punctuation and is short or stops on a function word. */
export function noteIsComplete(note: string): boolean {
  const text = note.trim();
  if (/[.!?…]["']?$/.test(text)) return true;
  const wordsInNote = text.split(/\s+/).filter(Boolean);
  if (wordsInNote.length < 4) return false;
  return !DANGLING_END.test(text);
}

/** Drop model notes that contradict a selected condition or pregnancy food safety. */
export function filterSafeAiNotes(notes: readonly string[], profile: PregnancyProfile): string[] {
  const rules = [...CONDITION_DENY_RULES, ...FOOD_SAFETY_DENY_RULES].filter((rule) => rule.applies(profile));
  return notes.filter(
    (note) =>
      !reviewWeightLossNote(note).drop &&
      !recommendsFishWithoutMercuryCaveat(note) &&
      !recommendsRawShellfish(note) &&
      !rules.some((rule) => ruleHits(note, rule))
  );
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
  cahoi: "salmon",
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
