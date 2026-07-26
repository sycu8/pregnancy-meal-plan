import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { BRAND_NAME, localizedPath, type Locale } from "@/lib/i18n";

const copy = {
  en: {
    code: "404",
    title: "This page could not be found",
    body: "The link may be outdated, or the page may have moved when we switched to pregnancymeal.tips. Try one of these instead.",
    home: "Go to homepage",
    planner: "Open meal planner",
    blog: "Read the blog",
    otherLocale: "Tiếng Việt",
    otherHref: "/vi"
  },
  vi: {
    code: "404",
    title: "Không tìm thấy trang này",
    body: "Liên kết có thể đã cũ, hoặc trang đã chuyển khi chúng tôi chuyển sang pregnancymeal.tips. Hãy thử một trong các liên kết dưới đây.",
    home: "Về trang chủ",
    planner: "Mở trình tạo thực đơn",
    blog: "Đọc blog",
    otherLocale: "English",
    otherHref: "/"
  }
} as const;

export function NotFoundContent({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-4 py-16">
      <Link
        href={localizedPath(locale, "/")}
        className="mb-10 inline-flex items-center gap-2 font-semibold text-foreground"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>{BRAND_NAME}</span>
      </Link>

      <p className="text-sm font-medium text-accent">{t.code}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{t.title}</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">{t.body}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={localizedPath(locale, "/")}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {t.home}
        </Link>
        <Link
          href={localizedPath(locale, "/planner")}
          className="inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          {t.planner}
        </Link>
        <Link
          href={localizedPath(locale, "/blog")}
          className="inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          {t.blog}
        </Link>
        <Link
          href={t.otherHref}
          className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {t.otherLocale}
        </Link>
      </div>
    </main>
  );
}
