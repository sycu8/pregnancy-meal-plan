import fs from "node:fs";

const UA = "MeBauAnGiBlogBot/1.0";
const TOPIC =
  /mang thai|mang bầu|thai kỳ|thai ky|sản phụ|san phu|dinh dưỡng|dinh duong|me bau|mẹ bầu|cho con bú|sau sinh|sơ sinh|nghén|nghen|tiểu đường thai|tăng cân|folate|sắt|canxi|omega|ăn dặm|an dam|vaccine.*thai|tiêm.*thai/i;

async function vinmecPosts() {
  const index = await fetch("https://www.vinmec.com/sitemap.xml", { headers: { "User-Agent": UA } }).then((r) => r.text());
  const maps = [...index.matchAll(/<loc>([^<]+posts-vi[^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = [];
  for (const sm of maps.slice(0, 14)) {
    const xml = await fetch(sm, { headers: { "User-Agent": UA } }).then((r) => r.text());
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
    await new Promise((r) => setTimeout(r, 300));
  }
  return urls.filter((u) => /thai|bau|san-phu|dinh-duong|me-bau|cho-con-bu|sau-sinh|nghen|an-dam|tre-so-sinh|nuoi-con|folate|sat|canxi|omega|tiem-chung/i.test(u));
}

async function tamAnhPosts() {
  const html = await fetch("https://tamanhhospital.vn/chu-de/san-phu-khoa/", { headers: { "User-Agent": UA } }).then((r) => r.text());
  const rel = [...html.matchAll(/href="(\/tin-tuc\/[^"]+)"/g)].map((m) => `https://tamanhhospital.vn${m[1]}`);
  const abs = [...html.matchAll(/href="(https:\/\/tamanhhospital\.vn\/tin-tuc\/[^"]+)"/g)].map((m) => m[1]);
  return [...new Set([...rel, ...abs])];
}

async function meta(url) {
  const html = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) }).then((r) => r.text());
  const title = html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] ?? html.match(/<title>([^<]+)/i)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] ?? "";
  return { url, title, desc, match: TOPIC.test(`${title} ${desc}`) };
}

const vin = await vinmecPosts();
console.log("Vinmec candidate URLs:", vin.length);
const tam = await tamAnhPosts();
console.log("Tam Anh candidate URLs:", tam.length);

const sample = [...vin.slice(0, 30), ...tam.slice(0, 15)];
const matched = [];
for (const url of sample) {
  await new Promise((r) => setTimeout(r, 800));
  try {
    const m = await meta(url);
    if (m.match) matched.push(m);
    console.log(m.match ? "+" : "-", m.title?.slice(0, 70));
  } catch (e) {
    console.log("ERR", url);
  }
}
fs.writeFileSync("content/blog/crawl-matched.json", JSON.stringify(matched, null, 2));
console.log("Matched:", matched.length);
