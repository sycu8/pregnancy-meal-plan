import type { MealItem } from "@/types/mealPlan";
import { estimateIngredientCostVnd, roundToNearest500 } from "./priceGuide";

export type MealTag =
  | "morning_sickness"
  | "constipation"
  | "anemia"
  | "gestational_diabetes"
  | "budget_low"
  | "budget_medium"
  | "budget_high"
  | "vegetarian"
  | "no_fish_safe"
  | "no_beef_safe"
  | "no_seafood_safe"
  | "quick"
  | "meal_prep";

export type MealRecord = MealItem & {
  tags: MealTag[];
  ingredients: {
    proteins?: string[];
    vegetables?: string[];
    fruits?: string[];
    dairy?: string[];
    grains?: string[];
    others?: string[];
  };
};

const safeCooked = "Ăn khi còn nóng, bảo quản lạnh đúng cách nếu chuẩn bị trước.";

export const breakfastMeals: MealRecord[] = [
  meal("Cháo cá hồi bí đỏ", ["đạm", "omega-3", "beta-carotene"], ["budget_high", "no_beef_safe"], ["cá hồi", "bí đỏ", "gạo"], "Mềm, dễ ăn và giàu chất béo tốt.", "Cá phải chín kỹ."),
  meal("Cháo thịt bằm cà rốt", ["đạm", "tinh bột", "vitamin A"], ["budget_low", "no_fish_safe", "no_seafood_safe"], ["thịt heo nạc", "cà rốt", "gạo"], "Dịu bụng, phù hợp khi mệt hoặc nghén nhẹ."),
  meal("Bún gà rau xanh", ["đạm", "rau xanh", "tinh bột"], ["budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["ức gà", "rau cải", "bún"], "Nhẹ nhưng đủ năng lượng cho buổi sáng."),
  meal("Phở gà ít béo", ["đạm", "tinh bột"], ["budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["gà", "bánh phở", "hành"], "Dễ ăn, ít mùi hơn nhiều món thịt đỏ."),
  meal("Miến gà nấm", ["đạm", "chất xơ", "tinh bột"], ["morning_sickness", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["gà", "nấm", "miến"], "Nước dùng ấm, mềm và dễ tiêu."),
  meal("Bánh mì trứng chín kỹ", ["đạm", "tinh bột"], ["quick", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["trứng", "bánh mì", "dưa leo"], "Nhanh, tiện và có đạm.", "Trứng cần chín hoàn toàn."),
  meal("Yến mạch sữa tươi tiệt trùng", ["canxi", "chất xơ", "tinh bột chậm"], ["quick", "constipation", "gestational_diabetes", "vegetarian", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["yến mạch", "sữa tươi tiệt trùng", "chuối"], "Giúp no lâu và hỗ trợ tiêu hóa."),
  meal("Xôi đậu xanh ít dầu", ["đạm thực vật", "tinh bột"], ["budget_low", "vegetarian", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu xanh", "gạo nếp"], "Có năng lượng tốt, nên ăn phần vừa phải."),
  meal("Cơm nắm muối vừng trứng", ["đạm", "canxi", "tinh bột"], ["quick", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["trứng", "gạo", "vừng"], "Dễ chuẩn bị, phù hợp ngày bận."),
  meal("Bún riêu chay đậu hũ", ["đạm thực vật", "canxi", "rau"], ["vegetarian", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu hũ", "cà chua", "bún"], "Vị thanh, thêm đậu hũ để tăng đạm."),
  meal("Cháo đậu xanh hạt sen", ["đạm thực vật", "tinh bột", "khoáng chất"], ["morning_sickness", "vegetarian", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu xanh", "hạt sen", "gạo"], "Mềm, ít mùi và dễ ăn."),
  meal("Bánh cuốn thịt nạc", ["đạm", "tinh bột"], ["budget_medium", "no_fish_safe", "no_seafood_safe"], ["thịt heo nạc", "bột gạo", "giá"], "Đổi vị nhẹ nhàng, không quá ngấy."),
  meal("Súp gà ngô nấm", ["đạm", "chất xơ", "tinh bột"], ["morning_sickness", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["gà", "ngô", "nấm"], "Ấm, mềm và phù hợp khi khó ăn."),
  meal("Bún bò rau cải", ["sắt", "đạm", "rau xanh"], ["anemia", "budget_medium", "no_fish_safe", "no_seafood_safe"], ["thịt bò", "rau cải", "bún"], "Bổ sung sắt từ thịt đỏ ở lượng vừa phải."),
  meal("Cháo yến mạch thịt bằm", ["đạm", "chất xơ", "tinh bột chậm"], ["constipation", "gestational_diabetes", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["thịt heo nạc", "yến mạch", "cà rốt"], "No lâu hơn cháo trắng."),
  meal("Bánh mì gà xé rau", ["đạm", "rau", "tinh bột"], ["quick", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["gà", "bánh mì", "xà lách"], "Dễ chuẩn bị và ít dầu."),
  meal("Nui rau củ thịt bằm", ["đạm", "rau củ", "tinh bột"], ["budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["thịt heo nạc", "nui", "cà rốt"], "Món mềm, dễ ăn cho bữa sáng."),
  meal("Bún mọc nấm", ["đạm", "rau", "tinh bột"], ["budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["giò sống nạc", "nấm", "bún"], "Nước dùng nhẹ, thêm rau để cân bằng."),
  meal("Cơm gạo lứt trứng rau luộc", ["đạm", "tinh bột chậm", "chất xơ"], ["gestational_diabetes", "quick", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["trứng", "gạo lứt", "rau cải"], "Giúp no lâu, hợp mục tiêu kiểm soát đường huyết."),
  meal("Bánh đa cua chay đậu hũ", ["đạm thực vật", "rau", "tinh bột"], ["vegetarian", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu hũ", "rau muống", "bánh đa"], "Đậm vị món Việt nhưng vẫn không dùng hải sản.")
];

export const mainMeals: MealRecord[] = [
  meal("Cơm gạo lứt cá thu sốt cà", ["omega-3", "đạm", "tinh bột chậm"], ["gestational_diabetes", "budget_high", "no_beef_safe"], ["cá thu", "cà chua", "gạo lứt"], "Cân bằng đạm và tinh bột chậm.", "Chọn cá thu nhỏ/nguồn an toàn, nấu chín kỹ."),
  meal("Thịt bò xào bông cải", ["sắt", "đạm", "folate"], ["anemia", "budget_medium", "no_fish_safe", "no_seafood_safe"], ["thịt bò", "bông cải xanh", "cơm"], "Hỗ trợ bổ sung sắt, ăn cùng trái cây giàu vitamin C."),
  meal("Canh rau dền thịt bằm", ["sắt", "chất xơ", "đạm"], ["anemia", "constipation", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["thịt heo nạc", "rau dền", "gạo"], "Món Việt dễ nấu, có rau xanh và đạm."),
  meal("Đậu hũ sốt cà chua", ["đạm thực vật", "canxi"], ["vegetarian", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu hũ", "cà chua", "cơm"], "Phù hợp ngày muốn ăn nhẹ hoặc ăn chay."),
  meal("Trứng hấp thịt", ["đạm", "choline"], ["budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["trứng", "thịt heo nạc", "hành"], "Mềm, dễ ăn và nhanh nấu.", "Hấp chín hoàn toàn."),
  meal("Cá diêu hồng hấp gừng", ["đạm", "iodine"], ["budget_medium", "no_beef_safe"], ["cá diêu hồng", "gừng", "rau cải"], "Ít dầu, vị gừng giúp giảm mùi tanh.", "Cá phải chín kỹ."),
  meal("Gà kho nghệ", ["đạm", "kẽm"], ["meal_prep", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["gà", "nghệ", "cơm"], "Dễ chuẩn bị cho nhiều bữa, hợp cơm Việt."),
  meal("Canh bí đỏ nấu tôm", ["đạm", "beta-carotene"], ["budget_medium", "no_fish_safe", "no_beef_safe"], ["tôm", "bí đỏ", "hành"], "Ngọt tự nhiên, dễ ăn.", "Tôm cần chín kỹ."),
  meal("Ức gà áp chảo rau củ", ["đạm nạc", "chất xơ"], ["gestational_diabetes", "quick", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["ức gà", "bí ngòi", "cà rốt"], "Ít dầu, hợp kiểm soát tăng cân."),
  meal("Cá hồi kho thơm", ["omega-3", "đạm"], ["budget_high", "no_beef_safe"], ["cá hồi", "thơm", "cơm"], "Đổi vị, giàu chất béo tốt.", "Cá nấu chín kỹ, tránh ăn tái."),
  meal("Canh chua cá lóc", ["đạm", "rau", "vitamin C"], ["budget_medium", "no_beef_safe"], ["cá lóc", "cà chua", "đậu bắp"], "Vị chua nhẹ giúp dễ ăn hơn khi ngán cơm."),
  meal("Thịt heo nạc rim gừng", ["đạm", "sắt"], ["meal_prep", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["thịt heo nạc", "gừng", "cơm"], "Dễ nấu và dễ chia khẩu phần."),
  meal("Canh cải bó xôi thịt bằm", ["folate", "sắt", "đạm"], ["anemia", "constipation", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["thịt heo nạc", "cải bó xôi", "cơm"], "Tăng rau xanh và vi chất."),
  meal("Đậu hũ nấm kho tiêu nhẹ", ["đạm thực vật", "chất xơ"], ["vegetarian", "gestational_diabetes", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu hũ", "nấm", "cơm gạo lứt"], "Món chay no lâu, dùng tiêu vừa phải."),
  meal("Gà luộc cơm rau luộc", ["đạm nạc", "chất xơ"], ["gestational_diabetes", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["gà", "rau cải", "gạo"], "Đơn giản, ít dầu, dễ kiểm soát khẩu phần."),
  meal("Bò hầm khoai tây cà rốt", ["sắt", "đạm", "năng lượng"], ["anemia", "meal_prep", "budget_high", "no_fish_safe", "no_seafood_safe"], ["thịt bò", "khoai tây", "cà rốt"], "Hợp khi cần tăng năng lượng lành mạnh."),
  meal("Chả cá thác lác nấu rau tần ô", ["đạm", "rau xanh"], ["budget_medium", "no_beef_safe"], ["chả cá", "tần ô", "cơm"], "Mềm, dễ ăn và có rau.", "Chả cá phải nấu sôi kỹ."),
  meal("Tôm rim thịt nạc", ["đạm", "kẽm"], ["meal_prep", "budget_medium", "no_fish_safe", "no_beef_safe"], ["tôm", "thịt heo nạc", "cơm"], "Đậm đà vừa phải, ăn cùng nhiều rau."),
  meal("Canh mướp đậu hũ", ["đạm thực vật", "nước", "chất xơ"], ["vegetarian", "constipation", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu hũ", "mướp", "cơm"], "Thanh nhẹ, hỗ trợ thêm nước và rau."),
  meal("Cơm cá basa kho nghệ", ["đạm", "tinh bột"], ["budget_low", "no_beef_safe"], ["cá basa", "nghệ", "cơm"], "Dễ mua, mềm và hợp cơm.", "Nấu chín kỹ và chọn nguồn cá rõ ràng."),
  meal("Bún thịt nạc rau sống trụng", ["đạm", "rau", "tinh bột"], ["quick", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["thịt heo nạc", "bún", "rau xà lách"], "Đổi bữa nhẹ, rau nên rửa kỹ và trụng nếu cần."),
  meal("Cơm đậu lăng rau củ", ["đạm thực vật", "sắt", "chất xơ"], ["vegetarian", "anemia", "constipation", "gestational_diabetes", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu lăng", "cà rốt", "gạo lứt"], "No lâu, nhiều chất xơ và phù hợp ăn chay."),
  meal("Gà xào nấm bông cải", ["đạm", "chất xơ"], ["gestational_diabetes", "quick", "budget_medium", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["gà", "nấm", "bông cải xanh"], "Ít tinh bột tinh chế, cân bằng rau và đạm."),
  meal("Canh chua chay đậu hũ", ["đạm thực vật", "vitamin C"], ["vegetarian", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu hũ", "cà chua", "đậu bắp"], "Vị thanh, dễ ăn vào ngày nghén.")
];

export const snackMeals: MealRecord[] = [
  meal("Khoai lang luộc", ["chất xơ", "tinh bột chậm"], ["constipation", "gestational_diabetes", "budget_low", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["khoai lang"], "No nhẹ và hỗ trợ tiêu hóa."),
  meal("Sữa chua không đường", ["canxi", "probiotic"], ["constipation", "gestational_diabetes", "budget_medium", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["sữa chua tiệt trùng"], "Tốt cho bữa phụ, chọn loại tiệt trùng."),
  meal("Chuối", ["kali", "năng lượng"], ["morning_sickness", "budget_low", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["chuối"], "Dễ ăn, tiện khi buồn nôn nhẹ."),
  meal("Cam", ["vitamin C", "nước"], ["anemia", "budget_low", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["cam"], "Vitamin C hỗ trợ hấp thu sắt."),
  meal("Ổi", ["vitamin C", "chất xơ"], ["anemia", "constipation", "budget_low", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["ổi"], "Giàu vitamin C và chất xơ."),
  meal("Hạt óc chó / hạnh nhân", ["chất béo tốt", "đạm"], ["budget_high", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["hạt óc chó", "hạnh nhân"], "Bữa phụ nhỏ giàu năng lượng lành mạnh."),
  meal("Sữa tươi tiệt trùng", ["canxi", "đạm"], ["budget_medium", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["sữa tươi tiệt trùng"], "Bổ sung canxi, chọn loại tiệt trùng."),
  meal("Bánh mì nguyên cám phô mai tiệt trùng", ["canxi", "tinh bột chậm"], ["budget_medium", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["bánh mì nguyên cám", "phô mai tiệt trùng"], "No lâu hơn bánh ngọt."),
  meal("Đậu nành luộc", ["đạm thực vật", "chất xơ"], ["vegetarian", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu nành"], "Tăng đạm thực vật trong ngày."),
  meal("Trứng luộc chín kỹ", ["đạm", "choline"], ["quick", "budget_low", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["trứng"], "Gọn, dễ chuẩn bị.", "Luộc chín hoàn toàn."),
  meal("Sinh tố bơ sữa tiệt trùng không đường", ["chất béo tốt", "canxi"], ["budget_medium", "vegetarian", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["bơ", "sữa tươi tiệt trùng"], "Tăng năng lượng lành mạnh, không thêm đường."),
  meal("Thanh long", ["nước", "chất xơ"], ["constipation", "budget_low", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["thanh long"], "Dễ ăn, hỗ trợ thêm chất xơ."),
  meal("Táo và bơ đậu phộng mỏng", ["chất xơ", "chất béo tốt"], ["gestational_diabetes", "budget_medium", "vegetarian", "quick", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["táo", "bơ đậu phộng"], "Bữa phụ cân bằng hơn so với ăn trái cây đơn thuần."),
  meal("Bắp luộc", ["tinh bột", "chất xơ"], ["budget_low", "vegetarian", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["bắp"], "Đổi vị, ăn phần vừa phải."),
  meal("Chè đậu đỏ ít đường", ["đạm thực vật", "sắt"], ["anemia", "budget_low", "vegetarian", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["đậu đỏ"], "Có đạm thực vật, nên nấu ít đường."),
  meal("Rau câu sữa chua trái cây", ["canxi", "nước"], ["budget_medium", "vegetarian", "no_fish_safe", "no_beef_safe", "no_seafood_safe"], ["sữa chua tiệt trùng", "trái cây"], "Mát, dễ ăn; tránh quá ngọt.")
];

function meal(
  name: string,
  nutrients: string[],
  tags: MealTag[],
  ingredients: string[],
  reason: string,
  caution = safeCooked
): MealRecord {
  const estimates = estimateMealPortion(name, tags);
  const estimatedCostVnd = estimateMealCost(ingredients, estimates.portionGram);
  const record: MealRecord = {
    name,
    reason,
    nutrients,
    portionGram: estimates.portionGram,
    estimatedCalories: estimates.estimatedCalories,
    estimatedCostVnd,
    alternatives: [],
    caution,
    tags,
    ingredients: {}
  };

  for (const item of ingredients) {
    const group = ingredientGroup(item);
    record.ingredients[group] = [...(record.ingredients[group] ?? []), item];
  }

  return record;
}

function estimateMealCost(ingredients: string[], portionGram: number) {
  if (ingredients.length === 0) return 0;
  const ingredientPortion = Math.max(45, Math.round(portionGram / ingredients.length));
  const total = ingredients.reduce((sum, ingredient) => sum + estimateIngredientCostVnd(ingredient, ingredientPortion), 0);
  return roundToNearest500(total);
}

function estimateMealPortion(name: string, tags: MealTag[]) {
  const text = name.toLowerCase();
  const isSnack = /chuối|cam|ổi|khoai lang|sữa chua|hạt|sữa tươi|thanh long|táo|bắp|chè|trứng luộc|đậu nành|rau câu/.test(text);
  const isBreakfast = /cháo|bún|phở|miến|bánh mì|xôi|cơm nắm|súp|nui|bánh cuốn|yến mạch/.test(text);
  const isEnergyDense = /hạt|bơ|xôi|bò hầm|cá hồi|sinh tố|phô mai/.test(text);
  const isBloodSugarFriendly = tags.includes("gestational_diabetes");

  if (isSnack) {
    return {
      portionGram: isEnergyDense ? 120 : 160,
      estimatedCalories: isEnergyDense ? 220 : isBloodSugarFriendly ? 130 : 160
    };
  }

  if (isBreakfast) {
    return {
      portionGram: 300,
      estimatedCalories: isEnergyDense ? 430 : isBloodSugarFriendly ? 330 : 380
    };
  }

  return {
    portionGram: 420,
    estimatedCalories: isEnergyDense ? 560 : isBloodSugarFriendly ? 440 : 500
  };
}

function ingredientGroup(item: string): keyof MealRecord["ingredients"] {
  const text = item.toLowerCase();
  if (/(gà|bò|heo|thịt|trứng|cá|tôm|đậu hũ|đậu lăng|đậu nành|chả cá|giò sống)/.test(text)) return "proteins";
  if (/(rau|cải|bí|cà rốt|cà chua|nấm|bông cải|mướp|đậu bắp|dưa leo|xà lách|tần ô|giá)/.test(text)) return "vegetables";
  if (/(chuối|cam|ổi|bơ|táo|thanh long|trái cây|thơm)/.test(text)) return "fruits";
  if (/(sữa|sữa chua|phô mai)/.test(text)) return "dairy";
  if (/(gạo|cơm|bún|miến|nui|yến mạch|bánh mì|khoai|bắp|bột gạo|gạo nếp|bánh đa)/.test(text)) return "grains";
  return "others";
}
