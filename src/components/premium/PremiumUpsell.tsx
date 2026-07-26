"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { openPremiumCheckout } from "@/lib/premium/checkoutClient";
import { getPremiumLimits } from "@/lib/premium/limits";
import { localizedPath, type Locale } from "@/lib/i18n";

export type PremiumUpsellReason = "ai-limit" | "swap-limit" | "history-limit" | "export" | "general";

const free = getPremiumLimits("free");

const copy = {
  vi: {
    eyebrow: "Thanh toán một lần",
    titles: {
      "ai-limit": "Đã hết lượt tạo thực đơn AI hôm nay",
      "swap-limit": "Đã hết lượt đổi món hôm nay",
      "history-limit": `Gói miễn phí chỉ lưu ${free.historyPlans} thực đơn gần nhất`,
      export: "Xuất PDF/cloud dành cho Premium",
      general: "Mở khóa Premium — trả một lần, dùng lâu dài"
    },
    bodies: {
      "ai-limit": `Gói miễn phí: ${free.aiPlansPerDay} thực đơn AI/ngày. Nâng cấp để tạo không giới hạn trong cả thai kỳ.`,
      "swap-limit": `Gói miễn phí: ${free.mealSwapsPerDay} lần đổi món/ngày. Premium đổi món thoải mái.`,
      "history-limit": "Premium lưu lịch sử không giới hạn và đồng bộ theo tài khoản.",
      export: "Free vẫn tải bản text tạm. Premium xuất PDF đẹp để đi khám hoặc gửi người nhà.",
      general: "Không giới hạn AI, đổi món, lịch sử, xuất PDF và chế độ chuyên sâu (tiểu đường thai kỳ, sau sinh)."
    },
    cta: "Đăng ký gói Premium",
    secondary: "Xem quyền lợi",
    dismiss: "Để sau",
    opening: "Đang mở…"
  },
  en: {
    eyebrow: "One-time payment",
    titles: {
      "ai-limit": "Daily AI meal-plan limit reached",
      "swap-limit": "Daily meal-swap limit reached",
      "history-limit": `Free plan keeps only the latest ${free.historyPlans} plans`,
      export: "PDF/cloud export is a Premium perk",
      general: "Unlock Premium — pay once, keep access"
    },
    bodies: {
      "ai-limit": `Free: ${free.aiPlansPerDay} AI plan/day. Upgrade for unlimited plans through pregnancy.`,
      "swap-limit": `Free: ${free.mealSwapsPerDay} swaps/day. Premium swaps without daily caps.`,
      "history-limit": "Premium keeps unlimited history and account sync.",
      export: "Free still downloads a basic text file. Premium unlocks polished PDF/cloud export.",
      general: "Unlimited AI plans, swaps, history, PDF export, and advanced modes (GDM, postpartum)."
    },
    cta: "Register for Premium",
    secondary: "See benefits",
    dismiss: "Not now",
    opening: "Opening…"
  }
} as const;

export function PremiumUpsell({
  locale = "vi",
  reason = "general",
  dismissible = false,
  onDismiss,
  className = ""
}: {
  locale?: Locale;
  reason?: PremiumUpsellReason;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}) {
  const t = copy[locale];
  const [busy, setBusy] = useState(false);

  async function handleCheckout() {
    setBusy(true);
    const result = await openPremiumCheckout();
    if (!result.ok) {
      setBusy(false);
      alert(result.message);
    }
  }

  return (
    <aside
      className={`rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-soft ${className}`}
      role="note"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-md bg-amber-100 p-2 text-amber-900">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800">{t.eyebrow}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">{t.titles[reason]}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.bodies[reason]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={handleCheckout} disabled={busy}>
              {busy ? t.opening : t.cta}
            </Button>
            <Button asChild variant="secondary">
              <Link href={localizedPath(locale, "/premium")}>{t.secondary}</Link>
            </Button>
            {dismissible && (
              <Button type="button" variant="ghost" onClick={onDismiss}>
                {t.dismiss}
              </Button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
