import type { Metadata } from "next";
import { LandingPage } from "@/components/home/LandingPage";
import { SeoJsonLd } from "@/components/shared/SeoJsonLd";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata("en", "home");

export default function EnglishLandingPage() {
  return (
    <>
      <SeoJsonLd locale="en" />
      <LandingPage locale="en" />
    </>
  );
}
