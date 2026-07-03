import type { Metadata } from "next";
import Link from "next/link";
import { localizedPath } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Hỗ trợ | Bầu Ăn Gì?",
  description: "Liên hệ hỗ trợ, câu hỏi thường gặp và thông tin về ứng dụng Bầu Ăn Gì?."
};

const faq = [
  {
    q: "Ứng dụng có thay thế bác sĩ không?",
    a: "Không. Bầu Ăn Gì? chỉ gợi ý thực đơn tham khảo. Hãy hỏi bác sĩ sản khoa hoặc chuyên gia dinh dưỡng trước khi thay đổi chế độ ăn, đặc biệt khi bạn có bệnh nền hoặc thai kỳ nguy cơ cao."
  },
  {
    q: "Dữ liệu của tôi được lưu ở đâu?",
    a: "Phiên bản miễn phí lưu hồ sơ và thực đơn trên thiết bị của bạn. Bạn có thể bật đồng bộ tùy chọn để lưu trên server. Xem thêm tại trang Chính sách quyền riêng tư."
  },
  {
    q: "Giới hạn miễn phí là gì?",
    a: "Miễn phí gồm 3 lượt tạo thực đơn AI mỗi ngày, 5 lượt đổi món mỗi ngày và lưu tối đa 20 thực đơn trong lịch sử. Rule-based planner vẫn hoạt động khi hết lượt AI."
  },
  {
    q: "Làm sao xóa dữ liệu trên trình duyệt?",
    a: "Vào trang Lịch sử để xóa từng thực đơn, hoặc xóa dữ liệu trang web trong cài đặt trình duyệt/ứng dụng."
  }
];

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Hỗ trợ</h1>
      <p className="mt-4 text-muted-foreground leading-7">
        Bầu Ăn Gì? giúp mẹ bầu lên thực đơn món Việt theo tuần thai. Nếu bạn cần trợ giúp kỹ thuật hoặc có góp ý sản phẩm, hãy liên hệ qua email bên dưới.
      </p>

      <section className="mt-8 rounded-lg border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Liên hệ</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Email:{" "}
          <a className="font-medium text-accent hover:underline" href="mailto:support@mebauangi.info">
            support@mebauangi.info
          </a>
        </p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Website:{" "}
          <a className="font-medium text-accent hover:underline" href="https://mebauangi.info">
            mebauangi.info
          </a>
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Câu hỏi thường gặp</h2>
        <div className="mt-4 space-y-4">
          {faq.map((item) => (
            <article key={item.q} className="rounded-lg border border-border bg-white p-5">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        <Link href="/privacy" className="text-accent hover:underline">
          Chính sách quyền riêng tư
        </Link>
        {" · "}
        <Link href={localizedPath("vi", "/planner")} className="text-accent hover:underline">
          Tạo thực đơn
        </Link>
      </p>
    </main>
  );
}
