import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocument";
import { createRouteMetadata } from "@/lib/i18n";
import { getTermsOfService } from "@/lib/legal/content";

export const metadata: Metadata = createRouteMetadata("vi", "/terms", {
  title: "Điều khoản sử dụng | Pregnancy Meal Planner",
  description:
    "Điều khoản sử dụng Pregnancy Meal Planner: cách dùng hợp lệ, tuyên bố không phải tư vấn y khoa, Premium, nội dung AI và giới hạn trách nhiệm.",
  keywords: ["điều khoản sử dụng", "tuyên bố y khoa", "thực đơn mẹ bầu"]
});

export default function ViTermsPage() {
  return <LegalDocumentView locale="vi" kind="terms" doc={getTermsOfService("vi")} />;
}
