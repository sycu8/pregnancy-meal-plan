import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocument";
import { createRouteMetadata } from "@/lib/i18n";
import { getPrivacyPolicy } from "@/lib/legal/content";

export const metadata: Metadata = createRouteMetadata("en", "/privacy", {
  title: "Privacy policy | Pregnancy Meal Planner",
  description:
    "Read how Pregnancy Meal Planner collects and stores profile data, optional account sync, payments, analytics, and your privacy choices.",
  keywords: ["privacy policy", "pregnancy meal planner privacy", "data protection"]
});

export default function EnPrivacyPage() {
  return <LegalDocumentView locale="en" kind="privacy" doc={getPrivacyPolicy("en")} />;
}
