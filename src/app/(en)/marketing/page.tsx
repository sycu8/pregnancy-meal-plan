import type { Metadata } from "next";
import { MarketingPortal } from "@/components/marketing/MarketingPortal";
import { BRAND_NAME } from "@/lib/i18n";
import { getMarketingStatus } from "@/lib/marketing/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Marketing portal | ${BRAND_NAME}`,
  description: "Internal marketing ops portal for social drafts, channel status, and Zapier/n8n automation.",
  robots: { index: false, follow: false }
};

export default async function EnMarketingPage() {
  const status = await getMarketingStatus("en");
  return <MarketingPortal locale="en" status={status} />;
}
