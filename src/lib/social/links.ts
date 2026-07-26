/** Canonical social profile URLs — keep free of i18n imports to avoid cycles. */
export const socialLinks = {
  facebook: "https://www.facebook.com/PregnancyMealPlanner",
  x: "https://x.com/PregMealTips",
  tiktok: "https://www.tiktok.com/@pregnancymeal.tips"
} as const;

export const socialSameAs = [socialLinks.facebook, socialLinks.x, socialLinks.tiktok];
