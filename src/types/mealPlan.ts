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
  shoppingBatches: ShoppingBatch[];
  costEstimate: CostEstimate;
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
  dailyShoppingList: ShoppingList;
};

export type MealItem = {
  /** Stable Vietnamese meal id used for matching / regeneration. */
  mealId?: string;
  /** Localized display name (English-first content, then Vietnamese). */
  name: string;
  reason: string;
  nutrients: string[];
  portionGram: number;
  estimatedCalories: number;
  /** Estimated cost in the plan's local currency (see costEstimate.currency). */
  estimatedCost: number;
  /** @deprecated Prefer estimatedCost; kept for older saved plans. */
  estimatedCostVnd?: number;
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

export type ShoppingBatch = {
  label: string;
  days: number[];
  shoppingList: ShoppingList;
  freshnessNote: string;
  /** Estimated cost in the plan's local currency (see costEstimate.currency). */
  estimatedCost: number;
  /** @deprecated Prefer estimatedCost; kept for older saved plans. */
  estimatedCostVnd?: number;
};

export type CostEstimate = {
  countryCode: string;
  currency: string;
  sourceNames: string[];
  updatedAt: string;
  note: string;
};
