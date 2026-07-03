import type { MealPlan } from "@/types/mealPlan";
import type { Locale } from "@/lib/i18n";

export function buildPlanExportText(plan: MealPlan, locale: Locale = "vi") {
  const lines: string[] = [];
  const week = plan.profileSnapshot.pregnancyWeek;

  lines.push(locale === "vi" ? `Bầu Ăn Gì? — Thực đơn tuần thai ${week}` : `Bầu Ăn Gì? — Pregnancy week ${week} meal plan`);
  lines.push(plan.summary.message);
  lines.push("");

  for (const day of plan.days) {
    lines.push(locale === "vi" ? `--- Ngày ${day.day} ---` : `--- Day ${day.day} ---`);
    lines.push(`${locale === "vi" ? "Sáng" : "Breakfast"}: ${day.breakfast.name}`);
    lines.push(`${locale === "vi" ? "Trưa" : "Lunch"}: ${day.lunch.name}`);
    lines.push(`${locale === "vi" ? "Tối" : "Dinner"}: ${day.dinner.name}`);
    lines.push("");
  }

  lines.push(locale === "vi" ? "Danh sách đi chợ (gom):" : "Shopping list (grouped):");
  for (const [group, items] of Object.entries(plan.shoppingList)) {
    if (items.length === 0) continue;
    lines.push(`${group}: ${items.join(", ")}`);
  }

  lines.push("");
  lines.push(plan.summary.disclaimer);
  return lines.join("\n");
}

export function buildPlanExportHtml(plan: MealPlan, locale: Locale = "vi") {
  const text = buildPlanExportText(plan, locale).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bau An Gi Plan</title></head><body><pre style="font-family:sans-serif;white-space:pre-wrap;padding:24px">${text}</pre></body></html>`;
}
