import type { BlogCategorySlug, BlogLocale, BlogPost } from "@/types/blog";
import { isCategorySlug } from "@/lib/blog/categories";
import { localizePost } from "@/lib/blog/localize";
import { postManifest } from "@/lib/blog/post-manifest";
import { filterPublished, normalizePost, sortPostsByDate } from "@/lib/blog/utils";

function loadRawPosts(): BlogPost[] {
  return postManifest.map((raw) => normalizePost(raw));
}

function loadPosts(locale: BlogLocale): BlogPost[] {
  const published = sortPostsByDate(filterPublished(loadRawPosts()));
  if (locale === "vi") return published;
  return published.map((post) => localizePost(post, locale));
}

export function getAllPosts(locale: BlogLocale = "vi"): BlogPost[] {
  return loadPosts(locale);
}

export function getPostBySlug(slug: string, locale: BlogLocale = "vi"): BlogPost | undefined {
  return getAllPosts(locale).find((post) => post.slug === slug);
}

export function getPostsByCategory(category: BlogCategorySlug, locale: BlogLocale = "vi"): BlogPost[] {
  return getAllPosts(locale).filter((post) => post.category === category);
}

export function getAllPostSlugs(): string[] {
  return sortPostsByDate(filterPublished(loadRawPosts())).map((post) => post.slug);
}

/** Static params: published posts + category landing pages (no collision). */
export function getAllBlogRouteSlugs(): string[] {
  const posts = getAllPostSlugs();
  const categories = ["dinh-duong-ba-bau", "thuc-don-ba-bau", "truoc-sinh", "sau-sinh", "cham-con-0-24-thang"] as const;
  return [...categories, ...posts.filter((slug) => !isCategorySlug(slug))];
}

export function getRelatedPosts(post: BlogPost, locale: BlogLocale = "vi", limit = 3): BlogPost[] {
  return getAllPosts(locale)
    .filter((p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, limit);
}
