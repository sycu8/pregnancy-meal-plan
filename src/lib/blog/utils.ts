import type { BlogPost } from "@/types/blog";
import { estimateReadingTimeMinutes } from "./readingTime";

/** Normalize and validate a raw JSON post; recompute reading time if missing. */
export function normalizePost(raw: BlogPost): BlogPost {
  const readingTimeMinutes = raw.readingTimeMinutes || estimateReadingTimeMinutes(raw.content);
  return { ...raw, readingTimeMinutes };
}

export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function filterPublished(posts: BlogPost[]): BlogPost[] {
  return posts.filter((p) => p.status === "published");
}
