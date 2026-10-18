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
  if (accented.some((item) => phrase(nfc, item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))) return true;
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
    "alfalfa",
    "blood soup"
  ];
  if (plain.some((item) => phrase(folded, item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))) return true;
  const cooked = /xao|chien|luoc|hap|nuong|cooked|stir-fried|stir fried|boiled|steamed/;
  const sprouts =
    phrase(nfc, "giá đỗ") ||
    phrase(nfc, "giá sống") ||
    phrase(nfc, "rau mầm") ||
    phrase(nfc, "mầm sống") ||
    phrase(folded, "gia do") ||
    phrase(folded, "gia song") ||
    phrase(folded, "rau mam") ||
    phrase(folded, "mam song") ||
    phrase(folded, "bean sprouts") ||
    phrase(folded, "sprouted");
  if (phrase(folded, "alfalfa") || phrase(nfc, "alfalfa")) return true;
  if (sprouts && !cooked.test(folded)) return true;
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

/** Unsafe foods always. Sweets and white-rice staples when glucose is a concern. */
export function mealBlocked(meal: { name: string; ingredients: MealRecord["ingredients"] }, profile: PregnancyProfile): boolean {
  const ingredients = flattenMealIngredients(meal as MealRecord);
  const blob = [meal.name, ...ingredients].join(" \n ");
  if (mentionsUnsafeFood(blob)) return true;
  if (!isGlucoseConcern(profile)) return false;
  if (ingredients.some(isWhiteRiceIngredient)) return true;
  return mentionsGdmSweet(blob);
}
