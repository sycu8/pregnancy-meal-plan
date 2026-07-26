import type { Locale } from "@/lib/i18n";
import { socialLinks, socialSameAs } from "@/lib/social/links";

export type SocialPlatform = "facebook" | "x" | "tiktok";

export type SocialProfile = {
  platform: SocialPlatform;
  label: string;
  handle: string;
  href: string;
  description: Record<Locale, string>;
};

const BRAND_NAME = "Pregnancy Meal Planner";

export { socialSameAs };

export const socialProfiles: SocialProfile[] = [
  {
    platform: "facebook",
    label: "Facebook",
    handle: "@PregnancyMealPlanner",
    href: socialLinks.facebook,
    description: {
      en: "Weekly meal tips, blog shares, and planner updates.",
      vi: "Mẹo ăn uống hàng tuần, bài blog và cập nhật planner."
    }
  },
  {
    platform: "x",
    label: "X",
    handle: "@PregMealTips",
    href: socialLinks.x,
    description: {
      en: "Short prenatal nutrition tips and product news.",
      vi: "Tips dinh dưỡng ngắn và tin sản phẩm."
    }
  },
  {
    platform: "tiktok",
    label: "TikTok",
    handle: "@pregnancymeal.tips",
    href: socialLinks.tiktok,
    description: {
      en: "Quick week-by-week meal ideas on video.",
      vi: "Gợi ý món theo tuần thai trên video ngắn."
    }
  }
];

export function withUtm(url: string, source: SocialPlatform | "social", campaign = "social_hub") {
  const parsed = new URL(url);
  parsed.searchParams.set("utm_source", source);
  parsed.searchParams.set("utm_medium", "social");
  parsed.searchParams.set("utm_campaign", campaign);
  return parsed.toString();
}

export const socialPageCopy = {
  en: {
    title: `${BRAND_NAME} on social`,
    metaTitle: `Social | ${BRAND_NAME}`,
    metaDescription:
      "Follow Pregnancy Meal Planner on Facebook, X, and TikTok — then create a free 7-day prenatal meal plan at pregnancymeal.tips.",
    headline: BRAND_NAME,
    subhead: "Follow along. Plan this week’s meals.",
    intro:
      "Practical prenatal nutrition tips in English and Vietnamese — then open the free planner for a personalized 7-day meal plan with a shopping list.",
    primaryCta: "Create a free meal plan",
    secondaryCta: "Read the blog",
    followHeading: "Follow us",
    followHint: "Same brand kit on every channel — calm tips, no scare tactics.",
    openProfile: "Open"
  },
  vi: {
    title: `${BRAND_NAME} trên mạng xã hội`,
    metaTitle: `Social | ${BRAND_NAME}`,
    metaDescription:
      "Theo dõi Pregnancy Meal Planner trên Facebook, X và TikTok — rồi tạo thực đơn mẹ bầu 7 ngày miễn phí tại pregnancymeal.tips.",
    headline: BRAND_NAME,
    subhead: "Theo dõi tip mỗi tuần. Lên thực đơn ngay.",
    intro:
      "Mẹo dinh dưỡng thai kỳ thực tế bằng tiếng Việt và tiếng Anh — mở planner miễn phí để tạo thực đơn 7 ngày kèm danh sách đi chợ.",
    primaryCta: "Tạo thực đơn miễn phí",
    secondaryCta: "Đọc blog",
    followHeading: "Theo dõi chúng tôi",
    followHint: "Cùng một brand kit trên mọi kênh — tip nhẹ nhàng, không gây sợ.",
    openProfile: "Mở"
  }
} as const;
