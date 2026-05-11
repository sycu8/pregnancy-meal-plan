import { describe, expect, it } from "vitest";
import { calculateBmi, getBmiCategory } from "@/lib/nutrition/bmi";
import {
  estimateExpectedWeightGainRange,
  getWeightGainStatus
} from "@/lib/nutrition/weightGain";
import {
  detectUrgentWarnings,
  getConditionSpecificWarnings
} from "@/lib/nutrition/safetyRules";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import type { PregnancyProfile } from "@/types/pregnancy";

const baseProfile: PregnancyProfile = {
  pregnancyWeek: 24,
  pregnancyType: "singleton",
  age: 30,
  heightCm: 160,
  prePregnancyWeightKg: 52,
  currentWeightKg: 58,
  activityLevel: "light",
  healthConditions: ["anemia", "constipation"],
  cuisinePreferences: ["vietnamese_rice"],
  budget: "medium",
  cookingTime: "around_30",
  goals: ["balanced", "increase_iron_calcium_protein"]
};

describe("nutrition calculations", () => {
  it("calculates and categorizes pre-pregnancy BMI", () => {
    expect(calculateBmi(52, 160)).toBe(20.3);
    expect(getBmiCategory(17)).toBe("underweight");
    expect(getBmiCategory(22)).toBe("normal");
    expect(getBmiCategory(27)).toBe("overweight");
    expect(getBmiCategory(31)).toBe("obese");
  });

  it("estimates trimester-aware expected weight gain ranges", () => {
    expect(estimateExpectedWeightGainRange({ pregnancyWeek: 10, bmiCategory: "normal" })).toEqual({
      min: 0.5,
      max: 2
    });
    expect(estimateExpectedWeightGainRange({ pregnancyWeek: 24, bmiCategory: "normal" })).toEqual({
      min: 4.4,
      max: 7.5
    });
    expect(getWeightGainStatus({ currentGainKg: 6, pregnancyWeek: 24, bmiCategory: "normal" })).toBe("normal");
    expect(getWeightGainStatus({ currentGainKg: 2, pregnancyWeek: 24, bmiCategory: "normal" })).toBe("low");
    expect(getWeightGainStatus({ currentGainKg: 10, pregnancyWeek: 24, bmiCategory: "normal" })).toBe("high");
  });
});

describe("pregnancy safety rules", () => {
  it("detects urgent doctor-note keywords without diagnosing", () => {
    expect(detectUrgentWarnings({ ...baseProfile, doctorNote: "Hôm nay thai máy giảm" })).toHaveLength(1);
    expect(detectUrgentWarnings({ ...baseProfile, doctorNote: "Bác sĩ dặn ăn thêm đạm" })).toEqual([]);
  });

  it("adds condition-specific food guidance", () => {
    const warnings = getConditionSpecificWarnings({
      ...baseProfile,
      healthConditions: ["gestational_diabetes", "anemia"]
    });
    expect(warnings.join(" ")).toContain("tinh bột chậm");
    expect(warnings.join(" ")).toContain("vitamin C");
  });
});

describe("rule-based meal planner", () => {
  it("creates a seven-day Vietnamese plan and respects food restrictions", () => {
    const plan = ruleBasedMealPlanner({
      ...baseProfile,
      cuisinePreferences: ["vietnamese_rice", "no_fish", "no_seafood"],
      allergies: "tôm"
    });

    expect(plan.days).toHaveLength(7);
    expect(plan.shoppingList.proteins.length).toBeGreaterThan(0);
    expect(plan.safetyWarnings).toContain("Không ăn đồ sống/tái; nấu chín kỹ thịt, cá, trứng và hải sản.");
    const selectedMealNames = plan.days
      .flatMap((day) => [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner])
      .map((meal) => meal.name.toLowerCase());
    const selectedProteins = plan.shoppingList.proteins.join(" ").toLowerCase();
    expect(selectedMealNames.some((name) => /(^|\s)cá(\s|$)|tôm|hải sản/.test(name))).toBe(false);
    expect(selectedProteins).not.toContain("tôm");
    expect(/(^|\s)cá(\s|$)/.test(selectedProteins)).toBe(false);
  });
});
