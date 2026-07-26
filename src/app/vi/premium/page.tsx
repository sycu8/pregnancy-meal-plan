import type { Metadata } from "next";
import { PremiumPage } from "@/components/premium/PremiumPage";

export const metadata: Metadata = {
  title: "Premium | Pregnancy Meal Planner",
  description: "Nâng cấp Premium — không giới hạn lượt và xuất PDF."
};

export default function ViPremiumPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PremiumPage locale="vi" />
    </main>
  );
}
