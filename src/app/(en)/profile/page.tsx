import type { Metadata } from "next";
import { PlannerForm } from "@/components/planner/PlannerForm";
import { SyncOptInBanner } from "@/components/shared/SyncOptInBanner";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata("en", "profile");

export default function EnglishProfilePage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-3xl font-semibold">Pregnancy profile</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your details are stored only in this browser so the next meal plan can be filled in faster.
        </p>
      </div>
      <div className="mx-auto max-w-3xl">
        <SyncOptInBanner locale="en" />
      </div>
      <PlannerForm locale="en" mode="profile" />
    </main>
  );
}
