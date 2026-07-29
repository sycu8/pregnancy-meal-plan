import type { Metadata } from "next";
import { faqContent } from "@/lib/faq";
import { SUPPORT_EMAIL } from "@/lib/site";
import { socialSameAs } from "@/lib/social/links";

export type Locale = "vi" | "en";
export type PageKey = "home" | "planner" | "history" | "profile" | "result";

export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "vi"];

export const BRAND_NAME = "Pregnancy Meal Planner";

export const pagePaths: Record<PageKey, string> = {
  home: "/",
  planner: "/planner",
  history: "/history",
  profile: "/profile",
  result: "/result"
};

export function stripLocaleFromPath(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const stripped = normalized.replace(/^\/vi(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

/** English is unprefixed (default). Vietnamese uses `/vi` prefix. */
export function localizedPath(locale: Locale, pathname: string) {
  const routePath = stripLocaleFromPath(pathname);
  if (locale === "en") return routePath;
  return routePath === "/" ? "/vi" : `/vi${routePath}`;
}

export const siteCopy = {
  vi: {
    brand: BRAND_NAME,
    languageLabel: "English",
    nav: {
      planner: "Tạo thực đơn",
      history: "Lịch sử",
      profile: "Hồ sơ",
      account: "Tài khoản",
      premium: "Premium",
      support: "Hỗ trợ",
      blog: "Blog",
      social: "Social"
    }
  },
  en: {
    brand: BRAND_NAME,
    languageLabel: "Tiếng Việt",
    nav: {
      planner: "Create plan",
      history: "History",
      profile: "Profile",
      account: "Account",
      premium: "Premium",
      support: "Support",
      blog: "Blog",
      social: "Social"
    }
  }
} as const;

export const pageSeo: Record<Locale, Record<PageKey, { title: string; description: string; keywords: string[] }>> = {
  en: {
    home: {
      title: "Pregnancy Meal Planner | 7-Day Prenatal Meal Plans",
      description:
        "Create a personalized 7-day pregnancy meal plan by week, weight, taste, budget, and common prenatal concerns.",
      keywords: [
        "pregnancy meal planner",
        "prenatal nutrition plan",
        "7 day pregnancy meal plan",
        "healthy meals for pregnant women",
        "gestational diabetes meal plan"
      ]
    },
    planner: {
      title: "Create a Free Pregnancy Meal Plan | Pregnancy Meal Planner",
      description:
        "Enter week, weight, preferences, and health notes to build a 7-day pregnancy meal plan with a shopping list.",
      keywords: ["create pregnancy meal plan", "prenatal meal planner", "pregnancy shopping list"]
    },
    history: {
      title: "Saved Pregnancy Meal Plans | Pregnancy Meal Planner",
      description:
        "Review saved pregnancy meal plans in this browser, reopen a plan, or clear local history without an account.",
      keywords: ["saved pregnancy meal plans", "meal plan history", "prenatal nutrition"]
    },
    profile: {
      title: "Pregnancy Nutrition Profile | Pregnancy Meal Planner",
      description:
        "Save pregnancy week, weight, preferences, and goals in your browser for faster personalized meal plans.",
      keywords: ["pregnancy nutrition profile", "prenatal profile", "personalized pregnancy meals"]
    },
    result: {
      title: "7-Day Pregnancy Meal Plan Result | Pregnancy Meal Planner",
      description:
        "See your 7-day pregnancy meal plan with meal ideas, reference portions, estimated costs, and shopping list.",
      keywords: ["pregnancy meal plan result", "7 day prenatal meal plan", "pregnancy shopping list"]
    }
  },
  vi: {
    home: {
      title: "Pregnancy Meal Planner | Thực đơn thai kỳ 7 ngày",
      description:
        "Tạo thực đơn thai kỳ 7 ngày theo tuần thai, cân nặng, khẩu vị, ngân sách và các triệu chứng thường gặp.",
      keywords: [
        "thực đơn mẹ bầu",
        "pregnancy meal planner",
        "dinh dưỡng thai kỳ",
        "thực đơn bà bầu 7 ngày",
        "ăn gì khi mang thai"
      ]
    },
    planner: {
      title: "Tạo thực đơn mẹ bầu miễn phí | Pregnancy Meal Planner",
      description:
        "Nhập tuần thai, cân nặng, khẩu vị và tình trạng sức khỏe để tạo thực đơn 7 ngày kèm danh sách đi chợ.",
      keywords: ["tạo thực đơn mẹ bầu", "meal planner thai kỳ", "danh sách đi chợ mẹ bầu"]
    },
    history: {
      title: "Lịch sử thực đơn thai kỳ | Pregnancy Meal Planner",
      description:
        "Xem lại thực đơn thai kỳ đã lưu trên trình duyệt, mở lại kế hoạch cũ hoặc xóa lịch sử khi không cần.",
      keywords: ["lịch sử thực đơn", "thực đơn thai kỳ đã lưu", "thực đơn mẹ bầu"]
    },
    profile: {
      title: "Hồ sơ thai kỳ cá nhân | Pregnancy Meal Planner",
      description:
        "Lưu tuần thai, cân nặng, khẩu vị và mục tiêu dinh dưỡng trên trình duyệt để tạo thực đơn nhanh hơn mỗi lần.",
      keywords: ["hồ sơ thai kỳ", "thông tin mẹ bầu", "dinh dưỡng cá nhân hóa"]
    },
    result: {
      title: "Kết quả thực đơn 7 ngày | Pregnancy Meal Planner",
      description:
        "Xem thực đơn 7 ngày với món ăn gợi ý, khẩu phần tham khảo, chi phí ước tính và danh sách đi chợ chi tiết.",
      keywords: ["kết quả thực đơn", "thực đơn 7 ngày", "danh sách đi chợ"]
    }
  }
};

export const landingContent = {
  en: {
    headline: "Pregnancy Meal Planner",
    subhead: "Personalized prenatal meals for a healthier pregnancy, week by week.",
    intro:
      "Create a 7-day pregnancy meal plan based on gestational week, weight, taste, budget and common concerns such as nausea, constipation, anemia or gestational diabetes — with shopping lists and food-safety notes.",
    primaryCta: "Create a free plan",
    secondaryCta: "Read pregnancy nutrition tips",
    highlights: ["Free to start", "No sign-in required", "Practical everyday meals", "Shopping list included"],
    countryPricingLabel: "Country-based grocery pricing",
    countryPricingTitle: "Shopping cost estimates that match where you live",
    countryPricingIntro:
      "If you live in Vietnam, the app keeps the current VND meal pricing. If you live abroad, it switches to public supermarket or convenience-store reference prices in that country and shows the cost in the local currency.",
    cardLabel: "Gentle personalization",
    cardTitle: "From pregnancy basics to specific meals",
    cardPoints: [
      "Gestational week and weight help estimate BMI and reference weight-gain ranges.",
      "Taste preferences and foods to avoid help filter dishes before the plan is created.",
      "Shopping items are grouped so grocery trips are easier to plan."
    ]
  },
  vi: {
    headline: "Pregnancy Meal Planner",
    subhead: "Ăn gì tuần này để mẹ khỏe, con đủ chất?",
    intro:
      "Tạo thực đơn 7 ngày theo tuần thai, cân nặng, khẩu vị, ngân sách và triệu chứng khi mang bầu, kèm danh sách đi chợ và lưu ý an toàn thực phẩm.",
    primaryCta: "Tạo thực đơn miễn phí",
    secondaryCta: "Đọc kiến thức dinh dưỡng mẹ bầu",
    highlights: ["Miễn phí giai đầu", "Không cần đăng nhập", "Món dễ nấu", "Có danh sách đi chợ"],
    countryPricingLabel: "Đi chợ theo từng quốc gia",
    countryPricingTitle: "Ước tính chi phí đi chợ theo nơi bạn đang sống",
    countryPricingIntro:
      "Nếu bạn ở Việt Nam, ứng dụng giữ cách tính giá bữa ăn bằng VND như hiện tại. Nếu bạn đang ở nước ngoài, hệ thống dùng giá tham khảo công khai từ siêu thị hoặc cửa hàng tiện lợi của quốc gia đó và hiển thị đúng đồng tiền địa phương.",
    cardLabel: "Cá nhân hóa nhẹ nhàng",
    cardTitle: "Từ thông tin đến bữa ăn cụ thể",
    cardPoints: [
      "Tuần thai và cân nặng giúp ước lượng BMI, mức tăng cân tham khảo.",
      "Khẩu vị và món cần tránh giúp lọc món trước khi tạo thực đơn.",
      "Danh sách đi chợ được gom nhóm để mua nhanh hơn."
    ]
  }
} as const;

/** Thin app shells that should not compete in the index. */
const NOINDEX_PAGES = new Set<PageKey>(["history", "profile", "result"]);

const DEFAULT_OG_IMAGE = "/og-default.png";

function siteMetadataBase() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pregnancymeal.tips");
}

/** Layout-only defaults — never set a homepage canonical here (child pages inherit it). */
export function createRootLayoutMetadata(locale: Locale): Metadata {
  const seo = pageSeo[locale].home;
  return {
    metadataBase: siteMetadataBase(),
    title: {
      default: seo.title,
      template: `%s | ${BRAND_NAME}`
    },
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      siteName: BRAND_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: BRAND_NAME }]
    },
    twitter: {
      card: "summary_large_image",
      images: [DEFAULT_OG_IMAGE]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1
      }
    }
  };
}

export function createPageMetadata(locale: Locale, page: PageKey): Metadata {
  const seo = pageSeo[locale][page];
  const routePath = pagePaths[page];
  const canonical = localizedPath(locale, routePath);
  const indexable = !NOINDEX_PAGES.has(page);

  return {
    metadataBase: siteMetadataBase(),
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        "en-US": localizedPath("en", routePath),
        "vi-VN": localizedPath("vi", routePath),
        "x-default": localizedPath("en", routePath)
      }
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      siteName: BRAND_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: seo.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [DEFAULT_OG_IMAGE]
    },
    robots: {
      index: indexable,
      follow: true,
      googleBot: {
        index: indexable,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1
      }
    }
  };
}

export type SimpleRouteSeo = {
  title: string;
  description: string;
  keywords?: string[];
  index?: boolean;
};

/** Full metadata for secondary routes (support, premium, privacy, account, topics). */
export function createRouteMetadata(locale: Locale, pathname: string, seo: SimpleRouteSeo): Metadata {
  const canonical = localizedPath(locale, pathname);
  const indexable = seo.index !== false;

  return {
    metadataBase: siteMetadataBase(),
    title: { absolute: seo.title },
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        "en-US": localizedPath("en", pathname),
        "vi-VN": localizedPath("vi", pathname),
        "x-default": localizedPath("en", pathname)
      }
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      siteName: BRAND_NAME,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: seo.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [DEFAULT_OG_IMAGE]
    },
    robots: {
      index: indexable,
      follow: true
    }
  };
}

export function createNotFoundMetadata(locale: Locale): Metadata {
  const title = locale === "en" ? `Page not found | ${BRAND_NAME}` : `Không tìm thấy trang | ${BRAND_NAME}`;
  const description =
    locale === "en"
      ? "This page does not exist. Return home or open the free pregnancy meal planner instead."
      : "Trang này không tồn tại. Quay về trang chủ hoặc mở trình tạo thực đơn mẹ bầu miễn phí.";

  return {
    metadataBase: siteMetadataBase(),
    title: { absolute: title },
    description,
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      siteName: BRAND_NAME,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: BRAND_NAME }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE]
    }
  };
}

export function structuredData(locale: Locale) {
  const seo = pageSeo[locale].home;
  const homeUrl = localizedPath(locale, "/");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pregnancymeal.tips";
  const pageUrl = `${siteUrl}${homeUrl}`;
  const language = locale === "vi" ? "vi-VN" : "en-US";

  // Homepage markup only — FAQPage belongs on /support where FAQ content is visible.
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: BRAND_NAME,
        url: siteUrl,
        inLanguage: ["en-US", "vi-VN"],
        publisher: { "@id": `${siteUrl}/#organization` }
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: BRAND_NAME,
        url: siteUrl,
        email: SUPPORT_EMAIL,
        sameAs: socialSameAs
      },
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#webapp`,
        name: BRAND_NAME,
        url: pageUrl,
        applicationCategory: "HealthApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: language,
        description: seo.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        publisher: { "@id": `${siteUrl}/#organization` },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: locale === "vi" ? "VND" : "USD"
        }
      }
    ]
  };
}

/** FAQ rich-result markup for support pages that render the FAQ content. */
export function faqPageStructuredData(locale: Locale) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pregnancymeal.tips";
  const pageUrl = `${siteUrl}${localizedPath(locale, "/support")}`;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    inLanguage: locale === "vi" ? "vi-VN" : "en-US",
    mainEntity: faqContent[locale].map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
