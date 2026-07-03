import { getPremiumLimits, type PremiumTier } from "@/lib/premium/limits";

const USAGE_KEY = "bau-an-gi:daily-usage";

type DailyUsage = {
  date: string;
  aiPlans: number;
  mealSwaps: number;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readUsage(): DailyUsage {
  if (typeof window === "undefined") {
    return { date: todayKey(), aiPlans: 0, mealSwaps: 0 };
  }

  try {
    const raw = window.localStorage.getItem(USAGE_KEY);
    if (!raw) return { date: todayKey(), aiPlans: 0, mealSwaps: 0 };
    const parsed = JSON.parse(raw) as DailyUsage;
    if (parsed.date !== todayKey()) return { date: todayKey(), aiPlans: 0, mealSwaps: 0 };
    return parsed;
  } catch {
    return { date: todayKey(), aiPlans: 0, mealSwaps: 0 };
  }
}

function writeUsage(usage: DailyUsage) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

export type UsageSnapshot = {
  aiPlansUsed: number;
  mealSwapsUsed: number;
  aiPlansRemaining: number;
  mealSwapsRemaining: number;
  aiPlansLimit: number;
  mealSwapsLimit: number;
};

export function getUsageSnapshot(tier: PremiumTier = "free"): UsageSnapshot {
  const limits = getPremiumLimits(tier);
  const usage = readUsage();
  const aiLimit = Number.isFinite(limits.aiPlansPerDay) ? limits.aiPlansPerDay : Number.MAX_SAFE_INTEGER;
  const swapLimit = Number.isFinite(limits.mealSwapsPerDay) ? limits.mealSwapsPerDay : Number.MAX_SAFE_INTEGER;

  return {
    aiPlansUsed: usage.aiPlans,
    mealSwapsUsed: usage.mealSwaps,
    aiPlansRemaining: Math.max(0, aiLimit - usage.aiPlans),
    mealSwapsRemaining: Math.max(0, swapLimit - usage.mealSwaps),
    aiPlansLimit: aiLimit,
    mealSwapsLimit: swapLimit
  };
}

export function canCreateAiPlan(tier: PremiumTier = "free") {
  return getUsageSnapshot(tier).aiPlansRemaining > 0;
}

export function canSwapMeal(tier: PremiumTier = "free") {
  return getUsageSnapshot(tier).mealSwapsRemaining > 0;
}

export function recordAiPlanUsage() {
  const usage = readUsage();
  writeUsage({ ...usage, aiPlans: usage.aiPlans + 1 });
}

export function recordMealSwapUsage() {
  const usage = readUsage();
  writeUsage({ ...usage, mealSwaps: usage.mealSwaps + 1 });
}

export function syncUsageFromServer(payload: { aiPlansUsed?: number; mealSwapsUsed?: number }) {
  const usage = readUsage();
  writeUsage({
    date: todayKey(),
    aiPlans: payload.aiPlansUsed ?? usage.aiPlans,
    mealSwaps: payload.mealSwapsUsed ?? usage.mealSwaps
  });
}
