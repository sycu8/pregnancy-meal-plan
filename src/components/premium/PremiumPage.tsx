"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { openPremiumCheckout } from "@/lib/premium/checkoutClient";
import { getPremiumLimits } from "@/lib/premium/limits";
import { localizedPath, type Locale } from "@/lib/i18n";

const free = getPremiumLimits("free");

export function PremiumPage({ locale = "vi" }: { locale?: Locale }) {
  const [busy, setBusy] = useState(false);
  const copy =
    locale === "en"
      ? {
          title: "Premium — pay once",
          body: "One-time unlock for unlimited meal planning through pregnancy and postpartum. No subscription.",
          lifetime: "Lifetime access after a single payment",
          freeTitle: "Free",
          premiumTitle: "Premium",
          freeItems: [
            `${free.aiPlansPerDay} AI meal plan / day`,
            `${free.mealSwapsPerDay} meal swaps / day`,
            `${free.historyPlans} recent plans in history`,
            "Basic text export",
            "Local browser storage"
          ],
          premiumItems: [
            "Unlimited AI meal plans",
            "Unlimited meal swaps",
            "Unlimited history + account sync",
            "Polished PDF / cloud export",
            "Advanced modes: gestational diabetes & postpartum",
            "Regional menus and deeper budget guidance"
          ],
          cta: "Register for Premium",
          back: "Back to planner",
          error: "Could not open checkout. Please try again."
        }
      : {
          title: "Premium — trả một lần",
          body: "Mở khóa không giới hạn để lên thực đơn suốt thai kỳ và sau sinh. Không gói tháng.",
          lifetime: "Thanh toán một lần, dùng lâu dài",
          freeTitle: "Miễn phí",
          premiumTitle: "Premium",
          freeItems: [
            `${free.aiPlansPerDay} thực đơn AI / ngày`,
            `${free.mealSwapsPerDay} lần đổi món / ngày`,
            `${free.historyPlans} thực đơn gần nhất trong lịch sử`,
            "Xuất text tạm",
            "Lưu trên trình duyệt"
          ],
          premiumItems: [
            "Không giới hạn tạo thực đơn AI",
            "Không giới hạn đổi món",
            "Lịch sử không giới hạn + đồng bộ tài khoản",
            "Xuất PDF / cloud đẹp để đi khám",
            "Chế độ chuyên sâu: tiểu đường thai kỳ & sau sinh",
            "Thực đơn theo vùng và ngân sách chi tiết hơn"
          ],
          cta: "Đăng ký gói Premium",
          back: "Quay lại tạo thực đơn",
          error: "Không mở được trang thanh toán. Vui lòng thử lại."
        };

  async function openCheckout() {
    setBusy(true);
    const result = await openPremiumCheckout();
    if (!result.ok) {
      setBusy(false);
      alert(result.message || copy.error);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border bg-white p-6 shadow-soft">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">{copy.lifetime}</p>
        <h1 className="mt-2 text-2xl font-semibold">{copy.title}</h1>
        <p className="mt-3 text-muted-foreground leading-7">{copy.body}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={openCheckout} disabled={busy}>
            {busy ? (locale === "en" ? "Opening…" : "Đang mở…") : copy.cta}
          </Button>
          <Button asChild variant="secondary">
            <Link href={localizedPath(locale, "/planner")}>{copy.back}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlanColumn title={copy.freeTitle} items={copy.freeItems} />
        <PlanColumn title={copy.premiumTitle} items={copy.premiumItems} highlight />
      </div>
    </section>
  );
}

function PlanColumn({ title, items, highlight = false }: { title: string; items: string[]; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-5 shadow-soft ${
        highlight ? "border-accent/40 bg-accent/5" : "border-border bg-white"
      }`}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
