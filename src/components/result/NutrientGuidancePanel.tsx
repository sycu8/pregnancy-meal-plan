import { nutrientGuidance } from "@/lib/nutrition/nutrientGuidance";

export function NutrientGuidancePanel() {
  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <p className="text-sm font-medium text-accent">Gợi ý đủ chất</p>
      <h2 className="mt-2 text-xl font-semibold">Checklist dinh dưỡng cho tuần này</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {nutrientGuidance.map((item) => (
          <div key={item.title} className="rounded-md bg-muted p-4">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Gợi ý: {item.foods}.</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.tip}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
