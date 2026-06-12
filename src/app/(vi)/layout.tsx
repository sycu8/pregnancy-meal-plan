import type { Metadata } from "next";
import { SiteChrome } from "@/components/shared/SiteChrome";
import { beVietnamPro } from "@/lib/fonts";
import { createPageMetadata } from "@/lib/i18n";
import "../globals.css";

export const metadata: Metadata = createPageMetadata("vi", "home");

export default function VietnameseRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi-VN" className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>
      <SiteChrome locale="vi">{children}</SiteChrome>
    </html>
  );
}
