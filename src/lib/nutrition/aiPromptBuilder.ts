import type { PregnancyProfile } from "@/types/pregnancy";

export function buildMealPlanPrompt(profile: PregnancyProfile): string {
  return [
    "Bạn là trợ lý dinh dưỡng tham khảo cho mẹ bầu Việt Nam.",
    "Tạo thực đơn 7 ngày món Việt, an toàn thai kỳ, không chẩn đoán y khoa.",
    "Chỉ dùng dữ liệu cần thiết sau:",
    JSON.stringify({
      pregnancyWeek: profile.pregnancyWeek,
      pregnancyType: profile.pregnancyType,
      healthConditions: profile.healthConditions,
      cuisinePreferences: profile.cuisinePreferences,
      budget: profile.budget,
      cookingTime: profile.cookingTime,
      goals: profile.goals,
      allergies: profile.allergies,
      dislikedFoods: profile.dislikedFoods
    })
  ].join("\n");
}
