import { howToContent, howToStructuredData, shortFaq, shortFaqStructuredData } from "@/lib/aeo";
import { localizedPath, type Locale } from "@/lib/i18n";
import Link from "next/link";

const labels = {
  vi: { faq: "Câu hỏi thường gặp", planner: "Mở trang tạo thực đơn" },
  en: { faq: "Common questions", planner: "Open the planner" }
} as const;

export function HomeAeo({ locale }: { locale: Locale }) {
  const howTo = howToContent[locale];
  const faq = shortFaq[locale];
  const text = labels[locale];

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 pb-12">
      <div id="howto" className="rounded-2xl border border-border bg-white p-6 shadow-soft md:p-8">
        <h2 className="text-2xl font-semibold">{howTo.name}</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{howTo.description}</p>
        <ol className="mt-5 list-decimal space-y-4 pl-5 text-base leading-7">
          {howTo.steps.map((step, index) => (
            <li key={step.name} id={`howto-step-${index + 1}`}>
              <span className="font-medium text-foreground">{step.name}.</span>{" "}
              <span className="text-muted-foreground">{step.text}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-muted-foreground">
          <Link href={localizedPath(locale, "/planner")} className="font-medium text-accent hover:underline">
            {text.planner}
          </Link>
        </p>
      </div>

      <div id="faq" className="rounded-2xl border border-border bg-white p-6 shadow-soft md:p-8">
        <h2 className="text-2xl font-semibold">{text.faq}</h2>
        <div className="mt-5 space-y-5">
          {faq.map((item) => (
            <article key={item.question}>
              <h3 className="text-base font-semibold">{item.question}</h3>
              <p className="mt-2 text-base leading-7 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToStructuredData(locale)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(shortFaqStructuredData(locale)) }} />
    </section>
  );
}
