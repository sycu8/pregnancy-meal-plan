import type { Metadata } from "next";
import { MarketingPortal } from "@/components/marketing/MarketingPortal";
import { BRAND_NAME } from "@/lib/i18n";
import { getMarketingStatus } from "@/lib/marketing/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Portal marketing | ${BRAND_NAME}`,
  description: "Portal vận hành marketing: draft social, trạng thái kênh và kết nối Zapier/n8n.",
  robots: { index: false, follow: false }
};

export default async function ViMarketingPage() {
  const status = await getMarketingStatus("vi");
  return <MarketingPortal locale="vi" status={status} />;
}
