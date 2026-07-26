import { localizedPath, type Locale } from "@/lib/i18n";
import type { MealPlan } from "@/types/mealPlan";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mebauangi.info";

export function buildPlanShareUrl(planId: string, locale: Locale) {
  const path = localizedPath(locale, "/result");
  return `${SITE_URL}${path}?plan=${encodeURIComponent(planId)}`;
}

function mealName(meal: { name?: string } | undefined) {
  return meal?.name?.trim() || "";
}

export function buildPlanShareText(plan: MealPlan, locale: Locale) {
  const week = plan.profileSnapshot.pregnancyWeek;
  const dayOne = plan.days[0] as
    | {
        breakfast?: { name?: string };
        lunch?: { name?: string };
        dinner?: { name?: string };
      }
    | undefined;
  const meals = dayOne
    ? [dayOne.breakfast, dayOne.lunch, dayOne.dinner].map(mealName).filter(Boolean).join(" · ")
    : "";
  const postpartum = plan.profileSnapshot.lifeStage === "postpartum";

  if (locale === "en") {
    return [
      postpartum
        ? `Pregnancy Meal Planner — Postpartum / baby meal plan${plan.profileSnapshot.babyAgeMonths != null ? ` (${plan.profileSnapshot.babyAgeMonths} mo)` : ""}`
        : `Pregnancy Meal Planner — 7-day pregnancy meal plan (week ${week})`,
      meals ? `Day 1 sample: ${meals}` : "",
      plan.summary.message,
      `Open: ${buildPlanShareUrl(plan.id, locale)}`,
      "Reference only — ask your clinician before changing your diet."
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    postpartum
      ? `Pregnancy Meal Planner — Thực đơn sau sinh${plan.profileSnapshot.babyAgeMonths != null ? ` (${plan.profileSnapshot.babyAgeMonths} tháng)` : ""}`
      : `Pregnancy Meal Planner — Thực đơn 7 ngày tuần thai ${week}`,
    meals ? `Mẫu ngày 1: ${meals}` : "",
    plan.summary.message,
    `Mở thực đơn: ${buildPlanShareUrl(plan.id, locale)}`,
    "Chỉ mang tính tham khảo — hãy hỏi bác sĩ trước khi thay đổi chế độ ăn."
  ]
    .filter(Boolean)
    .join("\n");
}

export async function persistSharedPlan(plan: MealPlan): Promise<boolean> {
  try {
    const response = await fetch("/api/shared-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan)
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function shareMealPlan(plan: MealPlan, locale: Locale) {
  const persisted = await persistSharedPlan(plan);
  const text = buildPlanShareText(plan, locale);
  const url = buildPlanShareUrl(plan.id, locale);

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share({
      title: locale === "en" ? "Pregnancy meal plan" : "Thực đơn mẹ bầu",
      text,
      url
    });
    if (persisted) return "shared";
    return "shared_local";
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    if (persisted) return "copied";
    return "copied_local";
  }

  if (!persisted) {
    throw new Error("Share storage unavailable");
  }

  throw new Error("Share not supported");
}
