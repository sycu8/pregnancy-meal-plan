import type { Metadata } from "next";
import Link from "next/link";
import { faqContent } from "@/lib/faq";
import { localizedPath } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Support | Bầu Ăn Gì?",
  description: "Support contact, FAQ and app information for Bầu Ăn Gì? pregnancy meal planner."
};

export default function EnSupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Support</h1>
      <p className="mt-4 text-muted-foreground leading-7">
        Bầu Ăn Gì? helps expecting parents plan Vietnamese home-style meals by gestational week. For technical help or product feedback, contact us by email below.
      </p>

      <section className="mt-8 rounded-lg border border-border bg-white p-5">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Email:{" "}
          <a className="font-medium text-accent hover:underline" href="mailto:support@mebauangi.info">
            support@mebauangi.info
          </a>
        </p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Website:{" "}
          <a className="font-medium text-accent hover:underline" href="https://mebauangi.info">
            mebauangi.info
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
        <Link href="/en/privacy" className="text-accent hover:underline">
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
