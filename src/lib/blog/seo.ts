import type { Metadata } from "next";
import type { BlogCategory, BlogLocale, BlogPost } from "@/types/blog";
import {
  buildBlogListKeywords,
  buildCategoryKeywords,
  buildPostKeywords,
  keywordsMetaValue
} from "@/lib/blog/keywords";
import { blogBasePath } from "@/lib/blog/ui";
import { siteOrigin } from "@/lib/agentDiscovery";
import { BRAND_NAME, localizedPath } from "@/lib/i18n";

const DEFAULT_OG_IMAGE = "/og-default.png";

const listMeta = {
  vi: {
    title: `Blog mẹ bầu & chăm con 0–24 tháng | ${BRAND_NAME}`,
    description:
      "Kiến thức dinh dưỡng bà bầu, thực đơn thai kỳ, chuẩn bị sinh và chăm con nhỏ — tổng hợp từ WHO, CDC, NHS, ACOG và nguồn y khoa uy tín.",
    locale: "vi_VN",
    lang: "vi-VN"
  },
  en: {
    title: `Pregnancy & baby blog (0–24 months) | ${BRAND_NAME}`,
    description:
      "Prenatal nutrition, meal plans, birth prep and baby care articles — synthesized from WHO, CDC, NHS, ACOG, NIH, FDA and trusted international medical sources.",
    locale: "en_US",
    lang: "en-US"
  }
} as const;

export function blogListMetadata(locale: BlogLocale = "en"): Metadata {
  const meta = listMeta[locale];
  const url = `${siteOrigin}${blogBasePath(locale)}`;
  const keywords = buildBlogListKeywords(locale);

  return {
    metadataBase: new URL(siteOrigin),
    title: meta.title,
    description: meta.description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        "en-US": `${siteOrigin}${localizedPath("en", "/blog")}`,
        "vi-VN": `${siteOrigin}${localizedPath("vi", "/blog")}`,
        "x-default": `${siteOrigin}${localizedPath("en", "/blog")}`
      }
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: BRAND_NAME,
      locale: meta.locale,
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: meta.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [DEFAULT_OG_IMAGE]
    },
    robots: { index: true, follow: true }
  };
}

export function blogCategoryMetadata(category: BlogCategory, locale: BlogLocale = "en"): Metadata {
  const url = `${siteOrigin}${blogBasePath(locale)}/${category.slug}`;
  const ogLocale = locale === "en" ? "en_US" : "vi_VN";
  const keywords = buildCategoryKeywords(category.slug, locale);

  return {
    metadataBase: new URL(siteOrigin),
    title: category.metaTitle,
    description: category.metaDescription,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        "en-US": `${siteOrigin}${localizedPath("en", `/blog/${category.slug}`)}`,
        "vi-VN": `${siteOrigin}${localizedPath("vi", `/blog/${category.slug}`)}`,
        "x-default": `${siteOrigin}${localizedPath("en", `/blog/${category.slug}`)}`
      }
    },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      url,
      siteName: BRAND_NAME,
      locale: ogLocale,
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: category.metaTitle }]
    },
    twitter: {
      card: "summary_large_image",
      title: category.metaTitle,
      description: category.metaDescription,
      images: [DEFAULT_OG_IMAGE]
    },
    robots: { index: true, follow: true }
  };
}

export function blogPostMetadata(post: BlogPost, locale: BlogLocale = "en"): Metadata {
  const base = blogBasePath(locale);
  const url = post.canonicalUrl ?? `${siteOrigin}${base}/${post.slug}`;
  const ogLocale = locale === "en" ? "en_US" : "vi_VN";
  const keywords = buildPostKeywords(post, locale);

  return {
    metadataBase: new URL(siteOrigin),
    title: post.metaTitle,
    description: post.metaDescription,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        "en-US": `${siteOrigin}${localizedPath("en", `/blog/${post.slug}`)}`,
        "vi-VN": `${siteOrigin}${localizedPath("vi", `/blog/${post.slug}`)}`,
        "x-default": `${siteOrigin}${localizedPath("en", `/blog/${post.slug}`)}`
      }
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      siteName: BRAND_NAME,
      locale: ogLocale,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.ogImage || DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: post.metaTitle }]
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.ogImage || DEFAULT_OG_IMAGE]
    },
    robots: { index: true, follow: true }
  };
}

export function blogPostJsonLd(post: BlogPost, locale: BlogLocale = "en") {
  const base = blogBasePath(locale);
  const url = post.canonicalUrl ?? `${siteOrigin}${base}/${post.slug}`;
  const lang = locale === "en" ? "en-US" : "vi-VN";

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author },
    ...(post.reviewer ? { reviewedBy: { "@type": "Person", name: post.reviewer } } : {}),
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: siteOrigin
    },
    mainEntityOfPage: url,
    inLanguage: lang,
    keywords: keywordsMetaValue(buildPostKeywords(post, locale)),
    about: ["pregnancy meal planner", "prenatal nutrition", "pregnancy meal plan", "baby care"],
    ...(post.ogImage
      ? {
          image: [post.ogImage]
        }
      : {})
  };
}

export function blogFaqJsonLd(post: BlogPost) {
  if (!post.faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function blogBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
