/**
 * Discover pregnancy-related article URLs from Vinmec and Tam Anh Hospital.
 * Run: node scripts/crawl-hospital-sources.mjs
 */
import fs from "node:fs";
import path from "node:path";

const UA = "MeBauAnGiBlogBot/1.0 (+https://mebauangi.info/robots.txt; research-ingestion)";

const TOPIC_RE =
  /thai|bầu|bau|sản|san|mang.?thai|dinh.?duong|cho.?con.?b[uú]|sau.?sinh|sơ.?sinh|so.?sinh|trẻ|tre|mẹ.?bầu|me.?bau|obstet|pregnan|nutrition|weaning|bé|san.?phu|phu.?nu|con.?so|nuoi.?con|an.?dam|tiem.?chung/i;

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xml,*/*" },
    signal: AbortSignal.timeout(20000)
  });
  if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
  return res.text();
}

function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function filterTopicUrls(urls) {
  return urls.filter((u) => TOPIC_RE.test(decodeURIComponent(u)));
}

async function discoverVinmec() {
  const xml = await fetchText("https://www.vinmec.com/sitemap.xml");
  const locs = parseSitemapLocs(xml);
  const matched = filterTopicUrls(locs);
  // Also try news sitemap if present
  const newsMaps = locs.filter((u) => u.includes("sitemap") && u !== "https://www.vinmec.com/sitemap.xml");
  for (const sm of newsMaps.slice(0, 5)) {
    try {
      const sub = await fetchText(sm);
      matched.push(...filterTopicUrls(parseSitemapLocs(sub)));
    } catch {
      /* skip */
    }
  }
  return [...new Set(matched)];
}

async function discoverTamAnh() {
  const fromSitemap = filterTopicUrls(parseSitemapLocs(await fetchText("https://tamanhhospital.vn/sitemap.xml")));
  const html = await fetchText("https://tamanhhospital.vn/tin-tuc/");
  const fromNews = [
    ...html.matchAll(/href="(https:\/\/tamanhhospital\.vn\/[^"]+)"/g),
    ...html.matchAll(/href="(\/[^"]+)"/g)
  ]
    .map((m) => (m[1].startsWith("http") ? m[1] : `https://tamanhhospital.vn${m[1]}`))
    .filter((u) => u.includes("tamanhhospital.vn") && TOPIC_RE.test(decodeURIComponent(u)))
    .filter((u) => !u.includes("/page/") && !u.endsWith("/tin-tuc/"));
  return [...new Set([...fromSitemap, ...fromNews])];
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchArticleMeta(url) {
  const html = await fetchText(url);
  const title =
    html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] ??
    html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const desc =
    html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ??
    html.match(/<meta property="og:description" content="([^"]+)"/i)?.[1] ??
    "";
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter(Boolean)
    .slice(0, 8);
  const bodyMatch = html.match(/<article[\s\S]*?<\/article>/i) ?? html.match(/<main[\s\S]*?<\/main>/i);
  const bodyText = bodyMatch ? stripHtml(bodyMatch[0]).slice(0, 1200) : stripHtml(html).slice(0, 800);
  return { url, title, desc, h2s, bodyText };
}

async function main() {
  console.log("Discovering Vinmec URLs...");
  const vinmecUrls = (await discoverVinmec()).slice(0, 25);
  console.log(`Vinmec: ${vinmecUrls.length} URLs`);
  vinmecUrls.slice(0, 8).forEach((u) => console.log(" ", u));

  console.log("\nDiscovering Tam Anh URLs...");
  const tamUrls = (await discoverTamAnh()).slice(0, 25);
  console.log(`Tam Anh: ${tamUrls.length} URLs`);
  tamUrls.slice(0, 8).forEach((u) => console.log(" ", u));

  const sample = [
    ...vinmecUrls.slice(0, 5).map((url) => ({ url, publisher: "Vinmec" })),
    ...tamUrls.slice(0, 5).map((url) => ({ url, publisher: "Tam Anh Hospital" }))
  ];

  console.log("\nFetching article metadata...");
  const articles = [];
  for (const item of sample) {
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const meta = await fetchArticleMeta(item.url);
      articles.push({ ...meta, publisher: item.publisher });
      console.log(` OK ${item.publisher}: ${meta.title?.slice(0, 60)}`);
    } catch (e) {
      console.log(` FAIL ${item.url}: ${e.message}`);
    }
  }

  const out = path.join(process.cwd(), "content/blog/crawl-hospital-articles.json");
  fs.writeFileSync(out, JSON.stringify({ fetchedAt: new Date().toISOString(), articles }, null, 2));
  console.log(`\nWrote ${articles.length} articles to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
