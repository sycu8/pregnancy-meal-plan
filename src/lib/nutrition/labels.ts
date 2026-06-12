import type { CuisinePreference, HealthCondition, NutritionGoal } from "@/types/pregnancy";
import type { Locale } from "@/lib/i18n";

export const healthConditionLabels: Record<HealthCondition, string> = {
  morning_sickness: "Nghén",
  constipation: "Táo bón",
  anemia: "Thiếu máu / thiếu sắt",
  gestational_diabetes: "Tiểu đường thai kỳ",
  hypertension: "Tăng huyết áp",
  edema: "Phù",
  reflux: "Trào ngược dạ dày",
  fast_weight_gain: "Tăng cân nhanh",
  slow_weight_gain: "Tăng cân chậm",
  small_fetus: "Thai nhỏ hơn chuẩn",
  large_fetus: "Thai lớn hơn chuẩn",
  none: "Không có vấn đề đặc biệt"
};

export const cuisinePreferenceLabels: Record<CuisinePreference, string> = {
  vietnamese_rice: "Ăn cơm Việt",
  northern: "Món Bắc",
  central: "Món Trung",
  southern: "Món Nam",
  vegetarian: "Ăn chay",
  no_fish: "Không ăn cá",
  no_beef: "Không ăn thịt bò",
  no_seafood: "Không ăn hải sản"
};

export const nutritionGoalLabels: Record<NutritionGoal, string> = {
  balanced: "Ăn đủ chất",
  weight_control: "Kiểm soát tăng cân",
  healthy_weight_gain: "Tăng cân lành mạnh",
  reduce_nausea: "Giảm nghén",
  blood_sugar_control: "Kiểm soát đường huyết",
  relieve_constipation: "Cải thiện táo bón",
  increase_iron_calcium_protein: "Tăng sắt / canxi / đạm"
};

export const budgetLabels = {
  low: "Tiết kiệm",
  medium: "Trung bình",
  high: "Cao"
} as const;

export const cookingTimeLabels = {
  under_15: "Dưới 15 phút",
  around_30: "Khoảng 30 phút",
  meal_prep: "Meal prep cuối tuần"
} as const;

export const activityLabels = {
  low: "Ít vận động",
  light: "Nhẹ",
  medium: "Trung bình"
} as const;

export const englishHealthConditionLabels: Record<HealthCondition, string> = {
  morning_sickness: "Morning sickness",
  constipation: "Constipation",
  anemia: "Anemia / low iron",
  gestational_diabetes: "Gestational diabetes",
  hypertension: "High blood pressure",
  edema: "Swelling",
  reflux: "Acid reflux",
  fast_weight_gain: "Fast weight gain",
  slow_weight_gain: "Slow weight gain",
  small_fetus: "Baby measuring smaller",
  large_fetus: "Baby measuring larger",
  none: "No special concern"
};

export const englishCuisinePreferenceLabels: Record<CuisinePreference, string> = {
  vietnamese_rice: "Vietnamese rice meals",
  northern: "Northern Vietnamese dishes",
  central: "Central Vietnamese dishes",
  southern: "Southern Vietnamese dishes",
  vegetarian: "Vegetarian",
  no_fish: "No fish",
  no_beef: "No beef",
  no_seafood: "No seafood"
};

export const englishNutritionGoalLabels: Record<NutritionGoal, string> = {
  balanced: "Balanced nutrition",
  weight_control: "Control weight gain",
  healthy_weight_gain: "Healthy weight gain",
  reduce_nausea: "Reduce nausea",
  blood_sugar_control: "Blood sugar control",
  relieve_constipation: "Relieve constipation",
  increase_iron_calcium_protein: "Increase iron / calcium / protein"
};

export const englishBudgetLabels = {
  low: "Budget-friendly",
  medium: "Moderate",
  high: "Higher budget"
} as const;

export const englishCookingTimeLabels = {
  under_15: "Under 15 minutes",
  around_30: "Around 30 minutes",
  meal_prep: "Weekend meal prep"
} as const;

export const englishActivityLabels = {
  low: "Low activity",
  light: "Light",
  medium: "Moderate"
} as const;

export function getNutritionLabels(locale: Locale) {
  return {
    healthConditionLabels: locale === "vi" ? healthConditionLabels : englishHealthConditionLabels,
    cuisinePreferenceLabels: locale === "vi" ? cuisinePreferenceLabels : englishCuisinePreferenceLabels,
    nutritionGoalLabels: locale === "vi" ? nutritionGoalLabels : englishNutritionGoalLabels,
    budgetLabels: locale === "vi" ? budgetLabels : englishBudgetLabels,
    cookingTimeLabels: locale === "vi" ? cookingTimeLabels : englishCookingTimeLabels,
    activityLabels: locale === "vi" ? activityLabels : englishActivityLabels
  };
}
