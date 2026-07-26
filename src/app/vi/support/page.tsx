import type { Metadata } from "next";
import Link from "next/link";
import { AgentClaimVerify } from "@/components/shared/AgentClaimVerify";
import { faqContent } from "@/lib/faq";
import { faqPageStructuredData, localizedPath } from "@/lib/i18n";
import { DEFAULT_SITE_URL, SITE_HOST, SUPPORT_EMAIL, SUPPORT_EMAIL_MAILTO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hỗ trợ | Pregnancy Meal Planner",
  description: "Liên hệ hỗ trợ, xem câu hỏi thường gặp và thông tin về Pregnancy Meal Planner."
};

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageStructuredData("vi")) }}
      />
      <h1 className="text-3xl font-semibold">Hỗ trợ</h1>
      <p className="mt-4 text-muted-foreground leading-7">
        Pregnancy Meal Planner giúp mẹ bầu lên thực đơn theo tuần thai. Nếu bạn cần trợ giúp kỹ thuật hoặc có góp ý sản phẩm, hãy liên hệ qua email bên dưới.
      </p>

      <AgentClaimVerify locale="vi" />

      <section className="mt-8 rounded-lg border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Liên hệ</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Email:{" "}
          <a className="font-medium text-accent hover:underline" href={SUPPORT_EMAIL_MAILTO}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Website:{" "}
          <a className="font-medium text-accent hover:underline" href={DEFAULT_SITE_URL}>
            {SITE_HOST}
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
        <Link href={localizedPath("vi", "/privacy")} className="text-accent hover:underline">
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
