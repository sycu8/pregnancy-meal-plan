import type { BlogCategorySlug, BlogLocale, BlogPost } from "@/types/blog";
import { isCategorySlug } from "@/lib/blog/categories";
import { applyTranslation, hasUsableEnglishTranslation, localizePost } from "@/lib/blog/localize";
import { enTranslationBySlug } from "@/lib/blog/en-post-manifest";
import { postManifest } from "@/lib/blog/post-manifest";
import { filterPublished, normalizePost, sortPostsByDate } from "@/lib/blog/utils";

function loadRawPosts(): BlogPost[] {
  return postManifest.map((raw) => normalizePost(raw));
}

function loadPosts(locale: BlogLocale): BlogPost[] {
  const published = sortPostsByDate(filterPublished(loadRawPosts()));
  if (locale === "vi") return published;

  // English web: only posts that have a usable English translation
  return published.flatMap((post) => {
    const localized = localizePost(post, "en");
    return localized ? [localized] : [];
  });
}

export function getAllPosts(locale: BlogLocale = "vi"): BlogPost[] {
  return loadPosts(locale);
}

export function getPostBySlug(slug: string, locale: BlogLocale = "vi"): BlogPost | undefined {
  if (locale === "en") {
    const raw = filterPublished(loadRawPosts()).find((post) => post.slug === slug);
    if (!raw) return undefined;
    return localizePost(raw, "en") ?? undefined;
  }
  return getAllPosts("vi").find((post) => post.slug === slug);
}

export function getPostsByCategory(category: BlogCategorySlug, locale: BlogLocale = "vi"): BlogPost[] {
  return getAllPosts(locale).filter((post) => post.category === category);
}

export function getAllPostSlugs(locale: BlogLocale = "vi"): string[] {
  return getAllPosts(locale).map((post) => post.slug);
}

/** Static params: published posts + category landing pages (no collision). */
export function getAllBlogRouteSlugs(locale: BlogLocale = "vi"): string[] {
  const posts = getAllPostSlugs(locale);
  const categories = ["dinh-duong-ba-bau", "thuc-don-ba-bau", "truoc-sinh", "sau-sinh", "cham-con-0-24-thang"] as const;
  return [...categories, ...posts.filter((slug) => !isCategorySlug(slug))];
}

export function getRelatedPosts(post: BlogPost, locale: BlogLocale = "vi", limit = 3): BlogPost[] {
  return getAllPosts(locale)
    .filter((p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, limit);
}

/** Debug/helper: force-apply EN overlay when present (even if quality gate fails). */
export function getEnglishOverlay(slug: string) {
  return enTranslationBySlug.get(slug);
}

export function requireEnglishTranslation(post: BlogPost): BlogPost | null {
  if (!hasUsableEnglishTranslation(post.slug)) return null;
  const translation = enTranslationBySlug.get(post.slug);
  if (!translation) return null;
  return applyTranslation(post, translation);
}
