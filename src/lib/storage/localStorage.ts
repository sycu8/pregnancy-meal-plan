import { getPremiumLimits } from "@/lib/premium/limits";
import { getPremiumTier } from "@/lib/premium/tier";
import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";

const PROFILE_KEY = "bau-an-gi:profile";
const HISTORY_KEY = "bau-an-gi:meal-history";
const CURRENT_PLAN_KEY = "bau-an-gi:current-plan";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveProfile(profile: PregnancyProfile) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getProfile(): PregnancyProfile | null {
  if (!canUseLocalStorage()) return null;
  return readJson<PregnancyProfile>(PROFILE_KEY);
}

export function saveMealPlan(plan: MealPlan) {
  if (!canUseLocalStorage()) return;
  const maxHistory = getPremiumLimits(getPremiumTier()).historyPlans;
  const cap = Number.isFinite(maxHistory) ? maxHistory : Number.MAX_SAFE_INTEGER;
  const history = getMealPlanHistory().filter((item) => item.id !== plan.id);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify([plan, ...history].slice(0, cap)));
  window.localStorage.setItem(CURRENT_PLAN_KEY, JSON.stringify(plan));
}

export function getMealPlanById(id: string): MealPlan | null {
  if (!canUseLocalStorage()) return null;
  const current = getCurrentMealPlan();
  if (current?.id === id) return current;
  return getMealPlanHistory().find((item) => item.id === id) ?? null;
}

export function getMealPlanHistory(): MealPlan[] {
  if (!canUseLocalStorage()) return [];
  return readJson<MealPlan[]>(HISTORY_KEY) ?? [];
}

export function getCurrentMealPlan(): MealPlan | null {
  if (!canUseLocalStorage()) return null;
  return readJson<MealPlan>(CURRENT_PLAN_KEY);
}

export function setCurrentMealPlan(plan: MealPlan) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(CURRENT_PLAN_KEY, JSON.stringify(plan));
}

export function deleteMealPlan(id: string) {
  if (!canUseLocalStorage()) return;
  const next = getMealPlanHistory().filter((item) => item.id !== id);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  const current = getCurrentMealPlan();
  if (current?.id === id) window.localStorage.removeItem(CURRENT_PLAN_KEY);
}

export function clearHistory() {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(HISTORY_KEY);
  window.localStorage.removeItem(CURRENT_PLAN_KEY);
}

function readJson<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}
