import { describe, expect, it } from "vitest";
import { getPremiumLimits } from "@/lib/premium/limits";
import { buildPlanShareText, buildPlanShareUrl } from "@/lib/share/planShare";
import type { MealPlan } from "@/types/mealPlan";

const samplePlan = {
  id: "plan-test-1",
  createdAt: "2026-07-01T00:00:00.000Z",
  profileSnapshot: {
    pregnancyWeek: 20,
    pregnancyType: "singleton",
    heightCm: 160,
    prePregnancyWeightKg: 52,
    currentWeightKg: 57,
    activityLevel: "light",
    healthConditions: ["none"],
    cuisinePreferences: ["vietnamese_rice"],
    budget: "medium",
    cookingTime: "around_30",
    goals: ["balanced"]
  },
  summary: {
    message: "Thực đơn tham khảo cho tuần 20.",
    disclaimer: "Tham khảo",
    bmi: 20.3,
    bmiCategory: "normal",
    weightGainKg: 5,
    weightGainStatus: "normal"
  },
  days: [
    {
      day: 1,
      breakfast: { name: "Phở bò", portionGram: 400, estimatedCalories: 450, estimatedCostVnd: 45000, reason: "test", nutrients: ["protein"], alternatives: [], caution: "" },
      morningSnack: { name: "Sữa chua", portionGram: 150, estimatedCalories: 120, estimatedCostVnd: 12000, reason: "test", nutrients: ["calcium"], alternatives: [], caution: "" },
      lunch: { name: "Cá hấp", portionGram: 350, estimatedCalories: 420, estimatedCostVnd: 50000, reason: "test", nutrients: ["omega3"], alternatives: [], caution: "" },
      afternoonSnack: { name: "Chuối", portionGram: 120, estimatedCalories: 110, estimatedCostVnd: 8000, reason: "test", nutrients: ["fiber"], alternatives: [], caution: "" },
      dinner: { name: "Canh rau", portionGram: 300, estimatedCalories: 180, estimatedCostVnd: 20000, reason: "test", nutrients: ["iron"], alternatives: [], caution: "" },
      hydrationNote: "Uống đủ nước"
    }
  ],
  shoppingList: { proteins: [], vegetables: [], fruits: [], dairy: [], grains: [], others: [] },
  shoppingBatches: [],
  safetyWarnings: [],
  specialNotes: [],
  urgentWarnings: [],
  costEstimate: { totalVnd: 0, sourceNames: ["Kingfoodmart"], note: "test" }
} as unknown as MealPlan;

describe("premium limits", () => {
  it("defines free tier daily caps", () => {
    expect(getPremiumLimits("free").aiPlansPerDay).toBe(3);
    expect(getPremiumLimits("free").mealSwapsPerDay).toBe(5);
    expect(getPremiumLimits("free").historyPlans).toBe(20);
  });

  it("removes caps for premium tier", () => {
    expect(getPremiumLimits("premium").aiPlansPerDay).toBe(Number.POSITIVE_INFINITY);
    expect(getPremiumLimits("premium").mealSwapsPerDay).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("plan share", () => {
  it("builds localized share URLs with plan id", () => {
    expect(buildPlanShareUrl("plan-test-1", "vi")).toContain("/result?plan=plan-test-1");
    expect(buildPlanShareUrl("plan-test-1", "en")).toContain("/en/result?plan=plan-test-1");
  });

  it("includes pregnancy week in share text", () => {
    expect(buildPlanShareText(samplePlan, "vi")).toContain("tuần thai 20");
    expect(buildPlanShareText(samplePlan, "en")).toContain("week 20");
  });
});
