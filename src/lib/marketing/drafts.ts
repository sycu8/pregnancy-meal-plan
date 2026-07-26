import type { BlogPost } from "@/types/blog";
import { localizedPath, type Locale } from "@/lib/i18n";
import { siteOrigin } from "@/lib/agentDiscovery";
import { withUtm, type SocialPlatform } from "@/lib/social/profiles";

export type SocialDraft = {
  id: string;
  platform: SocialPlatform;
  locale: Locale;
  text: string;
  link: string;
  sourceSlug: string;
  createdAt: string;
};

function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "").trim()}…`;
}

function postLink(slug: string, locale: Locale, platform: SocialPlatform) {
  return withUtm(`${siteOrigin}${localizedPath(locale, `/blog/${slug}`)}`, platform, "blog_share");
}

/** Turn one blog post into platform-ready captions (EN + VI when available). */
export function draftsFromBlogPost(post: BlogPost, locales: Locale[] = ["en"]): SocialDraft[] {
  const createdAt = new Date().toISOString();
  const drafts: SocialDraft[] = [];

  for (const locale of locales) {
    const title = post.title;
    const excerpt = post.excerpt || post.metaDescription || "";
    const tip = truncate(excerpt, locale === "en" ? 180 : 160);

    const bodies: Record<SocialPlatform, string> = {
      facebook:
        locale === "en"
          ? `${title}\n\n${tip}\n\nEducational tip only — not medical advice.\nRead more:`
          : `${title}\n\n${tip}\n\nChỉ mang tính tham khảo giáo dục — không thay thế bác sĩ.\nĐọc thêm:`,
      x:
        locale === "en"
          ? truncate(`${title} — ${tip}`, 220)
          : truncate(`${title} — ${tip}`, 220),
      tiktok:
        locale === "en"
          ? `Hook: ${truncate(title, 70)}\nScript: ${tip}\nCTA: Free planner → pregnancymeal.tips/planner\n#PregnancyMealPlan #PrenatalNutrition`
          : `Hook: ${truncate(title, 70)}\nScript: ${tip}\nCTA: Planner miễn phí → pregnancymeal.tips/vi/planner\n#ThucDonMeBau #DinhDuongThaiKy`
    };

    for (const platform of ["facebook", "x", "tiktok"] as const) {
      const link = postLink(post.slug, locale, platform);
      const text =
        platform === "tiktok" ? bodies[platform] : `${bodies[platform]} ${platform === "x" ? link : `\n${link}`}`;

      drafts.push({
        id: `${post.slug}-${locale}-${platform}`,
        platform,
        locale,
        text: platform === "x" ? truncate(text, 280) : text,
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
