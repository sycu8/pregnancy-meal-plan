import { structuredData, type Locale } from "@/lib/i18n";

export function SeoJsonLd({ locale }: { locale: Locale }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData(locale))
      }}
    />
  );
}
