import type { PregnancyProfile } from "@/types/pregnancy";
import type { Locale } from "@/lib/i18n";

export const MEDICAL_DISCLAIMER =
  "Thực đơn được tạo tự động dựa trên thông tin bạn cung cấp và chỉ mang tính tham khảo. Ứng dụng không chẩn đoán, điều trị hoặc thay thế tư vấn từ bác sĩ sản khoa/chuyên gia dinh dưỡng. Nếu bạn có tiểu đường thai kỳ, tăng huyết áp, tiền sản giật, thiếu máu nặng, thai chậm tăng trưởng hoặc bất kỳ vấn đề y khoa nào, hãy hỏi bác sĩ trước khi áp dụng.";

export const LOCAL_PRIVACY_NOTICE =
  "Mặc định, thông tin của bạn được lưu trên trình duyệt bằng localStorage. Đồng bộ lên cloud chỉ diễn ra khi bạn đăng nhập và bật đồng bộ (opt-in).";

export const ENGLISH_MEDICAL_DISCLAIMER =
  "This meal plan is generated automatically from the information you provide and is for reference only. The app does not diagnose, treat or replace advice from an obstetrician or registered dietitian. If you have gestational diabetes, hypertension, preeclampsia risk, severe anemia, fetal growth concerns or any medical issue, ask your clinician before following the plan.";

export function getGeneralPregnancyFoodWarnings(locale: Locale = "vi"): string[] {
  if (locale === "en") {
    return [
      "Avoid raw or undercooked food; cook meat, fish, eggs and seafood thoroughly.",
      "Avoid high-mercury fish such as swordfish, shark and king mackerel; choose lower-mercury fish in moderate amounts.",
      "Avoid unpasteurized milk or cheese.",
      "Avoid chilled pate, deli meats or sausages unless reheated until steaming hot.",
      "Do not drink alcohol.",
      "Limit caffeine; ask your clinician if you drink coffee, strong tea or energy drinks daily.",
      "Be cautious with herbal remedies, traditional medicine or supplements from unclear sources.",
      "Do not eat too much animal liver because it may contain excess retinol-form vitamin A.",
      "Limit sugary drinks and high-sugar foods, especially if you have gestational diabetes."
    ];
  }

  return [
    "Không ăn đồ sống/tái; nấu chín kỹ thịt, cá, trứng và hải sản.",
    "Tránh cá thủy ngân cao như cá kiếm, cá mập, cá thu vua; ưu tiên cá ít thủy ngân và dùng lượng vừa phải.",
    "Tránh sữa hoặc phô mai chưa thanh trùng.",
    "Tránh pate lạnh, thịt nguội hoặc xúc xích chưa làm nóng kỹ.",
    "Không dùng rượu bia.",
    "Hạn chế caffeine; hỏi bác sĩ nếu bạn đang uống cà phê, trà đặc hoặc nước tăng lực hằng ngày.",
    "Cẩn trọng với thảo mộc, thuốc nam hoặc thực phẩm bổ sung không rõ nguồn gốc.",
    "Không ăn quá nhiều gan động vật vì có thể dư vitamin A dạng retinol.",
    "Hạn chế nước ngọt và đồ nhiều đường, đặc biệt nếu có tiểu đường thai kỳ."
  ];
}

export function getConditionSpecificWarnings(profile: PregnancyProfile, locale: Locale = "vi"): string[] {
  const conditions = new Set(profile.healthConditions.filter((condition) => condition !== "none"));
  const notes: string[] = [];

  if (conditions.has("gestational_diabetes") || profile.goals.includes("blood_sugar_control")) {
    notes.push(
      locale === "vi"
        ? "Tiểu đường thai kỳ: ưu tiên tinh bột chậm, chia nhỏ bữa, tránh nước ép/nước ngọt và hỏi bác sĩ về lượng tinh bột phù hợp."
        : "Gestational diabetes: prioritize slow-digesting carbohydrates, split meals into smaller portions, avoid juice and sugary drinks, and ask your clinician about the right carbohydrate amount."
    );
  }
  if (conditions.has("anemia") || profile.goals.includes("increase_iron_calcium_protein")) {
    notes.push(
      locale === "vi"
        ? "Thiếu máu/thiếu sắt: tăng thực phẩm giàu sắt kèm vitamin C, tránh trà/cà phê gần bữa chính."
        : "Anemia or low iron: add iron-rich foods with vitamin C, and avoid tea or coffee close to main meals."
    );
  }
  if (conditions.has("constipation") || profile.goals.includes("relieve_constipation")) {
    notes.push(
      locale === "vi"
        ? "Táo bón: tăng chất xơ, nước, sữa chua, rau xanh, đậu và khoai lang theo mức dung nạp."
        : "Constipation: increase fiber, water, yogurt, leafy greens, beans and sweet potato as tolerated."
    );
  }
  if (conditions.has("morning_sickness") || profile.goals.includes("reduce_nausea")) {
    notes.push(
      locale === "vi"
        ? "Nghén: chia nhỏ bữa, chọn món ít mùi, mềm, dễ tiêu; có thể thử bánh mì, cháo, khoai hoặc trái cây ít chua."
        : "Morning sickness: eat smaller meals and choose mild-smelling, soft, easy-to-digest foods such as bread, porridge, potatoes or less acidic fruit."
    );
  }
  if (conditions.has("fast_weight_gain") || profile.goals.includes("weight_control")) {
    notes.push(
      locale === "vi"
        ? "Tăng cân nhanh: giảm đồ ngọt, nước ngọt, tinh bột tinh chế; tăng rau, đạm nạc và món hấp/luộc."
        : "Fast weight gain: reduce sweets, sugary drinks and refined starches; add vegetables, lean protein and steamed or boiled dishes."
    );
  }
  if (conditions.has("slow_weight_gain") || conditions.has("small_fetus") || profile.goals.includes("healthy_weight_gain")) {
    notes.push(
      locale === "vi"
        ? "Tăng cân chậm/thai nhỏ: tăng năng lượng lành mạnh từ đạm, sữa tiệt trùng, đậu, hạt và chất béo tốt."
        : "Slow weight gain or smaller fetal growth: add healthy energy from protein, pasteurized dairy, beans, nuts and healthy fats."
    );
  }
  if (conditions.has("hypertension") || conditions.has("edema")) {
    notes.push(
      locale === "vi"
        ? "Tăng huyết áp/phù: giảm món quá mặn, đồ chế biến sẵn; theo dõi theo hướng dẫn của bác sĩ."
        : "High blood pressure or swelling: reduce very salty foods and processed foods; follow your clinician's monitoring guidance."
    );
  }
  if (conditions.has("reflux")) {
    notes.push(
      locale === "vi"
        ? "Trào ngược: ăn lượng nhỏ, tránh nằm ngay sau ăn, hạn chế món nhiều dầu, cay hoặc quá chua nếu làm khó chịu."
        : "Reflux: eat smaller portions, avoid lying down right after meals, and limit oily, spicy or very sour foods if they trigger discomfort."
    );
  }
  if (conditions.has("large_fetus")) {
    notes.push(
      locale === "vi"
        ? "Thai lớn hơn chuẩn: ưu tiên bữa cân bằng, hạn chế đồ ngọt; trao đổi bác sĩ về theo dõi đường huyết nếu cần."
        : "Baby measuring larger: prioritize balanced meals, limit sweets and ask your clinician whether blood-sugar monitoring is needed."
    );
  }

  return notes;
}

/**
 * Doctor-note red-flag phrases, with diacritics.
 *
 * Cuong signed off this list on 18 Oct 2026. The short phrase "ra nước" is
 * replaced by "ra nước âm đạo" and "chảy nước âm đạo" so everyday notes about
 * urine do not fire. Matching is accent-aware and letter-bounded (see
 * noteMatchesUrgentKeyword).
 */
export const URGENT_DOCTOR_NOTE_KEYWORDS = [
  "ra máu",
  "chảy máu",
  "xuất huyết",
  "ra huyết",
  "ra dịch hồng",
  "ra dịch nâu",
  "đau bụng dữ dội",
  "đau bụng nhiều",
  "đau quặn",
  "đau đầu dữ dội",
  "đau đầu nhiều",
  "nhìn mờ",
  "mờ mắt",
  "hoa mắt",
  "phù mặt",
  "phù nhiều",
  "phù tay chân",
  "huyết áp cao",
  "thai máy giảm",
  "thai máy ít",
  "thai đạp ít",
  "con ít đạp",
  "thai không đạp",
  "vỡ ối",
  "rỉ ối",
  "ra nước âm đạo",
  "chảy nước âm đạo",
  "co giật",
  "ngất",
  "xỉu",
  "khó thở",
  "đau ngực",
  "sốt cao",
  "nôn ói không ăn uống được",
  "nôn ra máu",
  "gò liên tục",
  "đau vai"
] as const;

/** Sentence the banner emphasizes. Signed off by Cuong on 18 Oct 2026. */
export const URGENT_NOTE_ACTION = {
  vi: "Hãy đến ngay khoa cấp cứu/khoa sản gần nhất hoặc gọi 115.",
  en: "Go to the nearest emergency department or maternity unit right now, or call 115."
} as const;

/**
 * Full planner reply. The action sentence is the review's required replacement
 * for "liên hệ … sớm" / "Contact … soon".
 */
export const URGENT_NOTE_BANNER = {
  vi: `Ghi chú của bạn có dấu hiệu có thể nguy hiểm (ra máu, đau bụng dữ dội, nhìn mờ, thai máy giảm…). ${URGENT_NOTE_ACTION.vi} Phù hoặc sưng đột ngột ở mặt hay tay là dấu hiệu cần cấp cứu. Đừng chờ đến lịch khám. Thực đơn dưới đây không thay thế việc khám ngay.`,
  en: `Your note mentions signs that may be dangerous (bleeding, severe abdominal pain, blurred vision, reduced fetal movement). ${URGENT_NOTE_ACTION.en} Sudden swelling of the face or hands needs emergency care. Do not wait for a scheduled appointment. The meal plan below does not replace immediate care.`
} as const;

/**
 * NFC, then lowercase. A leading Telex «dd» becomes «đ» (ddap → đap, ddau → đau).
 * Also produce a diacritics-stripped copy for matching.
 */
export function normalizeUrgentNote(value: string): { nfc: string; stripped: string } {
  const nfc = value
    .normalize("NFC")
    .toLowerCase()
    .replace(/(^|[^\p{L}])dd(?=\p{L})/gu, "$1đ");
  const stripped = nfc.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");
  return { nfc, stripped };
}

/**
 * Telex types đ as «dd» at the start of a syllable («ddap», «ddau»).
 * Only a leading «dd» is rewritten, so a «dd» inside an English word stays put.
 */
function foldLeadingDd(token: string): string {
  const nfc = token.normalize("NFC").toLowerCase();
  return nfc.startsWith("dd") ? `đ${nfc.slice(2)}` : nfc;
}

/**
 * Tone marks and vowel diacritics (ă, â, ê, ô, ơ, ư, and the tone set).
 * đ/Đ is a consonant, so a token such as «đap» is unaccented and may fold to «dap».
 * A different tone, such as «đáp», still has a mark and must not fold onto «đạp».
 */
function hasToneOrVowelMark(value: string): boolean {
  const withoutD = foldLeadingDd(value).replace(/đ/g, "d");
  return /\p{M}/u.test(withoutD.normalize("NFD"));
}

function foldToken(token: string): string {
  return normalizeUrgentNote(foldLeadingDd(token)).stripped;
}

function letterTokens(value: string): string[] {
  return value.split(/[^\p{L}]+/u).filter(Boolean);
}

/** Letter tokens plus counts such as 2 and 1-2. Keyword matching stays letters-only. */
function movementTokens(value: string): string[] {
  return [...value.matchAll(/\p{L}+|\d+(?:-\d+)?/gu)].map((match) => match[0] ?? "");
}

/**
 * A comma, semicolon, period, or question mark ends negation scope.
 * hay / hoặc / or stays inside the same negation and is not a break.
 */
const CLAUSE_BREAK = "§";

function clauseTokens(value: string): string[] {
  const marked = normalizeUrgentNote(value).nfc.replace(/[!?？.;…,，；\n\r]+/gu, ` ${CLAUSE_BREAK} `);
  return marked
    .split(new RegExp(`[^\\p{L}${CLAUSE_BREAK}]+`, "u"))
    .filter(Boolean)
    .map((token) => (token === CLAUSE_BREAK ? token : foldLeadingDd(token)));
}

function crossesClause(tokens: string[], left: number, right: number): boolean {
  const from = Math.min(left, right) + 1;
  const to = Math.max(left, right);
  for (let index = from; index < to; index += 1) {
    if (tokens[index] === CLAUSE_BREAK) return true;
  }
  return false;
}

function tokensMatch(noteToken: string, keyToken: string): boolean {
  const note = foldLeadingDd(noteToken);
  const key = foldLeadingDd(keyToken);
  if (note === key) return true;
  if (hasToneOrVowelMark(note)) return false;
  return foldToken(note) === foldToken(key);
}

/**
 * «dau ngực» is the đầu ngực (nipple) family when only ngực keeps its accent.
 * Fully unaccented «dau nguc» and properly spelled «đau ngực» still match.
 */
function isNippleFalseFriend(noteDau: string, noteNguc: string, keyDau: string, keyNguc: string): boolean {
  if (keyDau !== "đau" || keyNguc !== "ngực") return false;
  if (noteNguc !== "ngực" || noteDau === "đau") return false;
  return !hasToneOrVowelMark(noteDau) && foldToken(noteDau) === "dau";
}

/** The one allowed gap may not be a negator («thai không máy giảm», «không phải»). */
function gapSkipsNegator(noteTokens: string[], index: number): boolean {
  const skipped = noteTokens[index] ?? "";
  if (skipped === CLAUSE_BREAK) return true;
  const previous = index > 0 ? foldToken(noteTokens[index - 1] ?? "") : undefined;
  return isSymptomNegator(skipped, previous) || isNeverToken(skipped);
}

/** Skipping chân would turn leg swelling «phù chân nhiều» into the keyword «phù nhiều». */
function gapSkipsLegInPhuNhieu(skipped: string, prevKey: string, nextKey: string): boolean {
  return foldToken(skipped) === "chan" && foldToken(prevKey) === "phu" && foldToken(nextKey) === "nhieu";
}

/**
 * Unaccented «mat ca» is mắt cá (ankle), not mặt.
 * Accented mặt still matches; accented mắt never matches the keyword mặt.
 */
function isUnaccentedAnkleNotFace(noteToken: string, following: string | undefined, keyToken: string): boolean {
  if (keyToken !== "mặt" || hasToneOrVowelMark(noteToken)) return false;
  return foldToken(noteToken) === "mat" && foldToken(following ?? "") === "ca";
}

/**
 * Letter-bounded match. One extra note token may sit inside a phrase.
 * A note token matches when it is NFC-equal, or when it has no tone or vowel
 * diacritic and its folded form equals the folded keyword token.
 * Mixed notes such as «chảy nuoc am dao» match, while «xíu» does not match «xỉu».
 * The extra token may not be chân between phù and nhiều, so «phù chân nhiều»
 * does not match «phù nhiều». Unaccented «mat ca» is the ankle, not mặt.
 * A leading telex «dd» is đ, so «ddau nguc» matches «đau ngực».
 * A short negation before the phrase suppresses it («không đau ngực», «chưa chảy máu»,
 * «chưa bao giờ ra máu», «hết đau ngực rồi», or a whole-token teen negator).
 * «never» does too. A second symptom joined by hay / hoặc / or stays in that negation.
 * A comma, semicolon, or period ends it, so «không đau đầu, ra máu» still alerts.
 * The one allowed gap inside a phrase may not be a negator, so «thai máy giảm»
 * cannot jump «không» or «không phải». «không thở được» is inability, not a negation.
 */
export function noteMatchesUrgentKeyword(note: string, keyword: string): boolean {
  const noteTokens = clauseTokens(note);
  const keyTokens = letterTokens(normalizeUrgentNote(keyword).nfc).map(foldLeadingDd);
  if (keyTokens.length === 0 || noteTokens.length === 0) return false;

  for (let start = 0; start < noteTokens.length; start += 1) {
    if (noteTokens[start] === CLAUSE_BREAK) continue;
    if (!tokensMatch(noteTokens[start], keyTokens[0])) continue;
    const end = alignKeyword(noteTokens, keyTokens, start);
    if (end === null || symptomGovernedByNegation(noteTokens, start, end)) continue;
    return true;
  }
  return false;
}

function alignKeyword(noteTokens: string[], keyTokens: string[], start: number): number | null {
  let noteIndex = start + 1;
  let gaps = 0;
  for (let keyIndex = 1; keyIndex < keyTokens.length; keyIndex += 1) {
    if (noteIndex >= noteTokens.length) return null;
    const keyToken = keyTokens[keyIndex];
    const prevKey = keyTokens[keyIndex - 1];
    const prevNote = noteTokens[noteIndex - 1];
    if (
      tokensMatch(noteTokens[noteIndex], keyToken) &&
      !isNippleFalseFriend(prevNote, noteTokens[noteIndex], prevKey, keyToken) &&
      !isUnaccentedAnkleNotFace(noteTokens[noteIndex], noteTokens[noteIndex + 1], keyToken)
    ) {
      noteIndex += 1;
      continue;
    }
    if (
      gaps < 1 &&
      noteIndex + 1 < noteTokens.length &&
      noteTokens[noteIndex] !== CLAUSE_BREAK &&
      !gapSkipsNegator(noteTokens, noteIndex) &&
      !gapSkipsLegInPhuNhieu(noteTokens[noteIndex], prevKey, keyToken) &&
      tokensMatch(noteTokens[noteIndex + 1], keyToken) &&
      !isNippleFalseFriend(prevNote, noteTokens[noteIndex + 1], prevKey, keyToken) &&
      !isUnaccentedAnkleNotFace(noteTokens[noteIndex + 1], noteTokens[noteIndex + 2], keyToken)
    ) {
      gaps += 1;
      noteIndex += 2;
      continue;
    }
    return null;
  }
  return noteIndex;
}

const FETAL_SUBJECTS = new Set(["thai", "con", "be"]);
const FETAL_REDUCTIONS = new Set(["it", "giam", "yeu", "khong", "chang", "mat", "ngung"]);
const MACHINE_AFTER_MAY = new Set(["hut", "lanh", "giat", "say", "xay", "bom", "tinh", "loc"]);
const KHONG_BRIDGE = new Set([
  "thay",
  "co",
  "con",
  "em",
  "be",
  "cua",
  "cam",
  "nhan",
  "duoc",
  "the"
]);
/** Whole-token teen spellings of không. «hông» is matched on the raw token so «hồng» does not count. */
const TEEN_NEGATOR_FOLDS = new Set(["ko", "k", "kh", "hok", "hem", "kg", "khg", "hk"]);
/**
 * One negator set for absence, a negated decrease, never-stops, and negation scope.
 * Each pair is the accented spelling and its unaccented fold.
 * «khong» still folds to «không». «hồng» is neither «hổng» nor «hông».
 * «chả» is not in this list: the hỏi tone is required, and unaccented «cha» is father.
 */
const SHARED_NEGATOR_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["không", "khong"],
  ["chưa", "chua"],
  ["chẳng", "chang"],
  ["hổng", "hong"],
  ["hông", "hong"]
];
/**
 * Negators the property test locks, accented Vietnamese plus English.
 * Unaccented folds stay on the pairs («khong» → «không») and are not repeated here.
 * Teen spellings stay on TEEN_NEGATOR_FOLDS. «cha» is father and is on neither list.
 */
export const SHARED_NEGATORS: readonly string[] = [
  "không",
  "hổng",
  "hông",
  "chả",
  "chẳng",
  "chưa",
  "not",
  "didn't",
  "haven't",
  "hasn't",
  "don't"
];
/** Tokens that may sit between thai/con/bé and đạp/máy/cử động. */
const SUBJECT_VERB_GAP = 5;
/**
 * After filler tokens are removed, a negator or a reduce word must sit within
 * this many tokens of đạp / máy / cử động / kick / move / movement.
 */
const REDUCED_MOVEMENT_WINDOW = 8;

type MovementSpan = [number, number];

function isTeenNegator(canonical: string, previousFolded: string | undefined): boolean {
  if (canonical === "hông") return true;
  if (!hasToneOrVowelMark(canonical) && foldToken(canonical) === "hong") return true;
  if (hasToneOrVowelMark(canonical)) return false;
  const folded = foldToken(canonical);
  if (!TEEN_NEGATOR_FOLDS.has(folded)) return false;
  if ((folded === "k" || folded === "kh") && previousFolded === "vitamin") return false;
  return true;
}

/**
 * Negation in front of a symptom class. Whole tokens only.
 * «hồng» (pink) is not the teen negator «hông». «hết sức» intensifies.
 */
const SYMPTOM_FILLERS: Array<[string, string]> = [
  ["bị", "bi"],
  ["có", "co"],
  ["còn", "con"],
  ["thấy", "thay"],
  ["đang", "dang"],
  ["hề", "he"],
  ["phải", "phai"],
  ["thể", "the"],
  ["từng", "tung"]
];

function isSymptomFiller(token: string): boolean {
  return SYMPTOM_FILLERS.some(([exact, folded]) => isMarkedOrPlain(token, exact, folded));
}

/**
 * Perception words between a negator and an ordinary red flag still deny that flag.
 * «không cảm thấy đau ngực» and «không nhận ra ra máu» stay silent.
 * «được» counts only when it completes cảm nhận / cảm thấy, not «không được ra máu».
 */
function isNegationFiller(tokens: string[], index: number): boolean {
  const token = tokens[index] ?? "";
  if (token === CLAUSE_BREAK) return false;
  if (isSymptomFiller(token)) return true;
  if (isMarkedOrPlain(token, "cảm", "cam") || isMarkedOrPlain(token, "giác", "giac")) return true;
  if (isMarkedOrPlain(token, "nhận", "nhan")) return true;
  if (
    isMarkedOrPlain(token, "ra", "ra") &&
    index > 0 &&
    isMarkedOrPlain(tokens[index - 1] ?? "", "nhận", "nhan")
  ) {
    return true;
  }
  if (!isMarkedOrPlain(token, "được", "duoc") || index <= 0) return false;
  const previous = tokens[index - 1] ?? "";
  return (
    isMarkedOrPlain(previous, "thấy", "thay") ||
    isMarkedOrPlain(previous, "nhận", "nhan") ||
    isMarkedOrPlain(previous, "nhìn", "nhin") ||
    isMarkedOrPlain(previous, "giác", "giac")
  );
}

/**
 * «đau hông» is the hip. «hông» / unaccented «hong» is a negator only in negator
 * position, never as the object of đau. Accented «hổng» stays a negator.
 */
function isHipAfterPain(token: string, previousFolded: string | undefined): boolean {
  if (previousFolded !== "dau") return false;
  const canonical = foldLeadingDd(token);
  if (canonical === "hổng") return false;
  if (canonical === "hông") return true;
  if (hasToneOrVowelMark(canonical)) return false;
  return foldToken(canonical) === "hong";
}

/** «chả» only. Unaccented «cha» is father and must not fold onto this negator. */
function isAccentOnlyCha(token: string): boolean {
  return foldLeadingDd(token) === "chả";
}

/** Shared negator: accented form, unaccented fold, or a whole-token teen spelling. */
function isSharedNegator(token: string, previousFolded: string | undefined): boolean {
  if (isHipAfterPain(token, previousFolded)) return false;
  if (isAccentOnlyCha(token)) return true;
  for (const [exact, folded] of SHARED_NEGATOR_PAIRS) {
    if (isMarkedOrPlain(token, exact, folded)) return true;
  }
  return isTeenNegator(token, previousFolded);
}

function isSymptomNegator(token: string, previousFolded: string | undefined): boolean {
  return isSharedNegator(token, previousFolded);
}

/** English «never» before a symptom, including «never had đau ngực». */
function isNeverToken(token: string): boolean {
  if (token === CLAUSE_BREAK || hasToneOrVowelMark(token)) return false;
  return foldToken(foldLeadingDd(token)) === "never";
}

function isOrConjunction(token: string): boolean {
  if (token === CLAUSE_BREAK) return false;
  if (token === "hay" || token === "hoặc" || token === "or") return true;
  if (hasToneOrVowelMark(token)) return false;
  return foldToken(token) === "hay" || foldToken(token) === "hoac" || foldToken(token) === "or";
}

/** Walking backward, «giờ» with «bao» immediately before it is the never-idiom tail. */
function isBaoGioEndingAt(tokens: string[], index: number): boolean {
  return (
    index > 0 &&
    isMarkedOrPlain(tokens[index] ?? "", "giờ", "gio") &&
    isMarkedOrPlain(tokens[index - 1] ?? "", "bao", "bao")
  );
}

function fillersBetween(tokens: string[], from: number, to: number): boolean {
  for (let index = from + 1; index < to; index += 1) {
    if (tokens[index] === CLAUSE_BREAK) return false;
    if (!isSymptomFiller(tokens[index] ?? "")) return false;
  }
  return true;
}

/**
 * Direct negator, optional fillers, and one «bao giờ».
 * Does not cross a comma or treat hay/hoặc as part of the negation.
 * Used for inability («không thở được», «chưa bao giờ thở nổi»), not for a second symptom.
 */
function directNegatorBefore(tokens: string[], target: number): boolean {
  let index = target - 1;
  let guard = 0;
  while (index >= 0 && guard < 8) {
    const token = tokens[index] ?? "";
    if (token === CLAUSE_BREAK) return false;
    if (isBaoGioEndingAt(tokens, index)) {
      index -= 2;
      guard += 2;
      continue;
    }
    const previous = index > 0 ? foldToken(tokens[index - 1] ?? "") : undefined;
    if (isSymptomNegator(token, previous) || isNeverToken(token)) return true;
    if (!isNegationFiller(tokens, index)) return false;
    index -= 1;
    guard += 1;
  }
  return false;
}

function neverWithin(tokens: string[], from: number): boolean {
  for (let index = from; index >= Math.max(0, from - 5); index -= 1) {
    if (tokens[index] === CLAUSE_BREAK) return false;
    if (isNeverToken(tokens[index] ?? "")) return true;
  }
  return false;
}

/**
 * Negation covers the next symptom, a «chưa/chẳng bao giờ» idiom, English «never»,
 * and a second symptom joined by hay / hoặc / or. A clause break stops the scan,
 * so a comma after the negator does not silence the next red flag.
 */
function governedByPrecedingNegation(tokens: string[], target: number): boolean {
  let index = target - 1;
  let crossedOr = false;
  let steps = 0;
  while (index >= 0 && steps < 18) {
    const token = tokens[index] ?? "";
    if (token === CLAUSE_BREAK) return false;
    if (
      isMarkedOrPlain(token, "là", "la") &&
      index > 0 &&
      isOrConjunction(tokens[index - 1] ?? "")
    ) {
      crossedOr = true;
      index -= 2;
      steps += 2;
      continue;
    }
    if (isOrConjunction(token)) {
      crossedOr = true;
      index -= 1;
      steps += 1;
      continue;
    }
    if (isBaoGioEndingAt(tokens, index)) {
      index -= 2;
      steps += 2;
      continue;
    }
    if (isNegationFiller(tokens, index)) {
      index -= 1;
      steps += 1;
      continue;
    }
    const previous = index > 0 ? foldToken(tokens[index - 1] ?? "") : undefined;
    if (isSymptomNegator(token, previous) || isNeverToken(token)) return true;
    if (!crossedOr) return neverWithin(tokens, index);
    index -= 1;
    steps += 1;
  }
  return false;
}

/** «hết … rồi» means the symptom stopped. «không hết … rồi» means it has not. */
function hetRoiWraps(tokens: string[], start: number, endExclusive: number): boolean {
  const last = endExclusive - 1;
  if (last < start || last >= tokens.length) return false;
  let foundRoi = false;
  for (let index = last + 1; index <= Math.min(tokens.length - 1, last + 2); index += 1) {
    if (tokens[index] === CLAUSE_BREAK) break;
    if (isMarkedOrPlain(tokens[index] ?? "", "rồi", "roi")) {
      foundRoi = true;
      break;
    }
  }
  if (!foundRoi) return false;
  for (let index = Math.max(0, start - 2); index < start; index += 1) {
    if (!isMarkedOrPlain(tokens[index] ?? "", "hết", "het")) continue;
    if (isMarkedOrPlain(tokens[index + 1] ?? "", "sức", "suc")) continue;
    if (tokens[index + 1] === CLAUSE_BREAK) continue;
    if (
      index > 0 &&
      isSymptomNegator(tokens[index - 1] ?? "", index > 1 ? foldToken(tokens[index - 2] ?? "") : undefined) &&
      fillersBetween(tokens, index - 1, index)
    ) {
      continue;
    }
    if (!fillersBetween(tokens, index, start)) continue;
    return true;
  }
  return false;
}

function symptomGovernedByNegation(tokens: string[], start: number, endExclusive: number): boolean {
  return governedByPrecedingNegation(tokens, start) || hetRoiWraps(tokens, start, endExclusive);
}

function isMovementNegator(_folded: string, canonical: string, previousFolded: string | undefined): boolean {
  // Same set as negation scope. The canonical token keeps its tone, so «hồng» is not «hổng».
  return isSharedNegator(canonical, previousFolded);
}

/** «không giảm» and «không thấy giảm» deny a decrease. They are not themselves a red flag. */
function negatorFollowedByGiam(folded: string[], index: number, canonical: string[]): boolean {
  if (!isMovementNegator(folded[index] ?? "", canonical[index] ?? "", folded[index - 1])) return false;
  if (folded[index + 1] === "giam") return true;
  return folded[index + 1] === "thay" && folded[index + 2] === "giam";
}

function giamIsNegated(folded: string[], index: number, canonical: string[]): boolean {
  if (folded[index] !== "giam") return false;
  if (decreaseWordDenied(folded, canonical, index)) return true;
  const prev = index - 1;
  if (prev < 0) return false;
  if (isMovementNegator(folded[prev] ?? "", canonical[prev] ?? "", folded[prev - 1])) return true;
  return (
    folded[prev] === "thay" &&
    prev >= 1 &&
    isMovementNegator(folded[prev - 1] ?? "", canonical[prev - 1] ?? "", folded[prev - 2])
  );
}

/**
 * A decrease word is denied when «không» / «không phải» / «chưa bao giờ» / «never»
 * sits inside the movement phrase or immediately in front of it.
 * «thai máy giảm» still counts. «không phải thai máy giảm» does not.
 */
function decreaseWordDenied(folded: string[], canonical: string[], index: number): boolean {
  if (observedDenialCovers(canonical, folded, index)) return true;
  let cursor = index - 1;
  let steps = 0;
  while (cursor >= 0 && steps < 8) {
    const token = canonical[cursor] ?? "";
    const word = folded[cursor] ?? "";
    if (isPhraseInternal(word, token, folded, cursor)) {
      cursor -= 1;
      steps += 1;
      continue;
    }
    const previous = cursor > 0 ? folded[cursor - 1] : undefined;
    return isSymptomNegator(token, previous) || isNeverToken(token);
  }
  return false;
}

function isPhraseInternal(word: string, token: string, folded: string[], index: number): boolean {
  if (word === "gio" && folded[index - 1] === "bao") return true;
  if (word === "bao" && folded[index + 1] === "gio") return true;
  if (FETAL_SUBJECTS.has(word) || word === "em") return true;
  if (isSymptomFiller(token) || word === "la" || word === "cua") return true;
  if (word === "cam" || word === "nhan" || word === "duoc" || word === "the") return true;
  if (isFetalKickToken(token) && folded[index + 1] !== "xe") return true;
  if (isFetalMayToken(token) && !MACHINE_AFTER_MAY.has(folded[index + 1] ?? "")) return true;
  if (isMarkedOrPlain(token, "cử", "cu") || isMarkedOrPlain(token, "động", "dong")) return true;
  return false;
}

/**
 * Exact spelling, or a form with no tone/vowel mark («dap», «đap», «may», «cu»).
 * A different tone stays distinct, so «đáp» is not «đạp» and «mấy» is not «máy».
 */
function isMarkedOrPlain(token: string, exact: string, foldedTarget: string): boolean {
  const canonical = foldLeadingDd(token);
  if (canonical === exact) return true;
  if (hasToneOrVowelMark(canonical)) return false;
  return foldToken(canonical) === foldedTarget;
}

function isFetalKickToken(token: string): boolean {
  return isMarkedOrPlain(token, "đạp", "dap");
}

function isFetalMayToken(token: string): boolean {
  return isMarkedOrPlain(token, "máy", "may");
}

function isCuDongAt(canonical: string[], index: number): boolean {
  return (
    isMarkedOrPlain(canonical[index] ?? "", "cử", "cu") &&
    isMarkedOrPlain(canonical[index + 1] ?? "", "động", "dong")
  );
}

function movementSpans(canonical: string[], folded: string[]): MovementSpan[] {
  const spans: MovementSpan[] = [];
  for (let index = 0; index < folded.length; index += 1) {
    if (isFetalMayToken(canonical[index] ?? "") && !MACHINE_AFTER_MAY.has(folded[index + 1] ?? "")) {
      spans.push([index, index]);
    }
    if (isFetalKickToken(canonical[index] ?? "") && folded[index + 1] !== "xe") spans.push([index, index]);
    if (isCuDongAt(canonical, index)) spans.push([index, index + 1]);
  }
  return spans;
}

function movementVerbEnd(canonical: string[], folded: string[], index: number): number {
  if (isCuDongAt(canonical, index)) return index + 1;
  if (isFetalKickToken(canonical[index] ?? "") && folded[index + 1] !== "xe") return index;
  if (isFetalMayToken(canonical[index] ?? "") && !MACHINE_AFTER_MAY.has(folded[index + 1] ?? "")) return index;
  return -1;
}

/** Words that may sit between a negator and the movement verb without changing the meaning. */
function isAbsenceSkip(word: string, token: string, folded: string[], index: number): boolean {
  if (isSymptomFiller(token) || FETAL_SUBJECTS.has(word) || word === "em" || word === "cua" || word === "su") {
    return true;
  }
  if (word === "duoc" || word === "the" || word === "rat" || word === "hon" || word === "qua") return true;
  if (word === "bao" && folded[index + 1] === "gio") return true;
  return word === "gio" && folded[index - 1] === "bao";
}

function isPerceptionWord(word: string): boolean {
  return word === "thay" || word === "cam" || word === "nhan" || word === "nhin" || isEnglishPerception(word);
}

/** cảm giác, nhận ra. cảm nhận and cảm thấy are already two perception words. */
function isPerceptionTail(token: string, previous: string | undefined): boolean {
  if (previous === "cam" && isMarkedOrPlain(token, "giác", "giac")) return true;
  return previous === "nhan" && isMarkedOrPlain(token, "ra", "ra");
}

function isEnglishPerception(word: string): boolean {
  return (
    word === "feel" ||
    word === "feels" ||
    word === "feeling" ||
    word === "felt" ||
    word === "see" ||
    word === "sees" ||
    word === "seen"
  );
}

/** đếm, not đêm. Unaccented «dem» counts; a different tone does not. */
function isCountVerb(token: string): boolean {
  if (isMarkedOrPlain(token, "đếm", "dem")) return true;
  return !hasToneOrVowelMark(token) && foldToken(token) === "count";
}

function isEnglishMovement(word: string): boolean {
  return (
    word === "kick" ||
    word === "kicks" ||
    word === "kicking" ||
    word === "kicked" ||
    word === "move" ||
    word === "moves" ||
    word === "moved" ||
    word === "moving" ||
    word === "movement" ||
    word === "movements"
  );
}

/**
 * «haven't» / «didn't» become «have not» / «did not» before the movement window.
 * Only the reduced-movement path uses this, so other red flags keep their tokens.
 */
function expandMovementContractions(note: string): string {
  const stems =
    "have|has|had|did|do|does|is|are|was|were|would|should|could";
  return note.replace(new RegExp(`\\b(${stems})n(?:['’]t|t)\\b`, "giu"), (_match, stem: string) => {
    return `${String(stem).toLowerCase()} not`;
  });
}

/**
 * «cú» is the kick classifier. «cử» / «cu động» stays, because that is cử động.
 * A different tone such as «đáp» is not rewritten here.
 */
function isKickClassifier(token: string, nextFolded: string | undefined): boolean {
  if (nextFolded === "dong") return false;
  const canonical = foldLeadingDd(token);
  if (canonical === "cú") return true;
  if (hasToneOrVowelMark(canonical)) return false;
  return foldToken(canonical) === "cu";
}

/**
 * Filler and classifier tokens dropped before the reduced-movement window.
 * «thể» folds to the same letters as English «the» but keeps its accent, so it stays.
 */
function isReducedMovementFiller(token: string, nextFolded: string | undefined): boolean {
  if (isKickClassifier(token, nextFolded)) return true;
  if (isMarkedOrPlain(token, "cái", "cai")) return true;
  if (isMarkedOrPlain(token, "lần", "lan")) return true;
  if (isMarkedOrPlain(token, "nào", "nao")) return true;
  if (isMarkedOrPlain(token, "gì", "gi")) return true;
  if (isMarkedOrPlain(token, "được", "duoc")) return true;
  if (hasToneOrVowelMark(token)) return false;
  const word = foldToken(token);
  return word === "any" || word === "a" || word === "the" || word === "single" || word === "more";
}

function dropMovementFillers(
  canonical: string[],
  folded: string[]
): { canonical: string[]; folded: string[] } {
  const keptCanonical: string[] = [];
  const keptFolded: string[] = [];
  for (let index = 0; index < canonical.length; index += 1) {
    if (isReducedMovementFiller(canonical[index] ?? "", folded[index + 1])) continue;
    keptCanonical.push(canonical[index] ?? "");
    keptFolded.push(folded[index] ?? "");
  }
  return { canonical: keptCanonical, folded: keptFolded };
}

/** can't / cannot / cant / can not / not. Width is how many tokens the negator uses. */
function englishNegatorWidth(folded: string[], index: number): number {
  const word = folded[index] ?? "";
  if (word === "cannot" || word === "cant" || word === "not") return 1;
  if (word === "can" && (folded[index + 1] === "t" || folded[index + 1] === "not")) return 2;
  return 0;
}

function decreaseSoonAfter(folded: string[], canonical: string[], verbEnd: number): boolean {
  let steps = 0;
  for (let index = verbEnd + 1; index < folded.length && steps < 3; index += 1) {
    const word = folded[index] ?? "";
    if (word === "rat" || word === "hon" || word === "qua" || word === "so") {
      steps += 1;
      continue;
    }
    return isBareDecreaseWord(word, canonical[index] ?? "");
  }
  return false;
}

/**
 * A negator marks missing movement («không thấy bé đạp», «ko máy», «chưa hề thấy máy»).
 * Perception is a class, not one spelling: thấy, cảm giác, cảm nhận, nhận ra, and English feel/see.
 * A negator plus that class plus reduced movement is inability («không cảm giác bé đạp»), not a
 * denied symptom. Counting is the same class («không đếm được cử động», «can't count kicks»).
 * It does not fire when the negator denies a decrease («không giảm», «không phải giảm»,
 * «không thấy giảm») or when «không phải» denies the whole phrase.
 * Filler tokens (cú, cái, lần, nào, gì, được, any, a, the, single, more) are already gone.
 * `blockOnDecrease` stops on the decrease word so a calm note can tell
 * «không thấy giảm … bình thường» apart from «không thấy đạp».
 */
function negatorMarksAbsence(
  folded: string[],
  canonical: string[],
  index: number,
  blockOnDecrease = false
): boolean {
  const englishWidth = englishNegatorWidth(folded, index);
  const vietnamese = isMovementNegator(folded[index] ?? "", canonical[index] ?? "", folded[index - 1]);
  if (!vietnamese && englishWidth === 0) return false;
  let sawPerception = false;
  let sawCount = false;
  let steps = 0;
  for (
    let cursor = index + (vietnamese ? 1 : englishWidth);
    cursor < folded.length && steps < REDUCED_MOVEMENT_WINDOW;
    cursor += 1
  ) {
    const verbEnd = movementVerbEnd(canonical, folded, cursor);
    const word = folded[cursor] ?? "";
    const token = canonical[cursor] ?? "";
    if (verbEnd >= 0) {
      if (sawPerception || sawCount) return true;
      if (!vietnamese) return false;
      if (decreaseSoonAfter(folded, canonical, verbEnd)) return false;
      return true;
    }
    if ((sawPerception || sawCount) && isEnglishMovement(word)) return true;
    if (isBareDecreaseWord(word, token)) {
      if (blockOnDecrease || !(sawPerception || sawCount)) return false;
      steps += 1;
      continue;
    }
    if (!sawPerception && !sawCount && isMarkedOrPlain(token, "phải", "phai")) return false;
    if (isPerceptionWord(word) || isNoticeWord(word) || isPerceptionTail(token, folded[cursor - 1])) {
      sawPerception = true;
      steps += 1;
      continue;
    }
    if (isCountVerb(token)) {
      sawCount = true;
      steps += 1;
      continue;
    }
    if (sawCount && (word === "dc" || word === "noi")) {
      steps += 1;
      continue;
    }
    if (isAbsenceSkip(word, token, folded, cursor) || word === "nao") {
      steps += 1;
      continue;
    }
    if (isQuantityWord(token, word) || unaccentedMayIsQuantity(canonical, folded, cursor)) {
      steps += 1;
      continue;
    }
    // «một» / «one» is not the quantity class, but it must not block «không thấy … đạp».
    if (isZeroOrOneToken(token, word)) {
      steps += 1;
      continue;
    }
    if (
      (englishWidth > 0 || sawPerception || sawCount) &&
      (word === "baby" ||
        word === "fetal" ||
        word === "of" ||
        word === "my" ||
        word === "her" ||
        word === "his" ||
        word === "a" ||
        word === "s" ||
        word === "so" ||
        word === "lan" ||
        word === "cai" ||
        word === "nhip")
    ) {
      steps += 1;
      continue;
    }
    return false;
  }
  return false;
}

function negatorSitsBetween(
  folded: string[],
  canonical: string[],
  left: number,
  right: number
): boolean {
  const from = Math.min(left, right) + 1;
  const to = Math.max(left, right);
  for (let index = from; index < to; index += 1) {
    if (isMovementNegator(folded[index] ?? "", canonical[index] ?? "", folded[index - 1])) return true;
  }
  return false;
}

function isCountedReduction(index: number, canonical: string[], folded: string[]): boolean {
  if (
    decreaseWordDenied(folded, canonical, index) ||
    negatorFollowedByGiam(folded, index, canonical) ||
    giamIsNegated(folded, index, canonical)
  ) {
    return false;
  }
  if (
    ((folded[index] ?? "") === "ngung" || isVietnameseStop(canonical[index] ?? "")) &&
    stopIsNegated(canonical, folded, index)
  ) {
    return false;
  }
  if (isMovementNegator(folded[index] ?? "", canonical[index] ?? "", folded[index - 1])) {
    return negatorMarksAbsence(folded, canonical, index);
  }
  if ((folded[index] ?? "") === "mat") return isMovementLoss(canonical, folded, index);
  return FETAL_REDUCTIONS.has(folded[index] ?? "");
}

/**
 * «mất» is reduced movement only when the thing lost is the movement
 * («mất cử động», «mất máy»). «mất ngủ» and any other object stay quiet.
 */
function isMovementLoss(canonical: string[], folded: string[], index: number): boolean {
  const token = canonical[index] ?? "";
  const word = folded[index] ?? "";
  const loss = token === "mất" || (word === "mat" && !hasToneOrVowelMark(token));
  if (!loss) return false;
  const last = Math.min(folded.length, index + 3);
  for (let cursor = index + 1; cursor < last; cursor += 1) {
    const next = folded[cursor] ?? "";
    if (next === "het" || next === "han" || next === "di" || next === "su" || next === "ca") continue;
    return isMovementNounAt(canonical, folded, cursor);
  }
  return false;
}

function isBareDecreaseWord(folded: string, canonical: string): boolean {
  if (folded === "it" || folded === "yeu" || folded === "ngung") return true;
  return folded === "giam";
}

/**
 * English «it» folds to the same letters as «ít».
 * It is the pronoun when an English helper sits beside it («it was kicking»).
 * «ít đạp» / «it dap» stays a decrease: the neighbor is not English.
 */
function isEnglishPronounIt(folded: string[], index: number): boolean {
  if ((folded[index] ?? "") !== "it") return false;
  const neighbors = new Set([
    "was",
    "is",
    "were",
    "are",
    "been",
    "kicking",
    "moving",
    "kicked",
    "moved",
    "kicks",
    "moves",
    "stopped",
    "stops",
    "stopping",
    "stop",
    "but",
    "now",
    "then",
    "when",
    "if",
    "and",
    "the",
    "baby",
    "still"
  ]);
  return neighbors.has(folded[index - 1] ?? "") || neighbors.has(folded[index + 1] ?? "");
}

function hasOrderedPhrase(tokens: string[], phrase: string[], maxGaps: number): boolean {
  if (phrase.length === 0) return false;
  for (let start = 0; start < tokens.length; start += 1) {
    if (tokens[start] !== phrase[0]) continue;
    let gaps = 0;
    let cursor = start;
    let matched = true;
    for (let part = 1; part < phrase.length; part += 1) {
      cursor += 1;
      if (cursor >= tokens.length) {
        matched = false;
        break;
      }
      if (tokens[cursor] === phrase[part]) continue;
      if (gaps < maxGaps && cursor + 1 < tokens.length && tokens[cursor + 1] === phrase[part]) {
        gaps += 1;
        cursor += 1;
        continue;
      }
      matched = false;
      break;
    }
    if (matched) return true;
  }
  return false;
}

/** Fixed quiet-fetus phrases. Unrelated «im» or «không thấy» do not match. */
function matchesQuietMoodPhrase(folded: string[], canonical: string[]): boolean {
  if (hasOrderedPhrase(folded, ["im", "hon", "moi", "khi"], 1)) return true;
  if (hasOrderedPhrase(folded, ["yen", "ang", "la"], 1)) return true;
  if (hasOrderedPhrase(folded, ["ca", "ngay", "khong", "thay", "gi"], 1)) return true;
  for (let index = 0; index + 4 < folded.length; index += 1) {
    if (folded[index] !== "ca" || folded[index + 1] !== "ngay") continue;
    if (!isTeenNegator(canonical[index + 2] ?? "", folded[index + 1])) continue;
    if (folded[index + 3] === "thay" && folded[index + 4] === "gi") return true;
  }
  return false;
}

/** «thấy ít cử động», «cử động ít», «ít đạp», «đạp ít». */
function seesLessMovement(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const cuDong = isCuDongAt(canonical, index);
    const kick = isFetalKickToken(canonical[index] ?? "") && folded[index + 1] !== "xe";
    const may = isFetalMayToken(canonical[index] ?? "") && !MACHINE_AFTER_MAY.has(folded[index + 1] ?? "");
    if (cuDong && (folded[index - 1] === "it" || folded[index + 2] === "it")) {
      const itIndex = folded[index - 1] === "it" ? index - 1 : index + 2;
      if (!decreaseWordDenied(folded, canonical, itIndex)) return true;
    }
    if ((kick || may) && (folded[index - 1] === "it" || folded[index + 1] === "it")) {
      const itIndex = folded[index - 1] === "it" ? index - 1 : index + 1;
      if (!decreaseWordDenied(folded, canonical, itIndex)) return true;
    }
    if (cuDong && (folded[index - 1] === "giam" || folded[index + 2] === "giam")) {
      const giamIndex = folded[index - 1] === "giam" ? index - 1 : index + 2;
      if (!giamIsNegated(folded, giamIndex, canonical) && !negatorWithin(folded, canonical, giamIndex, 4)) return true;
    }
  }
  return false;
}

function negatorWithin(folded: string[], canonical: string[], index: number, window: number): boolean {
  for (let cursor = index - 1; cursor >= Math.max(0, index - window); cursor -= 1) {
    if (isMovementNegator(folded[cursor] ?? "", canonical[cursor] ?? "", folded[cursor - 1])) return true;
  }
  return false;
}

function isNonNegatorDecrease(index: number, canonical: string[], folded: string[]): boolean {
  if (isEnglishPronounIt(folded, index)) return false;
  if (giamIsNegated(folded, index, canonical) || decreaseWordDenied(folded, canonical, index)) return false;
  const word = folded[index] ?? "";
  const token = canonical[index] ?? "";
  if ((word === "ngung" || isVietnameseStop(token)) && stopIsNegated(canonical, folded, index)) return false;
  if (isMovementLoss(canonical, folded, index)) return true;
  if (word === "it" || word === "yeu" || word === "ngung") return true;
  return word === "giam";
}

/** Decrease glued to the verb: immediately before, or up to one token after («đạp rất ít»). */
function decreaseOnVerb(canonical: string[], folded: string[], spans: MovementSpan[]): boolean {
  for (const [start, end] of spans) {
    if (start - 1 >= 0 && isNonNegatorDecrease(start - 1, canonical, folded)) return true;
    for (let index = end + 1; index <= end + 2 && index < folded.length; index += 1) {
      if (isNonNegatorDecrease(index, canonical, folded)) return true;
    }
  }
  return false;
}

function hasDecreaseWordNearMovement(canonical: string[], folded: string[], spans: MovementSpan[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    if (!isNonNegatorDecrease(index, canonical, folded)) continue;
    if (spans.some(([start, end]) => tokensBetween(index, start, end) <= 3)) return true;
  }
  return false;
}

function decreaseBesideSpan(canonical: string[], folded: string[], start: number, end: number): boolean {
  const before = start - 1;
  const after = end + 1;
  if (before >= 0 && isBesideDecrease(before, canonical, folded, "before")) return true;
  return after < folded.length && isBesideDecrease(after, canonical, folded, "after");
}

function isBesideDecrease(
  index: number,
  canonical: string[],
  folded: string[],
  side: "before" | "after"
): boolean {
  if (giamIsNegated(folded, index, canonical)) return false;
  const word = folded[index] ?? "";
  const token = canonical[index] ?? "";
  if (isBareDecreaseWord(word, token) && word !== "giam") return true;
  if (word === "giam") return true;
  if (side === "before" && isMovementNegator(word, token, folded[index - 1]) && !negatorFollowedByGiam(folded, index, canonical)) {
    return true;
  }
  return false;
}

function isAbsenceBridge(folded: string[], index: number): boolean {
  const word = folded[index] ?? "";
  if (KHONG_BRIDGE.has(word) || FETAL_SUBJECTS.has(word)) return true;
  if (word === "bao" && folded[index + 1] === "gio") return true;
  if (word === "gio" && folded[index - 1] === "bao") return true;
  return false;
}

/** «chưa thai máy giảm» denies the decrease. «chưa thấy bé đạp» has no decrease word. */
function decreaseAfterIsDenied(folded: string[], canonical: string[], end: number): boolean {
  for (let index = end + 1; index <= end + 2 && index < folded.length; index += 1) {
    const word = folded[index] ?? "";
    if (word === "rat" || word === "hon" || word === "qua" || word === "so") continue;
    if (word === "giam" || word === "it" || word === "yeu" || word === "ngung") {
      return decreaseWordDenied(folded, canonical, index);
    }
    if (isMovementLoss(canonical, folded, index)) return decreaseWordDenied(folded, canonical, index);
    return false;
  }
  return false;
}

function negatorTargetsMovement(canonical: string[], folded: string[], spans: MovementSpan[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    if (negatorFollowedByGiam(folded, index, canonical)) continue;
    if (!isMovementNegator(folded[index] ?? "", canonical[index] ?? "", folded[index - 1])) continue;
    let steps = 0;
    for (let cursor = index + 1; cursor < folded.length && steps <= 4; cursor += 1) {
      const span = spans.find(([start]) => start === cursor);
      if (span) {
        if (decreaseAfterIsDenied(folded, canonical, span[1])) break;
        return true;
      }
      if (isAbsenceBridge(folded, cursor)) {
        steps += 1;
        continue;
      }
      break;
    }
  }
  return false;
}

function binhThuongFollows(end: number, canonical: string[], folded: string[]): boolean {
  for (let index = end + 1; index <= end + 3 && index < folded.length - 1; index += 1) {
    if (folded[index] !== "binh" || folded[index + 1] !== "thuong") continue;
    for (let between = end + 1; between < index; between += 1) {
      if (isBareDecreaseWord(folded[between] ?? "", canonical[between] ?? "")) return false;
      if (isMovementNegator(folded[between] ?? "", canonical[between] ?? "", folded[between - 1])) return false;
    }
    return true;
  }
  return false;
}

/** Vẫn + movement, or movement described as bình thường, with no decrease glued to that verb. */
function spanLooksReassuring(start: number, end: number, canonical: string[], folded: string[]): boolean {
  if (decreaseBesideSpan(canonical, folded, start, end)) return false;
  const before = start - 1;
  if (
    before >= 0 &&
    isMovementNegator(folded[before] ?? "", canonical[before] ?? "", folded[before - 1]) &&
    !negatorFollowedByGiam(folded, before, canonical)
  ) {
    return false;
  }
  const still = folded[before] === "van";
  return still || binhThuongFollows(end, canonical, folded);
}

function isSoftReassured(canonical: string[], folded: string[], spans: MovementSpan[]): boolean {
  if (spans.some(([start, end]) => decreaseBesideSpan(canonical, folded, start, end))) return false;
  if (negatorTargetsMovement(canonical, folded, spans)) return false;
  if (folded.some((_, index) => negatorFollowedByGiam(folded, index, canonical))) return true;
  if (spans.length === 0) return false;
  return spans.every(([start, end]) => spanLooksReassuring(start, end, canonical, folded));
}

function isMovementQuestion(note: string, folded: string[]): boolean {
  if (note.includes("?")) return true;
  if (hasOrderedPhrase(folded, ["bao", "nhieu"], 2)) return true;
  return hasOrderedPhrase(folded, ["co", "binh", "thuong", "khong"], 2);
}

function matchesSubjectVerbReduction(canonical: string[], folded: string[], spans: MovementSpan[]): boolean {
  const subjects: number[] = [];
  const reductions: number[] = [];
  for (let index = 0; index < folded.length; index += 1) {
    if (FETAL_SUBJECTS.has(folded[index] ?? "")) subjects.push(index);
    if (isCountedReduction(index, canonical, folded)) reductions.push(index);
  }

  for (const subject of subjects) {
    for (const [actionStart, actionEnd] of spans) {
      const between =
        subject < actionStart ? actionStart - subject - 1 : subject > actionEnd ? subject - actionEnd - 1 : 0;
      if (between > SUBJECT_VERB_GAP) continue;
      const spanStart = Math.min(subject, actionStart);
      const spanEnd = Math.max(subject, actionEnd);
      for (const reduction of reductions) {
        const inside = reduction >= spanStart && reduction <= spanEnd;
        const distance = inside ? 0 : reduction < spanStart ? spanStart - reduction : reduction - spanEnd;
        if (!inside && distance > 3) continue;
        const word = folded[reduction] ?? "";
        if (isMovementNegator(word, canonical[reduction] ?? "", folded[reduction - 1])) {
          if (negatorMarksAbsence(folded, canonical, reduction)) return true;
          continue;
        }
        if (inside || !negatorSitsBetween(folded, canonical, reduction, actionEnd)) return true;
      }
    }
  }
  return false;
}

function isEnglishDecreaseWord(word: string): boolean {
  return (
    word === "less" ||
    word === "fewer" ||
    word === "decrease" ||
    word === "decreased" ||
    word === "decreasing" ||
    word === "reducing" ||
    word === "reduced" ||
    word === "reduction"
  );
}

/** «no decrease», «not less», «has not decreased», «did not notice … less». */
function englishDecreaseIsNegated(
  folded: string[],
  index: number,
  canonical: string[] = folded
): boolean {
  if (observedDenialCovers(canonical, folded, index)) return true;
  for (let cursor = index - 1; cursor >= Math.max(0, index - 4); cursor -= 1) {
    const word = folded[cursor] ?? "";
    if (word === "no" || word === "not" || word === "never") return true;
    if (
      word === "is" ||
      word === "was" ||
      word === "were" ||
      word === "been" ||
      word === "has" ||
      word === "have" ||
      word === "had" ||
      word === "a" ||
      word === "the" ||
      word === "any" ||
      word === "of" ||
      word === "in" ||
      word === "really" ||
      word === "there"
    ) {
      continue;
    }
    return false;
  }
  return false;
}

function clauseHasNegatedDecrease(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const word = folded[index] ?? "";
    const token = canonical[index] ?? "";
    if (isBareDecreaseWord(word, token) && decreaseWordDenied(folded, canonical, index)) return true;
    if (isEnglishDecreaseWord(word) && englishDecreaseIsNegated(folded, index, canonical)) return true;
  }
  return false;
}

function hasUndeniedDecreaseNearMovement(canonical: string[], folded: string[]): boolean {
  const spans = movementSpans(canonical, folded);
  for (let index = 0; index < folded.length; index += 1) {
    if (!isNonNegatorDecrease(index, canonical, folded)) continue;
    if (spans.some(([start, end]) => tokensBetween(index, start, end) <= 4)) return true;
  }
  return false;
}

function movementConceptAt(canonical: string[], folded: string[], index: number): boolean {
  if (index < 0 || index >= folded.length) return false;
  if (isCuDongAt(canonical, index)) return true;
  if (isFetalKickToken(canonical[index] ?? "") && folded[index + 1] !== "xe") return true;
  if (isFetalMayToken(canonical[index] ?? "") && !MACHINE_AFTER_MAY.has(folded[index + 1] ?? "")) return true;
  return isEnglishMovement(folded[index] ?? "");
}

/**
 * Words that may sit between vẫn / still and the movement noun.
 * «vẫn còn đạp» and «vẫn thấy bé đạp» are the same calm cue as «vẫn đạp».
 * A negator is not a bridge, so «vẫn không đạp» stays an absence.
 */
const STILL_MOVING_BRIDGE = new Set([
  "con",
  "be",
  "em",
  "baby",
  "the",
  "a",
  "her",
  "my",
  "his",
  "thay",
  "cam",
  "nhan",
  "co",
  "dang",
  "lai",
  "rat",
  "kha",
  "feel",
  "feeling",
  "felt",
  "quite",
  "really",
  "very"
]);

/** «vẫn đạp», «still moving», «bình thường», or movement described as normal. */
function hasStillMovingSignal(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    if (folded[index] === "binh" && folded[index + 1] === "thuong") return true;
    const token = canonical[index] ?? "";
    if (!hasToneOrVowelMark(token) && (folded[index] === "normal" || folded[index] === "normally")) return true;
    if (folded[index] !== "van" && folded[index] !== "still") continue;
    for (let distance = 1; distance <= 3; distance += 1) {
      const at = index + distance;
      if (!movementConceptAt(canonical, folded, at)) continue;
      let bridged = true;
      for (let cursor = index + 1; cursor < at; cursor += 1) {
        if (!STILL_MOVING_BRIDGE.has(folded[cursor] ?? "")) bridged = false;
      }
      if (bridged) return true;
    }
  }
  return false;
}

/** Absence that does not depend on stepping over a decrease word. «không thấy đạp» counts. */
function hasDirectAbsence(folded: string[], canonical: string[]): boolean {
  return folded.some((_, index) => negatorMarksAbsence(folded, canonical, index, true));
}

/**
 * A negator on the decrease word plus a still-moving signal is calm.
 * «không giảm, bé vẫn đạp» and «no decrease, baby still moving» stay silent.
 * «thai máy giảm», «ít đạp», and «không thấy đạp» are not calm.
 */
function isCalmNegatedDecrease(canonical: string[], folded: string[]): boolean {
  if (!hasStillMovingSignal(canonical, folded)) return false;
  if (!clauseHasNegatedDecrease(canonical, folded)) return false;
  if (hasUndeniedDecreaseNearMovement(canonical, folded)) return false;
  if (hasDirectAbsence(folded, canonical)) return false;
  return true;
}

/**
 * ít / vài / mấy, a bare number, or a range such as 1-2.
 * Accented «mấy» is a quantity. Unaccented «may» is «máy» unless a kick follows,
 * which is the accent-stripped «mấy cú đạp» shape.
 */
function isQuantityWord(token: string, folded: string): boolean {
  if (/^\d+(?:-\d+)?$/.test(token) || /^\d+(?:-\d+)?$/.test(folded)) return true;
  if (isMarkedOrPlain(token, "ít", "it")) return true;
  if (isMarkedOrPlain(token, "vài", "vai")) return true;
  return foldLeadingDd(token) === "mấy";
}

/** Exactly one kick («1», «one», «một»). A range such as «1-2» is not a single kick. */
function isLoneSingleCount(token: string): boolean {
  if (token === "1" || token === "one") return true;
  const exact = EXACT_VI_NUMBERS[foldLeadingDd(token)];
  return exact === 1;
}

/**
 * Zero or one sitting between a negator and the verb.
 * «không thấy một cú đạp» is absence, not a report of a single kick.
 * Unmarked «mot» counts. A different tone does not.
 */
function isZeroOrOneToken(token: string, word: string): boolean {
  if (token === "0" || token === "1" || word === "0" || word === "1") return true;
  if (!hasToneOrVowelMark(token) && (word === "one" || word === "zero" || word === "once")) return true;
  const value = isViNumberUnit(token, word, !hasToneOrVowelMark(token));
  return value === 0 || value === 1;
}

function unaccentedMayIsQuantity(canonical: string[], folded: string[], index: number): boolean {
  const token = canonical[index] ?? "";
  if (hasToneOrVowelMark(token) || (folded[index] ?? "") !== "may") return false;
  if (MACHINE_AFTER_MAY.has(folded[index + 1] ?? "")) return false;
  const last = Math.min(folded.length, index + 5);
  for (let cursor = index + 1; cursor < last; cursor += 1) {
    if (isFetalKickToken(canonical[cursor] ?? "") && folded[cursor + 1] !== "xe") return true;
    if (isCuDongAt(canonical, cursor)) return true;
  }
  return false;
}

/** thấy / cảm / feel, then a quantity, then a kick. «thấy 1-2 cú đạp», «thấy vài cú đạp». */
function perceptionThenQuantityThenMovement(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const token = canonical[index] ?? "";
    const word = folded[index] ?? "";
    if (!isPerceptionWord(word) && !isPerceptionTail(token, folded[index - 1])) continue;
    let sawQuantity = false;
    let steps = 0;
    for (
      let cursor = index + 1;
      cursor < folded.length && steps < REDUCED_MOVEMENT_WINDOW;
      cursor += 1
    ) {
      const nextToken = canonical[cursor] ?? "";
      const nextWord = folded[cursor] ?? "";
      // A normal or high kick count is not reduced movement. «thấy 15 cú đạp» stays quiet.
      // «thấy 1-2 cú đạp» and «thấy vài cú đạp» are still a low count.
      if (countMagnitude(nextToken) === "high" || countMagnitude(nextWord) === "high") {
        steps += 1;
        continue;
      }
      if (
        isLoneSingleCount(nextToken) &&
        !isTwoHourWindow(folded) &&
        !isLongReducedWindow(canonical, folded)
      ) {
        steps += 1;
        continue;
      }
      if (isQuantityWord(nextToken, nextWord) || unaccentedMayIsQuantity(canonical, folded, cursor)) {
        sawQuantity = true;
        steps += 1;
        continue;
      }
      if (movementVerbEnd(canonical, folded, cursor) >= 0 || isEnglishMovement(nextWord)) {
        if (!sawQuantity) break;
        return true;
      }
      if (
        isAbsenceSkip(nextWord, nextToken, folded, cursor) ||
        isOrConjunction(nextToken) ||
        nextWord === "to" ||
        nextWord === "and" ||
        nextWord === "only" ||
        nextWord === "chi" ||
        nextWord === "co"
      ) {
        steps += 1;
        continue;
      }
      break;
    }
  }
  return false;
}

function isVietnameseStop(token: string): boolean {
  return (
    isMarkedOrPlain(token, "ngừng", "ngung") ||
    isMarkedOrPlain(token, "ngưng", "ngung") ||
    isMarkedOrPlain(token, "dừng", "dung") ||
    isMarkedOrPlain(token, "hết", "het")
  );
}

/**
 * «thôi» / «thoi» is a stop only directly before the movement verb.
 * That is «thôi đạp» and «thoi may», including between the subject and the verb
 * («bé thôi đạp», «con thoi may»). Sentence-initial «thôi bé đạp» is discourse.
 * A trailing «thôi» («đạp bình thường thôi») is not a stop.
 */
function thoiStopsFollowingMovement(canonical: string[], folded: string[], index: number): boolean {
  if (!isMarkedOrPlain(canonical[index] ?? "", "thôi", "thoi")) return false;
  if (stopIsNegated(canonical, folded, index)) return false;
  const next = index + 1;
  return movementVerbEnd(canonical, folded, next) >= 0 || isEnglishMovement(folded[next] ?? "");
}

function stopIsNegated(canonical: string[], folded: string[], index: number): boolean {
  if (index <= 0) return false;
  let cursor = index - 1;
  if (cursor >= 1 && (folded[cursor] ?? "") === "gio" && (folded[cursor - 1] ?? "") === "bao") {
    cursor -= 2;
  }
  if (cursor < 0) return false;
  // «hổng chịu ngừng»: negator + chịu + stop means it never stops.
  if (isMarkedOrPlain(canonical[cursor] ?? "", "chịu", "chiu")) {
    let negAt = cursor - 1;
    if (negAt >= 1 && (folded[negAt] ?? "") === "gio" && (folded[negAt - 1] ?? "") === "bao") {
      negAt -= 2;
    }
    if (negAt < 0) return false;
    return isMovementNegator(folded[negAt] ?? "", canonical[negAt] ?? "", folded[negAt - 1]);
  }
  if (isMovementNegator(folded[cursor] ?? "", canonical[cursor] ?? "", folded[cursor - 1])) return true;
  const token = canonical[cursor] ?? "";
  return !hasToneOrVowelMark(token) && (folded[cursor] ?? "") === "never";
}

function hetSucAt(canonical: string[], index: number): boolean {
  return (
    isMarkedOrPlain(canonical[index] ?? "", "hết", "het") &&
    isMarkedOrPlain(canonical[index + 1] ?? "", "sức", "suc")
  );
}

/** «hết cả buổi» means the whole session, not that movement stopped. */
function hetIsWholePeriod(canonical: string[], folded: string[], index: number): boolean {
  if (!isMarkedOrPlain(canonical[index] ?? "", "hết", "het")) return false;
  const next = folded[index + 1] ?? "";
  return (
    next === "ca" ||
    next === "buoi" ||
    next === "ngay" ||
    next === "dem" ||
    next === "sang" ||
    next === "chieu" ||
    next === "toi" ||
    next === "gio"
  );
}

/**
 * «cử động ngừng», «cử động dừng», «cử động hết», with or without accents.
 * No perception verb is required. «hết sức» and «đạp xe» do not count.
 * Bare «máy» is left out so «máy hết nước» stays a machine phrase.
 */
/**
 * A stop verb and a movement verb in the same clause.
 * «ngừng» / «dừng» / «hết» need not sit on the noun: «đạp một cái rồi ngừng»,
 * «cử động thì hết», «hết đạp». «hết cả buổi», «hết sức», «không ngừng»,
 * and «máy hết nước» stay quiet. «hết máy» (stop, then máy) still alerts.
 */
function vietnameseStopNearMovement(canonical: string[], folded: string[]): boolean {
  const spans = movementSpans(canonical, folded);
  for (let index = 0; index < folded.length; index += 1) {
    if (thoiStopsFollowingMovement(canonical, folded, index)) return true;
    const token = canonical[index] ?? "";
    if (!isVietnameseStop(token)) continue;
    if (stopIsNegated(canonical, folded, index)) continue;
    if (hetSucAt(canonical, index) || hetIsWholePeriod(canonical, folded, index)) continue;
    if (isFoodVerb(canonical[index + 1] ?? "", folded[index + 1] ?? "")) continue;
    for (const [start, end] of spans) {
      const bareMay =
        isFetalMayToken(canonical[start] ?? "") &&
        !isCuDongAt(canonical, start) &&
        !isFetalKickToken(canonical[start] ?? "");
      const kick = isFetalKickToken(canonical[start] ?? "") && folded[start + 1] !== "xe";
      if (!isCuDongAt(canonical, start) && !kick && !bareMay) continue;
      if (bareMay && isMarkedOrPlain(token, "hết", "het") && index >= start) continue;
      const distance = index < start ? start - index : index > end ? index - end : 0;
      if (distance <= 6) return true;
    }
  }
  return false;
}

function englishMovementNoun(word: string): boolean {
  return (
    word === "kick" ||
    word === "kicks" ||
    word === "kicking" ||
    word === "movement" ||
    word === "movements" ||
    word === "moving"
  );
}

function babyWithin(folded: string[], index: number): boolean {
  for (let cursor = Math.max(0, index - 4); cursor < index; cursor += 1) {
    const word = folded[cursor] ?? "";
    if (word === "baby" || word === "babies" || word === "fetal" || word === "fetus") return true;
  }
  return false;
}

/**
 * English reduced movement with no perception verb.
 * «baby not moving», «no movement», «stopped kicking», «fewer kicks».
 * «not the kicks» loses «the» as a filler and stays silent: «not» does not
 * govern a bare kick noun unless a baby word is in the window.
 */
function englishStopWord(word: string): boolean {
  return (
    word === "stop" ||
    word === "stopped" ||
    word === "stops" ||
    word === "stopping" ||
    word === "quit" ||
    word === "quits" ||
    word === "quitting"
  );
}

/** «it was kicking but now it stopped». The stop is not glued to the verb. */
function englishStopAfterBut(folded: string[], canonical: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    if ((folded[index] ?? "") !== "but") continue;
    let sawMovement = false;
    for (let cursor = 0; cursor < index; cursor += 1) {
      const word = folded[cursor] ?? "";
      if (isEnglishMovement(word) || englishMovementNoun(word)) sawMovement = true;
    }
    if (!sawMovement) continue;
    for (let cursor = index + 1; cursor < folded.length; cursor += 1) {
      const word = folded[cursor] ?? "";
      if (englishStopWord(word) && !englishDecreaseIsNegated(folded, cursor, canonical)) return true;
    }
  }
  return false;
}

function englishReducedMovement(folded: string[], canonical: string[] = folded): boolean {
  if (englishStopAfterBut(folded, canonical)) return true;
  for (let index = 0; index < folded.length; index += 1) {
    const word = folded[index] ?? "";
    if (word === "no" && (folded[index + 1] ?? "") === "longer") {
      const last = Math.min(folded.length, index + 6);
      for (let cursor = index + 2; cursor < last; cursor += 1) {
        const target = folded[cursor] ?? "";
        if (isEnglishMovement(target) || englishMovementNoun(target)) return true;
      }
    }
    if (word === "no" && ((folded[index + 1] ?? "") === "baby" || (folded[index + 1] ?? "") === "fetal" || (folded[index + 1] ?? "") === "fetus")) {
      const target = folded[index + 2] ?? "";
      if (isEnglishMovement(target) || englishMovementNoun(target)) return true;
    }
    if (
      word === "no" &&
      (folded[index + 1] === "movement" ||
        folded[index + 1] === "movements" ||
        folded[index + 1] === "kicking" ||
        folded[index + 1] === "moving" ||
        folded[index + 1] === "kicks" ||
        folded[index + 1] === "kick")
    ) {
      return true;
    }
    if (word === "not" || word === "cannot" || word === "cant") {
      let cursor = index + 1;
      if (folded[cursor] === "really" || folded[cursor] === "even") cursor += 1;
      const target = folded[cursor] ?? "";
      if (target === "moving" || target === "kicking") return true;
      if (
        (target === "move" || target === "moves" || target === "moved" || target === "kick" || target === "kicks") &&
        babyWithin(folded, index)
      ) {
        return true;
      }
    }
    if (
      englishStopWord(word) &&
      englishMovementNoun(folded[index + 1] ?? "") &&
      !englishDecreaseIsNegated(folded, index, canonical)
    ) {
      return true;
    }
    if (
      englishMovementNoun(word) &&
      (folded[index + 1] === "stopped" || folded[index + 1] === "stops" || folded[index + 1] === "stopping") &&
      !englishDecreaseIsNegated(folded, index + 1, canonical)
    ) {
      return true;
    }
    if (isEnglishDecreaseWord(word) && !englishDecreaseIsNegated(folded, index, canonical)) {
      const next = folded[index + 1] ?? "";
      if (englishMovementNoun(next)) return true;
      if (
        (next === "fetal" || next === "baby") &&
        englishMovementNoun(folded[index + 2] ?? "")
      ) {
        return true;
      }
      if (tokenNearEnglishMovement(folded, index, 5)) return true;
    }
    if (
      (word === "hardly" || word === "barely" || word === "scarcely" || word === "absent" || word === "absence" || word === "rarely") &&
      tokenNearEnglishMovement(folded, index, 4)
    ) {
      return true;
    }
    if (word === "little") {
      const next = folded[index + 1] ?? "";
      if (next === "movement" || next === "movements" || next === "kicking" || next === "moving") return true;
    }
    if (
      (word === "ceased" || word === "cease" || word === "ceases") &&
      !englishDecreaseIsNegated(folded, index, canonical) &&
      tokenNearEnglishMovement(folded, index, 4)
    ) {
      return true;
    }
    if (word === "not" || word === "no") {
      if (isEnglishDecreaseWord(folded[index + 1] ?? "")) continue;
      for (let cursor = index + 1; cursor < Math.min(folded.length, index + 4); cursor += 1) {
        const target = folded[cursor] ?? "";
        if (target === "kicked" || target === "kicking" || target === "moving" || target === "moved") return true;
        if (
          target === "a" ||
          target === "the" ||
          target === "any" ||
          target === "even" ||
          target === "really" ||
          target === "been" ||
          target === "have" ||
          target === "has"
        ) {
          continue;
        }
        break;
      }
    }
  }
  return false;
}

function tokenNearEnglishMovement(folded: string[], index: number, window: number): boolean {
  const from = Math.max(0, index - window);
  const to = Math.min(folded.length - 1, index + window);
  for (let cursor = from; cursor <= to; cursor += 1) {
    if (cursor === index) continue;
    const word = folded[cursor] ?? "";
    if (isEnglishMovement(word) || englishMovementNoun(word)) return true;
  }
  return false;
}

/**
 * «not a single kick» / «not one kick». Fillers «a» and «single» are already
 * gone on the analyzed path, so this reads the raw tokens.
 * «not the kicks» has no one/single/zero and stays silent.
 */
function englishNotSingleKick(folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const word = folded[index] ?? "";
    if (word !== "not" && word !== "no") continue;
    if (isEnglishDecreaseWord(folded[index + 1] ?? "")) continue;
    let sawZeroWord = false;
    for (let cursor = index + 1; cursor < Math.min(folded.length, index + 5); cursor += 1) {
      const target = folded[cursor] ?? "";
      if (target === "single" || target === "one" || target === "zero" || target === "once") sawZeroWord = true;
      if (
        (target === "kick" || target === "kicks" || target === "movement" || target === "movements" || target === "kicked" || target === "kicking") &&
        (sawZeroWord || babyWithin(folded, index))
      ) {
        return true;
      }
      if (
        target === "a" ||
        target === "the" ||
        target === "any" ||
        target === "even" ||
        target === "single" ||
        target === "one" ||
        target === "zero" ||
        target === "once" ||
        target === "really"
      ) {
        continue;
      }
      break;
    }
  }
  return false;
}

/** «đạp giảm» and «đạp rất ít» with no fetal subject. A negator on the decrease stays off. */
function decreaseImmediatelyOnMovement(canonical: string[], folded: string[]): boolean {
  const intensifier = new Set(["rat", "hon", "qua", "so", "la"]);
  for (const [start, end] of movementSpans(canonical, folded)) {
    if (start - 1 >= 0 && isNonNegatorDecrease(start - 1, canonical, folded)) return true;
    let index = end + 1;
    if (intensifier.has(folded[index] ?? "")) index += 1;
    if (index < folded.length && isNonNegatorDecrease(index, canonical, folded)) return true;
  }
  return false;
}

function analyzeMovementClause(note: string): { canonical: string[]; folded: string[]; quiet: boolean } | null {
  const expanded = expandMovementContractions(note);
  const originalCanonical = movementTokens(normalizeUrgentNote(expanded).nfc).map(foldLeadingDd);
  const originalFolded = originalCanonical.map((token) => foldToken(token));
  if (originalCanonical.length === 0) return null;
  const quiet = matchesQuietMoodPhrase(originalFolded, originalCanonical);
  const normalized = dropMovementFillers(originalCanonical, originalFolded);
  return { canonical: normalized.canonical, folded: normalized.folded, quiet };
}

/**
 * Absence that is not really «không thấy … giảm».
 * A decrease word in the same window means the negator is about the decrease.
 */
function hasPureAbsence(folded: string[], canonical: string[]): boolean {
  return folded.some((_, index) => {
    if (!negatorMarksAbsence(folded, canonical, index, true)) return false;
    const end = Math.min(folded.length, index + 1 + REDUCED_MOVEMENT_WINDOW);
    let verbAt = -1;
    for (let cursor = index + 1; cursor < end; cursor += 1) {
      const verbEnd = movementVerbEnd(canonical, folded, cursor);
      if (verbEnd >= 0 || isEnglishMovement(folded[cursor] ?? "")) {
        verbAt = verbEnd >= 0 ? verbEnd : cursor;
        break;
      }
    }
    if (verbAt < 0) return false;
    const last = Math.min(folded.length - 1, verbAt + 2);
    for (let cursor = index + 1; cursor <= last; cursor += 1) {
      const token = canonical[cursor] ?? "";
      const tokenFold = folded[cursor] ?? "";
      if (isBareDecreaseWord(tokenFold, token) || isEnglishDecreaseWord(tokenFold)) return false;
    }
    return true;
  });
}

/**
 * Digit or range magnitude. Fewer than 10 is the low kick-count line.
 * 10 itself is not fewer than 10. «1-2» is low. «15» and «10-12» are not.
 */
function countMagnitude(token: string): "low" | "high" | "mid" | null {
  const range = /^(\d+)-(\d+)$/.exec(token);
  if (range) {
    const min = Number(range[1]);
    const max = Number(range[2]);
    if (max < 10) return "low";
    if (min >= 10) return "high";
    return "mid";
  }
  if (/^\d+$/.test(token)) return Number(token) < 10 ? "low" : "high";
  return null;
}

const VI_NUMBER_UNITS: Record<string, number> = {
  mot: 1,
  hai: 2,
  ba: 3,
  bon: 4,
  tu: 4,
  nam: 5,
  lam: 5,
  sau: 6,
  bay: 7,
  tam: 8,
  chin: 9
};

const EN_NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  zero: 0,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  thirty: 30
};

const COUNT_TIME_WORDS = new Set([
  "gio",
  "tieng",
  "hour",
  "hours",
  "phut",
  "minute",
  "minutes",
  "ngay",
  "tuan",
  "week",
  "weeks",
  "thang",
  "month",
  "months",
  "giay",
  "second",
  "seconds"
]);

/** «của», «rất», «đã», «has» may sit between a movement noun and its partner. */
const CLASS_WINDOW_SKIP = new Set([
  "da",
  "dang",
  "vua",
  "moi",
  "bi",
  "se",
  "sap",
  "rat",
  "hon",
  "qua",
  "so",
  "voi",
  "la",
  "cua",
  "thai",
  "con",
  "be",
  "em",
  "su",
  "is",
  "are",
  "was",
  "were",
  "been",
  "has",
  "have",
  "had",
  "much",
  "quite",
  "really",
  "very",
  "just",
  "already",
  "the",
  "of",
  "to",
  "a",
  "bit",
  "little",
  "fetal",
  "baby",
  "her",
  "his",
  "my"
]);

function rawMovementFold(note: string): { canonical: string[]; folded: string[] } {
  const expanded = expandMovementContractions(note);
  const canonical = movementTokens(normalizeUrgentNote(expanded).nfc).map(foldLeadingDd);
  return { canonical, folded: canonical.map((token) => foldToken(token)) };
}

/**
 * Accented number spellings. «hai» and «ba» have no mark, so the spelling itself is exact.
 * A different tone is not a number: «từ» is not «tư», «làm» is not «lăm», «nằm» is not «năm».
 */
const EXACT_VI_NUMBERS: Record<string, number> = {
  "một": 1,
  "mốt": 1,
  "hai": 2,
  "ba": 3,
  "bốn": 4,
  "tư": 4,
  "năm": 5,
  "lăm": 5,
  "sáu": 6,
  "bảy": 7,
  "tám": 8,
  "chín": 9
};

/**
 * Match a number word on the accented token only.
 * The old guard compared the fold with itself, so every lookalike counted.
 * A fold-only match (unaccented «sau», «nam», «bon») counts only when
 * `foldOnlyAllowed` is set: the caller found a count classifier or a time window.
 */
function isViNumberUnit(token: string, folded: string, foldOnlyAllowed = false): number | null {
  const exact = EXACT_VI_NUMBERS[foldLeadingDd(token)];
  if (exact !== undefined) return exact;
  if (hasToneOrVowelMark(token)) return null;
  if (!foldOnlyAllowed) return null;
  const value = VI_NUMBER_UNITS[folded];
  return value === undefined ? null : value;
}

/** «lần» / «cái» / «cú», not «cử động». */
function isCountClassifierToken(canonical: string[], folded: string[], index: number): boolean {
  if (index < 0 || index >= canonical.length) return false;
  if ((folded[index + 1] ?? "") === "dong") return false;
  const token = canonical[index] ?? "";
  const word = folded[index] ?? "";
  if (isMarkedOrPlain(token, "lần", "lan") || isMarkedOrPlain(token, "cái", "cai")) return true;
  if (token === "cú") return true;
  return !hasToneOrVowelMark(token) && word === "cu";
}

/** «lần sau / lần này / lần trước» is next, this, or last time, not a kick count. */
function isLanTimeIdiom(folded: string[], index: number): boolean {
  if ((folded[index - 1] ?? "") !== "lan") return false;
  const word = folded[index] ?? "";
  return word === "sau" || word === "nay" || word === "truoc" || word === "dau" || word === "toi" || word === "kia";
}

function countClassifierNear(canonical: string[], folded: string[], index: number): boolean {
  for (const at of [index - 1, index + 1, index + 2, index + 3]) {
    if (!isCountClassifierToken(canonical, folded, at)) continue;
    if (at === index - 1 && isLanTimeIdiom(folded, index)) continue;
    return true;
  }
  return false;
}

/**
 * A counted duration such as «2 giờ» or «sáu giờ». «đến giờ» is not one.
 * The number is read with the same accent rule as a kick count. Folding «từ giờ»
 * into «4 giờ» is what made an ordinary "from now" note license a later lookalike.
 */
function hasCountedTimeWindow(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    if (!COUNT_TIME_WORDS.has(folded[index] ?? "")) continue;
    const prevToken = canonical[index - 1] ?? "";
    const prev = folded[index - 1] ?? "";
    if (/^\d+$/.test(prev)) return true;
    if (isViNumberUnit(prevToken, prev, true) !== null) return true;
    if (!hasToneOrVowelMark(prevToken) && (prev === "two" || prev === "one" || prev === "three" || prev === "zero")) {
      return true;
    }
  }
  return false;
}

function foldOnlyLicensed(canonical: string[], folded: string[], index: number): boolean {
  return hasCountedTimeWindow(canonical, folded) || countClassifierNear(canonical, folded, index);
}

const DAY_PARTS = new Set([
  "sang",
  "trua",
  "chieu",
  "toi",
  "dem",
  "khuya",
  "ngay",
  "buoi",
  "morning",
  "noon",
  "afternoon",
  "evening",
  "night",
  "tonight",
  "day",
  "yesterday",
  "dawn",
  "dusk"
]);

const MEAL_WORDS = new Set(["breakfast", "lunch", "dinner", "supper", "brunch", "bua"]);

const SINCE_BRIDGE = new Set([
  "luc",
  "khoang",
  "vao",
  "this",
  "the",
  "about",
  "around",
  "early",
  "late",
  "a",
  "an",
  "past",
  "last"
]);

/** A clock time («6 giờ sáng», «từ 2 giờ») is never the 2-hour kick-count window. */
function isClockHour(folded: string[], index: number): boolean {
  const next = folded[index + 1] ?? "";
  if (next !== "gio" && next !== "hour" && next !== "hours" && next !== "oclock") return false;
  const prev = folded[index - 1] ?? "";
  const after = folded[index + 2] ?? "";
  if (
    prev === "tu" ||
    prev === "luc" ||
    prev === "vao" ||
    prev === "at" ||
    prev === "since" ||
    prev === "from" ||
    prev === "khoang"
  ) {
    return true;
  }
  return DAY_PARTS.has(after) || after === "am" || after === "pm";
}

function isTwoHourWindow(folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const word = folded[index] ?? "";
    const next = folded[index + 1] ?? "";
    const two = word === "2" || word === "hai" || word === "two";
    const hour = next === "gio" || next === "tieng" || next === "hour" || next === "hours";
    if (two && hour && !isClockHour(folded, index)) return true;
  }
  return false;
}

function isMuoiToken(token: string, folded: string): boolean {
  return folded === "muoi" && (token === "mười" || token === "mươi" || !hasToneOrVowelMark(token));
}

function isKickClassifierAt(canonical: string[], folded: string[], index: number): boolean {
  const token = canonical[index] ?? "";
  const word = folded[index] ?? "";
  const next = folded[index + 1];
  if (next === "dong") return false;
  if (token === "cú") return true;
  if (!hasToneOrVowelMark(token) && word === "cu") return true;
  if (
    isMarkedOrPlain(token, "lần", "lan") ||
    isMarkedOrPlain(token, "cái", "cai") ||
    isMarkedOrPlain(token, "nhịp", "nhip")
  ) {
    return true;
  }
  return word === "times";
}

function isBareKickClassifier(canonical: string[], folded: string[], index: number): boolean {
  const token = canonical[index] ?? "";
  const word = folded[index] ?? "";
  if (folded[index + 1] === "dong") return false;
  if (token === "cú") return true;
  return !hasToneOrVowelMark(token) && word === "cu";
}

function isMovementNounAt(canonical: string[], folded: string[], index: number): boolean {
  if (index < 0 || index >= folded.length) return false;
  if (isCuDongAt(canonical, index)) return true;
  if (isFetalKickToken(canonical[index] ?? "") && folded[index + 1] !== "xe") return true;
  if (isFetalMayToken(canonical[index] ?? "") && !MACHINE_AFTER_MAY.has(folded[index + 1] ?? "")) return true;
  return isEnglishMovement(folded[index] ?? "");
}

function movementNounNearby(
  canonical: string[],
  folded: string[],
  start: number,
  end: number,
  window = 4
): boolean {
  for (let index = Math.max(0, start - window); index <= Math.min(folded.length - 1, end + window); index += 1) {
    if (isMovementNounAt(canonical, folded, index)) return true;
  }
  return false;
}

/**
 * A reported count is anchored when the number sits on a kick noun or «cú».
 * «lần» / «times» count only when a movement noun is in the same window,
 * so «5 lần siêu âm» is not a kick count. «2 giờ» is a time span, not a count.
 */
function numberIsKickCount(
  canonical: string[],
  folded: string[],
  start: number,
  end: number
): boolean {
  const left = folded[start - 1] ?? "";
  const right = folded[end] ?? "";
  if (COUNT_TIME_WORDS.has(left) || COUNT_TIME_WORDS.has(right)) return false;
  const link = new Set(["chi", "only", "just", "about", "khoang", "around", "roughly", "exactly"]);
  const rightIsCount = isMovementNounAt(canonical, folded, end) || isBareKickClassifier(canonical, folded, end);
  const leftIsCount =
    isMovementNounAt(canonical, folded, start - 1) || isBareKickClassifier(canonical, folded, start - 1);
  if (rightIsCount || leftIsCount) return true;
  const rightClass = isKickClassifierAt(canonical, folded, end);
  const leftClass = isKickClassifierAt(canonical, folded, start - 1);
  if ((rightClass || leftClass) && movementNounNearby(canonical, folded, start, end)) return true;
  if (link.has(left) && (isMovementNounAt(canonical, folded, start - 2) || isBareKickClassifier(canonical, folded, start - 2))) {
    return true;
  }
  if (link.has(right) && isMovementNounAt(canonical, folded, end + 1)) return true;
  return false;
}

/**
 * «từ lần khám trước» and «sau lần siêu âm» are time idioms, not tư/sáu lần.
 * «tư lần đạp» and «sau lan dap» stay kick counts.
 */
function isTimeIdiomNotCount(canonical: string[], folded: string[], index: number): boolean {
  const token = canonical[index] ?? "";
  const word = folded[index] ?? "";
  if (hasToneOrVowelMark(token)) return false;
  if (word !== "tu" && word !== "sau") return false;
  if ((folded[index + 1] ?? "") !== "lan") return false;
  let sawEvent = false;
  let sawTruoc = false;
  const last = Math.min(folded.length, index + 7);
  for (let cursor = index + 2; cursor < last; cursor += 1) {
    const next = folded[cursor] ?? "";
    const nextToken = canonical[cursor] ?? "";
    if (next === "truoc") {
      sawTruoc = true;
      break;
    }
    if (
      isMovementNounAt(canonical, folded, cursor) ||
      isBareKickClassifier(canonical, folded, cursor) ||
      isKickClassifierAt(canonical, folded, cursor)
    ) {
      if (!sawEvent) return false;
      break;
    }
    if (FETAL_SUBJECTS.has(next) || next === "em" || next === "nay" || isSymptomFiller(nextToken)) continue;
    sawEvent = true;
  }
  if (word === "tu" && sawTruoc) return true;
  return word === "sau" && sawEvent;
}

function isDamBaPair(folded: string[], index: number): boolean {
  return (folded[index] ?? "") === "dam" && (folded[index + 1] ?? "") === "ba";
}

function readNumberAt(
  canonical: string[],
  folded: string[],
  index: number
): { value: number; end: number } | null {
  if (isTimeIdiomNotCount(canonical, folded, index)) return null;
  if ((folded[index] ?? "") === "ba" && (folded[index - 1] ?? "") === "dam") return null;
  const token = canonical[index] ?? "";
  const word = folded[index] ?? "";
  const magnitude = countMagnitude(token) ?? countMagnitude(word);
  if (magnitude) {
    const range = /^(\d+)-(\d+)$/.exec(token) ?? /^(\d+)-(\d+)$/.exec(word);
    if (range) return { value: Number(range[2]), end: index + 1 };
    return { value: Number(token || word), end: index + 1 };
  }
  const english = !hasToneOrVowelMark(token) ? EN_NUMBER_WORDS[word] : undefined;
  if (english !== undefined) return { value: english, end: index + 1 };
  if (!hasToneOrVowelMark(token) && word === "once" && (folded[index - 1] ?? "") !== "at") {
    return { value: 1, end: index + 1 };
  }

  const licensed = foldOnlyLicensed(canonical, folded, index);
  const unit = isViNumberUnit(token, word, licensed);
  const nextLicensed = licensed || foldOnlyLicensed(canonical, folded, index + 1);
  const nextUnit = isViNumberUnit(canonical[index + 1] ?? "", folded[index + 1] ?? "", nextLicensed);
  const nextIsMuoi = isMuoiToken(canonical[index + 1] ?? "", folded[index + 1] ?? "");
  if (unit !== null && nextIsMuoi) {
    const after = isViNumberUnit(
      canonical[index + 2] ?? "",
      folded[index + 2] ?? "",
      nextLicensed || foldOnlyLicensed(canonical, folded, index + 2)
    );
    return { value: unit * 10 + (after ?? 0), end: after === null ? index + 2 : index + 3 };
  }
  if (isMuoiToken(token, word)) {
    return { value: 10 + (nextUnit ?? 0), end: nextUnit === null ? index + 1 : index + 2 };
  }
  if (unit !== null) return { value: unit, end: index + 1 };
  return null;
}

function fewerThanIntro(folded: string[], canonical: string[], index: number): boolean {
  const prev = folded[index - 1] ?? "";
  const prev2 = folded[index - 2] ?? "";
  const intro =
    ((prev2 === "it" || prev2 === "fewer" || prev2 === "less") && (prev === "hon" || prev === "than")) ||
    prev === "under" ||
    prev === "duoi";
  if (!intro) return false;
  if (prev2 === "fewer" || prev2 === "less") return !englishDecreaseIsNegated(folded, index - 2, canonical);
  if (prev2 === "it") return !decreaseWordDenied(folded, canonical, index - 2);
  return true;
}

function isFoodVerb(token: string, folded: string): boolean {
  if (token === "ăn" || token === "uống" || token === "bú" || token === "ngủ") return true;
  if (!hasToneOrVowelMark(token) && (folded === "bu" || folded === "uong" || folded === "ngu")) return true;
  return (
    folded === "eat" ||
    folded === "eating" ||
    folded === "ate" ||
    folded === "drink" ||
    folded === "drinking" ||
    folded === "drank" ||
    folded === "sleep" ||
    folded === "sleeping" ||
    folded === "slept" ||
    folded === "feed" ||
    folded === "feeding"
  );
}

function quantityOwnedByFood(canonical: string[], folded: string[], index: number): boolean {
  let cursor = index - 1;
  while (cursor >= 0 && CLASS_WINDOW_SKIP.has(folded[cursor] ?? "")) cursor -= 1;
  return cursor >= 0 && isFoodVerb(canonical[cursor] ?? "", folded[cursor] ?? "");
}

function isVagueLowQuantity(canonical: string[], folded: string[], index: number): boolean {
  const token = canonical[index] ?? "";
  const word = folded[index] ?? "";
  if (isDamBaPair(folded, index)) return true;
  if (isMarkedOrPlain(token, "vài", "vai")) return true;
  if (foldLeadingDd(token) === "mấy") return true;
  if (unaccentedMayIsQuantity(canonical, folded, index)) return true;
  if (!hasToneOrVowelMark(token) && (word === "few" || word === "couple" || word === "several")) return true;
  return false;
}

/** «đạp tiếp», «lại đạp», «đạp nhiều», «very active», «kept kicking». */
function hasActiveBabyCue(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const token = canonical[index] ?? "";
    const word = folded[index] ?? "";
    if (!hasToneOrVowelMark(token) && (word === "active" || word === "actively" || word === "energetic")) {
      return true;
    }
    if (!hasToneOrVowelMark(token) && (word === "lots" || word === "plenty")) return true;
    if (word === "lot" && ((folded[index - 1] ?? "") === "a" || (folded[index + 1] ?? "") === "of")) return true;
    if (
      !hasToneOrVowelMark(token) &&
      (word === "kept" || word === "again" || word === "continued" || word === "continues" || word === "continue") &&
      (isEnglishMovement(folded[index + 1] ?? "") ||
        isEnglishMovement(folded[index - 1] ?? "") ||
        isEnglishMovement(folded[index + 2] ?? "") ||
        englishMovementNoun(folded[index + 1] ?? "") ||
        englishMovementNoun(folded[index + 2] ?? ""))
    ) {
      return true;
    }
    if (isMarkedOrPlain(token, "tiếp", "tiep") && isMovementNounAt(canonical, folded, index - 1)) return true;
    if (isMarkedOrPlain(token, "tiếp", "tiep") && isMarkedOrPlain(canonical[index + 1] ?? "", "tục", "tuc")) {
      return true;
    }
    if (word === "lai" && isMovementNounAt(canonical, folded, index + 1)) return true;
    if (
      isMarkedOrPlain(token, "liên", "lien") &&
      (isMarkedOrPlain(canonical[index + 1] ?? "", "tục", "tuc") ||
        isMarkedOrPlain(canonical[index + 1] ?? "", "tiếp", "tiep"))
    ) {
      return true;
    }
    if (
      isMovementNounAt(canonical, folded, index - 1) &&
      (isMarkedOrPlain(token, "nữa", "nua") ||
        isMarkedOrPlain(token, "thêm", "them") ||
        isMarkedOrPlain(token, "mạnh", "manh") ||
        isMarkedOrPlain(token, "đều", "deu") ||
        isMarkedOrPlain(token, "nhiều", "nhieu"))
    ) {
      return true;
    }
    if (isMarkedOrPlain(token, "nhiều", "nhieu") && isMovementNounAt(canonical, folded, index + 1)) return true;
    if ((folded[index] ?? "") === "hieu" && (folded[index + 1] ?? "") === "dong") return true;
    if (isMarkedOrPlain(token, "quậy", "quay")) return true;
    if (isKhoeToken(token)) return true;
    if (!hasToneOrVowelMark(token) && (word === "lively" || word === "playful" || word === "hyperactive")) {
      return true;
    }
    if (isMarkedOrPlain(token, "mạnh", "manh")) {
      const prev = folded[index - 1] ?? "";
      if (isMovementNounAt(canonical, folded, index - 1)) return true;
      if ((prev === "rat" || prev === "qua") && isMovementNounAt(canonical, folded, index - 2)) return true;
    }
  }
  return false;
}

function isKhoeToken(token: string): boolean {
  const canonical = foldLeadingDd(token);
  if (canonical === "khỏe" || canonical === "khoẻ") return true;
  if (hasToneOrVowelMark(canonical)) return false;
  return foldToken(canonical) === "khoe";
}

/** A burst is one episode, not the 2-hour total. «đạp một tràng», «4 times in a burst». */
function isBurstAround(canonical: string[], folded: string[], index: number, end: number): boolean {
  const from = Math.max(0, index - 4);
  const to = Math.min(folded.length - 1, end + 4);
  for (let cursor = from; cursor <= to; cursor += 1) {
    const token = canonical[cursor] ?? "";
    const word = folded[cursor] ?? "";
    if (!hasToneOrVowelMark(token) && (word === "burst" || word === "bursts")) return true;
    if (isMarkedOrPlain(token, "tràng", "trang")) return true;
    if (isMarkedOrPlain(token, "dồn", "don")) return true;
    if (word === "once" && (folded[cursor - 1] ?? "") === "at") return true;
    if (word === "row" && ((folded[cursor - 1] ?? "") === "a" || (folded[cursor - 2] ?? "") === "in")) return true;
    if (
      isMarkedOrPlain(token, "liên", "lien") &&
      isMarkedOrPlain(canonical[cursor + 1] ?? "", "tiếp", "tiep")
    ) {
      return true;
    }
  }
  return false;
}

function isWeekOrMonthCount(folded: string[], end: number): boolean {
  const next = folded[end] ?? "";
  return (
    next === "tuan" ||
    next === "week" ||
    next === "weeks" ||
    next === "thang" ||
    next === "month" ||
    next === "months"
  );
}

function isReachWord(token: string, folded: string): boolean {
  return (
    isMarkedOrPlain(token, "được", "duoc") ||
    isMarkedOrPlain(token, "tới", "toi") ||
    isMarkedOrPlain(token, "đến", "den") ||
    isMarkedOrPlain(token, "đủ", "du")
  );
}

/**
 * Not yet at the count: «chưa được 10 lần trong 2 giờ», «not even 10 yet».
 * «chưa được 10 tuần» is gestational age, not a kick count.
 */
function notYetReachingCount(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const word = folded[index] ?? "";
    const token = canonical[index] ?? "";
    let numberAt = -1;
    if (word === "not" && ((folded[index + 1] ?? "") === "even" || (folded[index + 1] ?? "") === "reached")) {
      numberAt = index + 2;
    } else if (word === "has" && (folded[index + 1] ?? "") === "not" && (folded[index + 2] ?? "") === "reached") {
      numberAt = index + 3;
    } else if (
      (word === "chua" || isMarkedOrPlain(token, "chưa", "chua")) &&
      isReachWord(canonical[index + 1] ?? "", folded[index + 1] ?? "")
    ) {
      numberAt = index + 2;
    }
    if (numberAt < 0) continue;
    const parsed = readNumberAt(canonical, folded, numberAt);
    if (!parsed || isWeekOrMonthCount(folded, parsed.end)) continue;
    if (word === "not" || word === "has") return true;
    const anchored =
      isTwoHourWindow(folded) ||
      isCountClassifierToken(canonical, folded, parsed.end) ||
      isKickClassifierAt(canonical, folded, parsed.end) ||
      isMovementNounAt(canonical, folded, parsed.end) ||
      countClassifierNear(canonical, folded, numberAt);
    if (anchored) return true;
  }
  return false;
}

/**
 * Hours, a whole morning, or since yesterday.
 * A count of zero or one over this window is reduced movement.
 * «2 giờ» stays the kick-count protocol window and is not this class.
 * «Bé đạp từ sáng đến giờ» has the window and no zero-or-one count, so it stays quiet.
 */
/** «từ» / «since» plus a part of day, a meal, or a clock time. Always a long window. */
function sinceTimeIsLongWindow(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const word = folded[index] ?? "";
    if (word !== "tu" && word !== "since" && word !== "from") continue;
    const end = Math.min(folded.length, index + 6);
    for (let cursor = index + 1; cursor < end; cursor += 1) {
      const next = folded[cursor] ?? "";
      const token = canonical[cursor] ?? "";
      if (DAY_PARTS.has(next) || MEAL_WORDS.has(next)) return true;
      if (
        (next === "gio" || next === "hour" || next === "hours" || next === "oclock") &&
        (/^\d+$/.test(folded[cursor - 1] ?? "") ||
          (!hasToneOrVowelMark(canonical[cursor - 1] ?? "") &&
            (EN_NUMBER_WORDS[folded[cursor - 1] ?? ""] !== undefined ||
              VI_NUMBER_UNITS[folded[cursor - 1] ?? ""] !== undefined)))
      ) {
        return true;
      }
      if (SINCE_BRIDGE.has(next) || /^\d+$/.test(token) || /^\d+$/.test(next)) continue;
      break;
    }
  }
  return false;
}

function wholeDayPartIsLongWindow(folded: string[]): boolean {
  const joined = ` ${folded.join(" ")} `;
  return /\s(?:all|whole|entire)\s+(?:morning|afternoon|evening|night|day|noon)\s/.test(joined);
}

function isLongReducedWindow(canonical: string[], folded: string[]): boolean {
  if (sinceTimeIsLongWindow(canonical, folded) || wholeDayPartIsLongWindow(folded)) return true;
  const joined = ` ${folded.join(" ")} `;
  if (/\s(?:for|over|several|many|past|multiple)\s+hours\s/.test(joined)) return true;
  if (/\s(?:few|couple)\s+hours\s/.test(joined)) return true;
  if (/\shours\s/.test(joined) && !/\s(?:\d+|two|one|three)\s+hours\s/.test(joined)) return true;
  if (/\s(?:all|whole)\s+morning\s/.test(joined)) return true;
  if (/\ssince\s+yesterday\s/.test(joined)) return true;
  if (/\ssince\s+(?:this\s+|the\s+)?morning\s/.test(joined)) return true;
  if (hasOrderedPhrase(folded, ["ca", "buoi", "sang"], 1)) return true;
  if (hasOrderedPhrase(folded, ["ca", "buoi"], 0)) return true;
  if (hasOrderedPhrase(folded, ["ca", "sang"], 0)) return true;
  if (hasOrderedPhrase(folded, ["suot", "buoi"], 0)) return true;
  if (hasOrderedPhrase(folded, ["tu", "hom", "qua"], 1)) return true;
  if (hasOrderedPhrase(folded, ["tu", "sang"], 0)) return true;
  for (let index = 0; index < folded.length - 1; index += 1) {
    const token = canonical[index] ?? "";
    const vagueHours =
      foldLeadingDd(token) === "mấy" || (!hasToneOrVowelMark(token) && (folded[index] ?? "") === "may");
    if (!vagueHours) continue;
    const next = folded[index + 1] ?? "";
    if (next === "tieng" || next === "gio") return true;
  }
  return hasOrderedPhrase(folded, ["nhieu", "tieng"], 0) || hasOrderedPhrase(folded, ["nhieu", "gio"], 0);
}

/**
 * Kick-count ruling, separate from reduced movement that is not a count.
 * Alerts for fewer-than-usual, «ít hơn 10», or a count below 10.
 * A single kick and a burst are not low counts unless the note says fewer than
 * usual, under 10 movements in 2 hours, or zero/one over a long window.
 * A normal or high count stays silent.
 * A vague quantity with an active-baby cue stays silent.
 */
function kickCountShouldAlert(note: string): boolean {
  const { canonical, folded } = rawMovementFold(note);
  if (fewerThanUsualShouldAlert(canonical, folded)) return true;
  if (notYetReachingCount(canonical, folded)) return true;
  const longWindow = isLongReducedWindow(canonical, folded);
  let index = 0;
  while (index < folded.length) {
    if (isVagueLowQuantity(canonical, folded, index) && !quantityOwnedByFood(canonical, folded, index)) {
      const anchorAt = isDamBaPair(folded, index) ? index + 2 : index + 1;
      const ahead = folded[anchorAt] ?? "";
      const anchored =
        isMovementNounAt(canonical, folded, anchorAt) ||
        isBareKickClassifier(canonical, folded, anchorAt) ||
        isKickClassifierAt(canonical, folded, anchorAt) ||
        isMovementNounAt(canonical, folded, index - 1) ||
        isBareKickClassifier(canonical, folded, index - 1) ||
        ((ahead === "of" || ahead === "lan" || ahead === "cai") &&
          isMovementNounAt(canonical, folded, anchorAt + 1));
      if (anchored && !decreaseWordDenied(folded, canonical, index) && !hasActiveBabyCue(canonical, folded)) {
        return true;
      }
    }
    const parsed = readNumberAt(canonical, folded, index);
    if (!parsed) {
      index += 1;
      continue;
    }
    if (numberIsKickCount(canonical, folded, index, parsed.end) && !viUnitIsNotACount(canonical, folded, index, parsed.end)) {
      if (fewerThanIntro(folded, canonical, index)) return true;
      const low = parsed.value < 10 && countMagnitude(canonical[index] ?? "") !== "high";
      const burst = isBurstAround(canonical, folded, index, parsed.end);
      const suppressSingle = parsed.value === 1 && !isTwoHourWindow(folded) && !longWindow;
      const suppressBurst = burst && parsed.value !== 1 && !isTwoHourWindow(folded);
      const suppressOneBurst = burst && parsed.value === 1 && !isTwoHourWindow(folded) && !longWindow;
      if (low && !suppressSingle && !suppressBurst && !suppressOneBurst) return true;
    }
    index = Math.max(index + 1, parsed.end);
  }
  return false;
}

/** «ba» is also father, «năm nay» is a year, and «tư thế» is a posture. Those are not kick counts. */
function viUnitIsNotACount(canonical: string[], folded: string[], index: number, end: number): boolean {
  const word = folded[index] ?? "";
  const next = folded[index + 1] ?? "";
  if (word === "nam" && (next === "nay" || next === "ngoai" || next === "kia" || next === "toi" || next === "sau" || next === "truoc")) {
    return true;
  }
  if (word === "tu" && next === "the") return true;
  if (word !== "ba") return false;
  if (end > index + 1) return false;
  const classifier =
    isKickClassifierAt(canonical, folded, index + 1) || isKickClassifierAt(canonical, folded, index - 1);
  return !classifier;
}

function phraseStartsAt(folded: string[], start: number, phrase: string[], maxGaps: number): boolean {
  if (folded[start] !== phrase[0]) return false;
  let gaps = 0;
  let cursor = start;
  for (let part = 1; part < phrase.length; part += 1) {
    cursor += 1;
    if (cursor >= folded.length) return false;
    if (folded[cursor] === phrase[part]) continue;
    if (gaps < maxGaps && folded[cursor + 1] === phrase[part]) {
      gaps += 1;
      cursor += 1;
      continue;
    }
    return false;
  }
  return true;
}

function fewerThanUsualShouldAlert(canonical: string[], folded: string[]): boolean {
  const phrases = [
    ["it", "hon", "moi", "khi"],
    ["fewer", "than", "usual"],
    ["less", "than", "usual"],
    ["fewer", "than", "normal"],
    ["less", "than", "normal"]
  ];
  for (const phrase of phrases) {
    for (let start = 0; start < folded.length; start += 1) {
      if (!phraseStartsAt(folded, start, phrase, 1)) continue;
      if (phrase[0] === "it" && (decreaseWordDenied(folded, canonical, start) || quantityOwnedByFood(canonical, folded, start))) {
        continue;
      }
      if ((phrase[0] === "fewer" || phrase[0] === "less") && englishDecreaseIsNegated(folded, start, canonical)) continue;
      if ((phrase[0] === "fewer" || phrase[0] === "less") && quantityOwnedByFood(canonical, folded, start)) continue;
      return true;
    }
  }
  return false;
}

function isWeightLossDecrease(folded: string[], index: number): boolean {
  const next = folded[index + 1] ?? "";
  return next === "can" || next === "weight" || next === "kg" || next === "kilo" || next === "pound" || next === "pounds";
}

function classPartnerDenied(canonical: string[], folded: string[], index: number): boolean {
  const word = folded[index] ?? "";
  if (isEnglishDecreaseWord(word) || englishStopWord(word)) {
    return englishDecreaseIsNegated(folded, index, canonical);
  }
  return decreaseWordDenied(folded, canonical, index) || stopIsNegated(canonical, folded, index);
}

/**
 * Stop or decrease within a short window of a movement noun, either order.
 * «cử động đã ngừng», «movement has decreased», «kicks fewer», «ngừng cử động».
 * «giảm cân», «đạp hết sức», «máy hết nước», and a negated partner do not alert.
 */
function classWindowShouldAlert(canonical: string[], folded: string[]): boolean {
  const spans = movementSpans(canonical, folded);
  for (let index = 0; index < folded.length; index += 1) {
    if (isEnglishMovement(folded[index] ?? "")) spans.push([index, index]);
  }
  for (const [start, end] of spans) {
    if (partnerAlong(canonical, folded, start, end, -1)) return true;
    if (partnerAlong(canonical, folded, start, end, 1)) return true;
  }
  return false;
}

function partnerAlong(
  canonical: string[],
  folded: string[],
  start: number,
  end: number,
  direction: -1 | 1
): boolean {
  const bareMay = isFetalMayToken(canonical[start] ?? "") && !isCuDongAt(canonical, start) && !isFetalKickToken(canonical[start] ?? "");
  let index = direction < 0 ? start - 1 : end + 1;
  let steps = 0;
  while (index >= 0 && index < folded.length && steps < 5) {
    const word = folded[index] ?? "";
    const token = canonical[index] ?? "";
    if (CLASS_WINDOW_SKIP.has(word) || (word === "di" && folded[index - 1] === "it")) {
      index += direction;
      steps += 1;
      continue;
    }
    const stop =
      isVietnameseStop(token) ||
      englishStopWord(word) ||
      (direction < 0 && index + 1 === start && isMarkedOrPlain(token, "thôi", "thoi"));
    const vietnameseIt = word === "it" && !isEnglishPronounIt(folded, index);
    const decrease =
      (isBareDecreaseWord(word, token) && !isEnglishPronounIt(folded, index)) ||
      isEnglishDecreaseWord(word) ||
      (vietnameseIt && folded[index + direction] === "di");
    if (stop || decrease) {
      if (stop && isVietnameseStop(token) && (hetSucAt(canonical, index) || hetIsWholePeriod(canonical, folded, index))) {
        return false;
      }
      if (stop && bareMay && isMarkedOrPlain(token, "hết", "het")) return false;
      if (decrease && isWeightLossDecrease(folded, index)) return false;
      if (word === "it" && quantityOwnedByFood(canonical, folded, index)) return false;
      if (classPartnerDenied(canonical, folded, index)) return false;
      return true;
    }
    if (isFoodVerb(token, word)) return false;
    return false;
  }
  return false;
}

function isHowToCountQuestion(note: string): boolean {
  const { canonical, folded } = rawMovementFold(note);
  const hasCount = canonical.some((token, index) => isCountVerb(token) || folded[index] === "counting");
  if (!hasCount) return false;
  const hasKick = folded.some((_, index) => isMovementNounAt(canonical, folded, index) || isBareKickClassifier(canonical, folded, index));
  if (!hasKick) return false;
  const joined = folded.join(" ");
  const lower = normalizeUrgentNote(note).stripped;
  return (
    note.includes("?") ||
    note.includes("？") ||
    joined.includes("nhu the nao") ||
    joined.includes("the nao") ||
    joined.includes("cach nao") ||
    joined.includes("lam sao") ||
    joined.includes("ra sao") ||
    joined.includes("cach dem") ||
    /\bhow (?:do|to|can|should|does|did|would)\b/.test(lower)
  );
}

/** A still-moving cue, «không giảm», «bình thường», or an English negated decrease. */
/**
 * «không thấy / không cảm thấy / chưa thấy … giảm / ít đi» denies the decrease.
 * English «did not notice … less» is the same denial.
 * «cảm giác» and «cảm nhận» are a different class: inability to feel movement.
 */
function isCamThay(folded: string[], index: number): boolean {
  return (folded[index] ?? "") === "cam" && (folded[index + 1] ?? "") === "thay";
}

function isNoticeWord(word: string): boolean {
  return word === "notice" || word === "noticed" || word === "notices" || word === "noticing";
}

function isObservedDecreaseAt(folded: string[], index: number): boolean {
  const word = folded[index] ?? "";
  if (word === "giam" || isEnglishDecreaseWord(word)) return true;
  return (word === "it" || word === "yeu") && (folded[index + 1] ?? "") === "di";
}

/** Movement, the baby, or a filler may sit between «thấy» / «notice» and the decrease. */
function isObservedDenialBridge(canonical: string[], folded: string[], index: number): boolean {
  const word = folded[index] ?? "";
  const token = canonical[index] ?? "";
  if (isMovementNounAt(canonical, folded, index) || isEnglishMovement(word) || englishMovementNoun(word)) {
    return true;
  }
  if (FETAL_SUBJECTS.has(word) || word === "em" || word === "baby" || word === "fetal" || word === "fetus") {
    return true;
  }
  if (word === "the" || word === "a" || word === "of" || word === "my" || word === "her" || word === "his") return true;
  if (word === "rat" || word === "dan" || word === "hon" || word === "qua" || word === "di") return true;
  if (isSymptomFiller(token) || isKickClassifierAt(canonical, folded, index)) return true;
  return isMarkedOrPlain(token, "động", "dong") && isMarkedOrPlain(canonical[index - 1] ?? "", "cử", "cu");
}

/**
 * This decrease word is «negator + thấy/cảm thấy/notice + … + giảm/ít đi/less».
 * «chưa» denies it the same way «không» does. «cảm nhận» does not.
 */
function observedDenialCovers(canonical: string[], folded: string[], target: number): boolean {
  if (!isObservedDecreaseAt(folded, target)) return false;
  for (let index = 0; index < target; index += 1) {
    const token = canonical[index] ?? "";
    const word = folded[index] ?? "";
    const vietnamese = isMovementNegator(word, token, folded[index - 1]);
    const english = word === "not" || word === "no" || word === "never";
    if (!vietnamese && !english) continue;
    let sawObserve = false;
    let steps = 0;
    for (let cursor = index + 1; cursor <= target && steps < 8; cursor += 1) {
      const next = folded[cursor] ?? "";
      const nextToken = canonical[cursor] ?? "";
      if (!sawObserve) {
        if (isCamThay(folded, cursor) || next === "thay" || isNoticeWord(next)) {
          sawObserve = true;
          steps += 1;
          continue;
        }
        if (next === "cam" && ((folded[cursor + 1] ?? "") === "giac" || (folded[cursor + 1] ?? "") === "nhan")) {
          break;
        }
        if (
          next === "cam" ||
          isSymptomFiller(nextToken) ||
          next === "he" ||
          next === "really" ||
          next === "even"
        ) {
          steps += 1;
          continue;
        }
        break;
      }
      if (cursor === target) return true;
      if (isObservedDenialBridge(canonical, folded, cursor)) {
        steps += 1;
        continue;
      }
      break;
    }
  }
  return false;
}

function observedDecreaseIsDenied(canonical: string[], folded: string[]): boolean {
  return folded.some((_, index) => observedDenialCovers(canonical, folded, index));
}

/**
 * A still-moving cue, «không giảm», «bình thường», or an English negated decrease.
 * The negated-decrease check runs before negator + perception, so
 * «không thấy thai máy giảm» is calm. Negator + perception without that
 * denial stays the reduced-movement class («không cảm nhận được cử động»,
 * «không thấy đạp»).
 */
function hasCalmCue(canonical: string[], folded: string[]): boolean {
  if (hasStillMovingSignal(canonical, folded)) return true;
  if (folded.some((_, index) => negatorFollowedByGiam(folded, index, canonical))) return true;
  if (observedDecreaseIsDenied(canonical, folded)) return true;
  if (
    folded.some(
      (_, index) => negatorMarksAbsence(folded, canonical, index) && perceptionFollowsNegator(folded, canonical, index)
    )
  ) {
    return false;
  }
  if (clauseHasNegatedDecrease(canonical, folded)) return true;
  return folded.some(
    (word, index) => isEnglishDecreaseWord(word) && englishDecreaseIsNegated(folded, index, canonical)
  );
}

function perceptionFollowsNegator(folded: string[], canonical: string[], index: number): boolean {
  const end = Math.min(folded.length, index + 1 + REDUCED_MOVEMENT_WINDOW);
  for (let cursor = index + 1; cursor < end; cursor += 1) {
    const token = canonical[cursor] ?? "";
    const word = folded[cursor] ?? "";
    if (isPerceptionWord(word) || isPerceptionTail(token, folded[cursor - 1])) return true;
  }
  return false;
}

function isMotherSubjectToken(token: string, folded: string): boolean {
  if (isMarkedOrPlain(token, "mẹ", "me")) return true;
  if (isMarkedOrPlain(token, "tôi", "toi")) return true;
  if (isMarkedOrPlain(token, "mình", "minh")) return true;
  return !hasToneOrVowelMark(token) && folded === "i";
}

/** Baby «con» has no tone. «còn» (still / no longer) keeps its tone and is not the baby. */
function isFetalSubjectWord(token: string, folded: string): boolean {
  if (folded === "baby" || folded === "babies" || folded === "fetal" || folded === "fetus" || folded === "thai") {
    return true;
  }
  if (folded === "be" && (foldLeadingDd(token) === "bé" || !hasToneOrVowelMark(token))) return true;
  if (folded === "con" && !hasToneOrVowelMark(token)) return true;
  return false;
}

/**
 * «mẹ không cử động được» and «I can't move» are the mother, not the baby.
 * A fetal subject in the same clause («bé không cử động») stays a red flag.
 */
function motherOwnsMovement(canonical: string[], folded: string[]): boolean {
  let sawMother = false;
  let sawFetal = false;
  for (let index = 0; index < folded.length; index += 1) {
    const token = canonical[index] ?? "";
    const word = folded[index] ?? "";
    if (isFetalSubjectWord(token, word)) sawFetal = true;
    const motherVerb =
      isCuDongAt(canonical, index) ||
      word === "move" ||
      word === "moves" ||
      word === "moving" ||
      word === "moved";
    if (!motherVerb) continue;
    for (let cursor = index - 1; cursor >= Math.max(0, index - 5); cursor -= 1) {
      const prevToken = canonical[cursor] ?? "";
      const prev = folded[cursor] ?? "";
      if (isFetalSubjectWord(prevToken, prev)) break;
      if (isMotherSubjectToken(prevToken, prev)) {
        sawMother = true;
        break;
      }
    }
  }
  return sawMother && !sawFetal;
}

function isReductionLemma(canonical: string[], folded: string[], index: number): boolean {
  const word = folded[index] ?? "";
  const token = canonical[index] ?? "";
  if (isEnglishPronounIt(folded, index) || isWeightLossDecrease(folded, index)) return false;
  if (word === "giam") return true;
  if (word === "it" || word === "yeu") {
    if (word === "yeu" && hasToneOrVowelMark(token) && foldLeadingDd(token) !== "yếu") return false;
    return true;
  }
  if (isMovementLoss(canonical, folded, index)) return true;
  if (isEnglishDecreaseWord(word)) return true;
  if (hasToneOrVowelMark(token)) return false;
  return (
    word === "diminished" ||
    word === "diminish" ||
    word === "diminishing" ||
    word === "decline" ||
    word === "declined" ||
    word === "declining"
  );
}

function reductionOwnedByOther(canonical: string[], folded: string[], index: number): boolean {
  if (quantityOwnedByFood(canonical, folded, index)) return true;
  if (isFoodVerb(canonical[index + 1] ?? "", folded[index + 1] ?? "")) return true;
  if (isFoodVerb(canonical[index - 1] ?? "", folded[index - 1] ?? "")) return true;
  return false;
}

function foodBetween(canonical: string[], folded: string[], left: number, right: number): boolean {
  const from = Math.min(left, right) + 1;
  const to = Math.max(left, right);
  for (let index = from; index < to; index += 1) {
    if (isFoodVerb(canonical[index] ?? "", folded[index] ?? "")) return true;
  }
  return false;
}

/**
 * hoạt động / vận động / activity name movement in general, not one kick verb.
 * They count only when a fetal subject is in the same window, so «mẹ ít hoạt động» stays quiet.
 */
function isGeneralMovementConceptAt(canonical: string[], folded: string[], index: number): boolean {
  const token = canonical[index] ?? "";
  const next = canonical[index + 1] ?? "";
  if (isMarkedOrPlain(token, "hoạt", "hoat") && isMarkedOrPlain(next, "động", "dong")) return true;
  if (isMarkedOrPlain(token, "vận", "van") && isMarkedOrPlain(next, "động", "dong")) return true;
  if (hasToneOrVowelMark(token)) return false;
  const word = folded[index] ?? "";
  return word === "activity" || word === "activities" || word === "active";
}

function fetalSubjectNear(canonical: string[], folded: string[], index: number): boolean {
  const from = Math.max(0, index - 6);
  const to = Math.min(folded.length - 1, index + 6);
  for (let cursor = from; cursor <= to; cursor += 1) {
    if (isFetalSubjectWord(canonical[cursor] ?? "", folded[cursor] ?? "")) return true;
  }
  return false;
}

/**
 * Reduced movement is a class: a reduction lemma near a movement lemma.
 * Asking about it or describing it in general terms is the same class
 * («giảm vận động của thai», «movement is decreasing», «reduced fetal activity»).
 * It is not one literal phrase. A denied decrease, weight loss, and food stay out.
 */
function reducedMovementConceptShouldAlert(canonical: string[], folded: string[]): boolean {
  const movements: number[] = [];
  for (let index = 0; index < folded.length; index += 1) {
    if (isMovementNounAt(canonical, folded, index) || isEnglishMovement(folded[index] ?? "")) {
      movements.push(index);
      continue;
    }
    if (isGeneralMovementConceptAt(canonical, folded, index) && fetalSubjectNear(canonical, folded, index)) {
      movements.push(index);
    }
  }
  if (movements.length === 0) return false;
  for (let index = 0; index < folded.length; index += 1) {
    if (!isReductionLemma(canonical, folded, index)) continue;
    if (decreaseWordDenied(folded, canonical, index) || giamIsNegated(folded, index, canonical)) continue;
    if (isEnglishDecreaseWord(folded[index] ?? "") && englishDecreaseIsNegated(folded, index, canonical)) continue;
    if (reductionOwnedByOther(canonical, folded, index)) continue;
    for (const movement of movements) {
      if (Math.abs(index - movement) <= 6 && !foodBetween(canonical, folded, index, movement)) return true;
    }
  }
  return false;
}

/**
 * Fetal subject in front of this word. mẹ / tôi / I met first owns it instead,
 * so «mẹ nằm im» and «I have not been as active» stay quiet.
 */
function fetalSubjectOwns(canonical: string[], folded: string[], index: number, window = 6): boolean {
  for (let cursor = index - 1; cursor >= Math.max(0, index - window); cursor -= 1) {
    const token = canonical[cursor] ?? "";
    const word = folded[cursor] ?? "";
    if (isMotherSubjectToken(token, word)) return false;
    if (isFetalSubjectWord(token, word)) return true;
  }
  return false;
}

function movementBefore(canonical: string[], folded: string[], index: number, window = 4): boolean {
  for (let cursor = index - 1; cursor >= Math.max(0, index - window); cursor -= 1) {
    if (isMovementNounAt(canonical, folded, cursor) || isEnglishMovement(folded[cursor] ?? "")) return true;
  }
  return false;
}

function honAfter(canonical: string[], index: number): number {
  const last = Math.min(canonical.length - 1, index + 2);
  for (let cursor = index + 1; cursor <= last; cursor += 1) {
    if (isMarkedOrPlain(canonical[cursor] ?? "", "hơn", "hon")) return cursor;
  }
  return -1;
}

/** mọi ngày / mọi khi / hôm qua / trước / bình thường, and the English baselines. */
function usualBaselineAfter(folded: string[], index: number): boolean {
  const last = Math.min(folded.length - 1, index + 3);
  for (let cursor = index; cursor <= last; cursor += 1) {
    const word = folded[cursor] ?? "";
    if (word === "truoc" || word === "usual" || word === "before" || word === "yesterday") return true;
    if (word === "normal" || word === "normally" || word === "typical") return true;
    if (word === "moi" && ((folded[cursor + 1] ?? "") === "ngay" || (folded[cursor + 1] ?? "") === "khi")) {
      return true;
    }
    if (word === "hom" && (folded[cursor + 1] ?? "") === "qua") return true;
    if (word === "binh" && (folded[cursor + 1] ?? "") === "thuong") return true;
  }
  return false;
}

/**
 * Reduced movement with no «giảm»: quieter or stiller than the baby's usual,
 * lying still, or lazy about kicking.
 * «yên hơn», «nằm im», «lười đạp», «quieter than usual», «not … as active as».
 * «ít hoạt động hơn» is the reduction lemma beside hoạt động.
 * «không còn … nhiều như trước» is a real decrease (see comparativeReduction),
 * not a negated decrease, so a calm cue must not swallow it.
 */
function conceptQuietReductionShouldAlert(canonical: string[], folded: string[]): boolean {
  return (
    vietnameseQuieterCompare(canonical, folded) ||
    fetusLyingStill(canonical, folded) ||
    lazyFetalMovement(canonical, folded) ||
    englishQuieterThanUsual(canonical, folded) ||
    notAsActiveAsUsual(canonical, folded)
  );
}

function vietnameseQuieterCompare(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const token = canonical[index] ?? "";
    const yen = isMarkedOrPlain(token, "yên", "yen");
    const im = isMarkedOrPlain(token, "im", "im");
    if (!yen && !im) continue;
    const honAt = honAfter(canonical, index);
    if (honAt < 0 || !fetalSubjectOwns(canonical, folded, index)) continue;
    if (yen && honAt === index + 1) return true;
    if (usualBaselineAfter(folded, honAt + 1)) return true;
  }
  return false;
}

function fetusLyingStill(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length - 1; index += 1) {
    if (!isMarkedOrPlain(canonical[index] ?? "", "nằm", "nam")) continue;
    if (!isMarkedOrPlain(canonical[index + 1] ?? "", "im", "im")) continue;
    if (fetalSubjectOwns(canonical, folded, index)) return true;
  }
  return false;
}

function lazyFetalMovement(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    if (!isMarkedOrPlain(canonical[index] ?? "", "lười", "luoi")) continue;
    let mother = false;
    for (let cursor = index - 1; cursor >= Math.max(0, index - 4); cursor -= 1) {
      const token = canonical[cursor] ?? "";
      const word = folded[cursor] ?? "";
      if (isFetalSubjectWord(token, word)) {
        mother = false;
        break;
      }
      if (isMotherSubjectToken(token, word)) {
        mother = true;
        break;
      }
    }
    if (mother) continue;
    const last = Math.min(folded.length - 1, index + 2);
    for (let cursor = index + 1; cursor <= last; cursor += 1) {
      const token = canonical[cursor] ?? "";
      const word = folded[cursor] ?? "";
      if (isFoodVerb(token, word) || word === "xe") break;
      if (isFetalKickToken(token) && (folded[cursor + 1] ?? "") === "xe") break;
      if (movementVerbEnd(canonical, folded, cursor) >= 0) return true;
      if (isGeneralMovementConceptAt(canonical, folded, cursor) && fetalSubjectOwns(canonical, folded, index)) {
        return true;
      }
    }
  }
  return false;
}

function englishQuieterThanUsual(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const token = canonical[index] ?? "";
    const word = folded[index] ?? "";
    if (hasToneOrVowelMark(token)) continue;
    const comparative =
      word === "quieter" ||
      word === "stiller" ||
      ((word === "quiet" || word === "still") && (folded[index - 1] ?? "") === "more");
    if (!comparative) continue;
    let thanAt = -1;
    for (let cursor = index + 1; cursor <= index + 2 && cursor < folded.length; cursor += 1) {
      if ((folded[cursor] ?? "") === "than") {
        thanAt = cursor;
        break;
      }
    }
    if (thanAt < 0 || !usualBaselineAfter(folded, thanAt + 1)) continue;
    if (fetalSubjectOwns(canonical, folded, index) || movementBefore(canonical, folded, index)) return true;
  }
  return false;
}

/** «not been as active as yesterday / usual». The baby's activity, not the mother's. */
function notAsActiveAsUsual(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    if ((folded[index] ?? "") !== "as") continue;
    const next = folded[index + 1] ?? "";
    if (next !== "active" && next !== "actively") continue;
    if (!fetalSubjectOwns(canonical, folded, index)) continue;
    for (let cursor = index - 1; cursor >= Math.max(0, index - 6); cursor -= 1) {
      const prev = folded[cursor] ?? "";
      if (prev === "not" || prev === "no" || prev === "never") return true;
    }
  }
  return false;
}

/** «yếu hơn», «không … nhiều như trước», «weaker», «not as much». No count required. */
function comparativeReductionShouldAlert(canonical: string[], folded: string[]): boolean {
  const hasMovement = folded.some(
    (word, index) => isMovementNounAt(canonical, folded, index) || isEnglishMovement(word)
  );
  for (let index = 0; index < folded.length; index += 1) {
    const token = canonical[index] ?? "";
    const word = folded[index] ?? "";
    if (word === "yeu" && (folded[index + 1] ?? "") === "hon") {
      if (hasToneOrVowelMark(token) && foldLeadingDd(token) !== "yếu") continue;
      if (decreaseWordDenied(folded, canonical, index) || quantityOwnedByFood(canonical, folded, index)) continue;
      return true;
    }
    if (word === "weaker" && !englishDecreaseIsNegated(folded, index, canonical)) return true;
    if (word === "less" && (folded[index + 1] ?? "") === "than" && (folded[index + 2] ?? "") === "before") {
      if (!englishDecreaseIsNegated(folded, index, canonical) && !quantityOwnedByFood(canonical, folded, index)) return true;
    }
    if (word === "as" && ((folded[index + 1] ?? "") === "much" || (folded[index + 1] ?? "") === "many")) {
      for (let cursor = index - 1; cursor >= Math.max(0, index - 4); cursor -= 1) {
        const prev = folded[cursor] ?? "";
        if (prev === "not" || prev === "no" || prev === "never") return true;
      }
    }
    if (
      hasMovement &&
      word === "nhieu" &&
      (folded[index + 1] ?? "") === "nhu" &&
      (folded[index + 2] ?? "") === "truoc"
    ) {
      for (let cursor = index - 1; cursor >= Math.max(0, index - 6); cursor -= 1) {
        if (isMovementNegator(folded[cursor] ?? "", canonical[cursor] ?? "", folded[cursor - 1])) return true;
      }
    }
  }
  return false;
}

/** «không phải ít đi mà là ngừng hẳn»: the stop is in the same clause as the denied decrease. */
function stopFollowsDeniedDecrease(canonical: string[], folded: string[]): boolean {
  let denied = false;
  for (let index = 0; index < folded.length; index += 1) {
    const word = folded[index] ?? "";
    const token = canonical[index] ?? "";
    if (
      isBareDecreaseWord(word, token) &&
      !isEnglishPronounIt(folded, index) &&
      decreaseWordDenied(folded, canonical, index)
    ) {
      denied = true;
    }
    if (isEnglishDecreaseWord(word) && englishDecreaseIsNegated(folded, index, canonical)) denied = true;
    if (!denied) continue;
    const stop = isVietnameseStop(token) || englishStopWord(word) || thoiStopsFollowingMovement(canonical, folded, index);
    if (!stop || stopIsNegated(canonical, folded, index)) continue;
    if (isVietnameseStop(token) && (hetSucAt(canonical, index) || hetIsWholePeriod(canonical, folded, index))) continue;
    if (englishStopWord(word) && englishDecreaseIsNegated(folded, index, canonical)) continue;
    return true;
  }
  return false;
}

/**
 * «không X mà ngưng/thôi/quit»: the stop is the claim.
 * A calm cue later in the note does not cancel it.
 */
function stopWinsAfterContrast(canonical: string[], folded: string[]): boolean {
  for (let index = 0; index < folded.length; index += 1) {
    const token = canonical[index] ?? "";
    const word = folded[index] ?? "";
    const stop =
      thoiStopsFollowingMovement(canonical, folded, index) ||
      ((isVietnameseStop(token) || englishStopWord(word)) &&
        !stopIsNegated(canonical, folded, index) &&
        !(isVietnameseStop(token) && (hetSucAt(canonical, index) || hetIsWholePeriod(canonical, folded, index))) &&
        !(englishStopWord(word) && englishDecreaseIsNegated(folded, index, canonical)));
    if (!stop) continue;
    let sawContrast = false;
    for (let cursor = index - 1; cursor >= Math.max(0, index - 8); cursor -= 1) {
      const prev = folded[cursor] ?? "";
      if (prev === "ma" || prev === "but") {
        sawContrast = true;
        continue;
      }
      if (!sawContrast) continue;
      if (isMovementNegator(prev, canonical[cursor] ?? "", folded[cursor - 1])) return true;
      if (prev === "not" || prev === "no" || prev === "never") return true;
    }
  }
  return false;
}

/**
 * True when this clause's hit is only a negated decrease, so a calm cue
 * elsewhere in the note may silence it. Real absence and an undenied decrease stay.
 */
function isSuppressibleWhenCalm(clause: string): boolean {
  const analyzed = analyzeMovementClause(clause);
  if (!analyzed) return true;
  const { canonical, folded, quiet } = analyzed;
  if (quiet) return false;
  if (conceptQuietReductionShouldAlert(canonical, folded)) return false;
  if (comparativeReductionShouldAlert(canonical, folded)) return false;
  if (stopFollowsDeniedDecrease(canonical, folded) || stopWinsAfterContrast(canonical, folded)) return false;
  if (reducedMovementConceptShouldAlert(canonical, folded)) return false;
  if (kickCountShouldAlert(clause)) return false;
  if (classWindowShouldAlert(canonical, folded)) return false;
  if (hasPureAbsence(folded, canonical)) return false;
  if (hasUndeniedDecreaseNearMovement(canonical, folded)) return false;
  if (decreaseImmediatelyOnMovement(canonical, folded)) return false;
  if (perceptionThenQuantityThenMovement(canonical, folded)) return false;
  if (vietnameseStopNearMovement(canonical, folded)) return false;
  if (englishReducedMovement(folded, canonical)) return false;
  if (englishNotSingleKick(rawMovementFold(clause).folded)) return false;
  if (seesLessMovement(canonical, folded)) return false;
  return true;
}

/**
 * Reduced fetal movement, beyond the exact signed-off phrases.
 * The clause is normalized first: lowercase, Telex «dd» to đ, then filler and
 * classifier tokens are removed (cú, cái, lần, nào, gì, được, any, a, the, single, more).
 * Accent matching still refuses to fold a different tone, so «đáp» is not «đạp».
 * After that, a negator or a reduce word within the movement window alerts:
 * không thấy đạp, không cảm giác bé đạp, không đếm được cử động, a count verb
 * with «cú» before đạp/máy, and «haven't felt any kicks».
 * A quantity between a perception verb and the kick also alerts
 * («thấy ít cú đạp», «thấy 1-2 cú đạp», «thấy vài/mấy cú đạp»).
 * A reported kick count alerts only for fewer-than-usual or a count below 10
 * («ít hơn 10 cử động trong 2 giờ», «fewer than 10 kicks in 2 hours», «năm cú đạp»).
 * A normal or high count does not («15 kicks in 2 hours», «20 cú đạp», «đạp 30 lần»).
 * A how-to-count question stays silent («đếm cú đạp như thế nào», «how do I count kicks»).
 * Stop, decrease, quantity, and negator match a movement noun in either order
 * inside the window («ngừng cử động», «cử động ngừng», «kicks fewer», «movement decreased»).
 * The calm check runs on the whole note, not on each comma-separated clause.
 * «vẫn đạp», «vẫn còn đạp», «vẫn cử động», «không giảm», «bình thường», «still moving»,
 * and «kicking normally» silence the note only when there is no separate real
 * red flag. A negated decrease plus that cue stays silent. An undenied decrease
 * («thai máy giảm», «ít đạp», «ít hơn mọi khi») and real absence («không thấy đạp», «baby not moving»)
 * still alert. A comma does not hide that calm cue or that decrease.
 * «không thấy giảm» denies a decrease, and «không cảm thấy đau ngực» stays a negated red flag.
 * Quiet phrases with no verb (ít cử động, im hơn mọi khi, cả ngày không thấy gì, yên ắng lạ) also match.
 * Machine words and «đạp xe» stay excluded. A comma, semicolon, or period keeps «giảm»
 * in the next clause from gluing onto «thai máy».
 * «thai không máy giảm» and «thai máy không phải giảm» deny the decrease, so they stay silent.
 */
function splitMovementClauses(note: string): string[] {
  return note
    .split(/[!?？.;…,，；\n\r]+/u)
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

/**
 * «đếm cú đạp như thế nào» and «how do I count kicks» do not report a decrease.
 * A low count or a real absence in the same note still alerts.
 */
function howToCountShouldStaySilent(note: string): boolean {
  if (!isHowToCountQuestion(note)) return false;
  if (kickCountShouldAlert(note)) return false;
  return !splitMovementClauses(note).some((clause) => reducedMovementClause(clause));
}

/**
 * A vague «vài» / "a few" is the only hit. A numeric low count, a stop, or
 * «ít hơn mọi khi» is not vague.
 */
function clauseAlertIsOnlyVague(clause: string): boolean {
  const analyzed = analyzeMovementClause(clause);
  if (!analyzed) return false;
  const { canonical, folded } = analyzed;
  if (fewerThanUsualShouldAlert(canonical, folded) || notYetReachingCount(canonical, folded)) return false;
  if (conceptQuietReductionShouldAlert(canonical, folded)) return false;
  if (comparativeReductionShouldAlert(canonical, folded) || stopFollowsDeniedDecrease(canonical, folded)) return false;
  if (reducedMovementConceptShouldAlert(canonical, folded)) return false;
  if (seesLessMovement(canonical, folded) || decreaseImmediatelyOnMovement(canonical, folded)) return false;
  if (folded.some((_, index) => negatorMarksAbsence(folded, canonical, index))) return false;
  if (vietnameseStopNearMovement(canonical, folded) || englishReducedMovement(folded, canonical)) return false;
  if (classWindowShouldAlert(canonical, folded)) return false;
  const { canonical: rawCanonical, folded: rawFolded } = rawMovementFold(clause);
  if (englishNotSingleKick(rawFolded)) return false;
  let index = 0;
  while (index < rawFolded.length) {
    const parsed = readNumberAt(rawCanonical, rawFolded, index);
    if (!parsed) {
      index += 1;
      continue;
    }
    if (
      numberIsKickCount(rawCanonical, rawFolded, index, parsed.end) &&
      !viUnitIsNotACount(rawCanonical, rawFolded, index, parsed.end) &&
      parsed.value < 10 &&
      countMagnitude(rawCanonical[index] ?? "") !== "high"
    ) {
      return false;
    }
    index = Math.max(index + 1, parsed.end);
  }
  return true;
}

export function noteMatchesReducedFetalMovement(note: string): boolean {
  if (howToCountShouldStaySilent(note)) return false;
  const clauses = splitMovementClauses(note);
  let hits = clauses.filter((part) => reducedMovementClause(part));
  if (hits.length === 0) return false;
  const whole = analyzeMovementClause(note);
  if (whole && hasActiveBabyCue(whole.canonical, whole.folded)) {
    hits = hits.filter((clause) => !clauseAlertIsOnlyVague(clause));
    if (hits.length === 0) return false;
  }
  if (!whole || !hasCalmCue(whole.canonical, whole.folded)) return true;
  return hits.some((clause) => !isSuppressibleWhenCalm(clause));
}

function reducedMovementClause(note: string): boolean {
  const analyzed = analyzeMovementClause(note);
  if (!analyzed) return false;
  const { canonical, folded, quiet: quietMood } = analyzed;

  if (motherOwnsMovement(canonical, folded)) return false;
  if (conceptQuietReductionShouldAlert(canonical, folded)) return true;
  if (canonical.length > 0 && isCalmNegatedDecrease(canonical, folded)) return false;
  if (comparativeReductionShouldAlert(canonical, folded)) return true;
  if (stopFollowsDeniedDecrease(canonical, folded) || stopWinsAfterContrast(canonical, folded)) return true;
  if (reducedMovementConceptShouldAlert(canonical, folded)) return true;

  const spans = movementSpans(canonical, folded);
  const lessMovement = seesLessMovement(canonical, folded);
  const subjectVerb = matchesSubjectVerbReduction(canonical, folded, spans);
  const reassured = isSoftReassured(canonical, folded, spans);
  const targets = negatorTargetsMovement(canonical, folded, spans);
  const absence = folded.some((_, index) => negatorMarksAbsence(folded, canonical, index));

  if (lessMovement || decreaseImmediatelyOnMovement(canonical, folded)) return true;
  // «ko máy», «không thấy đạp», «chưa hề thấy máy», and «không cử động» alert with no subject.
  // «không thấy giảm» and «thai không máy giảm» do not: that negator denies a decrease.
  if (targets || absence) return true;
  if (perceptionThenQuantityThenMovement(canonical, folded)) return true;
  if (vietnameseStopNearMovement(canonical, folded)) return true;
  if (englishReducedMovement(folded, canonical)) return true;
  if (englishNotSingleKick(rawMovementFold(note).folded)) return true;
  if (kickCountShouldAlert(note)) return true;
  if (classWindowShouldAlert(canonical, folded)) return true;
  if (subjectVerb) {
    if (targets || decreaseOnVerb(canonical, folded, spans)) return true;
    if (isMovementQuestion(note, folded) && !hasDecreaseWordNearMovement(canonical, folded, spans)) return false;
    if (reassured) return false;
    return true;
  }
  if (quietMood && !reassured) return true;
  return false;
}

/** Up to three tokens may sit between phù/sưng and the face or hand. */
const SWELLING_NEAR = 3;

function tokensBetween(index: number, start: number, end: number): number {
  if (index >= start && index <= end) return 0;
  return index < start ? start - index - 1 : index - end - 1;
}

/**
 * Sudden swelling of the face or hands.
 * phù or sưng near mặt, mí mắt, tay, or bàn tay, plus the phrase phù đột ngột
 * with no body part. Leg or ankle swelling alone (phù chân, sưng mắt cá) does not match.
 * mắt cá is the ankle, not mí mắt. Accented and unaccented notes both match.
 */
export function noteMatchesFaceOrHandSwelling(note: string): boolean {
  const tokens = clauseTokens(note);
  if (tokens.length === 0) return false;
  const sudden = suddenSwellingAt(tokens);
  if (sudden >= 0 && !symptomGovernedByNegation(tokens, sudden, sudden + 3)) return true;

  const positive: Array<[number, number]> = [];
  const consumed = new Set<number>();

  for (let index = 0; index < tokens.length; index += 1) {
    const next = tokens[index + 1] ?? "";
    if (tokensMatch(tokens[index], "mắt") && tokensMatch(next, "cá")) {
      consumed.add(index);
      consumed.add(index + 1);
    }
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const next = tokens[index + 1] ?? "";
    if (tokensMatch(tokens[index], "mí") && tokensMatch(next, "mắt") && !consumed.has(index + 1)) {
      positive.push([index, index + 1]);
      consumed.add(index + 1);
    }
  }

  for (let index = 0; index < tokens.length; index += 1) {
    if (consumed.has(index) || tokens[index] === CLAUSE_BREAK) continue;
    if (tokensMatch(tokens[index], "mặt") || tokensMatch(tokens[index], "tay")) positive.push([index, index]);
  }

  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index] === CLAUSE_BREAK) continue;
    if (!tokensMatch(tokens[index], "phù") && !tokensMatch(tokens[index], "sưng")) continue;
    if (symptomGovernedByNegation(tokens, index, index + 1)) continue;
    for (const [start, end] of positive) {
      if (crossesClause(tokens, index, end)) continue;
      if (tokensBetween(index, start, end) <= SWELLING_NEAR) return true;
    }
  }
  return false;
}

function suddenSwellingAt(tokens: string[]): number {
  for (let index = 0; index < tokens.length - 2; index += 1) {
    if (
      tokensMatch(tokens[index], "phù") &&
      tokensMatch(tokens[index + 1], "đột") &&
      tokensMatch(tokens[index + 2], "ngột")
    ) {
      return index;
    }
  }
  return -1;
}

function isBreatheAbility(token: string): boolean {
  if (isMarkedOrPlain(token, "được", "duoc") || isMarkedOrPlain(token, "nổi", "noi")) return true;
  if (hasToneOrVowelMark(token)) return false;
  return foldToken(foldLeadingDd(token)) === "dc";
}

/**
 * Inability, not a negated «khó thở».
 * «không thở được», «không thở nổi», and «ko thở dc» alert.
 * «không khó thở» does not: that negates the symptom and has no ability word.
 */
function noteMatchesCannotBreathe(note: string): boolean {
  const tokens = clauseTokens(note);
  for (let index = 0; index < tokens.length; index += 1) {
    if (!isMarkedOrPlain(tokens[index] ?? "", "thở", "tho")) continue;
    let abilityAt = -1;
    for (let cursor = index + 1; cursor <= index + 2 && cursor < tokens.length; cursor += 1) {
      if (tokens[cursor] === CLAUSE_BREAK) break;
      if (isBreatheAbility(tokens[cursor] ?? "")) {
        abilityAt = cursor;
        break;
      }
    }
    if (abilityAt < 0) continue;
    if (directNegatorBefore(tokens, index)) return true;
    if (abilityAt > index + 1 && directNegatorBefore(tokens, abilityAt)) return true;
  }
  return false;
}

function foldedClause(clause: string): string {
  return clause.normalize("NFC").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");
}

function matchesIsItNormal(clause: string): boolean {
  return /\bco(?:\s+\S+){0,2}\s+binh\s+thuong\s+khong\b/.test(foldedClause(clause));
}

function clauseMatchesRedFlag(clause: string): boolean {
  const sample = clause.trim();
  if (!sample) return false;
  return (
    URGENT_DOCTOR_NOTE_KEYWORDS.some((keyword) => noteMatchesUrgentKeyword(sample, keyword)) ||
    noteMatchesReducedFetalMovement(sample) ||
    noteMatchesFaceOrHandSwelling(sample) ||
    noteMatchesCannotBreathe(sample)
  );
}

/**
 * Keep a clause that itself names a red flag, even when it is a question.
 * Otherwise drop a question, and keep an assertion that sits before «có phải» or «bao nhiêu».
 */
function assertionPart(clause: string, delim: string): string {
  if (clauseMatchesRedFlag(clause)) return clause;
  if (matchesIsItNormal(clause)) return "";
  const tokenMatches = [...clause.matchAll(/\p{L}+/gu)];
  const foldedTokens = tokenMatches.map((match) => foldToken(foldLeadingDd(match[0] ?? "")));
  const coPhai = foldedTokens.findIndex((token, index) => token === "co" && foldedTokens[index + 1] === "phai");
  if (coPhai >= 0) return clause.slice(0, tokenMatches[coPhai]?.index ?? 0);
  const baoNhieu = foldedTokens.findIndex((token, index) => token === "bao" && foldedTokens[index + 1] === "nhieu");
  if (baoNhieu >= 0) return clause.slice(0, tokenMatches[baoNhieu]?.index ?? 0);
  if (delim.includes("?") || delim.includes("？")) return "";
  return clause;
}

/**
 * A question that names a red flag still alerts.
 * «Thai máy giảm có bình thường không?» and «Có phải đau ngực không?» show the 115 banner.
 * «Bao nhiêu lần là bình thường?» does not name a symptom and stays silent.
 * «Bé đạp ít hơn, bao nhiêu là nguy hiểm?» keeps the decrease before the comma.
 */
function assertiveNote(note: string): string {
  const pieces = note.split(/([,，;；.!?？…\n\r]+)/u);
  const kept: string[] = [];
  for (let index = 0; index < pieces.length; index += 2) {
    const text = pieces[index] ?? "";
    const delim = pieces[index + 1] ?? "";
    const part = assertionPart(text, delim);
    if (part.trim()) kept.push(part.trim());
  }
  return kept.join(", ");
}

export function detectUrgentWarnings(profile: PregnancyProfile, locale: Locale = "vi"): string[] {
  const note = assertiveNote(profile.doctorNote ?? "");
  if (!note.trim()) return [];

  if (
    URGENT_DOCTOR_NOTE_KEYWORDS.some((keyword) => noteMatchesUrgentKeyword(note, keyword)) ||
    noteMatchesReducedFetalMovement(note) ||
    noteMatchesFaceOrHandSwelling(note) ||
    noteMatchesCannotBreathe(note)
  ) {
    return [locale === "vi" ? URGENT_NOTE_BANNER.vi : URGENT_NOTE_BANNER.en];
  }

  return [];
}
