import type { Locale } from "@/lib/i18n";
import type { MealItem, MealPlan, ShoppingList } from "@/types/mealPlan";
import { findMealRecordByName } from "./mealDatabase";
import { getCountryPricing } from "./countries";
import { localizeIngredientList, localizeMealText, resolveMealId } from "./mealLocales";
import {
  ENGLISH_MEDICAL_DISCLAIMER,
  getConditionSpecificWarnings,
  getGeneralPregnancyFoodWarnings,
  MEDICAL_DISCLAIMER
} from "./safetyRules";

export const MAX_SPECIAL_NOTES = 8;
export const MAX_SPECIAL_NOTE_CHARS = 240;

function textOfNote(note: unknown): string | null {
  if (typeof note === "string") return note;
  if (!note || typeof note !== "object") return null;
  const text = (note as { text?: unknown }).text;
  return typeof text === "string" ? text : null;
}

function cleanNoteStrings(notes: unknown, limit = Number.POSITIVE_INFINITY): string[] {
  if (!Array.isArray(notes)) return [];
  const clean: string[] = [];
  const seen = new Set<string>();
  for (const note of notes) {
    const raw = textOfNote(note);
    if (!raw) continue;
    const text = raw.trim().replace(/\s+/g, " ").slice(0, MAX_SPECIAL_NOTE_CHARS);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    clean.push(text);
    if (clean.length >= limit) break;
  }
  return clean;
}

/** Keep only short strings so a model payload cannot crash the result page. */
export function sanitizeSpecialNotes(notes: unknown, limit = MAX_SPECIAL_NOTES): string[] {
  return cleanNoteStrings(notes, limit);
}

/**
 * Re-apply display language for a saved plan.
 * English is authored first; Vietnamese locale must always show Vietnamese meal copy.
 */
export function localizeMealPlanForLocale(plan: MealPlan, locale: Locale): MealPlan {
  const days = plan.days.map((day) => {
    const breakfast = localizeStoredMealItem(day.breakfast, locale);
    const morningSnack = localizeStoredMealItem(day.morningSnack, locale);
    const lunch = localizeStoredMealItem(day.lunch, locale);
    const afternoonSnack = localizeStoredMealItem(day.afternoonSnack, locale);
    const dinner = localizeStoredMealItem(day.dinner, locale);
    const dayMeals = [breakfast, morningSnack, lunch, afternoonSnack, dinner]
      .map((item) => findMealRecordByName(item.mealId ?? resolveMealId(item.name) ?? item.name))
      .filter(Boolean);

    return {
      ...day,
      breakfast,
      morningSnack,
      lunch,
      afternoonSnack,
      dinner,
      hydrationNote:
        locale === "vi"
          ? "Uống nước đều trong ngày; thêm trái cây tươi nguyên miếng nếu không có chống chỉ định."
          : "Drink water steadily through the day; add whole fresh fruit if you have no contraindication.",
      dailyShoppingList: localizeShoppingListFromRecords(
        dayMeals as NonNullable<(typeof dayMeals)[number]>[],
        day.dailyShoppingList,
        locale
      )
    };
  });

  const allRecords = days
    .flatMap((day) => [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner])
    .map((item) => findMealRecordByName(item.mealId ?? resolveMealId(item.name) ?? item.name))
    .filter(Boolean) as NonNullable<ReturnType<typeof findMealRecordByName>>[];

  const country = getCountryPricing(plan.costEstimate?.countryCode ?? plan.profileSnapshot.residenceCountry);
  const profile = plan.profileSnapshot;

  const batchRanges =
    locale === "vi"
      ? [
          { label: "Ngày 1-2", days: [1, 2], freshnessNote: "Ưu tiên mua rau lá, trái cây mềm, thịt/cá dùng trong 1-2 ngày đầu." },
          { label: "Ngày 3-4", days: [3, 4], freshnessNote: "Mua bổ sung đồ tươi giữa tuần; kiểm tra hạn dùng sữa chua, sữa tiệt trùng và đậu hũ." },
          { label: "Ngày 5-7", days: [5, 6, 7], freshnessNote: "Mua đợt cuối cho 3 ngày; thịt/cá nên chia phần nhỏ, bảo quản lạnh đúng cách nếu chưa nấu ngay." }
        ]
      : [
          { label: "Days 1-2", days: [1, 2], freshnessNote: "Prioritize leafy greens, soft fruit and meat or fish for the first 1-2 days." },
          { label: "Days 3-4", days: [3, 4], freshnessNote: "Refresh midweek groceries and check dates on yogurt, pasteurized milk and tofu." },
          { label: "Days 5-7", days: [5, 6, 7], freshnessNote: "Buy the final 3-day batch; divide meat or fish into packs and refrigerate properly if not cooking right away." }
        ];

  const shoppingBatches = (plan.shoppingBatches?.length ? plan.shoppingBatches : []).map((batch, index) => {
    const range =
      batchRanges.find((item) => item.days.join("-") === batch.days.join("-")) ??
      batchRanges[Math.min(index, batchRanges.length - 1)];
    const batchRecords = days
      .filter((day) => batch.days.includes(day.day))
      .flatMap((day) => [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner])
      .map((item) => findMealRecordByName(item.mealId ?? resolveMealId(item.name) ?? item.name))
      .filter(Boolean) as NonNullable<ReturnType<typeof findMealRecordByName>>[];

    return {
      ...batch,
      label: range.label,
      freshnessNote: range.freshnessNote,
      shoppingList: localizeShoppingListFromRecords(batchRecords, batch.shoppingList, locale)
    };
  });

  return {
    ...plan,
    days,
    shoppingList: localizeShoppingListFromRecords(allRecords, plan.shoppingList, locale),
    shoppingBatches,
    summary: {
      ...plan.summary,
      message: localizeSummaryMessage(plan, locale),
      disclaimer: locale === "vi" ? MEDICAL_DISCLAIMER : ENGLISH_MEDICAL_DISCLAIMER
    },
    costEstimate: {
      ...plan.costEstimate,
      countryCode: plan.costEstimate?.countryCode ?? country.code,
      currency: plan.costEstimate?.currency ?? country.currency,
      sourceNames: plan.costEstimate?.sourceNames?.length ? plan.costEstimate.sourceNames : [...country.sources],
      updatedAt: plan.costEstimate?.updatedAt ?? country.updatedAt,
      note: country.note[locale]
    },
    safetyWarnings: [...getGeneralPregnancyFoodWarnings(locale), ...getConditionSpecificWarnings(profile, locale)],
    specialNotes: localizeSpecialNotes(plan.specialNotes, profile, locale),
    urgentWarnings: localizeUrgentWarnings(plan.urgentWarnings, locale)
  };
}

function localizeSummaryMessage(plan: MealPlan, locale: Locale): string {
  const profile = plan.profileSnapshot;
  const status = plan.summary.weightGainStatus;

  if (profile.lifeStage === "postpartum") {
    const months = profile.babyAgeMonths ?? 0;
    return locale === "en"
      ? `Postpartum mode (${months} months): family-friendly Vietnamese meals with gentle nutrition reminders.`
      : `Chế độ sau sinh (${months} tháng): gợi ý món Việt phù hợp gia đình, ưu tiên dinh dưỡng nhẹ nhàng.`;
  }

  if (locale === "en") {
    if (status === "low") {
      return "The gain is below the reference range. The plan will prioritize protein-rich, nutrient-dense and easy-to-eat meals.";
    }
    if (status === "high") {
      return "The gain is above the reference range. The plan will prioritize vegetables, lean protein and slow-digesting carbohydrates while keeping meals balanced.";
    }
    if (status === "normal") {
      return "Your indicators are within the reference range. The plan suggests balanced, practical meals for this pregnancy week.";
    }
    return "There is not enough data to assess the gain. The meal plan is still generated from the information you entered.";
  }

  if (status === "low") return "Mức tăng cân đang thấp hơn khoảng tham khảo. Mình sẽ ưu tiên bữa giàu đạm, năng lượng lành mạnh và dễ ăn.";
  if (status === "high") return "Mức tăng cân đang cao hơn khoảng tham khảo. Mình sẽ ưu tiên rau, đạm nạc và tinh bột chậm, vẫn giữ bữa ăn đủ chất.";
  if (status === "normal") return "Các chỉ số đang nằm trong khoảng tham khảo. Mình sẽ gợi ý thực đơn cân bằng, dễ nấu và phù hợp tuần thai.";
  return "Mình chưa có đủ dữ liệu để đánh giá tăng cân. Thực đơn vẫn được tạo theo thông tin bạn đã nhập.";
}

function localizeUrgentWarnings(warnings: string[] | undefined, locale: Locale): string[] | undefined {
  if (!warnings?.length) return warnings;
  if (locale === "vi") {
    const vi = warnings.filter((note) => looksVietnamese(note));
    return vi.length ? vi : warnings;
  }
  const en = warnings.filter((note) => !looksVietnamese(note));
  return en.length ? en : warnings;
}

function localizeStoredMealItem(item: MealItem, locale: Locale): MealItem {
  const mealId = item.mealId ?? resolveMealId(item.name) ?? item.name;
  const record = findMealRecordByName(mealId);
  const localized = localizeMealText(mealId, locale, {
    reason: record?.reason ?? item.reason,
    nutrients: record?.nutrients ?? item.nutrients,
    caution: record?.caution ?? item.caution
  });

  const alternatives = (item.alternatives ?? []).map((alt) => {
    const altId = resolveMealId(alt) ?? alt;
    const altRecord = findMealRecordByName(altId);
    return localizeMealText(altId, locale, {
      reason: altRecord?.reason ?? "",
      nutrients: altRecord?.nutrients ?? []
    }).name;
  });

  return {
    ...item,
    mealId,
    name: localized.name,
    reason: localized.reason,
    nutrients: localized.nutrients,
    caution: localized.caution,
    alternatives
  };
}

function localizeShoppingListFromRecords(
  records: NonNullable<ReturnType<typeof findMealRecordByName>>[],
  fallback: ShoppingList,
  locale: Locale
): ShoppingList {
  if (records.length === 0) {
    return {
      proteins: localizeIngredientList(fallback.proteins, locale),
      vegetables: localizeIngredientList(fallback.vegetables, locale),
      fruits: localizeIngredientList(fallback.fruits, locale),
      dairy: localizeIngredientList(fallback.dairy, locale),
      grains: localizeIngredientList(fallback.grains, locale),
      others: localizeIngredientList(fallback.others, locale)
    };
  }

  const shoppingList: ShoppingList = { proteins: [], vegetables: [], fruits: [], dairy: [], grains: [], others: [] };
  for (const meal of records) {
    for (const key of Object.keys(shoppingList) as (keyof ShoppingList)[]) {
      shoppingList[key].push(...(meal.ingredients[key] ?? []));
    }
  }

  return {
    proteins: localizeIngredientList(uniqueSorted(shoppingList.proteins), locale),
    vegetables: localizeIngredientList(uniqueSorted(shoppingList.vegetables), locale),
    fruits: localizeIngredientList(uniqueSorted(shoppingList.fruits), locale),
    dairy: localizeIngredientList(uniqueSorted(shoppingList.dairy), locale),
    grains: localizeIngredientList(uniqueSorted(shoppingList.grains), locale),
    others: localizeIngredientList(uniqueSorted(shoppingList.others), locale)
  };
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

/** Notes that can be shown for this locale. The 8-note cap is applied after the language filter. */
export function filterNotesForLocale(notes: readonly string[], locale: Locale): string[] {
  const clean = sanitizeSpecialNotes([...notes], Number.POSITIVE_INFINITY);
  const localized = locale === "vi" ? clean.filter((note) => looksVietnamese(note)) : clean.filter((note) => !looksVietnamese(note));
  return localized.slice(0, MAX_SPECIAL_NOTES);
}

function localizeSpecialNotes(notes: unknown, profile: MealPlan["profileSnapshot"], locale: Locale): string[] {
  const warnings = cleanNoteStrings(getConditionSpecificWarnings(profile, locale));
  const warningSet = new Set(warnings);
  const incoming = cleanNoteStrings(notes).filter((note) => !warningSet.has(note));
  const kept = filterNotesForLocale(incoming, locale);
  return [...new Set([...warnings, ...kept])];
}

function looksVietnamese(text: string): boolean {
  return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(text);
}
