import type { BlogCategorySlug, BlogLocale, BlogPost } from "@/types/blog";
import { getAllPosts } from "@/lib/blog/posts";

export const BLOG_PAGE_SIZE = 12;

export type BlogListQuery = {
  q?: string;
  tag?: string;
  page: number;
  category?: BlogCategorySlug;
};

export function parseBlogListQuery(
  searchParams: Record<string, string | string[] | undefined>,
  category?: BlogCategorySlug
): BlogListQuery {
  const q = pickString(searchParams.q)?.trim();
  const tag = pickString(searchParams.tag)?.trim().toLowerCase();
  const pageRaw = pickString(searchParams.page);
  const page = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);

  return {
    q: q || undefined,
    tag: tag || undefined,
    page,
    category
  };
}

export function filterPosts(posts: BlogPost[], query: Pick<BlogListQuery, "q" | "tag">): BlogPost[] {
  let result = posts;

  if (query.tag) {
    result = result.filter((post) => post.tags.some((t) => t.toLowerCase() === query.tag));
  }

  if (query.q) {
    const terms = query.q.toLowerCase().split(/\s+/).filter(Boolean);
    result = result.filter((post) => {
      const haystack = [post.title, post.excerpt, post.content, post.tags.join(" "), post.category].join(" ").toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  return result;
}

export function paginatePosts<T>(items: T[], page: number, pageSize = BLOG_PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage,
    pageSize
  };
}

export function getTagCounts(posts: BlogPost[], limit = 24): { tag: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const key = tag.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "vi"))
    .slice(0, limit);
}

export function formatTagLabel(tag: string): string {
  return tag.replace(/-/g, " ");
}

export function buildBlogListHref(
  basePath: string,
  query: Pick<BlogListQuery, "q" | "tag">,
  page?: number
): string {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.tag) params.set("tag", query.tag);
  if (page && page > 1) params.set("page", String(page));

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function searchBlogPosts(locale: BlogLocale, query: { q?: string; page?: number; pageSize?: number }) {
  const posts = filterPosts(getAllPosts(locale), { q: query.q });
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  const { items, total, totalPages } = paginatePosts(posts, page, pageSize);
  return { posts: items, total, totalPages, page };
}
