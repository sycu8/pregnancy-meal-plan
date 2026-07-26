import type { Metadata } from "next";
import { SiteChrome } from "@/components/shared/SiteChrome";
import { beVietnamPro } from "@/lib/fonts";
import { createRootLayoutMetadata } from "@/lib/i18n";
import { siteViewport } from "@/lib/viewport";
import "../globals.css";

export const metadata: Metadata = createRootLayoutMetadata("vi");
export const viewport = siteViewport;

export default function VietnameseRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi-VN" className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>
      <SiteChrome locale="vi">{children}</SiteChrome>
    </html>
  );
}
