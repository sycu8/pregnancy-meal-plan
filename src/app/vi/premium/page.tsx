import type { Metadata } from "next";
import { PremiumPage } from "@/components/premium/PremiumPage";
import { createRouteMetadata } from "@/lib/i18n";

export const metadata: Metadata = createRouteMetadata("vi", "/premium", {
  title: "Premium Lifetime | Pregnancy Meal Planner",
  description:
    "So sánh gói miễn phí và Premium: thực đơn AI không giới hạn, đổi món, lịch sử lưu trữ, xuất PDF và hỗ trợ song ngữ cho mẹ bầu."
});

export default function ViPremiumPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PremiumPage locale="vi" />
    </main>
  );
}
