import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";

const OFFLINE_PROFILE_KEY = "bau-an-gi:offline-profile";
const OFFLINE_PLAN_KEY = "bau-an-gi:offline-plan";
const PLAN_COUNT_KEY = "bau-an-gi:plan-count";

export function cacheOfflineSnapshot(profile: PregnancyProfile | null, plan: MealPlan | null) {
  if (typeof window === "undefined") return;
  if (profile) window.localStorage.setItem(OFFLINE_PROFILE_KEY, JSON.stringify(profile));
  if (plan) window.localStorage.setItem(OFFLINE_PLAN_KEY, JSON.stringify(plan));
}

export function getOfflineProfile(): PregnancyProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(OFFLINE_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as PregnancyProfile) : null;
  } catch {
    return null;
  }
}

export function getOfflinePlan(): MealPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(OFFLINE_PLAN_KEY);
    return raw ? (JSON.parse(raw) as MealPlan) : null;
  } catch {
    return null;
  }
}

export function incrementPlanCount() {
  if (typeof window === "undefined") return 0;
  const next = getPlanCount() + 1;
  window.localStorage.setItem(PLAN_COUNT_KEY, String(next));
  return next;
}

export function getPlanCount() {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(PLAN_COUNT_KEY) ?? "0") || 0;
}

export function shouldShowReviewPrompt() {
  return getPlanCount() >= 3 && typeof window !== "undefined" && !window.localStorage.getItem("bau-an-gi:review-dismissed");
}

export function dismissReviewPrompt() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("bau-an-gi:review-dismissed", "1");
}
