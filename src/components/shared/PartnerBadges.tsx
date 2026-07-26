import type { Locale } from "@/lib/i18n";

const partners = [
  { name: "Vinmec", href: "https://www.vinmec.com" },
  { name: "Tâm Anh", href: "https://tamanhhospital.vn" },
  { name: "Medlatec", href: "https://medlatec.vn" },
  { name: "Long Châu", href: "https://nhathuoclongchau.com.vn" },
  { name: "ACOG", href: "https://www.acog.org" },
  { name: "WHO", href: "https://www.who.int" }
];

export function PartnerBadges({ locale = "vi" }: { locale?: Locale }) {
  const title = locale === "en" ? "Reference partners & sources" : "Đối tác & nguồn tham khảo";

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {partners.map((partner) => (
          <a
            key={partner.name}
            href={partner.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
          >
            {partner.name}
          </a>
        ))}
      </div>
    </section>
  );
}
