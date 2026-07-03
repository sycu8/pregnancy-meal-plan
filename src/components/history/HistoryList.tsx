"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { getNutritionLabels } from "@/lib/nutrition/labels";
import { deleteMealPlan, getMealPlanHistory } from "@/lib/storage/localStorage";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { MealPlan } from "@/types/mealPlan";

const copy = {
  vi: {
    emptyTitle: "Chưa có lịch sử thực đơn",
    emptyDescription:
      "Sau khi tạo thực đơn, ứng dụng sẽ lưu lịch sử trên trình duyệt này để bạn mở lại hoặc xóa khi cần.",
    week: "Tuần thai",
    created: "Tạo ngày",
    goals: "Mục tiêu",
    open: "Mở lại",
    delete: "Xóa",
    deleteLabel: "Xóa thực đơn",
    locale: "vi-VN"
  },
  en: {
    emptyTitle: "No meal plan history yet",
    emptyDescription:
      "After you create a meal plan, the app saves local history in this browser so you can reopen or delete it when needed.",
    week: "Pregnancy week",
    created: "Created",
    goals: "Goals",
    open: "Open",
    delete: "Delete",
    deleteLabel: "Delete meal plan",
    locale: "en-US"
  }
} as const;

export function HistoryList({ locale = "vi" }: { locale?: Locale }) {
  const t = copy[locale];
  const labels = getNutritionLabels(locale);
  const [history, setHistory] = useState<MealPlan[]>([]);

  useEffect(() => {
    setHistory(getMealPlanHistory());
  }, []);

  function remove(id: string) {
    deleteMealPlan(id);
    setHistory(getMealPlanHistory());
  }

  if (history.length === 0) {
    return <EmptyState locale={locale} title={t.emptyTitle} description={t.emptyDescription} />;
  }

  return (
    <div className="space-y-3">
      {history.map((plan) => (
        <article key={plan.id} className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">{t.week} {plan.profileSnapshot.pregnancyWeek}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.created} {new Date(plan.createdAt).toLocaleDateString(t.locale)} · {t.goals}:{" "}
              {plan.profileSnapshot.goals.map((goal) => labels.nutritionGoalLabels[goal]).join(", ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={`${localizedPath(locale, "/result")}?plan=${encodeURIComponent(plan.id)}`}>
                {t.open}
              </Link>
            </Button>
            <Button type="button" variant="ghost" onClick={() => remove(plan.id)} aria-label={t.deleteLabel}>
              <Trash2 className="h-4 w-4" /> {t.delete}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
