"use client";

import { getPremiumTier } from "@/lib/premium/tier";
import { getUsageSnapshot } from "@/lib/premium/usage";
import type { Locale } from "@/lib/i18n";

const copy = {
  vi: {
    aiRemaining: (n: number) => `Còn ${n} lượt tạo thực đơn AI hôm nay`,
    swapRemaining: (n: number) => `Còn ${n} lượt đổi món hôm nay`,
    unlimited: "Gói Premium — không giới hạn lượt trong ngày"
  },
  en: {
    aiRemaining: (n: number) => `${n} AI meal plans remaining today`,
    swapRemaining: (n: number) => `${n} meal swaps remaining today`,
    unlimited: "Premium — unlimited daily usage"
  }
} as const;

export function PremiumUsageHint({
  locale,
  mode = "ai",
  refreshKey = 0
}: {
  locale: Locale;
  mode?: "ai" | "swap";
  refreshKey?: number;
}) {
  void refreshKey;
  const tier = getPremiumTier();
  const snapshot = getUsageSnapshot(tier);
  const t = copy[locale];

  if (tier === "premium") {
    return <p className="text-xs text-muted-foreground">{t.unlimited}</p>;
  }

  const text =
    mode === "swap"
      ? t.swapRemaining(snapshot.mealSwapsRemaining)
      : t.aiRemaining(snapshot.aiPlansRemaining);

  return <p className="text-xs text-muted-foreground">{text}</p>;
}
