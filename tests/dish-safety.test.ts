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
