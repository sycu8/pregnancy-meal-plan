/**
 * Extended ingestion:
 * - RSS/Atom ingestion (existing)
 * - Sitemap/HTML discovery for enabled sources without RSS
 *
 * Output: content/blog/queue/*.json (metadata-only)
 *
 * Run: node --experimental-strip-types scripts/ingest-blog-auto.ts
 */
import fs from "node:fs";
import path from "node:path";
import type { SourceConfig } from "../src/types/blog.ts";
import { dedupeFeedItems, hashValue, topicMatches } from "../src/lib/blog/ingestion/dedupe.ts";
import { assertUrlAllowedByRobots } from "../src/lib/blog/ingestion/robots.ts";
import { BLOG_USER_AGENT, DEFAULT_RATE_LIMIT_MS, getEnabledSources } from "../src/lib/blog/ingestion/sources.ts";
import { ingestBlogSources, loadIngestedIndex, saveIngestedIndex } from "../src/lib/blog/ingestion/ingest.ts";

type QueuedItem = {
  id: string;
  sourceName: string;
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  fetchedAt: string;
  status: "draft" | "published";
  note: string;
};

function contentRoot() {
  return path.join(process.cwd(), "content/blog");
}

function queueDir() {
  return path.join(contentRoot(), "queue");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseSitemapLocs(xml: string) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function isXmlUrl(url: string) {
  return url.toLowerCase().endsWith(".xml");
}

function urlAllowedBySource(url: string, source: SourceConfig) {
  if (!url.startsWith(source.baseUrl)) return false;
  if (!source.allowedPaths || source.allowedPaths.length === 0) return true;
  const parsed = new URL(url);
  return source.allowedPaths.some((prefix) => parsed.pathname.startsWith(prefix));
}

function fastUrlTopicMatch(url: string, topics: string[]) {
  // quick filter without fetching HTML: match topics in URL itself
  return topicMatches(url, "", topics);
}

async function fetchText(url: string) {
  const allowed = await assertUrlAllowedByRobots(url);
  if (!allowed) return null;

  const res = await fetch(url, {
    headers: { "User-Agent": BLOG_USER_AGENT, Accept: "text/html,application/xml,*/*" },
    signal: AbortSignal.timeout(20000)
  });
  if (!res.ok) return null;
  return await res.text();
}

function extractMeta(html: string) {
  const title =
    html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] ??
    html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ??
    "";
  const desc =
    html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ??
    html.match(/<meta property="og:description" content="([^"]+)"/i)?.[1] ??
    "";
  return { title: title.trim(), desc: desc.trim() };
}

async function discoverFromSitemap(source: SourceConfig, options: { maxSitemaps: number; maxCandidates: number; maxHtmlFetch: number }) {
  const sitemapIndex = new URL("/sitemap.xml", source.baseUrl).toString();
  const indexXml = await fetchText(sitemapIndex);
  if (!indexXml) return [];

  const locs = parseSitemapLocs(indexXml);
  const subSitemaps = locs.filter((u) => isXmlUrl(u)).slice(0, options.maxSitemaps);
  const urlCandidates: string[] = [];

  for (const sm of subSitemaps) {
    await sleep(250);
    const xml = await fetchText(sm);
    if (!xml) continue;
    for (const url of parseSitemapLocs(xml)) {
      if (!urlAllowedBySource(url, source)) continue;
      if (!fastUrlTopicMatch(url, source.topics)) continue;
      urlCandidates.push(url);
      if (urlCandidates.length >= options.maxCandidates) break;
    }
    if (urlCandidates.length >= options.maxCandidates) break;
  }

  // Fetch only a small number of pages to validate relevance via title/desc.
  const validated: { url: string; title: string; snippet: string }[] = [];
  for (const url of urlCandidates.slice(0, options.maxHtmlFetch)) {
    await sleep(DEFAULT_RATE_LIMIT_MS);
    const html = await fetchText(url);
    if (!html) continue;
    const { title, desc } = extractMeta(html);
    if (!title) continue;
    if (!topicMatches(title, desc, source.topics)) continue;
    validated.push({ url, title, snippet: desc });
  }

  return validated;
}

async function ingestNonRssSources(sources: SourceConfig[]) {
  fs.mkdirSync(queueDir(), { recursive: true });
  const existing = loadIngestedIndex();
  const newIndex = [...existing];

  const candidates: Omit<QueuedItem, "status" | "note">[] = [];
  for (const source of sources) {
    if (source.rssUrl) continue;
    const discovered = await discoverFromSitemap(source, { maxSitemaps: 25, maxCandidates: 120, maxHtmlFetch: 12 });
    for (const item of discovered) {
      candidates.push({
        id: hashValue(`${source.name}:${item.url}`),
        sourceName: source.name,
        title: item.title,
        url: item.url,
        snippet: item.snippet,
        fetchedAt: new Date().toISOString()
      });
    }
  }

  const unique = dedupeFeedItems(candidates, existing);

  let queued = 0;
  const maxQueue = Number(process.env.BLOG_AUTO_QUEUE_MAX ?? "12");
  const queueLimit = Number.isFinite(maxQueue) && maxQueue > 0 ? maxQueue : 12;

  for (const item of unique.slice(0, queueLimit)) {
    const file = path.join(queueDir(), `${item.id}.json`);
    const payload: QueuedItem = {
      ...item,
      status: "draft",
      note: "Metadata-only queue item. Requires editorial synthesis before publish — do not copy source text."
    };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
    newIndex.push({ id: item.id, titleHash: item.titleHash, urlHash: item.urlHash });
    queued++;
  }

  saveIngestedIndex(newIndex);
  return { discovered: candidates.length, queued };
}

async function main() {
  console.log("Starting RSS ingestion (metadata only)...");
  await ingestBlogSources();

  const enabled = getEnabledSources();
  const withoutRss = enabled.filter((s) => !s.rssUrl);
  if (withoutRss.length === 0) {
    console.log("No enabled non-RSS sources.");
    return;
  }

  console.log(`Starting sitemap/HTML discovery for ${withoutRss.length} sources...`);
  const result = await ingestNonRssSources(withoutRss);
  console.log(`Discovered ${result.discovered} candidates, queued ${result.queued} new items.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

