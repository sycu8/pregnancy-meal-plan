import type { Metadata } from "next";
import { PlannerForm } from "@/components/planner/PlannerForm";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata("vi", "planner");

export default function PlannerPage() {
  return (
    <main className="px-4 py-8">
      <PlannerForm locale="vi" />
    </main>
  );
}
