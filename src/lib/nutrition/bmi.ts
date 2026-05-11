import type { MealPlan } from "@/types/mealPlan";

export type BmiCategory = MealPlan["summary"]["bmiCategory"];

export function calculateBmi(weightKg: number, heightCm: number): number | null {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBmiCategory(bmi: number | null): BmiCategory {
  if (bmi === null || !Number.isFinite(bmi)) return "unknown";
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

export const bmiCategoryLabels: Record<BmiCategory, string> = {
  underweight: "Thiếu cân",
  normal: "Bình thường",
  overweight: "Thừa cân",
  obese: "Béo phì",
  unknown: "Chưa đủ dữ liệu"
};
