export type PremiumTier = "free" | "premium";

export const premiumLimits = {
  free: {
    aiPlansPerDay: 3,
    historyPlans: 20,
    mealSwapsPerDay: 5
  },
  premium: {
    aiPlansPerDay: Number.POSITIVE_INFINITY,
    historyPlans: Number.POSITIVE_INFINITY,
    mealSwapsPerDay: Number.POSITIVE_INFINITY
  }
} as const;

export function getPremiumLimits(tier: PremiumTier = "free") {
  return premiumLimits[tier];
}
