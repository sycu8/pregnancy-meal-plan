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
import type { MealItem, MealPlan } from "@/types/mealPlan";

const groupLabels = {
  proteins: "Thịt / cá / trứng / đậu",
  vegetables: "Rau củ",
  fruits: "Trái cây",
  dairy: "Sữa / sữa chua / phô mai tiệt trùng",
  grains: "Ngũ cốc / tinh bột",
  others: "Gia vị / khác"
} as const;

export function MealPlanResult() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  useEffect(() => {
    setPlan(getCurrentMealPlan());
  }, []);

  if (!plan) {
    return <EmptyState title="Chưa có thực đơn" description="Bạn hãy tạo thực đơn mới. Kết quả sẽ được lưu trên trình duyệt và có thể mở lại trong lịch sử." />;
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
  const shoppingBatches = plan.shoppingBatches?.length ? plan.shoppingBatches : buildFallbackShoppingBatches(plan);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tổng quan tham khảo</p>
            <h1 className="mt-1 text-2xl font-semibold">Thực đơn tuần thai {plan.profileSnapshot.pregnancyWeek}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{plan.summary.message}</p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleSave}>
              <Save className="h-4 w-4" /> {saved ? "Đã lưu" : "Lưu thực đơn"}
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> In thực đơn
            </Button>
            <Button asChild>
              <Link href="/planner">
                <RefreshCcw className="h-4 w-4" /> Tạo lại
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="BMI trước mang thai" value={plan.summary.bmi?.toString() ?? "Chưa đủ dữ liệu"} />
          <Metric label="Nhóm BMI" value={bmiCategoryLabels[plan.summary.bmiCategory]} />
          <Metric label="Đã tăng" value={plan.summary.weightGainKg === null ? "Chưa đủ dữ liệu" : `${plan.summary.weightGainKg} kg`} />
          <Metric label="Đánh giá" value={weightGainStatusLabels[plan.summary.weightGainStatus]} />
        </div>
      </section>

      {plan.urgentWarnings && plan.urgentWarnings.length > 0 && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <h2 className="font-semibold">Cần lưu ý y tế</h2>
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
            <p className="text-sm font-medium text-accent">Thực đơn 7 ngày</p>
            <h2 className="mt-1 text-xl font-semibold">Xem theo từng ngày</h2>
          </div>
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            Ngày {activeDay.day}: {dayCalories > 0 ? `khoảng ${dayCalories} kcal` : "ước tính sẽ có khi tạo lại"}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7" role="tablist" aria-label="Chọn ngày thực đơn">
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
              Ngày {day.day}
            </button>
          ))}
        </div>

        <article className="mt-5">
          <div className="grid gap-3 md:grid-cols-2">
            <MealBlock title="Bữa sáng" item={activeDay.breakfast} />
            <MealBlock title="Bữa phụ sáng" item={activeDay.morningSnack} />
            <MealBlock title="Bữa trưa" item={activeDay.lunch} />
            <MealBlock title="Bữa phụ chiều" item={activeDay.afternoonSnack} />
            <MealBlock title="Bữa tối" item={activeDay.dinner} />
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Nước uống / trái cây</p>
              <p className="mt-1 leading-6">{activeDay.hydrationNote}</p>
              <p className="mt-3 text-xs">Ước tính khẩu phần và calorie chỉ để tham khảo, có thể thay đổi theo cách nấu và lượng ăn thực tế.</p>
            </div>
          </div>
        </article>

        <DailyShoppingList shoppingList={activeDay.dailyShoppingList ?? plan.shoppingList} />
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <p className="text-sm font-medium text-accent">Lịch đi chợ tươi ngon</p>
        <h2 className="mt-1 text-xl font-semibold">Ưu tiên mua theo 2-3 ngày/lần</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Rau lá, thịt, cá, đậu hũ và trái cây mềm nên mua thành nhiều đợt nhỏ để giữ độ tươi. Đồ khô như gạo, yến mạch, hạt và gia vị có thể chuẩn bị trước.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {shoppingBatches.map((batch) => (
            <div key={batch.label} className="rounded-md border border-border p-4">
              <h3 className="font-semibold">{batch.label}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{batch.freshnessNote}</p>
              <ShoppingListGroups shoppingList={batch.shoppingList} />
            </div>
          ))}
        </div>
      </section>

      <NutrientGuidancePanel />

      <section className="grid gap-5 md:grid-cols-2">
        <ListPanel title="Cảnh báo an toàn" items={plan.safetyWarnings} />
        <ListPanel title="Ghi chú theo tình trạng đặc biệt" items={plan.specialNotes.length ? plan.specialNotes : ["Chưa có tình trạng đặc biệt được chọn."]} />
      </section>

      <TrustedSources />
      <Disclaimer />
      <div className="no-print">
        <Button asChild variant="secondary">
          <Link href="/planner">Quay lại chỉnh thông tin</Link>
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

function MealBlock({ title, item }: { title: string; item: MealItem }) {
  const hasEstimate = item.portionGram > 0 && item.estimatedCalories > 0;

  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-xs font-medium uppercase text-accent">{title}</p>
      <h4 className="mt-1 font-semibold">{item.name}</h4>
      {hasEstimate && (
        <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs font-medium text-foreground">
          Ước tính: {item.portionGram} g · {item.estimatedCalories} kcal
        </p>
      )}
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.reason}</p>
      <p className="mt-2 text-xs text-muted-foreground">Nhóm chính: {item.nutrients.join(", ")}</p>
      {item.alternatives && item.alternatives.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Thay thế: {item.alternatives.join(" / ")}</p>}
      {item.caution && <p className="mt-2 text-xs text-warning">Lưu ý: {item.caution}</p>}
    </div>
  );
}

function DailyShoppingList({ shoppingList }: { shoppingList: MealPlan["shoppingList"] }) {
  return (
    <section className="mt-5 rounded-md bg-muted p-4">
      <h3 className="font-semibold">Danh sách nguyên liệu riêng cho ngày này</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Dùng để kiểm tra nhanh khi nấu ngày đang chọn. Phần bên dưới gom lại thành lịch đi chợ 2-3 ngày/lần.</p>
      <ShoppingListGroups shoppingList={shoppingList} />
    </section>
  );
}

function ShoppingListGroups({ shoppingList }: { shoppingList: MealPlan["shoppingList"] }) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {Object.entries(groupLabels).map(([key, label]) => {
        const items = shoppingList[key as keyof typeof groupLabels];
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
              <p className="mt-2 text-sm text-muted-foreground">Không có món trong nhóm này.</p>
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
    }
  ];
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
