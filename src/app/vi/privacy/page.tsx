import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocument";
import { createRouteMetadata } from "@/lib/i18n";
import { getPrivacyPolicy } from "@/lib/legal/content";

export const metadata: Metadata = createRouteMetadata("vi", "/privacy", {
  title: "Chính sách quyền riêng tư | Pregnancy Meal Planner",
  description:
    "Tìm hiểu cách Pregnancy Meal Planner thu thập và lưu hồ sơ, đồng bộ tài khoản tùy chọn, thanh toán, phân tích và lựa chọn quyền riêng tư của bạn.",
  keywords: ["chính sách quyền riêng tư", "bảo vệ dữ liệu", "thực đơn mẹ bầu"]
});

export default function ViPrivacyPage() {
  return <LegalDocumentView locale="vi" kind="privacy" doc={getPrivacyPolicy("vi")} />;
}
