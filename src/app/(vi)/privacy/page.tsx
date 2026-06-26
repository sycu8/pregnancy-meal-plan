import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư | Bầu Ăn Gì?",
  description: "Cách Bầu Ăn Gì? lưu trữ dữ liệu trên trình duyệt và khi bạn chọn đồng bộ."
};

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
