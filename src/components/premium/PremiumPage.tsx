"use client";

import Link from "next/link";
import { Button } from "@/components/shared/Button";
import type { Locale } from "@/lib/i18n";

export function PremiumPage({ locale = "vi" }: { locale?: Locale }) {
  const copy =
    locale === "en"
      ? {
          title: "Premium",
          body: "Unlimited AI plans, meal swaps and history. PDF export to cloud storage.",
          cta: "Open checkout",
          back: "Back to planner",
          note: "Billing requires STRIPE_CHECKOUT_URL or PREMIUM_CHECKOUT_URL on the server."
        }
      : {
          title: "Premium",
          body: "Không giới hạn lượt AI, đổi món và lịch sử. Xuất PDF lên cloud.",
          cta: "Mở trang thanh toán",
          back: "Quay lại tạo thực đơn",
          note: "Cần cấu hình STRIPE_CHECKOUT_URL hoặc PREMIUM_CHECKOUT_URL trên server."
        };

  async function openCheckout() {
    const response = await fetch("/api/premium/checkout");
    const data = await response.json();
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    else alert(data.message ?? data.error);
  }

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-semibold">{copy.title}</h1>
      <p className="mt-3 text-muted-foreground leading-7">{copy.body}</p>
      <p className="mt-2 text-xs text-muted-foreground">{copy.note}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={openCheckout}>
          {copy.cta}
        </Button>
        <Button asChild variant="secondary">
          <Link href={locale === "en" ? "/en/planner" : "/planner"}>{copy.back}</Link>
        </Button>
      </div>
    </section>
  );
}
