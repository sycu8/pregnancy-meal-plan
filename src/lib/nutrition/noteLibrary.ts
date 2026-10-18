import type { Locale } from "@/lib/i18n";
import type { MealPlan } from "@/types/mealPlan";
import { flattenMealIngredients, findMealRecordByName } from "@/lib/nutrition/mealDatabase";
import { localizeIngredient } from "@/lib/nutrition/mealLocales";

export type NoteTopic =
  | "protein"
  | "iron"
  | "calcium"
  | "folate"
  | "fiber"
  | "hydration"
  | "food-safety"
  | "gdm"
  | "trimester";

export type LibraryNote = {
  id: string;
  topic: NoteTopic;
  /** When set, the sentence includes exactly one {food} from the plan. */
  foodSlot?: boolean;
  vi: string;
  en: string;
};

/**
 * Curated sentences only. The model never writes this text.
 * Wording stays neutral: no gain targets and no serving-limit claims.
 */
export const NOTE_LIBRARY: readonly LibraryNote[] = [
  { id: "protein-each-meal", topic: "protein", vi: "Mỗi bữa chính nên có một món đạm đã nấu chín.", en: "Include a cooked protein food at each main meal." },
  { id: "protein-breakfast", topic: "protein", vi: "Bữa sáng có trứng, sữa tiệt trùng hoặc đậu sẽ đủ đạm hơn.", en: "Breakfast is more balanced with eggs, pasteurized milk, or beans." },
  { id: "protein-plant", topic: "protein", vi: "Đậu hũ, đậu lăng và đậu nành là đạm thực vật dễ dùng.", en: "Tofu, lentils, and soybeans are practical plant proteins." },
  { id: "protein-eggs", topic: "protein", vi: "Trứng nên luộc hoặc hấp cho đến khi lòng đỏ chín đặc.", en: "Cook eggs until the yolk is firm." },
  { id: "protein-dairy", topic: "protein", vi: "Sữa chua và sữa tiệt trùng thêm đạm và canxi cho bữa phụ.", en: "Pasteurized yogurt and milk add protein and calcium at snack time." },
  { id: "protein-with-food", topic: "protein", foodSlot: true, vi: "Dùng {food} đã nấu chín như món đạm trong ngày.", en: "Use cooked {food} as a protein food during the day." },
  { id: "protein-rotate", topic: "protein", vi: "Xoay thịt nạc, cá, trứng và đậu trong tuần cho đủ đạm.", en: "Rotate lean meat, fish, eggs, and beans through the week." },

  { id: "iron-with-fruit", topic: "iron", vi: "Ăn thịt hoặc đậu cùng trái cây giàu vitamin C như cam hoặc ổi.", en: "Pair meat or beans with vitamin C fruit such as orange or guava." },
  { id: "iron-greens", topic: "iron", vi: "Rau dền, cải bó xôi và thịt nạc là nguồn sắt trong bữa Việt.", en: "Amaranth, spinach, and lean meat add iron to a Vietnamese meal." },
  { id: "iron-legumes", topic: "iron", vi: "Đậu lăng và đậu đỏ thêm sắt cho ngày ăn chay.", en: "Lentils and red beans add iron on vegetarian days." },
  { id: "iron-tea-gap", topic: "iron", vi: "Để trà và cà phê cách bữa chính một khoảng thời gian.", en: "Leave a gap between tea or coffee and the main meal." },
  { id: "iron-with-food", topic: "iron", foodSlot: true, vi: "Ăn {food} cùng quả giàu vitamin C để hỗ trợ hấp thu sắt.", en: "Eat {food} with vitamin C fruit to support iron absorption." },
  { id: "iron-variety", topic: "iron", vi: "Đổi nguồn sắt giữa thịt đỏ, trứng và rau lá trong tuần.", en: "Vary iron sources among red meat, eggs, and leafy greens." },

  { id: "calcium-dairy", topic: "calcium", vi: "Sữa tiệt trùng và sữa chua không đường là nguồn canxi quen thuộc.", en: "Pasteurized milk and unsweetened yogurt are familiar calcium foods." },
  { id: "calcium-tofu", topic: "calcium", vi: "Đậu hũ thêm canxi cho bữa không dùng sữa.", en: "Tofu adds calcium when the meal has no milk." },
  { id: "calcium-greens", topic: "calcium", vi: "Rau lá xanh đậm góp thêm canxi bên cạnh sữa.", en: "Dark leafy greens add calcium alongside milk." },
  { id: "calcium-snack", topic: "calcium", vi: "Một bữa phụ với sữa chua tiệt trùng giúp rải canxi trong ngày.", en: "A pasteurized yogurt snack spreads calcium through the day." },
  { id: "calcium-with-food", topic: "calcium", foodSlot: true, vi: "Thêm {food} vào bữa khi bạn muốn có thêm canxi.", en: "Add {food} to a meal when you want more calcium." },
  { id: "calcium-day", topic: "calcium", vi: "Chia sữa, đậu hũ và rau xanh ra các bữa trong ngày.", en: "Spread milk, tofu, and greens across meals in the day." },

  { id: "folate-greens", topic: "folate", vi: "Rau lá xanh và bông cải xanh là nguồn folate trong bữa nhà.", en: "Leafy greens and broccoli add folate to a home meal." },
  { id: "folate-beans", topic: "folate", vi: "Đậu và đậu lăng thêm folate cùng chất xơ.", en: "Beans and lentils add folate together with fiber." },
  { id: "folate-citrus", topic: "folate", vi: "Cam và quýt thêm folate cùng vitamin C.", en: "Oranges and tangerines add folate and vitamin C." },
  { id: "folate-daily", topic: "folate", vi: "Nên có rau lá hoặc đậu ở ít nhất một bữa mỗi ngày.", en: "Include leafy greens or beans at least once a day." },
  { id: "folate-with-food", topic: "folate", foodSlot: true, vi: "Thêm {food} vào bữa để có thêm folate.", en: "Add {food} to a meal for more folate." },
  { id: "folate-meals", topic: "folate", vi: "Xào hoặc luộc rau lá vừa chín để giữ folate trong món.", en: "Steam or boil leafy greens until just done to keep folate in the dish." },

  { id: "fiber-vegetables", topic: "fiber", vi: "Thêm rau ở bữa trưa và bữa tối để có thêm chất xơ.", en: "Add vegetables at lunch and dinner for more fiber." },
  { id: "fiber-oats", topic: "fiber", vi: "Yến mạch và khoai lang là tinh bột có chất xơ cho bữa sáng.", en: "Oats and sweet potato are fiber-rich starches for breakfast." },
  { id: "fiber-beans", topic: "fiber", vi: "Đậu và đậu lăng thêm chất xơ cùng đạm thực vật.", en: "Beans and lentils add fiber and plant protein." },
  { id: "fiber-whole-fruit", topic: "fiber", vi: "Ăn trái cây nguyên miếng thay cho nước ép.", en: "Eat whole fruit instead of juice." },
  { id: "fiber-with-food", topic: "fiber", foodSlot: true, vi: "Thêm {food} khi bữa cần nhiều chất xơ hơn.", en: "Add {food} when the meal needs more fiber." },
  { id: "fiber-gradual", topic: "fiber", vi: "Tăng rau và đậu từ từ nếu bụng dễ đầy hơi.", en: "Increase vegetables and beans gradually if bloating is easy." },

  { id: "hydration-steady", topic: "hydration", vi: "Uống đủ nước trong ngày.", en: "Drink water through the day." },
  { id: "hydration-between", topic: "hydration", vi: "Uống nước lọc giữa các bữa.", en: "Drink water between meals." },
  { id: "hydration-meals", topic: "hydration", vi: "Uống nước lọc cùng bữa ăn, từng ngụm nhỏ.", en: "Sip water with meals." },
  { id: "hydration-morning", topic: "hydration", vi: "Bắt đầu ngày với một cốc nước lọc.", en: "Start the day with a glass of water." },
  { id: "hydration-warm", topic: "hydration", vi: "Nước ấm dễ uống hơn vào ngày khó uống lạnh.", en: "Warm water is easier to drink on days when cold water is hard." },
  { id: "hydration-fruit", topic: "hydration", vi: "Trái cây nhiều nước như cam và ổi bổ sung thêm nước.", en: "Juicy fruit such as orange and guava adds fluid." },

  { id: "safety-cook-protein", topic: "food-safety", vi: "Nấu thịt, cá và hải sản cho đến khi chín đều.", en: "Cook meat, fish, and shellfish until done all the way through." },
  { id: "safety-eggs", topic: "food-safety", vi: "Trứng dùng cho mẹ bầu nên chín hoàn toàn.", en: "Eggs for pregnancy should be cooked all the way through." },
  { id: "safety-leftovers", topic: "food-safety", vi: "Thịt hoặc cá đã nấu chín. Cất tủ lạnh trong vòng 2 giờ, dùng trong 24 giờ, hâm nóng kỹ đến khi bốc hơi.", en: "Cooked meat or fish: refrigerate within 2 hours, eat within 24 hours, and reheat until steaming hot." },
  { id: "safety-wash", topic: "food-safety", vi: "Rửa rau và trái cây dưới nước sạch trước khi ăn.", en: "Rinse vegetables and fruit under clean water before eating." },
  { id: "safety-milk", topic: "food-safety", vi: "Chọn sữa và phô mai đã tiệt trùng.", en: "Choose pasteurized milk and cheese." },
  { id: "safety-separate", topic: "food-safety", vi: "Để thớt thịt sống riêng với rau đã rửa.", en: "Keep the raw-meat board separate from washed vegetables." },
  { id: "safety-cook-food", topic: "food-safety", foodSlot: true, vi: "Nấu {food} cho đến khi chín nóng đều.", en: "Cook {food} until it is hot all the way through." },
  { id: "gdm-oats", topic: "gdm", vi: "Yến mạch và khoai lang là tinh bột chậm dễ dùng.", en: "Oats and sweet potato are practical slow-digesting starches." },
  { id: "gdm-brown-rice", topic: "gdm", vi: "Gạo lứt và cơm gạo lứt thay cho gạo trắng trong bữa chính.", en: "Use brown rice in place of white rice at main meals." },
  { id: "gdm-vegetables", topic: "gdm", vi: "Thêm rau vào đĩa cùng đạm và tinh bột chậm.", en: "Add vegetables on the plate with protein and slow-digesting starch." },
  { id: "gdm-unsweetened", topic: "gdm", vi: "Chọn sữa chua không đường và trái cây nguyên miếng.", en: "Choose unsweetened yogurt and whole fruit." },
  { id: "gdm-beans", topic: "gdm", vi: "Đậu và đậu lăng thêm đạm và chất xơ cho bữa cần tinh bột chậm.", en: "Beans and lentils add protein and fiber to a slow-starch meal." },
  { id: "gdm-pair-food", topic: "gdm", foodSlot: true, vi: "Ăn {food} cùng rau thay vì ăn tinh bột một mình.", en: "Eat {food} with vegetables instead of starch on its own." },
  { id: "gdm-drinks", topic: "gdm", vi: "Uống nước lọc thay cho nước ngọt và nước ép.", en: "Drink water instead of sugary drinks and juice." },

  { id: "trimester-early-bland", topic: "trimester", vi: "Tam cá nguyệt đầu, món ít mùi và mềm thường dễ ăn hơn.", en: "In the first trimester, mild and soft dishes are often easier to eat." },
  { id: "trimester-early-snacks", topic: "trimester", vi: "Nếu buổi sáng khó ăn, chọn món mềm và ít mùi.", en: "If mornings are hard, choose a soft dish with a mild smell." },
  { id: "trimester-mid-variety", topic: "trimester", vi: "Giữa thai kỳ là lúc dễ thêm rau, đậu và đạm vào các bữa.", en: "The second trimester is a good time to add vegetables, beans, and protein." },
  { id: "trimester-mid-iron", topic: "trimester", vi: "Giữa thai kỳ nên giữ thịt nạc hoặc đậu trong bữa chính.", en: "In the second trimester, keep lean meat or beans in main meals." },
  { id: "trimester-late-fiber", topic: "trimester", vi: "Tam cá nguyệt cuối, rau, khoai và nước lọc giúp bữa dễ tiêu hơn.", en: "In the third trimester, vegetables, sweet potato, and water keep meals easier to digest." },
  { id: "trimester-late-comfort", topic: "trimester", vi: "Cuối thai kỳ, món nấu chín, ít dầu thường dễ chịu hơn.", en: "Late in pregnancy, cooked dishes with little oil are often more comfortable." },
  { id: "trimester-any-regular", topic: "trimester", vi: "Giữ nhịp bữa đều trong tuần, dù tuần thai nào.", en: "Keep a regular meal rhythm through the week at any stage." },
  { id: "trimester-late-protein", topic: "trimester", vi: "Cuối thai kỳ vẫn cần đạm chín ở bữa trưa và bữa tối.", en: "Late pregnancy still needs cooked protein at lunch and dinner." }
];

const BY_ID = new Map(NOTE_LIBRARY.map((note) => [note.id, note]));

export const NOTE_IDS: readonly string[] = NOTE_LIBRARY.map((note) => note.id);

export function libraryNote(id: string): LibraryNote | undefined {
  return BY_ID.get(id);
}

const MEAL_SLOTS = ["breakfast", "morningSnack", "lunch", "afternoonSnack", "dinner"] as const;

/** Ingredient names the model may copy, in the plan language. */
export function ingredientsFromPlan(plan: MealPlan, locale: Locale): string[] {
  const names = new Set<string>();
  for (const day of plan.days) {
    for (const slot of MEAL_SLOTS) {
      const item = day[slot];
      const record = findMealRecordByName(item.mealId ?? item.name);
      if (!record) continue;
      for (const ingredient of flattenMealIngredients(record)) {
        names.add(localizeIngredient(ingredient, locale));
      }
    }
  }
  return [...names].sort((left, right) => left.localeCompare(right));
}

function foldToken(value: string): string {
  return value.normalize("NFC").normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase().trim();
}

/** Foods a slot note may name. Anything outside the list is not shown. */
const SLOT_FOODS: Partial<Record<NoteTopic, readonly string[]>> = {
  protein: [
    "trứng", "egg",
    "thịt heo nạc", "lean pork",
    "ức gà", "chicken breast",
    "gà", "chicken",
    "thịt bò", "beef",
    "đậu hũ", "tofu",
    "đậu lăng", "lentils",
    "đậu nành", "soybeans",
    "đậu đỏ", "red beans",
    "đậu xanh", "mung beans",
    "cá hồi", "salmon",
    "cá basa", "basa fish",
    "cá lóc", "snakehead fish",
    "cá thu", "mackerel",
    "cá diêu hồng", "red tilapia",
    "tôm", "shrimp",
    "chả cá", "fish cake",
    "giò sống nạc", "lean pork paste",
    "sữa tươi tiệt trùng", "pasteurized milk",
    "sữa chua tiệt trùng", "pasteurized yogurt"
  ],
  iron: ["thịt bò", "beef", "thịt heo nạc", "lean pork", "rau dền", "amaranth", "cải bó xôi", "spinach", "trứng", "egg", "đậu lăng", "lentils", "đậu đỏ", "red beans", "rau muống", "water spinach"],
  calcium: ["sữa tươi tiệt trùng", "pasteurized milk", "sữa chua tiệt trùng", "pasteurized yogurt", "đậu hũ", "tofu", "phô mai tiệt trùng", "pasteurized cheese", "cải bó xôi", "spinach", "rau cải", "leafy greens", "bông cải xanh", "broccoli"],
  folate: ["rau cải", "leafy greens", "cải bó xôi", "spinach", "bông cải xanh", "broccoli", "đậu lăng", "lentils", "đậu đỏ", "red beans", "đậu xanh", "mung beans", "đậu nành", "soybeans", "rau muống", "water spinach", "cam", "orange"],
  fiber: ["rau cải", "leafy greens", "yến mạch", "oats", "khoai lang", "sweet potato", "đậu lăng", "lentils", "đậu đỏ", "red beans", "ổi", "guava", "táo", "apple", "gạo lứt", "cơm gạo lứt", "brown rice", "bông cải xanh", "broccoli", "đậu bắp", "okra", "rau muống", "water spinach", "bánh mì nguyên cám", "whole-grain bread", "mướp", "luffa", "bí ngòi", "zucchini", "đậu nành", "soybeans"],
  "food-safety": ["trứng", "egg", "thịt heo nạc", "lean pork", "ức gà", "chicken breast", "gà", "chicken", "thịt bò", "beef", "cá hồi", "salmon", "cá basa", "basa fish", "cá lóc", "snakehead fish", "cá thu", "mackerel", "cá diêu hồng", "red tilapia", "tôm", "shrimp", "chả cá", "fish cake", "giò sống nạc", "lean pork paste"],
  gdm: ["yến mạch", "oats", "khoai lang", "sweet potato", "gạo lứt", "cơm gạo lứt", "brown rice", "đậu lăng", "lentils", "đậu hũ", "tofu", "trứng", "egg", "ức gà", "chicken breast", "thịt heo nạc", "lean pork", "rau cải", "leafy greens"]
};

function slotFoodAllowed(topic: NoteTopic, ingredient: string): boolean {
  const allow = SLOT_FOODS[topic];
  if (!allow) return false;
  const allowed = new Set(allow.map((item) => foldToken(item)));
  const forms = [ingredient, localizeIngredient(ingredient, "vi"), localizeIngredient(ingredient, "en")];
  return forms.some((form) => allowed.has(foldToken(form)));
}

/** Accept the listed name, or the same food in the other language. */
export function matchPlanIngredient(food: string, ingredients: readonly string[]): string | null {
  const folded = foldToken(food);
  if (!folded) return null;
  for (const ingredient of ingredients) {
    if (foldToken(ingredient) === folded) return ingredient;
    const vi = localizeIngredient(ingredient, "vi");
    const en = localizeIngredient(ingredient, "en");
    if (foldToken(vi) === folded || foldToken(en) === folded) return ingredient;
  }
  return null;
}

function renderNote(note: LibraryNote, locale: Locale, food: string | null): string | null {
  const template = locale === "vi" ? note.vi : note.en;
  if (!note.foodSlot) return template;
  if (!food) return null;
  return template.replaceAll("{food}", food);
}

export type NoteSelection =
  | { ok: true; notes: string[] }
  | { ok: false; detail: "invalid_notes" | "no_valid_notes" };

const MAX_LIBRARY_NOTES = 3;

/**
 * The model may return ids and at most one food name.
 * Unknown ids are dropped. A broken payload or a second food yields no note.
 */
export function selectLibraryNotes(payload: unknown, ingredients: readonly string[], locale: Locale): NoteSelection {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, detail: "invalid_notes" };
  }
  const row = payload as { notes?: unknown; food?: unknown };
  if (!("notes" in row)) return { ok: false, detail: "invalid_notes" };
  if (!Array.isArray(row.notes)) return { ok: false, detail: "invalid_notes" };
  if (row.notes.length === 0) return { ok: false, detail: "no_valid_notes" };

  const foods: string[] = [];
  if ("food" in row && row.food != null) {
    if (typeof row.food !== "string") return { ok: false, detail: "invalid_notes" };
    foods.push(row.food);
  }

  const ids: string[] = [];
  for (const item of row.notes) {
    if (typeof item === "string") {
      ids.push(item);
      continue;
    }
    if (!item || typeof item !== "object" || Array.isArray(item)) return { ok: false, detail: "invalid_notes" };
    const id = (item as { id?: unknown }).id;
    if (typeof id !== "string") return { ok: false, detail: "invalid_notes" };
    ids.push(id);
    if ("food" in item && (item as { food?: unknown }).food != null) {
      const food = (item as { food?: unknown }).food;
      if (typeof food !== "string") return { ok: false, detail: "invalid_notes" };
      foods.push(food);
    }
  }

  const distinct = [...new Set(foods.map((food) => foldToken(food)).filter(Boolean))];
  if (distinct.length > 1) return { ok: false, detail: "invalid_notes" };

  const matched = distinct.length === 1 ? matchPlanIngredient(foods.find((food) => foldToken(food) === distinct[0]) ?? "", ingredients) : null;
  if (distinct.length === 1 && !matched) {
    // A food outside the plan cannot be shown. Notes that do not need it can stay.
  }

  const rendered: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const note = libraryNote(id);
    if (!note) continue;
    if (note.foodSlot && (!matched || !slotFoodAllowed(note.topic, matched))) continue;
    const text = renderNote(note, locale, matched);
    if (!text) continue;
    rendered.push(text);
    if (rendered.length >= MAX_LIBRARY_NOTES) break;
  }

  if (rendered.length === 0) return { ok: false, detail: "no_valid_notes" };
  return { ok: true, notes: rendered };
}
