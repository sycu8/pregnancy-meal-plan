"use client";

import Link from "next/link";
import { getPremiumTier } from "@/lib/premium/tier";
import { getUsageSnapshot } from "@/lib/premium/usage";
import { localizedPath, type Locale } from "@/lib/i18n";

const copy = {
  vi: {
    aiRemaining: (n: number, limit: number) => `Còn ${n}/${limit} lượt tạo thực đơn AI hôm nay`,
    swapRemaining: (n: number, limit: number) => `Còn ${n}/${limit} lượt đổi món hôm nay`,
    unlimited: "Gói Premium — không giới hạn lượt trong ngày",
    upgrade: "Mở Premium Lifetime"
  },
  en: {
    aiRemaining: (n: number, limit: number) => `${n}/${limit} AI meal plans remaining today`,
    swapRemaining: (n: number, limit: number) => `${n}/${limit} meal swaps remaining today`,
    unlimited: "Premium — unlimited daily usage",
    upgrade: "Unlock Premium Lifetime"
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
      ? t.swapRemaining(snapshot.mealSwapsRemaining, snapshot.mealSwapsLimit)
      : t.aiRemaining(snapshot.aiPlansRemaining, snapshot.aiPlansLimit);

  return (
    <p className="text-xs text-muted-foreground">
      {text}.{" "}
      <Link href={localizedPath(locale, "/premium")} className="font-medium text-accent underline-offset-2 hover:underline">
        {t.upgrade}
      </Link>
    </p>
  );
}
