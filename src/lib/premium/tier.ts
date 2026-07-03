import type { PremiumTier } from "@/lib/premium/limits";

const TIER_KEY = "bau-an-gi:premium-tier";

export function getPremiumTier(): PremiumTier {
  if (typeof window === "undefined") return "free";
  const stored = window.localStorage.getItem(TIER_KEY);
  return stored === "premium" ? "premium" : "free";
}

export function setPremiumTier(tier: PremiumTier) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TIER_KEY, tier);
}

export function premiumTierHeader(): Record<string, string> {
  return { "x-premium-tier": getPremiumTier() };
}
