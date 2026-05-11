import { z } from "zod";

export const pregnancyProfileSchema = z.object({
  pregnancyWeek: z.number().int().min(1, "Tuần thai phải từ 1 đến 40.").max(40, "Tuần thai phải từ 1 đến 40."),
  pregnancyType: z.enum(["singleton", "twins"]),
  fetalWeightGram: z.number().positive().optional(),
  doctorNote: z.string().optional(),
  age: z.number().int().min(12).max(60).optional(),
  heightCm: z.number().min(120, "Chiều cao cần từ 120 đến 220 cm.").max(220, "Chiều cao cần từ 120 đến 220 cm."),
  prePregnancyWeightKg: z
    .number()
    .min(30, "Cân nặng trước mang thai cần từ 30 đến 200 kg.")
    .max(200, "Cân nặng trước mang thai cần từ 30 đến 200 kg."),
  currentWeightKg: z
    .number()
    .min(30, "Cân nặng hiện tại cần từ 30 đến 220 kg.")
    .max(220, "Cân nặng hiện tại cần từ 30 đến 220 kg."),
  activityLevel: z.enum(["low", "light", "medium"]),
  healthConditions: z.array(
    z.enum([
      "morning_sickness",
      "constipation",
      "anemia",
      "gestational_diabetes",
      "hypertension",
      "edema",
      "reflux",
      "fast_weight_gain",
      "slow_weight_gain",
      "small_fetus",
      "large_fetus",
      "none"
    ])
  ),
  cuisinePreferences: z.array(
    z.enum(["vietnamese_rice", "northern", "central", "southern", "vegetarian", "no_fish", "no_beef", "no_seafood"])
  ),
  dislikedFoods: z.string().optional(),
  allergies: z.string().optional(),
  budget: z.enum(["low", "medium", "high"]),
  cookingTime: z.enum(["under_15", "around_30", "meal_prep"]),
  goals: z.array(
    z.enum([
      "balanced",
      "weight_control",
      "healthy_weight_gain",
      "reduce_nausea",
      "blood_sugar_control",
      "relieve_constipation",
      "increase_iron_calcium_protein"
    ])
  )
});

export function validationErrorToVietnamese(error: unknown) {
  if (error instanceof z.ZodError) return error.errors.map((item) => item.message).join(" ");
  return "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.";
}
