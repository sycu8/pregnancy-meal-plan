import type { Metadata } from "next";
import type { BlogCategory, BlogLocale, BlogPost } from "@/types/blog";
import { blogBasePath } from "@/lib/blog/ui";
import { siteOrigin } from "@/lib/agentDiscovery";

const listMeta = {
  vi: {
    title: "Blog mẹ bầu & chăm con 0–24 tháng | Bầu Ăn Gì?",
    description:
      "Kiến thức dinh dưỡng bà bầu, thực đơn thai kỳ, chuẩn bị sinh và chăm con nhỏ — tổng hợp từ WHO, CDC, NHS, ACOG và nguồn y khoa uy tín.",
    locale: "vi_VN",
    lang: "vi-VN"
  },
  en: {
    title: "Pregnancy & baby blog (0–24 months) | Bầu Ăn Gì?",
    description:
      "Prenatal nutrition, meal plans, birth prep and baby care articles — synthesized from WHO, CDC, NHS, ACOG and trusted medical sources.",
    locale: "en_US",
    lang: "en-US"
  }
} as const;

export function blogListMetadata(locale: BlogLocale = "vi"): Metadata {
  const meta = listMeta[locale];
  const url = `${siteOrigin}${blogBasePath(locale)}`;

  return {
    metadataBase: new URL(siteOrigin),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: url,
      languages: {
        "vi-VN": `${siteOrigin}/blog`,
        "en-US": `${siteOrigin}/en/blog`
      }
    },
    openGraph: { title: meta.title, description: meta.description, url, siteName: "Bầu Ăn Gì?", locale: meta.locale, type: "website" },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
    robots: { index: true, follow: true }
  };
}

export function blogCategoryMetadata(category: BlogCategory, locale: BlogLocale = "vi"): Metadata {
  const url = `${siteOrigin}${blogBasePath(locale)}/${category.slug}`;
  const ogLocale = locale === "en" ? "en_US" : "vi_VN";

  return {
    metadataBase: new URL(siteOrigin),
    title: category.metaTitle,
    description: category.metaDescription,
    alternates: {
      canonical: url,
      languages: {
        "vi-VN": `${siteOrigin}/blog/${category.slug}`,
        "en-US": `${siteOrigin}/en/blog/${category.slug}`
      }
    },
    openGraph: { title: category.metaTitle, description: category.metaDescription, url, locale: ogLocale, type: "website" },
    robots: { index: true, follow: true }
  };
}

export function blogPostMetadata(post: BlogPost, locale: BlogLocale = "vi"): Metadata {
  const base = blogBasePath(locale);
  const url = post.canonicalUrl ?? `${siteOrigin}${base}/${post.slug}`;
  const ogLocale = locale === "en" ? "en_US" : "vi_VN";

  return {
    metadataBase: new URL(siteOrigin),
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: url,
      languages: {
        "vi-VN": `${siteOrigin}/blog/${post.slug}`,
        "en-US": `${siteOrigin}/en/blog/${post.slug}`
      }
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      siteName: "Bầu Ăn Gì?",
      locale: ogLocale,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      ...(post.ogImage ? { images: [{ url: post.ogImage }] } : {})
    },
    twitter: { card: "summary_large_image", title: post.metaTitle, description: post.metaDescription },
    robots: { index: true, follow: true }
  };
}

export function blogPostJsonLd(post: BlogPost, locale: BlogLocale = "vi") {
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
      name: "Bầu Ăn Gì?",
      url: siteOrigin
    },
    mainEntityOfPage: url,
    inLanguage: lang,
    keywords: post.tags.join(", ")
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
