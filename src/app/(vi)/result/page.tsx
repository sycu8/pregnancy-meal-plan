import type { Metadata } from "next";
import { MealPlanResult } from "@/components/result/MealPlanResult";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata("vi", "result");

export default function ResultPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <MealPlanResult locale="vi" />
    </main>
  );
}
