import fs from "node:fs";

const UA = "MeBauAnGiBlogBot/1.0 (+https://mebauangi.info/robots.txt)";
const TOPIC =
  /mang thai|mang bầu|thai kỳ|thai ky|sản phụ|san phu|mẹ bầu|me bau|dinh dưỡng|dinh duong|cho con bú|sau sinh|sơ sinh|nghén|nghen|tiểu đường thai|tăng cân|folate|sắt|canxi|omega|ăn dặm|an dam|tiêm chủng|tiem chung|bổ sung|bo sung|vitamin|thai nhi|thai nhi/i;

const SLUG_TOPIC =
  /thai|bau|san-phu|me-bau|dinh-duong|cho-con-bu|sau-sinh|nghen|an-dam|tre-so-sinh|folate|sat|canxi|vitamin|mang-thai|thai-ky|sua-me|ke-hoach-mang|beta-hcg|tien-san-giat|tieu-duong/i;

const ARTICLE_PATH = /\/tin-tuc\/|\/bai-viet\//i;
const EXCLUDE_PRODUCT = /\/thuc-pham-chuc-nang\/|\/san-pham\/|\.html$/i;

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

async function discoverFromSitemaps(base, sitemapUrls) {
  const urls = new Set();
  for (const sm of sitemapUrls) {
    try {
      const xml = await fetchText(sm);
      for (const loc of parseSitemapLocs(xml)) {
        if (loc.startsWith(base) && SLUG_TOPIC.test(loc)) urls.add(loc);
      }
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) {
      console.log("sitemap skip", sm, e.message);
    }
  }
  return [...urls];
}

async function discoverFromPage(listUrl, linkPattern) {
  const html = await fetchText(listUrl);
  const links = [
    ...html.matchAll(linkPattern),
    ...html.matchAll(/href="(\/[^"]+)"/g)
  ]
    .map((m) => {
      const href = m[1] ?? m[0];
      if (href.startsWith("http")) return href;
      const base = new URL(listUrl).origin;
      return `${base}${href.startsWith("/") ? href : `/${href}`}`;
    })
    .filter((u) => SLUG_TOPIC.test(u));
  return [...new Set(links)];
}

async function meta(url) {
  const html = await fetchText(url);
  const title =
    html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] ??
    html.match(/<title>([^<]+)/i)?.[1]?.trim();
  const desc =
    html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ??
    html.match(/<meta property="og:description" content="([^"]+)"/i)?.[1] ??
    "";
  const text = `${title} ${desc}`;
  const isArticle = ARTICLE_PATH.test(url) && !EXCLUDE_PRODUCT.test(url);
  return { url, title, desc, match: isArticle && (TOPIC.test(text) || SLUG_TOPIC.test(url)) };
}

async function medlatec() {
  const candidates = new Set();
  try {
    const index = await fetchText("https://medlatec.vn/sitemap.xml");
    const subs = parseSitemapLocs(index).filter((u) => u.includes("sitemap"));
    for (const sm of subs.slice(0, 20)) {
      try {
        const xml = await fetchText(sm);
        for (const loc of parseSitemapLocs(xml)) {
          if (/medlatec\.vn/i.test(loc) && SLUG_TOPIC.test(loc)) candidates.add(loc);
        }
      } catch {
        /* skip */
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  } catch (e) {
    console.log("Medlatec sitemap:", e.message);
  }

  const pages = [
    "https://medlatec.vn/tin-tuc",
    "https://medlatec.vn/tin-tuc-suc-khoe",
    "https://medlatec.vn/chuyen-muc/san-phu-khoa",
    "https://medlatec.vn/chuyen-muc/me-va-be"
  ];
  for (const page of pages) {
    try {
      const html = await fetchText(page);
      for (const m of html.matchAll(/href="(https:\/\/medlatec\.vn\/[^"]+)"/g)) {
        if (SLUG_TOPIC.test(m[1])) candidates.add(m[1]);
      }
      for (const m of html.matchAll(/href="(\/tin-tuc\/[^"]+)"/g)) {
        candidates.add(`https://medlatec.vn${m[1]}`);
      }
      for (const m of html.matchAll(/href="(\/bai-viet\/[^"]+)"/g)) {
        candidates.add(`https://medlatec.vn${m[1]}`);
      }
    } catch (e) {
      console.log("Medlatec page skip", page, e.message);
    }
  }
  return [...candidates];
}

async function longChau() {
  const candidates = new Set();
  const sitemaps = [
    "https://nhathuoclongchau.com.vn/sitemap.xml",
    "https://www.nhathuoclongchau.com.vn/sitemap.xml"
  ];
  for (const sm of sitemaps) {
    try {
      const index = await fetchText(sm);
      const subs = parseSitemapLocs(index);
      for (const loc of subs) {
        if (loc.includes("sitemap") && loc.endsWith(".xml")) {
          try {
            const xml = await fetchText(loc);
            for (const u of parseSitemapLocs(xml)) {
              if (/longchau/i.test(u) && SLUG_TOPIC.test(u)) candidates.add(u);
            }
          } catch {
            /* skip */
          }
        } else if (/longchau/i.test(loc) && SLUG_TOPIC.test(loc)) {
          candidates.add(loc);
        }
      }
    } catch (e) {
      console.log("Long Chau sitemap:", sm, e.message);
    }
  }

  const pages = [
    "https://nhathuoclongchau.com.vn/bai-viet",
    "https://nhathuoclongchau.com.vn/chuyen-muc/me-va-be",
    "https://nhathuoclongchau.com.vn/chuyen-muc/suc-khoe-phu-nu"
  ];
  for (const page of pages) {
    try {
      const html = await fetchText(page);
      for (const m of html.matchAll(/href="(https:\/\/[^"]*longchau[^"]+)"/gi)) {
        if (SLUG_TOPIC.test(m[1]) && !m[1].includes("/san-pham/")) candidates.add(m[1]);
      }
    } catch (e) {
      console.log("Long Chau page skip", page, e.message);
    }
  }
  return [...candidates];
}

const med = await medlatec();
console.log("Medlatec URLs:", med.length);
med.slice(0, 10).forEach((u) => console.log(" M", u));

const lc = await longChau();
console.log("Long Chau URLs:", lc.length);
lc.slice(0, 10).forEach((u) => console.log(" L", u));

const sample = [...med.slice(0, 25), ...lc.slice(0, 25)];
const matched = [];
for (const url of sample) {
  await new Promise((r) => setTimeout(r, 700));
  try {
    const m = await meta(url);
    if (m.match && m.title) matched.push(m);
    console.log(m.match ? "+" : "-", (m.title ?? url).slice(0, 72));
  } catch {
    console.log("ERR", url);
  }
}

const out = {
  fetchedAt: new Date().toISOString(),
  medlatec: matched.filter((m) => /medlatec\.vn/i.test(m.url)),
  longChau: matched.filter((m) => /longchau/i.test(m.url) && /\/bai-viet\//i.test(m.url))
};
fs.writeFileSync("content/blog/crawl-pharmacy-matched.json", JSON.stringify(out, null, 2));
console.log("Matched Medlatec:", out.medlatec.length, "Long Chau:", out.longChau.length);
