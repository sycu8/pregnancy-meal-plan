import { describe, expect, it } from "vitest";
import { findMealRecordByName } from "@/lib/nutrition/mealDatabase";
import { mealBlocked } from "@/lib/nutrition/dishSafety";
import { regenerateMealInPlan, ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import type { PregnancyProfile } from "@/types/pregnancy";

const profile: PregnancyProfile = {
  pregnancyWeek: 24,
  pregnancyType: "singleton",
  age: 30,
  heightCm: 160,
  prePregnancyWeightKg: 52,
  currentWeightKg: 58,
  activityLevel: "light",
  healthConditions: ["none"],
  cuisinePreferences: ["vietnamese_rice"],
  budget: "medium",
  cookingTime: "around_30",
  goals: ["balanced"]
};

const gdm: PregnancyProfile = {
  ...profile,
  healthConditions: ["gestational_diabetes"],
  goals: ["blood_sugar_control"]
};

const slots = ["breakfast", "morningSnack", "lunch", "afternoonSnack", "dinner"] as const;

describe("dish and swap safety", () => {
  it("denies mugwort, raw or blanched sprouts, and green papaya, and keeps sprouts only when cooked through", () => {
    expect(mealBlocked({ name: "Canh ngải cứu", ingredients: { vegetables: ["ngải cứu"] } }, profile)).toBe(true);
    expect(mealBlocked({ name: "Canh ngai cuu", ingredients: {} }, profile)).toBe(true);
    expect(mealBlocked({ name: "Salad giá đỗ", ingredients: { vegetables: ["giá đỗ"] } }, profile)).toBe(true);
    expect(mealBlocked({ name: "Giá", ingredients: { vegetables: ["giá"] } }, profile)).toBe(true);
    expect(mealBlocked({ name: "Giá sống", ingredients: { vegetables: ["giá sống"] } }, profile)).toBe(true);
    expect(mealBlocked({ name: "Bean sprouts", ingredients: { vegetables: ["bean sprouts"] } }, profile)).toBe(true);
    expect(mealBlocked({ name: "Sprouts", ingredients: {} }, profile)).toBe(true);
    expect(mealBlocked({ name: "Giá trụng", ingredients: { vegetables: ["giá"] } }, profile)).toBe(true);
    expect(mealBlocked({ name: "Blanched bean sprouts", ingredients: {} }, profile)).toBe(true);
    expect(mealBlocked({ name: "Giá đỗ xào", ingredients: { vegetables: ["giá đỗ"] } }, profile)).toBe(false);
    expect(mealBlocked({ name: "Well cooked bean sprouts", ingredients: {} }, profile)).toBe(false);
    expect(mealBlocked({ name: "Alfalfa xào", ingredients: { vegetables: ["alfalfa"] } }, profile)).toBe(true);
    expect(mealBlocked({ name: "Đu đủ xanh", ingredients: { fruits: ["đu đủ xanh"] } }, profile)).toBe(true);
    expect(mealBlocked({ name: "Sữa bò sống", ingredients: { dairy: ["sữa bò sống"] } }, profile)).toBe(true);
    const rolls = findMealRecordByName("Bánh cuốn thịt nạc");
    expect(rolls && Object.values(rolls.ingredients).flat()).not.toContain("giá");
    expect(mealBlocked(rolls!, profile)).toBe(false);
    expect(mealBlocked(findMealRecordByName("Sữa tươi tiệt trùng")!, profile)).toBe(false);
  });

  it("drops sweets and white-rice staples for gestational diabetes and keeps brown rice", () => {
    expect(mealBlocked(findMealRecordByName("Phở gà ít béo")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Phở gà ít béo")!, profile)).toBe(false);
    expect(mealBlocked(findMealRecordByName("Xôi đậu xanh ít dầu")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Chè đậu đỏ ít đường")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Sinh tố bơ sữa tiệt trùng không đường")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Gà luộc cơm rau luộc")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Bún gà rau xanh")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Bún gà rau xanh")!, profile)).toBe(false);
    expect(mealBlocked(findMealRecordByName("Miến gà nấm")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Bánh cuốn thịt nạc")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Bánh đa cua chay đậu hũ")!, gdm)).toBe(true);
    expect(mealBlocked({ name: "Noodles", ingredients: { grains: ["bánh phở"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Pho noodles", ingredients: {} }, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Bánh mì trứng chín kỹ")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Bánh mì trứng chín kỹ")!, profile)).toBe(false);
    expect(mealBlocked(findMealRecordByName("Nui rau củ thịt bằm")!, gdm)).toBe(true);
    expect(mealBlocked(findMealRecordByName("Nui rau củ thịt bằm")!, profile)).toBe(false);
    expect(mealBlocked({ name: "White bread", ingredients: { grains: ["white bread"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Macaroni", ingredients: { grains: ["macaroni"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Pasta", ingredients: { grains: ["pasta"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Bread", ingredients: { grains: ["bread"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Bread", ingredients: { grains: ["bread"] } }, profile)).toBe(false);
    expect(mealBlocked({ name: "Bột mì", ingredients: { grains: ["bột mì"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mì gói", ingredients: { grains: ["mì gói"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mì Ý", ingredients: { grains: ["mì Ý"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mi y", ingredients: { grains: ["mi y"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mì", ingredients: { grains: ["mì"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mỳ", ingredients: { grains: ["mỳ"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mỹ", ingredients: { grains: ["Mỹ"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "My", ingredients: { grains: ["My"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "mi", ingredients: { grains: ["mi"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "my", ingredients: { grains: ["my"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "my y", ingredients: { grains: ["my y"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mì căn", ingredients: { grains: ["mì căn"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "Mỳ căn", ingredients: { grains: ["mỳ căn"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "Mi goi", ingredients: { grains: ["mi goi"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mi tom", ingredients: { grains: ["mi tom"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mì tôm", ingredients: { grains: ["mì tôm"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Mì ăn liền", ingredients: { grains: ["mì ăn liền"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Instant noodle", ingredients: { grains: ["instant noodle"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Instant noodles", ingredients: { grains: ["instant noodles"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "instant-noodle", ingredients: { grains: ["instant-noodle"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "instant-noodles", ingredients: { grains: ["instant-noodles"] } }, gdm)).toBe(true);
    const noodleCompounds = [
      "mì gói",
      "mỳ gói",
      "mì tôm",
      "mỳ tôm",
      "mì Ý",
      "mỳ Ý",
      "mì ăn liền",
      "mỳ ăn liền",
      "mì ống",
      "mỳ ống",
      "my goi",
      "my tom",
      "my an lien",
      "my ong"
    ];
    expect(noodleCompounds).toHaveLength(14);
    for (const name of noodleCompounds) {
      expect(mealBlocked({ name, ingredients: { grains: [name] } }, gdm), name).toBe(true);
    }
    expect(mealBlocked({ name: "Ramen", ingredients: { grains: ["ramen"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Bánh bao", ingredients: { grains: ["bánh bao"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Bánh quy", ingredients: { grains: ["bánh quy"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Cracker", ingredients: { grains: ["cracker"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Crackers", ingredients: { grains: ["crackers"] } }, gdm)).toBe(true);
    expect(mealBlocked({ name: "Crackers", ingredients: { grains: ["crackers"] } }, profile)).toBe(false);
    expect(mealBlocked({ name: "Rye bread", ingredients: { grains: ["rye bread"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "Buckwheat noodles", ingredients: { grains: ["buckwheat noodles"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "Mì kiều mạch", ingredients: { grains: ["mì kiều mạch"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "Whole-wheat mì", ingredients: { grains: ["whole-wheat mì"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "Whole wheat bread", ingredients: { grains: ["whole wheat bread"] } }, gdm)).toBe(false);
    expect(mealBlocked({ name: "Bánh quy nguyên cám", ingredients: { grains: ["bánh quy nguyên cám"] } }, gdm)).toBe(false);
    expect(mealBlocked(findMealRecordByName("Bánh mì nguyên cám phô mai tiệt trùng")!, gdm)).toBe(false);
    expect(mealBlocked({ name: "Whole-grain pasta", ingredients: { grains: ["whole wheat pasta"] } }, gdm)).toBe(false);
    expect(mealBlocked(findMealRecordByName("Cơm gạo lứt trứng rau luộc")!, gdm)).toBe(false);
    expect(mealBlocked(findMealRecordByName("Yến mạch sữa tươi tiệt trùng")!, gdm)).toBe(false);
    expect(mealBlocked(findMealRecordByName("Ổi")!, gdm)).toBe(false);
    expect(mealBlocked(findMealRecordByName("Táo và bơ đậu phộng mỏng")!, gdm)).toBe(false);
  });

  it("keeps gestational-diabetes dishes and swaps off white rice and sweets", () => {
    const plan = ruleBasedMealPlanner(gdm, "vi");
    for (const day of plan.days) {
      for (const slot of slots) {
        const item = day[slot];
        const meal = findMealRecordByName(item.mealId ?? item.name);
        expect(meal && mealBlocked(meal, gdm), item.name).toBe(false);
        for (const alternative of item.alternatives ?? []) {
          const candidate = findMealRecordByName(alternative);
          if (!candidate) continue;
          expect(mealBlocked(candidate, gdm), alternative).toBe(false);
        }
      }
    }

    let swapped = plan;
    for (const slot of slots) {
      swapped = regenerateMealInPlan(swapped, gdm, 1, slot, "vi");
    }
    for (const slot of slots) {
      const item = swapped.days[0][slot];
      const meal = findMealRecordByName(item.mealId ?? item.name);
      expect(meal && mealBlocked(meal, gdm), item.name).toBe(false);
    }
  });
});
