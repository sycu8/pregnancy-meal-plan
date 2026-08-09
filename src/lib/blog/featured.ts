import type { BlogLocale, BlogPost } from "@/types/blog";
import { getAllPosts } from "@/lib/blog/posts";

/** Curated hot posts — shown first in the featured rail (lower rank = hotter). */
export const FEATURED_POST_RANKS: Record<string, number> = {
  "pregnancy-food-safety-analysis-sushi-salads-bbq-and-cheese-boards": 1,
  "common-vietnamese-dishes-in-pregnancy-what-to-keep-tweak-or-skip": 2,
  "pregnancy-recipes-iron-and-folate-bowls-you-can-cook-in-30-minutes": 3,
  "delicious-weeknight-pregnancy-menus-5-cook-once-recipes": 4,
  "vietnamese-foods-that-support-a-healthy-pregnancy-plate": 5,
  "international-pantry-staples-for-pregnancy-nutrition": 6,
  "dinh-duong-3-thang-dau-thai-ky": 7,
  "thuc-pham-nen-tranh-khi-mang-thai": 8,
  "thuc-don-giam-nghen-tam-ca-nguyet-1": 9
};

export const FEATURED_RAIL_SIZE = 6;

export function featuredRank(slug: string): number | undefined {
  return FEATURED_POST_RANKS[slug];
}

export function isFeaturedSlug(slug: string): boolean {
  return featuredRank(slug) != null;
}

/** Sort curated featured posts by rank, then fill with recent ogImage posts if needed. */
export function pickFeaturedPosts(posts: BlogPost[], limit = FEATURED_RAIL_SIZE): BlogPost[] {
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const picked: BlogPost[] = [];
  const used = new Set<string>();

  const ranked = Object.entries(FEATURED_POST_RANKS).sort((a, b) => a[1] - b[1]);
  for (const [slug] of ranked) {
    if (picked.length >= limit) break;
    const post = bySlug.get(slug);
    if (!post) continue;
    picked.push(post);
    used.add(slug);
  }

  if (picked.length < limit) {
    const fillers = [...posts]
      .filter((p) => !used.has(p.slug))
      .sort((a, b) => {
        const img = Number(Boolean(b.ogImage)) - Number(Boolean(a.ogImage));
        if (img !== 0) return img;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    for (const post of fillers) {
      if (picked.length >= limit) break;
      picked.push(post);
      used.add(post.slug);
    }
  }

  return picked;
}

export function getFeaturedPosts(locale: BlogLocale = "en", limit = FEATURED_RAIL_SIZE): BlogPost[] {
  return pickFeaturedPosts(getAllPosts(locale), limit);
}

/** Remove featured slugs from the main grid so page 1 does not duplicate the rail. */
export function excludeFeatured(posts: BlogPost[], featured: BlogPost[]): BlogPost[] {
  const slugs = new Set(featured.map((p) => p.slug));
  return posts.filter((p) => !slugs.has(p.slug));
}
