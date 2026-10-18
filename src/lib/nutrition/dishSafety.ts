import type { PregnancyProfile } from "@/types/pregnancy";
import type { MealRecord } from "@/lib/nutrition/mealDatabase";
import { flattenMealIngredients } from "@/lib/nutrition/mealDatabase";
import { foldNote } from "@/lib/nutrition/aiNoteSafety";

function hasCondition(profile: PregnancyProfile, condition: PregnancyProfile["healthConditions"][number]): boolean {
  return profile.healthConditions.includes(condition);
}

export function isGlucoseConcern(profile: PregnancyProfile): boolean {
  return hasCondition(profile, "gestational_diabetes") || profile.goals.includes("blood_sugar_control");
}

function phrase(text: string, pattern: string): boolean {
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`, "iu").test(text);
}

/** Exact staple names. Brown rice and a longer name that only contains the word stay. */
function isWhiteRiceIngredient(item: string): boolean {
  const folded = foldNote(item);
  if (folded.includes("lut") || folded.includes("brown")) return false;
  return folded === "gao" || folded === "com" || folded === "com trang" || folded === "gao trang" || folded === "white rice" || folded === "com tam" || folded === "banh mi trang";
}

function mentionsUnsafeFood(text: string): boolean {
  const nfc = text.normalize("NFC").toLowerCase();
  const folded = foldNote(text);
  const accented = [
    "ngải cứu",
    "thuốc nam",
    "thuốc bắc",
    "trà thảo mộc",
    "đu đủ xanh",
    "sữa tươi sống",
    "sữa bò sống",
    "sữa nông trại",
    "sữa sống",
    "sữa mới vắt",
    "tiết canh"
  ];
  if (accented.some((item) => phrase(nfc, escapePhrase(item)))) return true;
  const plain = [
    "ngai cuu",
    "ngai cu",
    "thuoc nam",
    "thuoc bac",
    "tra thao moc",
    "du du xanh",
    "sua tuoi song",
    "sua bo song",
    "sua nong trai",
    "sua song",
    "sua moi vat",
    "tiet canh",
    "mugwort",
    "herbal tea",
    "green papaya",
    "unripe papaya",
    "raw milk",
    "farm milk",
    "blood soup"
  ];
  return plain.some((item) => phrase(folded, escapePhrase(item)));
}

function escapePhrase(item: string): string {
  return item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Bare giá, named sprouts, and other sprout types. Alfalfa is never spared. */
function mentionsSprout(text: string): boolean {
  const nfc = text.normalize("NFC").toLowerCase();
  const folded = foldNote(text);
  const accented = ["giá đỗ", "giá sống", "giá đậu", "rau mầm", "mầm sống", "mầm", "giá"];
  if (accented.some((item) => phrase(nfc, escapePhrase(item)))) return true;
  const plain = [
    "gia do",
    "gia song",
    "gia dau",
    "rau mam",
    "mam song",
    "bean sprouts",
    "mung bean sprouts",
    "broccoli sprouts",
    "radish sprouts",
    "pea sprouts",
    "lentil sprouts",
    "alfalfa sprouts",
    "sprouts",
    "sprouted",
    "mam",
    "gia"
  ];
  return plain.some((item) => phrase(folded, escapePhrase(item)));
}

function mentionsAlfalfa(text: string): boolean {
  const nfc = text.normalize("NFC").toLowerCase();
  return phrase(nfc, "alfalfa") || phrase(foldNote(text), "alfalfa");
}

function isBlanchedOrRaw(text: string): boolean {
  const nfc = text.normalize("NFC").toLowerCase();
  const folded = foldNote(text);
  if (/trụng|chần|luộc sơ|blanch/.test(nfc) || /luoc so|blanch/.test(folded)) return true;
  if (phrase(nfc, "sống") || phrase(folded, "raw")) return true;
  return false;
}

/** Boiled, steamed, stir-fried, or otherwise cooked through. Blanching does not count. */
function isFullyCooked(text: string): boolean {
  if (isBlanchedOrRaw(text)) return false;
  const nfc = text.normalize("NFC").toLowerCase();
  const folded = foldNote(text);
  if (/xào|chiên|luộc|hấp|nướng|chín kỹ|nấu chín/.test(nfc)) return true;
  return (
    phrase(folded, "xao") ||
    phrase(folded, "chien") ||
    phrase(folded, "luoc") ||
    phrase(folded, "hap") ||
    phrase(folded, "nuong") ||
    /chin ky|nau chin|well cooked|stir-fried|stir fried/.test(folded) ||
    phrase(folded, "boiled") ||
    phrase(folded, "steamed") ||
    phrase(folded, "cooked")
  );
}

/**
 * Sprouts are shown only when the dish says they are cooked through.
 * A bare ingredient such as "giá" is not cooked. Alfalfa never stays.
 */
function hasUnsafeSprouts(name: string, ingredients: readonly string[]): boolean {
  const parts = [name, ...ingredients];
  if (parts.some((part) => mentionsAlfalfa(part))) return true;
  const sproutParts = parts.filter((part) => mentionsSprout(part));
  if (sproutParts.length === 0) return false;
  const nameCooksSprouts = mentionsSprout(name) && isFullyCooked(name);
  for (const part of sproutParts) {
    if (isFullyCooked(part)) continue;
    if (part !== name && nameCooksSprouts) continue;
    return true;
  }
  return false;
}

function mentionsGdmSweet(text: string): boolean {
  const nfc = text.normalize("NFC").toLowerCase();
  const folded = foldNote(text);
  const accented = [
    "cơm trắng",
    "gạo trắng",
    "cơm tấm",
    "bánh mì trắng",
    "phở",
    "xôi",
    "chè",
    "sinh tố",
    "nước ngọt",
    "nước ép",
    "mật ong",
    "trà sữa",
    "kẹo",
    "sô cô la",
    "bánh ngọt",
    "kem",
    "nước mía",
    "bò húc",
    "trà chanh"
  ];
  if (accented.some((item) => phrase(nfc, item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))) return true;
  const plain = [
    "com trang",
    "gao trang",
    "com tam",
    "banh mi trang",
    "white rice",
    "ice cream",
    "chocolate",
    "candy",
    "cake",
    "soda",
    "soft drink",
    "pepsi",
    "fanta",
    "sprite",
    "7up",
    "coca-cola",
    "red bull",
    "mirinda",
    "sting"
  ];
  if (plain.some((item) => phrase(folded, item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))) return true;
  // English pho, xoi, and che. Skip phô mai / phổ biến.
  if (phrase(folded, "pho") && !/\bpho mai\b|\bpho bien\b/.test(folded)) return true;
  if (phrase(folded, "xoi")) return true;
  if (phrase(folded, "che") && !/\bche bien\b/.test(folded)) return true;
  if (phrase(folded, "sinh to")) return true;
  return false;
}

/** Bún, miến, bánh cuốn, bánh đa, and phở noodles, same as white rice for glucose. */
function mentionsRefinedStarch(text: string): boolean {
  const nfc = text.normalize("NFC").toLowerCase();
  const folded = foldNote(text);
  const accented = ["bánh cuốn", "bánh đa", "bánh phở", "bún", "miến", "phở"];
  if (accented.some((item) => phrase(nfc, escapePhrase(item)))) return true;
  const plain = ["banh cuon", "banh da", "banh pho", "pho noodles", "rice noodles", "glass noodles", "rice crackers", "bun", "mien"];
  if (plain.some((item) => phrase(folded, escapePhrase(item)))) return true;
  if (phrase(folded, "pho") && !/\bpho mai\b|\bpho bien\b/.test(folded)) return true;
  return false;
}

function isWholeGrainStarch(text: string): boolean {
  const folded = foldNote(text);
  return /nguyen cam|nguyen hat|whole grain|whole-grain|whole wheat|wholewheat/.test(folded);
}

/** White bread, flour, instant noodles, and refined pasta. Whole-grain bread stays. */
function mentionsRefinedFlour(text: string): boolean {
  if (isWholeGrainStarch(text)) return false;
  const nfc = text.normalize("NFC").toLowerCase();
  const folded = foldNote(text);
  const accented = ["bánh mì trắng", "bánh mì", "bột mì", "mì ống", "mì gói", "mì ý", "nui"];
  if (accented.some((item) => phrase(nfc, escapePhrase(item)))) return true;
  const plain = ["banh mi trang", "banh mi", "bot mi", "white bread", "bread", "macaroni", "pasta", "spaghetti", "mi ong", "mi goi", "mi y", "nui"];
  return plain.some((item) => phrase(folded, escapePhrase(item)));
}

/** Unsafe foods always. Sweets, white rice, and refined noodles when glucose is a concern. */
export function mealBlocked(meal: { name: string; ingredients: MealRecord["ingredients"] }, profile: PregnancyProfile): boolean {
  const ingredients = flattenMealIngredients(meal as MealRecord);
  const blob = [meal.name, ...ingredients].join(" \n ");
  if (mentionsUnsafeFood(blob) || hasUnsafeSprouts(meal.name, ingredients)) return true;
  if (!isGlucoseConcern(profile)) return false;
  if (ingredients.some(isWhiteRiceIngredient) || mentionsRefinedStarch(blob) || [meal.name, ...ingredients].some(mentionsRefinedFlour)) return true;
  return mentionsGdmSweet(blob);
}
