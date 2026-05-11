import type { MealPlan } from "@/types/mealPlan";

type BmiCategory = MealPlan["summary"]["bmiCategory"];
type WeightGainStatus = MealPlan["summary"]["weightGainStatus"];

const weeklyRates: Record<Exclude<BmiCategory, "unknown">, { min: number; max: number }> = {
  underweight: { min: 0.44, max: 0.58 },
  normal: { min: 0.35, max: 0.5 },
  overweight: { min: 0.23, max: 0.33 },
  obese: { min: 0.17, max: 0.27 }
};

export const totalPregnancyGainRanges: Record<Exclude<BmiCategory, "unknown">, { min: number; max: number }> = {
  underweight: { min: 12.5, max: 18 },
  normal: { min: 11.5, max: 16 },
  overweight: { min: 7, max: 11.5 },
  obese: { min: 5, max: 9 }
};

export function estimateExpectedWeightGainRange({
  pregnancyWeek,
  bmiCategory
}: {
  pregnancyWeek: number;
  bmiCategory: BmiCategory;
}): { min: number; max: number } | null {
  if (bmiCategory === "unknown" || pregnancyWeek < 1 || pregnancyWeek > 40) return null;
  if (pregnancyWeek <= 13) return { min: 0.5, max: 2 };

  const weeksAfter13 = pregnancyWeek - 13;
  const rate = weeklyRates[bmiCategory];

  return {
    min: roundOneDecimal(0.5 + weeksAfter13 * rate.min),
    max: roundOneDecimal(2 + weeksAfter13 * rate.max)
  };
}

export function getWeightGainStatus({
  currentGainKg,
  pregnancyWeek,
  bmiCategory
}: {
  currentGainKg: number | null;
  pregnancyWeek: number;
  bmiCategory: BmiCategory;
}): WeightGainStatus {
  const range = estimateExpectedWeightGainRange({ pregnancyWeek, bmiCategory });
  if (currentGainKg === null || range === null || !Number.isFinite(currentGainKg)) return "unknown";
  if (currentGainKg < range.min - 1) return "low";
  if (currentGainKg > range.max + 1) return "high";
  return "normal";
}

export const weightGainStatusLabels: Record<WeightGainStatus, string> = {
  low: "Thấp hơn ước lượng",
  normal: "Trong khoảng tham khảo",
  high: "Cao hơn ước lượng",
  unknown: "Chưa đủ dữ liệu"
};

function roundOneDecimal(value: number) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}
