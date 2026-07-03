import { localizedPath, type Locale } from "@/lib/i18n";
import type { MealPlan } from "@/types/mealPlan";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mebauangi.info";

export function buildPlanShareUrl(planId: string, locale: Locale) {
  const path = localizedPath(locale, "/result");
  return `${SITE_URL}${path}?plan=${encodeURIComponent(planId)}`;
}

export function buildPlanShareText(plan: MealPlan, locale: Locale) {
  const week = plan.profileSnapshot.pregnancyWeek;
  const dayOne = plan.days[0];
  const meals = dayOne
    ? [dayOne.breakfast, dayOne.lunch, dayOne.dinner].map((meal) => meal.name).join(" · ")
    : "";

  if (locale === "en") {
    return [
      `Bầu Ăn Gì? — 7-day pregnancy meal plan (week ${week})`,
      meals ? `Day 1 sample: ${meals}` : "",
      plan.summary.message,
      `Open: ${buildPlanShareUrl(plan.id, locale)}`,
      "Reference only — ask your clinician before changing your diet."
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Bầu Ăn Gì? — Thực đơn 7 ngày tuần thai ${week}`,
    meals ? `Mẫu ngày 1: ${meals}` : "",
    plan.summary.message,
    `Mở thực đơn: ${buildPlanShareUrl(plan.id, locale)}`,
    "Chỉ mang tính tham khảo — hãy hỏi bác sĩ trước khi thay đổi chế độ ăn."
  ]
    .filter(Boolean)
    .join("\n");
}

export async function shareMealPlan(plan: MealPlan, locale: Locale) {
  try {
    await fetch("/api/shared-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan)
    });
  } catch {
    // Share still works on the same device via localStorage.
  }

  const text = buildPlanShareText(plan, locale);
  const url = buildPlanShareUrl(plan.id, locale);

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share({
      title: locale === "en" ? "Pregnancy meal plan" : "Thực đơn mẹ bầu",
      text,
      url
    });
    return "shared" as const;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return "copied" as const;
  }

  throw new Error("Share not supported");
}
