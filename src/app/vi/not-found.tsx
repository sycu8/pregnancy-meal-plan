import type { Metadata } from "next";
import { NotFoundContent } from "@/components/shared/NotFoundContent";
import { BRAND_NAME } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `Không tìm thấy trang | ${BRAND_NAME}`,
  description: "Trang này không tồn tại. Quay về trang chủ hoặc mở trình tạo thực đơn."
};

export default function VietnameseNotFound() {
  return <NotFoundContent locale="vi" />;
}
