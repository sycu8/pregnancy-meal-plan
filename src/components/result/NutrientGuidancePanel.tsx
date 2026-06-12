import { nutrientGuidance } from "@/lib/nutrition/nutrientGuidance";
import type { Locale } from "@/lib/i18n";

const copy = {
  vi: {
    label: "Gợi ý đủ chất",
    title: "Checklist dinh dưỡng cho tuần này",
    suggestion: "Gợi ý"
  },
  en: {
    label: "Nutrient guidance",
    title: "Pregnancy nutrition checklist for this week",
    suggestion: "Suggested foods"
  }
} as const;

export function NutrientGuidancePanel({ locale = "vi" }: { locale?: Locale }) {
  const t = copy[locale];

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <p className="text-sm font-medium text-accent">{t.label}</p>
      <h2 className="mt-2 text-xl font-semibold">{t.title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {nutrientGuidance.map((item) => (
          <div key={item.title} className="rounded-md bg-muted p-4">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.suggestion}: {item.foods}.</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.tip}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
