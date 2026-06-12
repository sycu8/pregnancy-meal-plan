import type { Metadata } from "next";
import { SiteChrome } from "@/components/shared/SiteChrome";
import { beVietnamPro } from "@/lib/fonts";
import { createPageMetadata } from "@/lib/i18n";
import "../globals.css";

export const metadata: Metadata = createPageMetadata("en", "home");

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>
      <SiteChrome locale="en">{children}</SiteChrome>
    </html>
  );
}
