export type PremiumTier = "free" | "premium";

export const premiumLimits = {
  free: {
    /**
     * Free AI plans per device per day. A separate per-IP abuse ceiling
     * (30/day) is enforced in server usage so carrier NAT does not share one slot.
     */
    aiPlansPerDay: 3,
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
