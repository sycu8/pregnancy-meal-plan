import type { Locale } from "@/lib/i18n";

export type LocalizedMealText = {
  name: string;
  reason: string;
  nutrients: string[];
  caution?: string;
};

/**
 * English is authored first; Vietnamese remains the meal-database source keys.
 * Lookup is by the Vietnamese meal name stored in mealDatabase.
 */
const mealTextByViName: Record<string, LocalizedMealText> = {
  "Cháo cá hồi bí đỏ": {
    name: "Salmon and pumpkin porridge",
    reason: "Soft, easy to eat, and rich in healthy fats.",
    nutrients: ["protein", "omega-3", "beta-carotene"],
    caution: "Fish must be fully cooked."
  },
  "Cháo thịt bằm cà rốt": {
    name: "Minced pork and carrot porridge",
    reason: "Gentle on the stomach; helpful when tired or mildly nauseous.",
    nutrients: ["protein", "starch", "vitamin A"]
  },
  "Bún gà rau xanh": {
    name: "Chicken noodle soup with greens",
    reason: "Light but energizing for breakfast.",
    nutrients: ["protein", "leafy greens", "starch"]
  },
  "Phở gà ít béo": {
    name: "Lean chicken pho",
    reason: "Easy to eat with a milder aroma than many red-meat dishes.",
    nutrients: ["protein", "starch"]
  },
  "Miến gà nấm": {
    name: "Chicken and mushroom glass noodles",
    reason: "Warm broth that is soft and easy to digest.",
    nutrients: ["protein", "fiber", "starch"]
  },
  "Bánh mì trứng chín kỹ": {
    name: "Fully cooked egg sandwich",
    reason: "Quick, convenient, and protein-rich.",
    nutrients: ["protein", "starch"],
    caution: "Eggs must be fully cooked."
  },
  "Yến mạch sữa tươi tiệt trùng": {
    name: "Oats with pasteurized milk",
    reason: "Keeps you fuller longer and supports digestion.",
    nutrients: ["calcium", "fiber", "slow carbs"]
  },
  "Xôi đậu xanh ít dầu": {
    name: "Low-oil mung bean sticky rice",
    reason: "Good energy; keep the portion moderate.",
    nutrients: ["plant protein", "starch"]
  },
  "Cơm nắm muối vừng trứng": {
    name: "Sesame salt rice ball with egg",
    reason: "Easy to prep on busy mornings.",
    nutrients: ["protein", "calcium", "starch"]
  },
  "Bún riêu chay đậu hũ": {
    name: "Vegetarian tofu crab-style noodles",
    reason: "Light flavor with tofu for more protein.",
    nutrients: ["plant protein", "calcium", "vegetables"]
  },
  "Cháo đậu xanh hạt sen": {
    name: "Mung bean and lotus seed porridge",
    reason: "Soft, mild, and easy to eat.",
    nutrients: ["plant protein", "starch", "minerals"]
  },
  "Bánh cuốn thịt nạc": {
    name: "Steamed rice rolls with lean pork",
    reason: "A gentle flavor change without feeling heavy.",
    nutrients: ["protein", "starch"]
  },
  "Súp gà ngô nấm": {
    name: "Chicken, corn, and mushroom soup",
    reason: "Warm and soft when appetite is low.",
    nutrients: ["protein", "fiber", "starch"]
  },
  "Bún bò rau cải": {
    name: "Beef noodle soup with greens",
    reason: "Adds iron from red meat in a moderate amount.",
    nutrients: ["iron", "protein", "leafy greens"]
  },
  "Cháo yến mạch thịt bằm": {
    name: "Oat porridge with minced pork",
    reason: "More filling than plain rice porridge.",
    nutrients: ["protein", "fiber", "slow carbs"]
  },
  "Bánh mì gà xé rau": {
    name: "Shredded chicken sandwich with greens",
    reason: "Easy to prepare with little oil.",
    nutrients: ["protein", "vegetables", "starch"]
  },
  "Nui rau củ thịt bằm": {
    name: "Pasta with vegetables and minced pork",
    reason: "Soft and easy breakfast option.",
    nutrients: ["protein", "vegetables", "starch"]
  },
  "Bún mọc nấm": {
    name: "Meatball and mushroom noodle soup",
    reason: "Light broth balanced with vegetables.",
    nutrients: ["protein", "vegetables", "starch"]
  },
  "Cơm gạo lứt trứng rau luộc": {
    name: "Brown rice with egg and boiled greens",
    reason: "Keeps you fuller longer; helpful for blood-sugar goals.",
    nutrients: ["protein", "slow carbs", "fiber"]
  },
  "Bánh đa cua chay đậu hũ": {
    name: "Vegetarian tofu crab rice-cracker noodles",
    reason: "Vietnamese flavor without seafood.",
    nutrients: ["plant protein", "vegetables", "starch"]
  },
  "Cơm gạo lứt cá thu sốt cà": {
    name: "Brown rice with mackerel tomato sauce",
    reason: "Balances protein with slow carbs.",
    nutrients: ["omega-3", "protein", "slow carbs"],
    caution: "Choose small or trusted-source mackerel and cook thoroughly."
  },
  "Thịt bò xào bông cải": {
    name: "Beef stir-fried with broccoli",
    reason: "Supports iron intake; pair with vitamin-C fruit.",
    nutrients: ["iron", "protein", "folate"]
  },
  "Canh rau dền thịt bằm": {
    name: "Amaranth soup with minced pork",
    reason: "Easy Vietnamese dish with greens and protein.",
    nutrients: ["iron", "fiber", "protein"]
  },
  "Đậu hũ sốt cà chua": {
    name: "Tofu in tomato sauce",
    reason: "Good for lighter or vegetarian days.",
    nutrients: ["plant protein", "calcium"]
  },
  "Trứng hấp thịt": {
    name: "Steamed egg with pork",
    reason: "Soft, easy to eat, and quick to cook.",
    nutrients: ["protein", "choline"],
    caution: "Steam until fully cooked."
  },
  "Cá diêu hồng hấp gừng": {
    name: "Ginger-steamed red tilapia",
    reason: "Low oil; ginger helps with fishy aroma.",
    nutrients: ["protein", "iodine"],
    caution: "Fish must be fully cooked."
  },
  "Gà kho nghệ": {
    name: "Turmeric braised chicken",
    reason: "Easy to meal-prep for several servings with rice.",
    nutrients: ["protein", "zinc"]
  },
  "Canh bí đỏ nấu tôm": {
    name: "Pumpkin soup with shrimp",
    reason: "Naturally sweet and easy to eat.",
    nutrients: ["protein", "beta-carotene"],
    caution: "Shrimp must be fully cooked."
  },
  "Ức gà áp chảo rau củ": {
    name: "Pan-seared chicken breast with vegetables",
    reason: "Low oil; helpful for weight-gain control.",
    nutrients: ["lean protein", "fiber"]
  },
  "Cá hồi kho thơm": {
    name: "Salmon braised with pineapple",
    reason: "Flavorful change rich in healthy fats.",
    nutrients: ["omega-3", "protein"],
    caution: "Cook fish thoroughly; avoid undercooked fish."
  },
  "Canh chua cá lóc": {
    name: "Sour snakehead fish soup",
    reason: "Mild sourness can make rice easier to eat.",
    nutrients: ["protein", "vegetables", "vitamin C"]
  },
  "Thịt heo nạc rim gừng": {
    name: "Ginger-braised lean pork",
    reason: "Easy to cook and portion.",
    nutrients: ["protein", "iron"]
  },
  "Canh cải bó xôi thịt bằm": {
    name: "Spinach soup with minced pork",
    reason: "Adds leafy greens and micronutrients.",
    nutrients: ["folate", "iron", "protein"]
  },
  "Đậu hũ nấm kho tiêu nhẹ": {
    name: "Light pepper braised tofu and mushrooms",
    reason: "Filling vegetarian option; use pepper moderately.",
    nutrients: ["plant protein", "fiber"]
  },
  "Gà luộc cơm rau luộc": {
    name: "Boiled chicken with rice and greens",
    reason: "Simple, low oil, easy portion control.",
    nutrients: ["lean protein", "fiber"]
  },
  "Bò hầm khoai tây cà rốt": {
    name: "Beef stew with potato and carrot",
    reason: "Helpful when healthy energy needs are higher.",
    nutrients: ["iron", "protein", "energy"]
  },
  "Chả cá thác lác nấu rau tần ô": {
    name: "Fish cake soup with chrysanthemum greens",
    reason: "Soft, easy to eat, with greens.",
    nutrients: ["protein", "leafy greens"],
    caution: "Fish cakes must be boiled thoroughly."
  },
  "Tôm rim thịt nạc": {
    name: "Braised shrimp with lean pork",
    reason: "Moderately savory; serve with plenty of vegetables.",
    nutrients: ["protein", "zinc"]
  },
  "Canh mướp đậu hũ": {
    name: "Luffa and tofu soup",
    reason: "Light soup that adds fluids and fiber.",
    nutrients: ["plant protein", "fluids", "fiber"]
  },
  "Cơm cá basa kho nghệ": {
    name: "Turmeric-braised basa with rice",
    reason: "Affordable, soft, and rice-friendly.",
    nutrients: ["protein", "starch"],
    caution: "Cook thoroughly and choose a clear fish source."
  },
  "Bún thịt nạc rau sống trụng": {
    name: "Lean pork noodles with blanched greens",
    reason: "Lighter meal swap; rinse greens well and blanch if needed.",
    nutrients: ["protein", "vegetables", "starch"]
  },
  "Cơm đậu lăng rau củ": {
    name: "Lentil rice with vegetables",
    reason: "Filling, high-fiber vegetarian option.",
    nutrients: ["plant protein", "iron", "fiber"]
  },
  "Gà xào nấm bông cải": {
    name: "Chicken stir-fried with mushrooms and broccoli",
    reason: "Balances protein and vegetables with less refined starch.",
    nutrients: ["protein", "fiber"]
  },
  "Canh chua chay đậu hũ": {
    name: "Vegetarian sour tofu soup",
    reason: "Light flavor that is easier on queasy days.",
    nutrients: ["plant protein", "vitamin C"]
  },
  "Khoai lang luộc": {
    name: "Boiled sweet potato",
    reason: "Lightly filling and digestion-friendly.",
    nutrients: ["fiber", "slow carbs"]
  },
  "Sữa chua không đường": {
    name: "Unsweetened yogurt",
    reason: "Good snack option; choose pasteurized yogurt.",
    nutrients: ["calcium", "probiotic"]
  },
  "Chuối": {
    name: "Banana",
    reason: "Easy to eat when mild nausea shows up.",
    nutrients: ["potassium", "energy"]
  },
  "Cam": {
    name: "Orange",
    reason: "Vitamin C supports iron absorption.",
    nutrients: ["vitamin C", "fluids"]
  },
  "Ổi": {
    name: "Guava",
    reason: "Rich in vitamin C and fiber.",
    nutrients: ["vitamin C", "fiber"]
  },
  "Hạt óc chó / hạnh nhân": {
    name: "Walnuts / almonds",
    reason: "Small snack with healthy fats and protein.",
    nutrients: ["healthy fats", "protein"]
  },
  "Sữa tươi tiệt trùng": {
    name: "Pasteurized milk",
    reason: "Calcium boost; choose pasteurized milk.",
    nutrients: ["calcium", "protein"]
  },
  "Bánh mì nguyên cám phô mai tiệt trùng": {
    name: "Whole-grain bread with pasteurized cheese",
    reason: "More filling than sweet bakery snacks.",
    nutrients: ["calcium", "slow carbs"]
  },
  "Đậu nành luộc": {
    name: "Boiled soybeans",
    reason: "Adds plant protein through the day.",
    nutrients: ["plant protein", "fiber"]
  },
  "Trứng luộc chín kỹ": {
    name: "Fully boiled egg",
    reason: "Compact and easy to prepare.",
    nutrients: ["protein", "choline"],
    caution: "Boil until fully cooked."
  },
  "Sinh tố bơ sữa tiệt trùng không đường": {
    name: "Unsweetened avocado milk smoothie",
    reason: "Healthy energy boost without added sugar.",
    nutrients: ["healthy fats", "calcium"]
  },
  "Thanh long": {
    name: "Dragon fruit",
    reason: "Easy to eat and adds fiber.",
    nutrients: ["fluids", "fiber"]
  },
  "Táo và bơ đậu phộng mỏng": {
    name: "Apple with a thin peanut-butter spread",
    reason: "More balanced snack than fruit alone.",
    nutrients: ["fiber", "healthy fats"]
  },
  "Bắp luộc": {
    name: "Boiled corn",
    reason: "A simple change of pace; keep portions moderate.",
    nutrients: ["starch", "fiber"]
  },
  "Chè đậu đỏ ít đường": {
    name: "Low-sugar red bean dessert",
    reason: "Plant protein snack; keep sugar low.",
    nutrients: ["plant protein", "iron"]
  },
  "Rau câu sữa chua trái cây": {
    name: "Yogurt fruit jelly",
    reason: "Cool and easy to eat; avoid overly sweet versions.",
    nutrients: ["calcium", "fluids"]
  }
};

const ingredientEnByVi: Record<string, string> = {
  "cá hồi": "salmon",
  "bí đỏ": "pumpkin",
  gạo: "rice",
  "thịt heo nạc": "lean pork",
  "cà rốt": "carrot",
  "ức gà": "chicken breast",
  "rau cải": "leafy greens",
  bún: "rice noodles",
  gà: "chicken",
  "bánh phở": "pho noodles",
  hành: "scallion",
  nấm: "mushroom",
  miến: "glass noodles",
  trứng: "egg",
  "bánh mì": "bread",
  "dưa leo": "cucumber",
  "yến mạch": "oats",
  "sữa tươi tiệt trùng": "pasteurized milk",
  chuối: "banana",
  "đậu xanh": "mung beans",
  "gạo nếp": "sticky rice",
  vừng: "sesame",
  "đậu hũ": "tofu",
  "cà chua": "tomato",
  "hạt sen": "lotus seeds",
  "bột gạo": "rice flour",
  giá: "bean sprouts",
  ngô: "corn",
  "thịt bò": "beef",
  "xà lách": "lettuce",
  nui: "pasta",
  "giò sống nạc": "lean pork paste",
  "gạo lứt": "brown rice",
  "rau muống": "water spinach",
  "bánh đa": "rice crackers",
  "cá thu": "mackerel",
  cơm: "rice",
  "bông cải xanh": "broccoli",
  "rau dền": "amaranth",
  "cá diêu hồng": "red tilapia",
  gừng: "ginger",
  nghệ: "turmeric",
  tôm: "shrimp",
  "bí ngòi": "zucchini",
  thơm: "pineapple",
  "cá lóc": "snakehead fish",
  "đậu bắp": "okra",
  "cải bó xôi": "spinach",
  "cơm gạo lứt": "brown rice",
  "khoai tây": "potato",
  "chả cá": "fish cake",
  "tần ô": "chrysanthemum greens",
  mướp: "luffa",
  "cá basa": "basa fish",
  "rau xà lách": "lettuce",
  "đậu lăng": "lentils",
  "khoai lang": "sweet potato",
  "sữa chua tiệt trùng": "pasteurized yogurt",
  cam: "orange",
  ổi: "guava",
  "hạt óc chó": "walnuts",
  "hạnh nhân": "almonds",
  "bánh mì nguyên cám": "whole-grain bread",
  "phô mai tiệt trùng": "pasteurized cheese",
  "đậu nành": "soybeans",
  bơ: "avocado",
  "thanh long": "dragon fruit",
  táo: "apple",
  "bơ đậu phộng": "peanut butter",
  bắp: "corn",
  "đậu đỏ": "red beans",
  "trái cây": "fruit"
};

const defaultCautionEn = "Eat while hot; refrigerate leftovers properly if prepping ahead.";

export function localizeMealText(
  viName: string,
  locale: Locale,
  fallback: { reason: string; nutrients: string[]; caution?: string }
): LocalizedMealText {
  const en = mealTextByViName[viName];
  if (locale === "en") {
    return {
      name: en?.name ?? viName,
      reason: en?.reason ?? fallback.reason,
      nutrients: en?.nutrients ?? fallback.nutrients,
      caution: en?.caution ?? (fallback.caution ? defaultCautionEn : undefined)
    };
  }
  return {
    name: viName,
    reason: fallback.reason,
    nutrients: fallback.nutrients,
    caution: fallback.caution
  };
}

export function localizeIngredient(ingredient: string, locale: Locale): string {
  if (locale !== "en") return ingredient;
  const key = ingredient.toLowerCase();
  return ingredientEnByVi[key] ?? ingredientEnByVi[ingredient] ?? ingredient;
}

export function localizeIngredientList(items: string[], locale: Locale): string[] {
  return items.map((item) => localizeIngredient(item, locale));
}
