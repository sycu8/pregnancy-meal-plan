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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Thực đơn 7 ngày</h2>
        {plan.days.map((day) => (
          <article key={day.day} className="rounded-lg border border-border bg-white p-5">
            <h3 className="text-lg font-semibold">Ngày {day.day}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <MealBlock title="Bữa sáng" item={day.breakfast} />
              <MealBlock title="Bữa phụ sáng" item={day.morningSnack} />
              <MealBlock title="Bữa trưa" item={day.lunch} />
              <MealBlock title="Bữa phụ chiều" item={day.afternoonSnack} />
              <MealBlock title="Bữa tối" item={day.dinner} />
              <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Nước uống / trái cây</p>
                <p className="mt-1 leading-6">{day.hydrationNote}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Danh sách đi chợ</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {Object.entries(groupLabels).map(([key, label]) => (
            <div key={key}>
              <h3 className="font-medium">{label}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {plan.shoppingList[key as keyof typeof groupLabels].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
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
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-xs font-medium uppercase text-accent">{title}</p>
      <h4 className="mt-1 font-semibold">{item.name}</h4>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.reason}</p>
      <p className="mt-2 text-xs text-muted-foreground">Nhóm chính: {item.nutrients.join(", ")}</p>
      {item.alternatives && item.alternatives.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Thay thế: {item.alternatives.join(" / ")}</p>}
      {item.caution && <p className="mt-2 text-xs text-warning">Lưu ý: {item.caution}</p>}
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
