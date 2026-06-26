"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Printer, RefreshCcw, Save } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { TrustedSources } from "@/components/shared/TrustedSources";
import { NutrientGuidancePanel } from "@/components/result/NutrientGuidancePanel";
import { bmiCategoryLabels } from "@/lib/nutrition/bmi";
import { weightGainStatusLabels } from "@/lib/nutrition/weightGain";
import { getCurrentMealPlan, saveMealPlan } from "@/lib/storage/localStorage";
import { fetchMealPlan } from "@/lib/nutrition/fetchMealPlan";
import type { MealSlot } from "@/lib/nutrition/mealPlanner";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { MealItem, MealPlan } from "@/types/mealPlan";

/** Thực đơn dinh dưỡng là khẩu phần 1 người; khi quy đổi đi chợ cho trẻ, mỗi trẻ ~ phần nhỏ hơn người lớn. */
const CHILD_PORTION_FACTOR = 0.55;
const ADULTS_IN_COUPLE = 2;

type ShoppingGroupKey = keyof MealPlan["shoppingList"];

const groupLabels: Record<ShoppingGroupKey, string> = {
  proteins: "Thịt / cá / trứng / đậu",
  vegetables: "Rau củ",
  fruits: "Trái cây",
  dairy: "Sữa / sữa chua / phô mai tiệt trùng",
  grains: "Ngũ cốc / tinh bột",
  others: "Gia vị / khác"
} as const;

const englishGroupLabels: Record<ShoppingGroupKey, string> = {
  proteins: "Meat / fish / eggs / beans",
  vegetables: "Vegetables",
  fruits: "Fruits",
  dairy: "Pasteurized milk / yogurt / cheese",
  grains: "Grains / starches",
  others: "Seasonings / other"
};

const englishBmiCategoryLabels: typeof bmiCategoryLabels = {
  underweight: "Underweight",
  normal: "Normal",
  overweight: "Overweight",
  obese: "Obese",
  unknown: "Not enough data"
};

const englishWeightGainStatusLabels: typeof weightGainStatusLabels = {
  low: "Below reference range",
  normal: "Within reference range",
  high: "Above reference range",
  unknown: "Not enough data"
};

const copy = {
  vi: {
    emptyTitle: "Chưa có thực đơn",
    emptyDescription:
      "Bạn hãy tạo thực đơn mới. Kết quả sẽ được lưu trên trình duyệt và có thể mở lại trong lịch sử.",
    overview: "Tổng quan tham khảo",
    titlePrefix: "Thực đơn tuần thai",
    saved: "Đã lưu",
    save: "Lưu thực đơn",
    print: "In thực đơn",
    regenerate: "Tạo lại",
    bmi: "BMI trước mang thai",
    bmiGroup: "Nhóm BMI",
    gained: "Đã tăng",
    status: "Đánh giá",
    noData: "Chưa đủ dữ liệu",
    medicalAttention: "Cần lưu ý y tế",
    sevenDay: "Thực đơn 7 ngày",
    byDay: "Xem theo từng ngày",
    day: "Ngày",
    aboutCalories: "khoảng",
    calories: "kcal",
    estimatedLater: "ước tính sẽ có khi tạo lại",
    onePersonMealCost: "Chi phí món (1 người)",
    tabLabel: "Chọn ngày thực đơn",
    meals: ["Bữa sáng", "Bữa phụ sáng", "Bữa trưa", "Bữa phụ chiều", "Bữa tối"],
    hydration: "Nước uống / trái cây",
    estimateNote:
      "Ước tính khẩu phần và calorie chỉ để tham khảo, có thể thay đổi theo cách nấu và lượng ăn thực tế.",
    freshShopping: "Lịch đi chợ tươi ngon",
    shoppingTitle: "Ưu tiên mua theo 2-3 ngày/lần",
    shoppingIntro:
      "Rau lá, thịt, cá, đậu hũ và trái cây mềm nên mua thành nhiều đợt nhỏ để giữ độ tươi. Đồ khô như gạo, yến mạch, hạt và gia vị có thể chuẩn bị trước.",
    sourcePrefix: "Nguồn giá tham khảo",
    safety: "Cảnh báo an toàn",
    specialNotes: "Ghi chú theo tình trạng đặc biệt",
    noSpecial: "Chưa có tình trạng đặc biệt được chọn.",
    edit: "Quay lại chỉnh thông tin",
    mainGroup: "Nhóm chính",
    alternative: "Thay thế",
    caution: "Lưu ý",
    estimate: "Ước tính",
    swapMeal: "Đổi món",
    swapping: "Đang đổi...",
    dailyShoppingTitle: "Danh sách nguyên liệu riêng cho ngày này",
    dailyShoppingText:
      "Dùng để kiểm tra nhanh khi nấu ngày đang chọn. Phần bên dưới gom lại thành lịch đi chợ 2-3 ngày/lần.",
    noItems: "Không có món trong nhóm này."
  },
  en: {
    emptyTitle: "No meal plan yet",
    emptyDescription:
      "Create a new meal plan first. The result will be saved in this browser and can be reopened from history.",
    overview: "Reference overview",
    titlePrefix: "Meal plan for pregnancy week",
    saved: "Saved",
    save: "Save plan",
    print: "Print plan",
    regenerate: "Create again",
    bmi: "Pre-pregnancy BMI",
    bmiGroup: "BMI group",
    gained: "Weight gained",
    status: "Assessment",
    noData: "Not enough data",
    medicalAttention: "Medical notes to watch",
    sevenDay: "7-day meal plan",
    byDay: "View by day",
    day: "Day",
    aboutCalories: "about",
    calories: "kcal",
    estimatedLater: "estimate will appear after regenerating",
    onePersonMealCost: "Meal cost (1 person)",
    tabLabel: "Choose meal-plan day",
    meals: ["Breakfast", "Morning snack", "Lunch", "Afternoon snack", "Dinner"],
    hydration: "Water / fruit",
    estimateNote:
      "Portion and calorie estimates are references only and may vary by recipe and actual serving size.",
    freshShopping: "Fresh grocery schedule",
    shoppingTitle: "Shop every 2-3 days when possible",
    shoppingIntro:
      "Leafy greens, meat, fish, tofu and soft fruit are best bought in smaller batches to stay fresh. Dry goods such as rice, oats, nuts and seasonings can be prepared ahead.",
    sourcePrefix: "Reference price sources",
    safety: "Food-safety warnings",
    specialNotes: "Notes for selected conditions",
    noSpecial: "No special condition was selected.",
    edit: "Edit information",
    mainGroup: "Main nutrients",
    alternative: "Alternatives",
    caution: "Note",
    estimate: "Estimate",
    swapMeal: "Swap meal",
    swapping: "Swapping...",
    dailyShoppingTitle: "Ingredients for this day",
    dailyShoppingText:
      "Use this for a quick cooking check for the selected day. The section below groups ingredients into 2-3 day grocery batches.",
    noItems: "No items in this group."
  }
} as const;

type ResultCopy = (typeof copy)[Locale];
type ShoppingGroupLabels = Record<ShoppingGroupKey, string>;

export function MealPlanResult({ locale = "vi" }: { locale?: Locale }) {
  const t = copy[locale];
  const groups = locale === "vi" ? groupLabels : englishGroupLabels;
  const bmiLabels = locale === "vi" ? bmiCategoryLabels : englishBmiCategoryLabels;
  const weightLabels = locale === "vi" ? weightGainStatusLabels : englishWeightGainStatusLabels;
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [childrenEatingCount, setChildrenEatingCount] = useState(0);
  const [swappingSlot, setSwappingSlot] = useState<MealSlot | null>(null);

  useEffect(() => {
    setPlan(getCurrentMealPlan());
  }, []);

  async function handleSwapMeal(mealSlot: MealSlot) {
    if (!plan) return;
    const day = plan.days[activeDayIndex]?.day ?? 1;
    setSwappingSlot(mealSlot);
    try {
      const next = await fetchMealPlan(plan.profileSnapshot, locale, {
        regenerate: { day, mealSlot, existingPlan: plan }
      });
      setPlan(next);
      saveMealPlan(next);
      setSaved(true);
    } finally {
      setSwappingSlot(null);
    }
  }

  if (!plan) {
    return <EmptyState locale={locale} title={t.emptyTitle} description={t.emptyDescription} />;
  }

  function handleSave() {
    if (!plan) return;
    saveMealPlan(plan);
    setSaved(true);
  }

  const activeDay = plan.days[activeDayIndex] ?? plan.days[0];
  const dayMeals = [activeDay.breakfast, activeDay.morningSnack, activeDay.lunch, activeDay.afternoonSnack, activeDay.dinner];
  const dayCalories = dayMeals.reduce(
    (total, item) => total + (item.estimatedCalories ?? 0),
    0
  );
  const dayCost = dayMeals.reduce((total, item) => total + (item.estimatedCostVnd ?? 0), 0);
  const shoppingBatches = plan.shoppingBatches?.length ? plan.shoppingBatches : buildFallbackShoppingBatches(plan);
  const weeklyShopOnePerson = shoppingBatches.reduce((total, batch) => total + (batch.estimatedCostVnd ?? 0), 0);
  const weeklyShopCouple = Math.round(weeklyShopOnePerson * ADULTS_IN_COUPLE);
  const weeklyShopChildren = Math.round(weeklyShopOnePerson * CHILD_PORTION_FACTOR * childrenEatingCount);
  const weeklyHouseholdTotal = weeklyShopCouple + weeklyShopChildren;
  const dayCostCouple = Math.round(dayCost * ADULTS_IN_COUPLE);
  const dayCostChildren = Math.round(dayCost * CHILD_PORTION_FACTOR * childrenEatingCount);
  const dayHouseholdTotal = dayCostCouple + dayCostChildren;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t.overview}</p>
            <h1 className="mt-1 text-2xl font-semibold">{t.titlePrefix} {plan.profileSnapshot.pregnancyWeek}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{plan.summary.message}</p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleSave}>
              <Save className="h-4 w-4" /> {saved ? t.saved : t.save}
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> {t.print}
            </Button>
            <Button asChild>
              <Link href={localizedPath(locale, "/planner")}>
                <RefreshCcw className="h-4 w-4" /> {t.regenerate}
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={t.bmi} value={plan.summary.bmi?.toString() ?? t.noData} />
          <Metric label={t.bmiGroup} value={bmiLabels[plan.summary.bmiCategory]} />
          <Metric label={t.gained} value={plan.summary.weightGainKg === null ? t.noData : `${plan.summary.weightGainKg} kg`} />
          <Metric label={t.status} value={weightLabels[plan.summary.weightGainStatus]} />
        </div>
      </section>

      {plan.urgentWarnings && plan.urgentWarnings.length > 0 && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <h2 className="font-semibold">{t.medicalAttention}</h2>
          {plan.urgentWarnings.map((warning) => (
            <p key={warning} className="mt-2">
              {warning}
            </p>
          ))}
        </section>
      )}

      <section className="rounded-lg border border-border bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-accent">{t.sevenDay}</p>
            <h2 className="mt-1 text-xl font-semibold">{t.byDay}</h2>
          </div>
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {t.day} {activeDay.day}: {dayCalories > 0 ? `${t.aboutCalories} ${dayCalories} ${t.calories}` : t.estimatedLater}
            {dayCost > 0 ? ` · ${t.onePersonMealCost}: ${formatVnd(dayCost)}` : ""}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7" role="tablist" aria-label={t.tabLabel}>
          {plan.days.map((day, index) => (
            <button
              key={day.day}
              type="button"
              role="tab"
              aria-selected={activeDayIndex === index}
              onClick={() => setActiveDayIndex(index)}
              className={`min-h-11 rounded-md border px-2 text-sm font-semibold transition ${
                activeDayIndex === index ? "border-accent bg-accent text-accent-foreground" : "border-border bg-white hover:bg-muted"
              }`}
            >
              {t.day} {day.day}
            </button>
          ))}
        </div>

        <article className="mt-5">
          <div className="grid gap-3 md:grid-cols-2">
            <MealBlock copy={t} title={t.meals[0]} item={activeDay.breakfast} mealSlot="breakfast" swapping={swappingSlot === "breakfast"} onSwap={handleSwapMeal} />
            <MealBlock copy={t} title={t.meals[1]} item={activeDay.morningSnack} mealSlot="morningSnack" swapping={swappingSlot === "morningSnack"} onSwap={handleSwapMeal} />
            <MealBlock copy={t} title={t.meals[2]} item={activeDay.lunch} mealSlot="lunch" swapping={swappingSlot === "lunch"} onSwap={handleSwapMeal} />
            <MealBlock copy={t} title={t.meals[3]} item={activeDay.afternoonSnack} mealSlot="afternoonSnack" swapping={swappingSlot === "afternoonSnack"} onSwap={handleSwapMeal} />
            <MealBlock copy={t} title={t.meals[4]} item={activeDay.dinner} mealSlot="dinner" swapping={swappingSlot === "dinner"} onSwap={handleSwapMeal} />
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t.hydration}</p>
              <p className="mt-1 leading-6">{activeDay.hydrationNote}</p>
              <p className="mt-3 text-xs">{t.estimateNote}</p>
            </div>
          </div>
        </article>

        <DailyShoppingList copy={t} groups={groups} shoppingList={activeDay.dailyShoppingList ?? plan.shoppingList} />
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <p className="text-sm font-medium text-accent">{t.freshShopping}</p>
        <h2 className="mt-1 text-xl font-semibold">{t.shoppingTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {t.shoppingIntro}
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
          {t.sourcePrefix}: {plan.costEstimate?.sourceNames?.join(", ") ?? "Kingfoodmart, WinMart, GO!/BigC/Tops"}. {plan.costEstimate?.note ?? "Giá có thể thay đổi theo khu vực và khuyến mãi."}
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {shoppingBatches.map((batch) => (
            <div key={batch.label} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{batch.label}</h3>
                {batch.estimatedCostVnd > 0 && (
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold" title="Ước tính cho 1 người (mẹ)">
                    {formatVnd(batch.estimatedCostVnd)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{batch.freshnessNote}</p>
              <ShoppingListGroups copy={t} groups={groups} shoppingList={batch.shoppingList} />
            </div>
          ))}
        </div>

        <HouseholdCostSection
          weeklyShopOnePerson={weeklyShopOnePerson}
          weeklyShopCouple={weeklyShopCouple}
          weeklyShopChildren={weeklyShopChildren}
          weeklyHouseholdTotal={weeklyHouseholdTotal}
          dayCost={dayCost}
          dayCostCouple={dayCostCouple}
          dayCostChildren={dayCostChildren}
          dayHouseholdTotal={dayHouseholdTotal}
          activeDayNumber={activeDay.day}
          childrenEatingCount={childrenEatingCount}
          onChildrenCountChange={setChildrenEatingCount}
          locale={locale}
        />
      </section>

      <NutrientGuidancePanel locale={locale} />

      <section className="grid gap-5 md:grid-cols-2">
        <ListPanel title={t.safety} items={plan.safetyWarnings} />
        <ListPanel title={t.specialNotes} items={plan.specialNotes.length ? plan.specialNotes : [t.noSpecial]} />
      </section>

      <TrustedSources locale={locale} />
      <Disclaimer locale={locale} />
      <div className="no-print">
        <Button asChild variant="secondary">
          <Link href={localizedPath(locale, "/planner")}>{t.edit}</Link>
        </Button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function MealBlock({
  copy,
  title,
  item,
  mealSlot,
  swapping,
  onSwap
}: {
  copy: ResultCopy;
  title: string;
  item: MealItem;
  mealSlot: MealSlot;
  swapping: boolean;
  onSwap: (slot: MealSlot) => void;
}) {
  const hasEstimate = item.portionGram > 0 && item.estimatedCalories > 0;
  const hasCost = item.estimatedCostVnd > 0;

  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase text-accent">{title}</p>
        <Button type="button" variant="ghost" size="sm" className="no-print h-8 px-2 text-xs" disabled={swapping} onClick={() => onSwap(mealSlot)}>
          {swapping ? copy.swapping : copy.swapMeal}
        </Button>
      </div>
      <h4 className="mt-1 font-semibold">{item.name}</h4>
      {hasEstimate && (
        <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs font-medium text-foreground">
          {copy.estimate}: {item.portionGram} g · {item.estimatedCalories} kcal
          {hasCost ? ` · ${formatVnd(item.estimatedCostVnd)}` : ""}
        </p>
      )}
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.reason}</p>
      <p className="mt-2 text-xs text-muted-foreground">{copy.mainGroup}: {item.nutrients.join(", ")}</p>
      {item.alternatives && item.alternatives.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{copy.alternative}: {item.alternatives.join(" / ")}</p>}
      {item.caution && <p className="mt-2 text-xs text-warning">{copy.caution}: {item.caution}</p>}
    </div>
  );
}

function DailyShoppingList({ copy, groups, shoppingList }: { copy: ResultCopy; groups: ShoppingGroupLabels; shoppingList: MealPlan["shoppingList"] }) {
  return (
    <section className="mt-5 rounded-md bg-muted p-4">
      <h3 className="font-semibold">{copy.dailyShoppingTitle}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.dailyShoppingText}</p>
      <ShoppingListGroups copy={copy} groups={groups} shoppingList={shoppingList} />
    </section>
  );
}

function ShoppingListGroups({ copy, groups, shoppingList }: { copy: ResultCopy; groups: ShoppingGroupLabels; shoppingList: MealPlan["shoppingList"] }) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {Object.entries(groups).map(([key, label]) => {
        const items = shoppingList[key as keyof ShoppingGroupLabels];
        return (
          <div key={key}>
            <h4 className="text-sm font-medium">{label}</h4>
            {items.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{copy.noItems}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function buildFallbackShoppingBatches(plan: MealPlan): MealPlan["shoppingBatches"] {
  return [
    {
      label: "Ngày 1-2",
      days: [1, 2],
      shoppingList: plan.shoppingList,
      freshnessNote: "Thực đơn cũ chưa có lịch đi chợ theo đợt. Hãy tạo lại để có danh sách chính xác hơn."
      ,
      estimatedCostVnd: 0
    }
  ];
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value);
}

function HouseholdCostSection({
  weeklyShopOnePerson,
  weeklyShopCouple,
  weeklyShopChildren,
  weeklyHouseholdTotal,
  dayCost,
  dayCostCouple,
  dayCostChildren,
  dayHouseholdTotal,
  activeDayNumber,
  childrenEatingCount,
  onChildrenCountChange,
  locale
}: {
  weeklyShopOnePerson: number;
  weeklyShopCouple: number;
  weeklyShopChildren: number;
  weeklyHouseholdTotal: number;
  dayCost: number;
  dayCostCouple: number;
  dayCostChildren: number;
  dayHouseholdTotal: number;
  activeDayNumber: number;
  childrenEatingCount: number;
  onChildrenCountChange: (n: number) => void;
  locale: Locale;
}) {
  const household = {
    vi: {
      title: "Ước tính chi phí theo số người ăn",
      introStart: "Khẩu phần dinh dưỡng trong thực đơn là cho",
      mother: "một người (mẹ)",
      introMiddle: "Các mức chi phí dưới đây giúp quy đổi khi nấu chung:",
      couple: "Hai vợ chồng",
      introEnd: `tính ×2 so với một người; phần trẻ em tách riêng theo số con bạn nhập (mỗi trẻ ~${Math.round(CHILD_PORTION_FACTOR * 100)}% khẩu phần đi chợ ước lượng so với một người lớn).`,
      childrenLabel: "Số trẻ ăn cùng (cùng món gia đình)",
      weekTitle: "Đi chợ cả tuần (cộng các đợt)",
      dayTitle: `Ngày ${activeDayNumber} - chi phí món ước tính`,
      one: "1 người (mẹ)",
      coupleRow: "Hai vợ chồng (×2)",
      childrenPlaceholder: "Trẻ em (nhập số con ở trên)",
      children: "Trẻ em",
      totalWithChildren: "Tổng (hai người lớn + trẻ)",
      totalCouple: "Tổng (hai người lớn)",
      totalDayWithChildren: "Tổng ngày (hai người lớn + trẻ)",
      totalDayCouple: "Tổng ngày (hai người lớn)",
      note: "Đây chỉ là tham khảo; thực tế còn tùy món thừa, khuyến mãi và món thêm ngoài thực đơn."
    },
    en: {
      title: "Estimated cost by number of eaters",
      introStart: "The nutrition portion in this meal plan is for",
      mother: "one person (the mother)",
      introMiddle: "Use the estimates below when cooking for the household:",
      couple: "two adults",
      introEnd: `is calculated at x2; children's portions are estimated separately from the number you enter (each child is about ${Math.round(CHILD_PORTION_FACTOR * 100)}% of one adult grocery portion).`,
      childrenLabel: "Children eating the same family meals",
      weekTitle: "Full-week groceries (all batches)",
      dayTitle: `Day ${activeDayNumber} - estimated meal cost`,
      one: "1 person (mother)",
      coupleRow: "Two adults (x2)",
      childrenPlaceholder: "Children (enter number above)",
      children: "Children",
      totalWithChildren: "Total (two adults + children)",
      totalCouple: "Total (two adults)",
      totalDayWithChildren: "Daily total (two adults + children)",
      totalDayCouple: "Daily total (two adults)",
      note: "This is only a reference; real cost depends on leftovers, promotions and extra dishes outside the plan."
    }
  } as const;
  const h = household[locale];

  return (
    <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/40 p-5">
      <h3 className="text-lg font-semibold">{h.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {h.introStart} <strong className="font-medium text-foreground">{h.mother}</strong>. {h.introMiddle}{" "}
        <strong className="font-medium text-foreground">{h.couple}</strong> {h.introEnd}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block text-sm font-medium">
          {h.childrenLabel}
          <input
            type="number"
            min={0}
            max={12}
            value={childrenEatingCount}
            onChange={(e) => {
              const v = Number(e.target.value);
              onChildrenCountChange(Number.isFinite(v) ? Math.min(12, Math.max(0, Math.floor(v))) : 0);
            }}
            className="mt-2 w-full max-w-[12rem] rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-auto"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <CostBreakdownCard
          title={h.weekTitle}
          rows={[
            { label: h.one, value: weeklyShopOnePerson },
            { label: h.coupleRow, value: weeklyShopCouple },
            ...(childrenEatingCount > 0
              ? [{ label: `${h.children} (x${childrenEatingCount}, ${CHILD_PORTION_FACTOR})`, value: weeklyShopChildren }]
              : [{ label: h.childrenPlaceholder, value: 0, muted: true }]),
            {
              label: childrenEatingCount > 0 ? h.totalWithChildren : h.totalCouple,
              value: weeklyHouseholdTotal,
              emphasize: true
            }
          ]}
        />
        <CostBreakdownCard
          title={h.dayTitle}
          rows={[
            { label: h.one, value: dayCost },
            { label: h.coupleRow, value: dayCostCouple },
            ...(childrenEatingCount > 0
              ? [{ label: `${h.children} (x${childrenEatingCount})`, value: dayCostChildren }]
              : [{ label: h.children, value: 0, muted: true }]),
            {
              label: childrenEatingCount > 0 ? h.totalDayWithChildren : h.totalDayCouple,
              value: dayHouseholdTotal,
              emphasize: true
            }
          ]}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{h.note}</p>
    </div>
  );
}

function CostBreakdownCard({
  title,
  rows
}: {
  title: string;
  rows: { label: string; value: number; emphasize?: boolean; muted?: boolean }[];
}) {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {rows.map((row) => (
          <li
            key={row.label}
            className={`flex justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0 ${row.emphasize ? "font-semibold text-foreground" : ""} ${row.muted ? "text-muted-foreground" : "text-muted-foreground"}`}
          >
            <span className={row.emphasize ? "text-foreground" : ""}>{row.label}</span>
            <span className={`shrink-0 tabular-nums ${row.emphasize ? "text-accent" : "text-foreground"}`}>
              {row.muted && row.value === 0 ? "—" : formatVnd(row.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
