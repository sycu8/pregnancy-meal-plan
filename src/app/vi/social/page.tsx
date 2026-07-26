import type { Metadata } from "next";
import { SocialHubContent } from "@/components/social/SocialHubContent";
import { BRAND_NAME, localizedPath } from "@/lib/i18n";
import { socialSameAs } from "@/lib/social/links";
import { socialPageCopy } from "@/lib/social/profiles";
import { siteOrigin } from "@/lib/agentDiscovery";

const copy = socialPageCopy.vi;
const canonical = `${siteOrigin}${localizedPath("vi", "/social")}`;

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  alternates: {
    canonical: "/vi/social",
    languages: {
      "en-US": "/social",
      "vi-VN": "/vi/social",
      "x-default": "/social"
    }
  },
  openGraph: {
    title: copy.metaTitle,
    description: copy.metaDescription,
    url: canonical,
    siteName: BRAND_NAME,
    locale: "vi_VN",
    type: "website",
    images: [{ url: "/brand/social/facebook-cover.png", width: 1640, height: 924, alt: BRAND_NAME }]
  },
  twitter: {
    card: "summary_large_image",
    title: copy.metaTitle,
    description: copy.metaDescription,
    images: ["/brand/social/x-header.png"]
  }
};

export default function ViSocialPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: siteOrigin,
    sameAs: socialSameAs
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SocialHubContent locale="vi" />
    </>
  );
}
