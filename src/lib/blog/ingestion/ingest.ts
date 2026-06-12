import fs from "node:fs";
import path from "node:path";
import type { IngestedFeedItem, SourceConfig } from "@/types/blog";
import { dedupeFeedItems, hashValue, topicMatches } from "./dedupe";
import { parseRssOrAtom } from "./rss";
import { assertUrlAllowedByRobots } from "./robots";
import { BLOG_USER_AGENT, DEFAULT_RATE_LIMIT_MS, getEnabledSources } from "./sources";

export type IngestionLogEntry = {
  at: string;
  level: "info" | "warn" | "error";
  message: string;
  source?: string;
};

export type IngestionResult = {
  fetched: number;
  queued: number;
  skipped: number;
  logs: IngestionLogEntry[];
};

function contentRoot() {
  return path.join(process.cwd(), "content/blog");
}

function queueDir() {
  return path.join(contentRoot(), "queue");
}

function indexPath() {
  return path.join(contentRoot(), "ingested-index.json");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function loadIngestedIndex(): Pick<IngestedFeedItem, "titleHash" | "urlHash" | "id">[] {
  try {
    const raw = fs.readFileSync(indexPath(), "utf8");
    return JSON.parse(raw) as Pick<IngestedFeedItem, "titleHash" | "urlHash" | "id">[];
  } catch {
    return [];
  }
}

export function saveIngestedIndex(items: Pick<IngestedFeedItem, "titleHash" | "urlHash" | "id">[]) {
  fs.mkdirSync(contentRoot(), { recursive: true });
  fs.writeFileSync(indexPath(), JSON.stringify(items, null, 2), "utf8");
}

export async function ingestBlogSources(options?: { sources?: SourceConfig[] }): Promise<IngestionResult> {
  const sources = options?.sources ?? getEnabledSources();
  const logs: IngestionLogEntry[] = [];
  const existing = loadIngestedIndex();
  const newIndex = [...existing];
  let fetched = 0;
  let queued = 0;
  let skipped = 0;

  fs.mkdirSync(queueDir(), { recursive: true });

  for (const source of sources) {
    if (!source.rssUrl) {
      logs.push({ at: new Date().toISOString(), level: "info", message: "No RSS URL — skip (HTML crawl not run in automated job)", source: source.name });
      continue;
    }

    const allowed = await assertUrlAllowedByRobots(source.rssUrl);
    if (!allowed) {
      logs.push({ at: new Date().toISOString(), level: "warn", message: "Blocked by robots.txt", source: source.name });
      skipped++;
      continue;
    }

    await sleep(DEFAULT_RATE_LIMIT_MS);

    try {
      const res = await fetch(source.rssUrl, {
        headers: { "User-Agent": BLOG_USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml, */*" },
        signal: AbortSignal.timeout(20000)
      });

      if (!res.ok) {
        logs.push({ at: new Date().toISOString(), level: "warn", message: `HTTP ${res.status}`, source: source.name });
        skipped++;
        continue;
      }

      const xml = await res.text();
      const items = parseRssOrAtom(xml);
      fetched += items.length;

      const candidates = items
        .filter((item) => topicMatches(item.title, item.description, source.topics))
        .map((item) => ({
          id: hashValue(`${source.name}:${item.link}`),
          sourceName: source.name,
          title: item.title,
          url: item.link,
          snippet: item.description,
          publishedAt: item.pubDate,
          fetchedAt: new Date().toISOString()
        }));

      const unique = dedupeFeedItems(candidates, existing);

      for (const item of unique) {
        const file = path.join(queueDir(), `${item.id}.json`);
        fs.writeFileSync(
          file,
          JSON.stringify(
            {
              ...item,
              status: "draft",
              note: "Metadata-only queue item. Requires editorial synthesis before publish — do not copy source text."
            },
            null,
            2
          ),
          "utf8"
        );
        newIndex.push({ id: item.id, titleHash: item.titleHash, urlHash: item.urlHash });
        queued++;
      }

      logs.push({
        at: new Date().toISOString(),
        level: "info",
        message: `RSS ${items.length} items, ${unique.length} new queue entries`,
        source: source.name
      });
    } catch (error) {
      logs.push({
        at: new Date().toISOString(),
        level: "error",
        message: error instanceof Error ? error.message : "Fetch failed",
        source: source.name
      });
      skipped++;
    }
  }

  saveIngestedIndex(newIndex);
  return { fetched, queued, skipped, logs };
}
