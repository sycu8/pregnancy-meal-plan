import type { Metadata } from "next";
import { createRouteMetadata } from "@/lib/i18n";

export const metadata: Metadata = createRouteMetadata("vi", "/privacy", {
  title: "Chính sách quyền riêng tư | Pregnancy Meal Planner",
  description:
    "Tìm hiểu cách Pregnancy Meal Planner lưu hồ sơ và thực đơn trên trình duyệt, đồng bộ đám mây tùy chọn và lựa chọn quyền riêng tư của bạn."
});

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-sm">
      <h1 className="text-3xl font-semibold">Chính sách quyền riêng tư</h1>
      <p className="mt-4 text-muted-foreground leading-7">
        Phiên bản miễn phí lưu hồ sơ và thực đơn trên trình duyệt bằng localStorage. Chúng tôi không bán dữ liệu cá nhân.
        Khi bạn bật đồng bộ (tùy chọn), chỉ các trường cần cho thực đơn được lưu trên Cloudflare D1 theo tài khoản của bạn.
      </p>
      <p className="mt-4 text-muted-foreground leading-7">
        API tạo thực đơn chỉ nhận thông tin bạn gửi để tính toán thực đơn tham khảo. Bạn có thể xóa dữ liệu trên trình duyệt bất cứ lúc nào.
      </p>
    </main>
  );
}
