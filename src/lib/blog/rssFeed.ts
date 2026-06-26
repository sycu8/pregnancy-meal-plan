import type { BlogLocale, BlogPost } from "@/types/blog";
import { siteOrigin } from "@/lib/agentDiscovery";
import { blogBasePath } from "@/lib/blog/ui";
import { getAllPosts } from "@/lib/blog/posts";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildBlogRssFeed(locale: BlogLocale, limit = 20): string {
  const posts = getAllPosts(locale).slice(0, limit);
  const base = `${siteOrigin}${blogBasePath(locale)}`;
  const title = locale === "en" ? "Bầu Ăn Gì? Blog (English)" : "Bầu Ăn Gì? Blog";
  const description =
    locale === "en"
      ? "Pregnancy nutrition, meal ideas, and maternal health references."
      : "Dinh dưỡng thai kỳ, thực đơn mẹ bầu và kiến thức chăm sóc mẹ và bé.";

  const items = posts
    .map((post) => itemXml(post, locale))
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(description)}</description>
    <language>${locale === "en" ? "en" : "vi"}</language>
    <atom:link href="${escapeXml(`${base}/feed.xml`)}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

function itemXml(post: BlogPost, locale: BlogLocale) {
  const url = `${siteOrigin}${blogBasePath(locale)}/${post.slug}`;
  return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${escapeXml(url)}</link>
  <guid isPermaLink="true">${escapeXml(url)}</guid>
  <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
  <description>${escapeXml(post.excerpt)}</description>
</item>`;
}
