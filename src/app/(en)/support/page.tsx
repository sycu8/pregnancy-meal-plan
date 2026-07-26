import type { Metadata } from "next";
import Link from "next/link";
import { faqContent } from "@/lib/faq";
import { faqPageStructuredData, localizedPath } from "@/lib/i18n";
import { DEFAULT_SITE_URL, SITE_HOST, SUPPORT_EMAIL, SUPPORT_EMAIL_MAILTO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support | Pregnancy Meal Planner",
  description: "Contact support, read FAQ answers, and learn how Pregnancy Meal Planner works."
};

export default function EnSupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageStructuredData("en")) }}
      />
      <h1 className="text-3xl font-semibold">Support</h1>
      <p className="mt-4 text-muted-foreground leading-7">
        Pregnancy Meal Planner helps expecting parents plan meals by gestational week. For technical help or product feedback, contact us by email below.
      </p>

      <section className="mt-8 rounded-lg border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Contact</h2>
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
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="mt-4 space-y-4">
          {faqContent.en.map((item) => (
            <article key={item.question} className="rounded-lg border border-border bg-white p-5">
              <h3 className="font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        <Link href="/privacy" className="text-accent hover:underline">
          Privacy policy
        </Link>
        {" · "}
        <Link href={localizedPath("en", "/planner")} className="text-accent hover:underline">
          Create a meal plan
        </Link>
      </p>
    </main>
  );
}
