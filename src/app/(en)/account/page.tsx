import type { Metadata } from "next";
import { AccountPanel } from "@/components/account/AccountPanel";
import { createRouteMetadata } from "@/lib/i18n";

export const metadata: Metadata = createRouteMetadata("en", "/account", {
  title: "Account | Pregnancy Meal Planner",
  description:
    "Sign in to manage your Pregnancy Meal Planner account, sync saved meal plans, Premium status, and bilingual settings securely.",
  index: false
});

export default function EnAccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <AccountPanel locale="en" />
    </main>
  );
}
