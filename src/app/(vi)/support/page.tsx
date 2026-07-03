import type { Metadata } from "next";
import Link from "next/link";
import { faqContent } from "@/lib/faq";
import { localizedPath } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Hỗ trợ | Bầu Ăn Gì?",
  description: "Liên hệ hỗ trợ, câu hỏi thường gặp và thông tin về ứng dụng Bầu Ăn Gì?."
};

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
          {faqContent.vi.map((item) => (
            <article key={item.question} className="rounded-lg border border-border bg-white p-5">
              <h3 className="font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer}</p>
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
