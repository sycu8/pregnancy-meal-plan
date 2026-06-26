import type { SourceConfig } from "@/types/blog";
import { topicMatches } from "@/lib/blog/ingestion/dedupe";
import { assertUrlAllowedByRobots } from "@/lib/blog/ingestion/robots";
import { BLOG_USER_AGENT } from "@/lib/blog/ingestion/sources";

export type SitemapCandidate = {
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
};

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

export async function discoverSitemapCandidates(
  source: SourceConfig,
  options: { maxSitemaps?: number; maxCandidates?: number; maxHtmlFetch?: number } = {}
): Promise<SitemapCandidate[]> {
  const maxSitemaps = options.maxSitemaps ?? 3;
  const maxCandidates = options.maxCandidates ?? 20;
  const maxHtmlFetch = options.maxHtmlFetch ?? 8;

  const sitemapIndex = new URL("/sitemap.xml", source.baseUrl).toString();
  const indexXml = await fetchText(sitemapIndex);
  if (!indexXml) return [];

  const locs = parseSitemapLocs(indexXml);
  const subSitemaps = locs.filter((u) => isXmlUrl(u)).slice(0, maxSitemaps);
  const urlCandidates: string[] = [];

  for (const sm of subSitemaps) {
    const xml = await fetchText(sm);
    if (!xml) continue;
    for (const url of parseSitemapLocs(xml)) {
      if (!urlAllowedBySource(url, source)) continue;
      if (isXmlUrl(url)) continue;
      if (!topicMatches(url, "", source.topics)) continue;
      urlCandidates.push(url);
      if (urlCandidates.length >= maxCandidates) break;
    }
    if (urlCandidates.length >= maxCandidates) break;
  }

  const results: SitemapCandidate[] = [];
  for (const url of urlCandidates.slice(0, maxHtmlFetch)) {
    const html = await fetchText(url);
    if (!html) continue;
    const meta = extractMeta(html);
    if (!meta.title) continue;
    if (!topicMatches(meta.title, meta.desc, source.topics)) continue;
    results.push({ title: meta.title, url, snippet: meta.desc });
  }

  return results;
}
