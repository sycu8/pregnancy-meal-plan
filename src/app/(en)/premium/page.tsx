import type { Metadata } from "next";
import { PremiumPage } from "@/components/premium/PremiumPage";

export const metadata: Metadata = {
  title: "Premium | Pregnancy Meal Planner",
  description: "Upgrade to Premium — unlimited usage and PDF export."
};

export default function EnPremiumRoutePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PremiumPage locale="en" />
    </main>
  );
}
