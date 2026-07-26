import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocument";
import { createRouteMetadata } from "@/lib/i18n";
import { getTermsOfService } from "@/lib/legal/content";

export const metadata: Metadata = createRouteMetadata("en", "/terms", {
  title: "Terms of service | Pregnancy Meal Planner",
  description:
    "Terms of service for Pregnancy Meal Planner: acceptable use, medical disclaimer, Premium billing, AI-generated plans, and liability limits.",
  keywords: ["terms of service", "pregnancy meal planner terms", "medical disclaimer"]
});

export default function EnTermsPage() {
  return <LegalDocumentView locale="en" kind="terms" doc={getTermsOfService("en")} />;
}
