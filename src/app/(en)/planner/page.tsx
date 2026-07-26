import type { Metadata } from "next";
import { PlannerForm } from "@/components/planner/PlannerForm";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata("en", "planner");

export default function EnglishPlannerPage() {
  return (
    <main className="px-4 py-8">
      <PlannerForm locale="en" />
    </main>
  );
}
