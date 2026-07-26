import type { Metadata } from "next";
import { NotFoundContent } from "@/components/shared/NotFoundContent";
import { beVietnamPro } from "@/lib/fonts";
import { BRAND_NAME } from "@/lib/i18n";
import { siteViewport } from "@/lib/viewport";
import "./globals.css";

export const metadata: Metadata = {
  title: `Page not found | ${BRAND_NAME}`,
  description: "This page does not exist. Head home or open the pregnancy meal planner."
};

export const viewport = siteViewport;

/**
 * Full-document 404 for multi-root-layout apps (EN at `/`, VI at `/vi`).
 * Requires experimental.globalNotFound in next.config.ts.
 * Locale catch-alls also render `not-found.tsx` inside each root layout.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en-US" className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>
      <body className="min-h-screen font-sans antialiased">
        <NotFoundContent locale="en" />
      </body>
    </html>
  );
}
