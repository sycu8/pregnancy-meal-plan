import type { Metadata } from "next";
import { LandingPage } from "@/components/home/LandingPage";
import { SeoJsonLd } from "@/components/shared/SeoJsonLd";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata("vi", "home");

export default function VietnameseLandingPage() {
  return (
    <>
      <SeoJsonLd locale="vi" />
      <LandingPage locale="vi" />
    </>
  );
}
