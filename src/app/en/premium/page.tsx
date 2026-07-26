import type { Metadata } from "next";
import { PremiumPage } from "@/components/premium/PremiumPage";

export const metadata: Metadata = {
  title: "Premium Lifetime | Bầu Ăn Gì?",
  description: "One-time payment — unlimited AI meal plans, swaps, history, and PDF export."
};

export default function EnPremiumRoutePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PremiumPage locale="en" />
    </main>
  );
}
