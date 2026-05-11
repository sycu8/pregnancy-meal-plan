"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { nutritionGoalLabels } from "@/lib/nutrition/labels";
import { deleteMealPlan, getMealPlanHistory, setCurrentMealPlan } from "@/lib/storage/localStorage";
import type { MealPlan } from "@/types/mealPlan";

export function HistoryList() {
  const [history, setHistory] = useState<MealPlan[]>([]);

  useEffect(() => {
    setHistory(getMealPlanHistory());
  }, []);

  function remove(id: string) {
    deleteMealPlan(id);
    setHistory(getMealPlanHistory());
  }

  if (history.length === 0) {
    return <EmptyState title="Chưa có lịch sử thực đơn" description="Sau khi tạo thực đơn, ứng dụng sẽ lưu lịch sử trên trình duyệt này để bạn mở lại hoặc xóa khi cần." />;
  }

  return (
    <div className="space-y-3">
      {history.map((plan) => (
        <article key={plan.id} className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Tuần thai {plan.profileSnapshot.pregnancyWeek}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tạo ngày {new Date(plan.createdAt).toLocaleDateString("vi-VN")} · Mục tiêu:{" "}
              {plan.profileSnapshot.goals.map((goal) => nutritionGoalLabels[goal]).join(", ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" onClick={() => setCurrentMealPlan(plan)}>
              <Link href="/result">Mở lại</Link>
            </Button>
            <Button type="button" variant="ghost" onClick={() => remove(plan.id)} aria-label="Xóa thực đơn">
              <Trash2 className="h-4 w-4" /> Xóa
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
