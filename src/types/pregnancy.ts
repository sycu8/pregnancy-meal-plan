export type LifeStage = "pregnancy" | "postpartum";

export type HealthCondition =
  | "morning_sickness"
  | "constipation"
  | "anemia"
  | "gestational_diabetes"
  | "hypertension"
  | "edema"
  | "reflux"
  | "fast_weight_gain"
  | "slow_weight_gain"
  | "small_fetus"
  | "large_fetus"
  | "none";

export type CuisinePreference =
  | "vietnamese_rice"
  | "northern"
  | "central"
  | "southern"
  | "vegetarian"
  | "no_fish"
  | "no_beef"
  | "no_seafood";

export type NutritionGoal =
  | "balanced"
  | "weight_control"
  | "healthy_weight_gain"
  | "reduce_nausea"
  | "blood_sugar_control"
  | "relieve_constipation"
  | "increase_iron_calcium_protein";

export type PregnancyProfile = {
  lifeStage?: LifeStage;
  babyAgeMonths?: number;
  strictGestationalDiabetes?: boolean;
  pregnancyWeek: number;
  pregnancyType: "singleton" | "twins";
  fetalWeightGram?: number;
  doctorNote?: string;
  age?: number;
  heightCm: number;
  prePregnancyWeightKg: number;
  currentWeightKg: number;
  activityLevel: "low" | "light" | "medium";
  healthConditions: HealthCondition[];
  cuisinePreferences: CuisinePreference[];
  dislikedFoods?: string;
  allergies?: string;
  budget: "low" | "medium" | "high";
  cookingTime: "under_15" | "around_30" | "meal_prep";
  goals: NutritionGoal[];
};
