import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { LegalDocument as LegalDocumentData } from "@/lib/legal/content";

const labels = {
  en: {
    lastUpdated: "Last updated",
    privacy: "Privacy policy",
    terms: "Terms of service",
    support: "Support"
  },
  vi: {
    lastUpdated: "Cập nhật lần cuối",
    privacy: "Chính sách quyền riêng tư",
    terms: "Điều khoản sử dụng",
    support: "Hỗ trợ"
  }
} as const;

export function LegalDocumentView({
  locale,
  doc,
  kind
}: {
  locale: Locale;
  doc: LegalDocumentData;
  kind: "privacy" | "terms";
}) {
  const t = labels[locale];
  const otherHref = localizedPath(locale, kind === "privacy" ? "/terms" : "/privacy");
  const otherLabel = kind === "privacy" ? t.terms : t.privacy;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{doc.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t.lastUpdated}: {doc.lastUpdated}
      </p>
      <p className="mt-6 text-base leading-7 text-muted-foreground">{doc.intro}</p>

      <div className="mt-10 space-y-8">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.heading}-p-${index}`} className="mt-3 text-sm leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
            {section.bullets?.length ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
                {section.bullets.map((bullet, index) => (
                  <li key={`${section.heading}-b-${index}`}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm leading-7 text-muted-foreground">{doc.contactNote}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href={otherHref} className="text-accent hover:underline">
          {otherLabel}
        </Link>
        {" · "}
        <Link href={localizedPath(locale, "/support")} className="text-accent hover:underline">
          {t.support}
        </Link>
      </p>
    </main>
  );
}
