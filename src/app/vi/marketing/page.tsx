import type { Metadata } from "next";
import { MarketingPortal } from "@/components/marketing/MarketingPortal";
import { BRAND_NAME } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `Portal marketing | ${BRAND_NAME}`,
  description: "Portal vận hành marketing: draft social, trạng thái kênh và kết nối Zapier/n8n.",
  robots: { index: false, follow: false }
};

export default function ViMarketingPage() {
  return <MarketingPortal locale="vi" />;
}
