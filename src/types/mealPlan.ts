import type { PregnancyProfile } from "./pregnancy";

export type MealPlan = {
  id: string;
  createdAt: string;
  profileSnapshot: PregnancyProfile;
  summary: {
    bmi: number | null;
    bmiCategory: "underweight" | "normal" | "overweight" | "obese" | "unknown";
    weightGainKg: number | null;
    weightGainStatus: "low" | "normal" | "high" | "unknown";
    message: string;
    disclaimer: string;
  };
  days: MealPlanDay[];
  shoppingList: ShoppingList;
  safetyWarnings: string[];
  specialNotes: string[];
  urgentWarnings?: string[];
};

export type MealPlanDay = {
  day: number;
  breakfast: MealItem;
  morningSnack: MealItem;
  lunch: MealItem;
  afternoonSnack: MealItem;
  dinner: MealItem;
  hydrationNote?: string;
};

export type MealItem = {
  name: string;
  reason: string;
  nutrients: string[];
  alternatives?: string[];
  caution?: string;
};

export type ShoppingList = {
  proteins: string[];
  vegetables: string[];
  fruits: string[];
  dairy: string[];
  grains: string[];
  others: string[];
};
