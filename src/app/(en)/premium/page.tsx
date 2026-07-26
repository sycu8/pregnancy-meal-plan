import type { Metadata } from "next";
import { PremiumPage } from "@/components/premium/PremiumPage";
import { createRouteMetadata } from "@/lib/i18n";

export const metadata: Metadata = createRouteMetadata("en", "/premium", {
  title: "Premium Lifetime | Pregnancy Meal Planner",
  description:
    "Compare free and Premium pregnancy meal planning: unlimited AI plans, meal swaps, saved history, PDF export, and bilingual support for mothers."
});

export default function EnPremiumRoutePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PremiumPage locale="en" />
    </main>
  );
}
