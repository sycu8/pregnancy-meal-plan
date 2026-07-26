import type { BlogPost } from "@/types/blog";
import { localizedPath, type Locale } from "@/lib/i18n";
import { siteOrigin } from "@/lib/agentDiscovery";
import { withUtm } from "@/lib/social/profiles";

/** Platforms supported by the marketing draft/publish pipeline. */
export type MarketingPlatform = "facebook" | "x";

export type SocialDraft = {
  id: string;
  platform: MarketingPlatform;
  locale: Locale;
  text: string;
  link: string;
  sourceSlug: string;
  createdAt: string;
};

export const MARKETING_PLATFORMS: MarketingPlatform[] = ["facebook", "x"];

function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "").trim()}…`;
}

function postLink(slug: string, locale: Locale, platform: MarketingPlatform) {
  return withUtm(`${siteOrigin}${localizedPath(locale, `/blog/${slug}`)}`, platform, "blog_share");
}

/** Turn one blog post into Facebook + X captions (EN + VI when available). */
export function draftsFromBlogPost(post: BlogPost, locales: Locale[] = ["en"]): SocialDraft[] {
  const createdAt = new Date().toISOString();
  const drafts: SocialDraft[] = [];

  for (const locale of locales) {
    const title = post.title;
    const excerpt = post.excerpt || post.metaDescription || "";
    const tip = truncate(excerpt, locale === "en" ? 180 : 160);

    for (const platform of MARKETING_PLATFORMS) {
      const link = postLink(post.slug, locale, platform);

      let text: string;
      if (platform === "facebook") {
        const body =
          locale === "en"
            ? `${title}\n\n${tip}\n\nEducational tip only — not medical advice.\nRead more:`
            : `${title}\n\n${tip}\n\nChỉ mang tính tham khảo giáo dục — không thay thế bác sĩ.\nĐọc thêm:`;
        text = `${body}\n${link}`;
      } else {
        // Keep the full URL intact — truncate caption only, then append link.
        const maxCaption = Math.max(80, 280 - link.length - 1);
        const caption = truncate(`${title} — ${tip}`, maxCaption);
        text = `${caption} ${link}`;
      }

      drafts.push({
        id: `${post.slug}-${locale}-${platform}`,
        platform,
        locale,
        text,
        link,
        sourceSlug: post.slug,
        createdAt
      });
    }
  }

  return drafts;
}

export function formatDraftQueue(drafts: SocialDraft[]) {
  return drafts
    .map(
      (draft) => `### ${draft.platform.toUpperCase()} · ${draft.locale.toUpperCase()} · ${draft.sourceSlug}

${draft.text}

---`
    )
    .join("\n\n");
}

export function isMarketingPlatform(value: string): value is MarketingPlatform {
  return value === "x" || value === "facebook";
}
