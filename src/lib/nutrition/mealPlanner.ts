import type { MealItem, MealPlan, MealPlanDay, ShoppingList } from "@/types/mealPlan";
import type { CuisinePreference, HealthCondition, NutritionGoal, PregnancyProfile } from "@/types/pregnancy";
import type { Locale } from "@/lib/i18n";
import { calculateBmi, getBmiCategory } from "./bmi";
import { breakfastMeals, mainMeals, type MealRecord, type MealTag, snackMeals } from "./mealDatabase";
import {
  detectUrgentWarnings,
  ENGLISH_MEDICAL_DISCLAIMER,
  getConditionSpecificWarnings,
  getGeneralPregnancyFoodWarnings,
  MEDICAL_DISCLAIMER
} from "./safetyRules";
import { estimateShoppingListCostVnd, groceryPriceGuideUpdatedAt, groceryPriceNote, groceryPriceSources } from "./priceGuide";
import { getWeightGainStatus } from "./weightGain";

type PoolName = "breakfast" | "main" | "snack";

export function ruleBasedMealPlanner(profile: PregnancyProfile, locale: Locale = "vi"): MealPlan {
  const bmi = calculateBmi(profile.prePregnancyWeightKg, profile.heightCm);
  const bmiCategory = getBmiCategory(bmi);
  const weightGainKg = Number((profile.currentWeightKg - profile.prePregnancyWeightKg).toFixed(1));
  const weightGainStatus = getWeightGainStatus({ currentGainKg: weightGainKg, pregnancyWeek: profile.pregnancyWeek, bmiCategory });
  const used = new Set<string>();

  const days = Array.from({ length: 7 }, (_, index) => {
    const breakfast = chooseMeal("breakfast", profile, used, index);
    const morningSnack = chooseMeal("snack", profile, used, index + 1);
    const lunch = chooseMeal("main", profile, used, index * 2);
    const afternoonSnack = chooseMeal("snack", profile, used, index + 8);
    const dinner = chooseMeal("main", profile, used, index * 2 + 1);

    const dayItems = [breakfast, morningSnack, lunch, afternoonSnack, dinner];

    return {
      day: index + 1,
      breakfast: toMealItem(breakfast, "breakfast", profile),
      morningSnack: toMealItem(morningSnack, "snack", profile),
      lunch: toMealItem(lunch, "main", profile),
      afternoonSnack: toMealItem(afternoonSnack, "snack", profile),
      dinner: toMealItem(dinner, "main", profile),
      hydrationNote:
        locale === "vi"
          ? "Uống nước đều trong ngày; thêm trái cây tươi nguyên miếng nếu không có chống chỉ định."
          : "Drink water steadily through the day; add whole fresh fruit if you have no contraindication.",
      dailyShoppingList: buildShoppingList(dayItems.map((meal) => toMealItem(meal, "main", profile)))
    };
  });

  return {
    id: createPlanId(),
    createdAt: new Date().toISOString(),
    profileSnapshot: profile,
    summary: {
      bmi,
      bmiCategory,
      weightGainKg: Number.isFinite(weightGainKg) ? weightGainKg : null,
      weightGainStatus,
      message: buildSummaryMessage(weightGainStatus, locale),
      disclaimer: locale === "vi" ? MEDICAL_DISCLAIMER : ENGLISH_MEDICAL_DISCLAIMER
    },
    days,
    shoppingList: buildShoppingList(days.flatMap((day) => [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner])),
    shoppingBatches: buildShoppingBatches(days, locale),
    costEstimate: {
      sourceNames: [...groceryPriceSources],
      updatedAt: groceryPriceGuideUpdatedAt,
      note: groceryPriceNote
    },
    safetyWarnings: [...getGeneralPregnancyFoodWarnings(locale), ...getConditionSpecificWarnings(profile, locale)],
    specialNotes: getConditionSpecificWarnings(profile, locale),
    urgentWarnings: detectUrgentWarnings(profile, locale)
  };
}

function buildShoppingBatches(days: MealPlan["days"], locale: Locale): MealPlan["shoppingBatches"] {
  const ranges =
    locale === "vi"
      ? [
          { label: "Ngày 1-2", days: [1, 2], freshnessNote: "Ưu tiên mua rau lá, trái cây mềm, thịt/cá dùng trong 1-2 ngày đầu." },
          { label: "Ngày 3-4", days: [3, 4], freshnessNote: "Mua bổ sung đồ tươi giữa tuần; kiểm tra hạn dùng sữa chua, sữa tiệt trùng và đậu hũ." },
          { label: "Ngày 5-7", days: [5, 6, 7], freshnessNote: "Mua đợt cuối cho 3 ngày; thịt/cá nên chia phần nhỏ, bảo quản lạnh đúng cách nếu chưa nấu ngay." }
        ]
      : [
          { label: "Days 1-2", days: [1, 2], freshnessNote: "Prioritize leafy greens, soft fruit and meat or fish for the first 1-2 days." },
          { label: "Days 3-4", days: [3, 4], freshnessNote: "Refresh midweek groceries and check dates on yogurt, pasteurized milk and tofu." },
          { label: "Days 5-7", days: [5, 6, 7], freshnessNote: "Buy the final 3-day batch; portion meat or fish and refrigerate properly if not cooking right away." }
        ];

  return ranges.map((range) => {
    const selectedDays = days.filter((day) => range.days.includes(day.day));
    return {
      ...range,
      shoppingList: mergeShoppingLists(selectedDays.map((day) => day.dailyShoppingList)),
      estimatedCostVnd: estimateShoppingListCostVnd(mergeShoppingLists(selectedDays.map((day) => day.dailyShoppingList)))
    };
  });
}

function mergeShoppingLists(lists: MealPlan["shoppingList"][]): MealPlan["shoppingList"] {
  return {
    proteins: uniqueSorted(lists.flatMap((list) => list.proteins)),
    vegetables: uniqueSorted(lists.flatMap((list) => list.vegetables)),
    fruits: uniqueSorted(lists.flatMap((list) => list.fruits)),
    dairy: uniqueSorted(lists.flatMap((list) => list.dairy)),
    grains: uniqueSorted(lists.flatMap((list) => list.grains)),
    others: uniqueSorted(lists.flatMap((list) => list.others))
  };
}

function chooseMeal(pool: PoolName, profile: PregnancyProfile, used: Set<string>, offset: number): MealRecord {
  const source = pool === "breakfast" ? breakfastMeals : pool === "snack" ? snackMeals : mainMeals;
  const filtered = source
    .filter((meal) => isAllowedByPreferences(meal, profile))
    .sort((a, b) => scoreMeal(b, profile) - scoreMeal(a, profile));

  const candidates = filtered.length > 0 ? filtered : source;
  const firstUnused = candidates.find((meal) => !used.has(meal.name));
  const selected = firstUnused ?? candidates[offset % candidates.length];
  used.add(selected.name);
  return selected;
}

function scoreMeal(meal: MealRecord, profile: PregnancyProfile): number {
  const conditions = profile.healthConditions.filter((condition) => condition !== "none");
  let score = 0;

  for (const condition of conditions) {
    const tag = conditionToTag(condition);
    if (tag && meal.tags.includes(tag)) score += 3;
  }
  for (const goal of profile.goals) {
    if (goalToTags(goal).some((tag) => meal.tags.includes(tag))) score += 2;
  }
  const budgetTag = `budget_${profile.budget}` as MealTag;
  if (meal.tags.includes(budgetTag)) score += 2;
  if (profile.cookingTime === "under_15" && meal.tags.includes("quick")) score += 2;
  if (profile.cookingTime === "meal_prep" && meal.tags.includes("meal_prep")) score += 2;
  if (profile.cuisinePreferences.includes("vegetarian") && meal.tags.includes("vegetarian")) score += 5;

  return score;
}

function isAllowedByPreferences(meal: MealRecord, profile: PregnancyProfile): boolean {
  const text = JSON.stringify([meal.name, meal.ingredients, meal.nutrients]).toLowerCase();
  const preferences = new Set<CuisinePreference>(profile.cuisinePreferences);
  const blockedTerms = splitFreeText(`${profile.allergies ?? ""},${profile.dislikedFoods ?? ""}`);

  if (preferences.has("vegetarian") && !meal.tags.includes("vegetarian")) return false;
  if (preferences.has("no_fish") && !meal.tags.includes("no_fish_safe")) return false;
  if (preferences.has("no_beef") && !meal.tags.includes("no_beef_safe")) return false;
  if (preferences.has("no_seafood") && !meal.tags.includes("no_seafood_safe")) return false;
  if (blockedTerms.some((term) => term.length >= 2 && text.includes(term))) return false;

  return true;
}

function conditionToTag(condition: HealthCondition): MealTag | null {
  if (condition === "morning_sickness" || condition === "constipation" || condition === "anemia" || condition === "gestational_diabetes") {
    return condition;
  }
  if (condition === "fast_weight_gain" || condition === "large_fetus") return "gestational_diabetes";
  if (condition === "slow_weight_gain" || condition === "small_fetus") return "budget_high";
  return null;
}

function goalToTags(goal: NutritionGoal): MealTag[] {
  const tags: Record<NutritionGoal, MealTag[]> = {
    balanced: ["budget_medium"],
    weight_control: ["gestational_diabetes"],
    healthy_weight_gain: ["budget_high"],
    reduce_nausea: ["morning_sickness"],
    blood_sugar_control: ["gestational_diabetes"],
    relieve_constipation: ["constipation"],
    increase_iron_calcium_protein: ["anemia"]
  };

  return tags[goal];
}

function toMealItem(meal: MealRecord, pool: PoolName, profile: PregnancyProfile): MealItem {
  const source = pool === "breakfast" ? breakfastMeals : pool === "snack" ? snackMeals : mainMeals;
  const alternatives = source
    .filter((candidate) => candidate.name !== meal.name && isAllowedByPreferences(candidate, profile))
    .slice(0, 2)
    .map((candidate) => candidate.name);

  return {
    name: meal.name,
    reason: meal.reason,
    nutrients: meal.nutrients,
    portionGram: meal.portionGram,
    estimatedCalories: meal.estimatedCalories,
    estimatedCostVnd: meal.estimatedCostVnd,
    alternatives,
    caution: meal.caution
  };
}

function buildShoppingList(items: MealItem[]): ShoppingList {
  const allMeals = [...breakfastMeals, ...mainMeals, ...snackMeals];
  const shoppingList: ShoppingList = { proteins: [], vegetables: [], fruits: [], dairy: [], grains: [], others: [] };

  for (const item of items) {
    const meal = allMeals.find((candidate) => candidate.name === item.name);
    if (!meal) continue;
    for (const key of Object.keys(shoppingList) as (keyof ShoppingList)[]) {
      shoppingList[key].push(...(meal.ingredients[key] ?? []));
    }
  }

  return Object.fromEntries(
    Object.entries(shoppingList).map(([key, values]) => [key, uniqueSorted(values)])
  ) as ShoppingList;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function splitFreeText(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createPlanId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `plan-${Date.now()}`;
}

function buildSummaryMessage(status: MealPlan["summary"]["weightGainStatus"], locale: Locale) {
  if (locale === "en") {
    if (status === "low") return "Weight gain is below the reference range. The plan will prioritize protein-rich, nutrient-dense and easy-to-eat meals.";
    if (status === "high") return "Weight gain is above the reference range. The plan will prioritize vegetables, lean protein and slow-digesting carbohydrates while keeping meals balanced.";
    if (status === "normal") return "Your indicators are within the reference range. The plan suggests balanced, practical meals for this pregnancy week.";
    return "There is not enough data to assess weight gain. The meal plan is still generated from the information you entered.";
  }

  if (status === "low") return "Mức tăng cân đang thấp hơn khoảng tham khảo. Mình sẽ ưu tiên bữa giàu đạm, năng lượng lành mạnh và dễ ăn.";
  if (status === "high") return "Mức tăng cân đang cao hơn khoảng tham khảo. Mình sẽ ưu tiên rau, đạm nạc và tinh bột chậm, vẫn giữ bữa ăn đủ chất.";
  if (status === "normal") return "Các chỉ số đang nằm trong khoảng tham khảo. Mình sẽ gợi ý thực đơn cân bằng, dễ nấu và phù hợp tuần thai.";
  return "Mình chưa có đủ dữ liệu để đánh giá tăng cân. Thực đơn vẫn được tạo theo thông tin bạn đã nhập.";
}

export type MealSlot = keyof Pick<MealPlanDay, "breakfast" | "morningSnack" | "lunch" | "afternoonSnack" | "dinner">;

/** Swap a single meal in an existing plan while keeping other days/meals. */
export function regenerateMealInPlan(
  plan: MealPlan,
  profile: PregnancyProfile,
  dayNumber: number,
  mealSlot: MealSlot,
  locale: Locale = "vi"
): MealPlan {
  const used = new Set<string>();
  for (const day of plan.days) {
    for (const slot of ["breakfast", "morningSnack", "lunch", "afternoonSnack", "dinner"] as const) {
      if (day.day === dayNumber && slot === mealSlot) continue;
      used.add(day[slot].name);
    }
  }
  used.add(plan.days.find((d) => d.day === dayNumber)?.[mealSlot].name ?? "");

  const pool: PoolName =
    mealSlot === "breakfast" ? "breakfast" : mealSlot === "morningSnack" || mealSlot === "afternoonSnack" ? "snack" : "main";
  const replacement = chooseMeal(pool, profile, used, dayNumber);

  const days = plan.days.map((day) => {
    if (day.day !== dayNumber) return day;
    const nextDay = { ...day, [mealSlot]: toMealItem(replacement, pool, profile) };
    const dayMeals = [nextDay.breakfast, nextDay.morningSnack, nextDay.lunch, nextDay.afternoonSnack, nextDay.dinner];
    return { ...nextDay, dailyShoppingList: buildShoppingList(dayMeals) };
  });

  return {
    ...plan,
    profileSnapshot: profile,
    days,
    shoppingList: buildShoppingList(days.flatMap((day) => [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner])),
    shoppingBatches: buildShoppingBatches(days, locale)
  };
}
