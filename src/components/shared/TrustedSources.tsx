import { ExternalLink } from "lucide-react";
import { referenceSources } from "@/lib/nutrition/nutrientGuidance";
import type { Locale } from "@/lib/i18n";

const copy = {
  vi: {
    label: "Nguồn tham khảo chính thống",
    title: "Dựa trên hướng dẫn dinh dưỡng và an toàn thực phẩm thai kỳ",
    note: "Các nguồn này dùng để định hướng an toàn và nhóm chất. Ứng dụng vẫn chỉ tạo gợi ý tham khảo, không thay thế tư vấn cá nhân từ bác sĩ."
  },
  en: {
    label: "Trusted references",
    title: "Based on pregnancy nutrition and food-safety guidance",
    note: "These references guide safety rules and nutrient groups. The app still provides educational suggestions only and does not replace personal medical advice."
  }
} as const;

const englishDescriptions: Record<string, string> = {
  ACOG: "Pregnancy nutrition guidance from the American College of Obstetricians and Gynecologists.",
  CDC: "Food-safety guidance for pregnant women from the U.S. Centers for Disease Control and Prevention.",
  NHS: "Practical guidance on foods to avoid during pregnancy from the UK National Health Service.",
  WHO: "Global public-health recommendations for iron and folic acid supplementation in pregnancy.",
  Vinmec: "Vinmec healthcare system: obstetrics, pregnancy nutrition, and maternal–child care articles for Vietnam.",
  "Tâm Anh": "Tam Anh General Hospital: obstetrics news and guidance on high-risk pregnancy and perinatal care.",
  Medlatec: "Medlatec: medical news, lab testing guidance, and maternal–newborn health articles in Vietnam.",
  "Long Châu": "FPT Long Chau Pharmacy: mother-and-baby health articles, nutrition, and pregnancy wellness."
};

export function TrustedSources({ locale = "vi" }: { locale?: Locale }) {
  const t = copy[locale];

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-accent">{t.label}</p>
      <h2 className="mt-2 text-xl font-semibold">{t.title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {referenceSources.map((source) => (
          <a
            key={source.name}
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border p-4 transition hover:border-accent hover:bg-muted"
          >
            <span className="flex items-center gap-2 font-semibold">
              {source.name}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
              {locale === "vi" ? source.description : englishDescriptions[source.name] ?? source.description}
            </span>
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">{t.note}</p>
    </section>
  );
}
