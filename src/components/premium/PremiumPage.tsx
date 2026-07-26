"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { localizedPath, type Locale } from "@/lib/i18n";

export function PremiumPage({ locale = "vi" }: { locale?: Locale }) {
  const [busy, setBusy] = useState(false);
  const copy =
    locale === "en"
      ? {
          title: "Premium plan",
          body: "Unlock unlimited AI meal plans, meal swaps, history, and PDF export to cloud storage.",
          benefits: [
            "Unlimited AI meal plans each day",
            "Unlimited meal swaps",
            "Longer plan history",
            "PDF/cloud export for premium accounts"
          ],
          cta: "Register for Premium",
          back: "Back to planner",
          error: "Could not open checkout. Please try again."
        }
      : {
          title: "Gói Premium",
          body: "Mở khóa không giới hạn lượt AI tạo thực đơn, đổi món, lịch sử và xuất PDF lên cloud.",
          benefits: [
            "Không giới hạn thực đơn AI mỗi ngày",
            "Không giới hạn đổi món",
            "Lưu lịch sử thực đơn dài hơn",
            "Xuất PDF/cloud cho tài khoản Premium"
          ],
          cta: "Đăng ký gói Premium",
          back: "Quay lại tạo thực đơn",
          error: "Không mở được trang thanh toán. Vui lòng thử lại."
        };

  async function openCheckout() {
    setBusy(true);
    try {
      const response = await fetch("/api/premium/checkout");
      const data = (await response.json()) as { checkoutUrl?: string; message?: string; error?: string };
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      alert(data.message ?? data.error ?? copy.error);
    } catch {
      alert(copy.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-semibold">{copy.title}</h1>
      <p className="mt-3 text-muted-foreground leading-7">{copy.body}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
        {copy.benefits.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={openCheckout} disabled={busy}>
          {busy ? (locale === "en" ? "Opening…" : "Đang mở…") : copy.cta}
        </Button>
        <Button asChild variant="secondary">
          <Link href={localizedPath(locale, "/planner")}>{copy.back}</Link>
        </Button>
      </div>
    </section>
  );
}
