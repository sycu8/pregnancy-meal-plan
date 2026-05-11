import type { CuisinePreference, HealthCondition, NutritionGoal } from "@/types/pregnancy";

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
