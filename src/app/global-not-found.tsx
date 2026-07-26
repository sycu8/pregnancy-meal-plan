import Link from "next/link";
import type { Metadata } from "next";
import { UtensilsCrossed } from "lucide-react";
import { beVietnamPro } from "@/lib/fonts";
import { BRAND_NAME } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: `Page not found | ${BRAND_NAME}`,
  description: "This page does not exist. Head home or open the pregnancy meal planner."
};

/**
 * Full-document 404 for multi-root-layout apps (EN at `/`, VI at `/vi`).
 * Requires experimental.globalNotFound in next.config.ts.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en-US" className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>
      <body className="min-h-screen font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-16">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 font-semibold text-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>{BRAND_NAME}</span>
          </Link>

          <p className="text-sm font-medium text-accent">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            This page could not be found
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
            The link may be outdated, or the page may have moved when we switched to pregnancymeal.tips.
            Try one of these instead.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Go to homepage
            </Link>
            <Link
              href="/planner"
              className="inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Open meal planner
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Read the blog
            </Link>
            <Link
              href="/vi"
              className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Tiếng Việt
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
