import type { Metadata } from "next";
import Link from "next/link";
import { localizedPath } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Support | Bầu Ăn Gì?",
  description: "Support contact, FAQ and app information for Bầu Ăn Gì? pregnancy meal planner."
};

const faq = [
  {
    q: "Does the app replace my doctor?",
    a: "No. Bầu Ăn Gì? provides reference meal suggestions only. Ask your obstetrician or dietitian before changing your diet, especially with high-risk pregnancies or medical conditions."
  },
  {
    q: "Where is my data stored?",
    a: "The free tier stores your profile and meal plans on your device. Optional sync stores meal-planning fields on the server. See the privacy policy for details."
  },
  {
    q: "What are the free-tier limits?",
    a: "Free accounts include 3 AI meal plans per day, 5 meal swaps per day and up to 20 saved plans in history. Rule-based planning remains available when AI daily limits are reached."
  },
  {
    q: "How do I delete local data?",
    a: "Remove individual plans from History, or clear site data in your browser or app settings."
  }
];

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
          {faq.map((item) => (
            <article key={item.q} className="rounded-lg border border-border bg-white p-5">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.a}</p>
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
