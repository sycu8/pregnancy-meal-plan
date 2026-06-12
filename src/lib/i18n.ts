import type { Metadata } from "next";

export type Locale = "vi" | "en";
export type PageKey = "home" | "planner" | "history" | "profile" | "result";

export const defaultLocale: Locale = "vi";
export const locales: Locale[] = ["vi", "en"];

export const pagePaths: Record<PageKey, string> = {
  home: "/",
  planner: "/planner",
  history: "/history",
  profile: "/profile",
  result: "/result"
};

export function stripLocaleFromPath(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const stripped = normalized.replace(/^\/en(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

export function localizedPath(locale: Locale, pathname: string) {
  const routePath = stripLocaleFromPath(pathname);
  if (locale === "vi") return routePath;
  return routePath === "/" ? "/en" : `/en${routePath}`;
}

export const siteCopy = {
  vi: {
    brand: "Bầu Ăn Gì?",
    languageLabel: "English",
    nav: {
      planner: "Tạo thực đơn",
      history: "Lịch sử",
      profile: "Hồ sơ",
      blog: "Blog"
    }
  },
  en: {
    brand: "Bầu Ăn Gì?",
    languageLabel: "Tiếng Việt",
    nav: {
      planner: "Create plan",
      history: "History",
      profile: "Profile",
      blog: "Blog"
    }
  }
} as const;

export const footerCredit = {
  label: "Created by Lê Sỹ Cường",
  href: "https://www.linkedin.com/in/sycule/"
} as const;

export const pageSeo: Record<Locale, Record<PageKey, { title: string; description: string; keywords: string[] }>> = {
  vi: {
    home: {
      title: "Bầu Ăn Gì? | Thực đơn cho mẹ bầu Việt Nam theo tuần thai",
      description:
        "Bầu Ăn Gì? giúp mẹ bầu Việt Nam tạo thực đơn 7 ngày món Việt theo tuần thai, cân nặng, khẩu vị, ngân sách và triệu chứng khi mang bầu, tham khảo theo chỉ dẫn của bác sĩ.",
      keywords: [
        "thực đơn mẹ bầu",
        "ăn gì khi mang thai",
        "dinh dưỡng thai kỳ",
        "thực đơn bà bầu 7 ngày",
        "món Việt cho mẹ bầu"
      ]
    },
    planner: {
      title: "Tạo thực đơn mẹ bầu miễn phí | Bầu Ăn Gì?",
      description:
        "Nhập tuần thai, cân nặng, khẩu vị và tình trạng sức khỏe để tạo thực đơn 7 ngày cho mẹ bầu, kèm danh sách đi chợ và lưu ý an toàn thực phẩm.",
      keywords: ["tạo thực đơn mẹ bầu", "meal planner thai kỳ", "danh sách đi chợ mẹ bầu"]
    },
    history: {
      title: "Lịch sử thực đơn thai kỳ | Bầu Ăn Gì?",
      description:
        "Xem lại các thực đơn thai kỳ đã tạo trên trình duyệt, mở lại thực đơn cũ hoặc xóa lịch sử khi cần mà không cần tài khoản.",
      keywords: ["lịch sử thực đơn", "thực đơn thai kỳ đã lưu", "thực đơn mẹ bầu"]
    },
    profile: {
      title: "Hồ sơ thai kỳ cá nhân | Bầu Ăn Gì?",
      description:
        "Lưu thông tin thai kỳ, cân nặng, khẩu vị và mục tiêu dinh dưỡng trên trình duyệt để lần sau tạo thực đơn nhanh hơn.",
      keywords: ["hồ sơ thai kỳ", "thông tin mẹ bầu", "dinh dưỡng cá nhân hóa"]
    },
    result: {
      title: "Kết quả thực đơn 7 ngày | Bầu Ăn Gì?",
      description:
        "Xem thực đơn 7 ngày cho mẹ bầu với món ăn, khẩu phần tham khảo, chi phí ước tính, danh sách đi chợ và checklist dinh dưỡng thai kỳ.",
      keywords: ["kết quả thực đơn", "thực đơn 7 ngày", "danh sách đi chợ"]
    }
  },
  en: {
    home: {
      title: "Pregnancy Meal Planner for Vietnamese Meals | Bầu Ăn Gì?",
      description:
        "Bầu Ăn Gì? creates a 7-day pregnancy meal plan with Vietnamese dishes based on gestational week, weight, budget, taste preferences and common concerns such as nausea, constipation, anemia or gestational diabetes.",
      keywords: [
        "pregnancy meal planner",
        "Vietnamese pregnancy meals",
        "prenatal nutrition plan",
        "7 day pregnancy meal plan",
        "healthy meals for pregnant women"
      ]
    },
    planner: {
      title: "Create a Free Pregnancy Meal Plan | Bầu Ăn Gì?",
      description:
        "Enter gestational week, weight, food preferences and health notes to create a 7-day pregnancy meal plan with a shopping list and food-safety reminders.",
      keywords: ["create pregnancy meal plan", "prenatal meal planner", "pregnancy shopping list"]
    },
    history: {
      title: "Saved Pregnancy Meal Plans | Bầu Ăn Gì?",
      description:
        "Review pregnancy meal plans saved in this browser, reopen a previous plan or remove local history without creating an account.",
      keywords: ["saved pregnancy meal plans", "meal plan history", "prenatal nutrition"]
    },
    profile: {
      title: "Pregnancy Nutrition Profile | Bầu Ăn Gì?",
      description:
        "Save pregnancy week, weight, preferences and nutrition goals locally in the browser so future meal plans can be created faster.",
      keywords: ["pregnancy nutrition profile", "prenatal profile", "personalized pregnancy meals"]
    },
    result: {
      title: "7-Day Pregnancy Meal Plan Result | Bầu Ăn Gì?",
      description:
        "View a 7-day pregnancy meal plan with meal ideas, reference portions, estimated costs, shopping batches and prenatal nutrition guidance.",
      keywords: ["pregnancy meal plan result", "7 day prenatal meal plan", "pregnancy shopping list"]
    }
  }
};

export const landingContent = {
  vi: {
    headline: "Bầu Ăn Gì?",
    subhead: "Ăn gì tuần này để mẹ khỏe, con đủ chất?",
    intro:
      "Tạo thực đơn 7 ngày món Việt theo tuần thai, cân nặng, khẩu vị, ngân sách và triệu chứng khi mang bầu, tham khảo theo chỉ dẫn của bác sĩ.",
    primaryCta: "Tạo thực đơn miễn phí",
    secondaryCta: "Xem lịch sử",
    highlights: ["Miễn phí giai đoạn đầu", "Không cần đăng nhập", "Món Việt dễ nấu", "Có danh sách đi chợ"],
    cardLabel: "Cá nhân hóa nhẹ nhàng",
    cardTitle: "Từ thông tin đến bữa ăn cụ thể",
    cardPoints: [
      "Tuần thai và cân nặng giúp ước lượng BMI, mức tăng cân tham khảo.",
      "Khẩu vị và món cần tránh giúp lọc món trước khi tạo thực đơn.",
      "Danh sách đi chợ được gom nhóm để mua nhanh hơn."
    ]
  },
  en: {
    headline: "Pregnancy Meal Planner",
    subhead: "Vietnamese meals for a healthier pregnancy week by week.",
    intro:
      "Create a 7-day Vietnamese meal plan based on gestational week, weight, taste, budget and common pregnancy concerns such as nausea, constipation, anemia or gestational diabetes.",
    primaryCta: "Create a free plan",
    secondaryCta: "View history",
    highlights: ["Free during early release", "No sign-in required", "Easy Vietnamese dishes", "Shopping list included"],
    cardLabel: "Gentle personalization",
    cardTitle: "From pregnancy basics to specific meals",
    cardPoints: [
      "Gestational week and weight help estimate BMI and reference weight-gain ranges.",
      "Taste preferences and foods to avoid help filter dishes before the plan is created.",
      "Shopping items are grouped so grocery trips are easier to plan."
    ]
  }
} as const;

export function createPageMetadata(locale: Locale, page: PageKey): Metadata {
  const seo = pageSeo[locale][page];
  const routePath = pagePaths[page];
  const canonical = localizedPath(locale, routePath);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mebauangi.info"),
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        "vi-VN": localizedPath("vi", routePath),
        "en-US": localizedPath("en", routePath),
        "x-default": localizedPath("vi", routePath)
      }
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      siteName: "Bầu Ăn Gì?",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description
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

export function structuredData(locale: Locale) {
  const seo = pageSeo[locale].home;
  const homeUrl = localizedPath(locale, "/");

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: locale === "vi" ? "Bầu Ăn Gì?" : "Bầu Ăn Gì? Pregnancy Meal Planner",
    url: homeUrl,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    inLanguage: locale === "vi" ? "vi-VN" : "en-US",
    description: seo.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND"
    },
    audience: {
      "@type": "PeopleAudience",
      suggestedGender: "female"
    }
  };
}
