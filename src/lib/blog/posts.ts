import type { BlogCategorySlug, BlogLocale, BlogPost } from "@/types/blog";
import { isCategorySlug } from "@/lib/blog/categories";
import { applyTranslation, hasUsableEnglishTranslation, localizePost } from "@/lib/blog/localize";
import { enTranslationBySlug } from "@/lib/blog/en-post-manifest";
import { postManifest } from "@/lib/blog/post-manifest";
import { filterPublished, normalizePost, sortPostsByDate } from "@/lib/blog/utils";

function loadRawPosts(): BlogPost[] {
  return postManifest.map((raw) => normalizePost(raw));
}

/** A post is live on the web only when EN translation is complete and usable. */
export function isWebPublishableSlug(slug: string): boolean {
  return hasUsableEnglishTranslation(slug);
}

function loadPublishedBilingual(): BlogPost[] {
  return sortPostsByDate(filterPublished(loadRawPosts())).filter((post) => isWebPublishableSlug(post.slug));
}

function loadPosts(locale: BlogLocale): BlogPost[] {
  const published = loadPublishedBilingual();
  if (locale === "vi") return published;

  // English web: localize overlays (already gated for usable EN above)
  return published.flatMap((post) => {
    const localized = localizePost(post, "en");
    return localized ? [localized] : [];
  });
}

/** Default locale matches site defaultLocale (EN first). */
export function getAllPosts(locale: BlogLocale = "en"): BlogPost[] {
  return loadPosts(locale);
}

export function getPostBySlug(slug: string, locale: BlogLocale = "en"): BlogPost | undefined {
  if (!isWebPublishableSlug(slug)) return undefined;

  const raw = filterPublished(loadRawPosts()).find((post) => post.slug === slug);
  if (!raw) return undefined;

  if (locale === "en") {
    return localizePost(raw, "en") ?? undefined;
  }
  return raw;
}

export function getPostsByCategory(category: BlogCategorySlug, locale: BlogLocale = "en"): BlogPost[] {
  return getAllPosts(locale).filter((post) => post.category === category);
}

export function getAllPostSlugs(locale: BlogLocale = "en"): string[] {
  return getAllPosts(locale).map((post) => post.slug);
}

/** Static params: published bilingual posts + category landing pages (no collision). */
export function getAllBlogRouteSlugs(locale: BlogLocale = "en"): string[] {
  const posts = getAllPostSlugs(locale);
  const categories = ["dinh-duong-ba-bau", "thuc-don-ba-bau", "truoc-sinh", "sau-sinh", "cham-con-0-24-thang"] as const;
  return [...categories, ...posts.filter((slug) => !isCategorySlug(slug))];
}

export function getRelatedPosts(post: BlogPost, locale: BlogLocale = "en", limit = 3): BlogPost[] {
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

/** Published VI posts that are missing a usable EN overlay (should not be live). */
export function listPostsMissingEnglish(): BlogPost[] {
  return sortPostsByDate(filterPublished(loadRawPosts())).filter((post) => !hasUsableEnglishTranslation(post.slug));
}
