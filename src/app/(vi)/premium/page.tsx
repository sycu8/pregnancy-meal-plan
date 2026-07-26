import type { Metadata } from "next";
import { PremiumPage } from "@/components/premium/PremiumPage";

export const metadata: Metadata = {
  title: "Premium Lifetime | Bầu Ăn Gì?",
  description: "Thanh toán một lần — không giới hạn thực đơn AI, đổi món, lịch sử và xuất PDF."
};

export default function ViPremiumPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PremiumPage locale="vi" />
    </main>
  );
}
