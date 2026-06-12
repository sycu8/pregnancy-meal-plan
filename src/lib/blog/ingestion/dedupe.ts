import { createHash } from "node:crypto";
import type { IngestedFeedItem } from "@/types/blog";

export function hashValue(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex").slice(0, 16);
}

export function dedupeFeedItems(
  items: Omit<IngestedFeedItem, "titleHash" | "urlHash">[],
  existing: Pick<IngestedFeedItem, "titleHash" | "urlHash">[]
): IngestedFeedItem[] {
  const seenTitle = new Set(existing.map((e) => e.titleHash));
  const seenUrl = new Set(existing.map((e) => e.urlHash));

  const result: IngestedFeedItem[] = [];
  for (const item of items) {
    const titleHash = hashValue(item.title);
    const urlHash = hashValue(item.url);
    if (seenTitle.has(titleHash) || seenUrl.has(urlHash)) continue;
    seenTitle.add(titleHash);
    seenUrl.add(urlHash);
    result.push({ ...item, titleHash, urlHash });
  }
  return result;
}

export function topicMatches(title: string, snippet: string, topics: string[]): boolean {
  const text = `${title} ${snippet}`.toLowerCase();
  const normalized = text.replace(/-/g, " ");
  return topics.some((topic) => {
    const t = topic.toLowerCase().replace(/-/g, " ");
    return normalized.includes(t) || text.includes(topic.toLowerCase());
  });
}
