export type PremiumTier = "free" | "premium";

export const premiumLimits = {
  free: {
    /** Enough to try the product once per day. */
    aiPlansPerDay: 1,
    historyPlans: 5,
    mealSwapsPerDay: 2,
    cloudExport: false
  },
  premium: {
    aiPlansPerDay: Number.POSITIVE_INFINITY,
    historyPlans: Number.POSITIVE_INFINITY,
    mealSwapsPerDay: Number.POSITIVE_INFINITY,
    cloudExport: true
  }
} as const;

export function getPremiumLimits(tier: PremiumTier = "free") {
  return premiumLimits[tier];
}
