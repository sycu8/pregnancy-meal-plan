/**
 * Convert queued metadata items into synthesized blog posts (VI + EN overlays).
 * IMPORTANT: Do not copy source text. Use only title/snippet as inspiration.
 *
 * Run: node --experimental-strip-types scripts/publish-queued-posts.ts
 */
import fs from "node:fs";
import path from "node:path";
import type { BlogCategorySlug, BlogPost, BlogTrimester, BlogPostTranslation } from "../src/types/blog.ts";
import { hashValue } from "../src/lib/blog/ingestion/dedupe.ts";
import { synthesizePost } from "../src/lib/blog/synthesis/synthesizePost.ts";

type QueueItem = {
  id: string;
  sourceName: string;
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  fetchedAt: string;
  status: "draft" | "published";
  note?: string;
  slug?: string;
};

const postsDir = path.join(process.cwd(), "content/blog/posts");
const enDir = path.join(process.cwd(), "content/blog/posts-en");
const queueDir = path.join(process.cwd(), "content/blog/queue");

const authorVi = "Đội ngũ Bầu Ăn Gì?";
const authorEn = "Bầu Ăn Gì? Team";

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function writeJson(file: string, value: unknown) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeSlug(raw: string) {
  return raw
    .toLowerCase()
    .replace(/\.html?$/i, "")
    .replace(/-s\d+-n\d+$/i, "") // Medlatec suffix
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function slugFromUrl(url: string) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "bai-viet";
  return normalizeSlug(last);
}

function ensureUniqueSlug(base: string) {
  const slug = base || "bai-viet";
  if (!fs.existsSync(path.join(postsDir, `${slug}.json`))) return slug;
  const suffix = hashValue(`${slug}:${Date.now()}`).slice(0, 6);
  return `${slug}-${suffix}`;
}

function guessCategory(title: string, snippet: string): BlogCategorySlug {
  const text = `${title} ${snippet}`.toLowerCase();
  if (/(sau sinh|hậu sản|postpartum|cho con bú|cho con bu|be bú|be bu)/i.test(text)) return "sau-sinh";
  if (/(trẻ|tre|sơ sinh|so sinh|ăn dặm|an dam|baby|infant|weaning)/i.test(text)) return "cham-con-0-24-thang";
  if (/(thực đơn|thuc don|menu|bữa ăn|bua an|calo|đường huyết|duong huyet|tiểu đường|tieu duong)/i.test(text))
    return "thuc-don-ba-bau";
  if (/(vitamin|folate|axit|acid|sắt|sat|canxi|omega|dinh dưỡng|dinh duong|protein|choline)/i.test(text))
    return "dinh-duong-ba-bau";
  return "truoc-sinh";
}

function guessTrimester(title: string, snippet: string): BlogTrimester | undefined {
  const text = `${title} ${snippet}`.toLowerCase();
  if (/(3 tháng đầu|tam cá nguyệt 1|tcn1|first trimester)/i.test(text)) return "3-thang-dau";
  if (/(3 tháng giữa|tam cá nguyệt 2|tcn2|second trimester)/i.test(text)) return "3-thang-giua";
  if (/(3 tháng cuối|tam cá nguyệt 3|tcn3|third trimester|tuần 28|week 28)/i.test(text)) return "3-thang-cuoi";
  return undefined;
}

function extractTags(title: string, snippet: string) {
  const text = `${title} ${snippet}`.toLowerCase();
  const tags: string[] = [];
  const push = (t: string) => {
    if (!tags.includes(t)) tags.push(t);
  };
  if (/(tiểu đường|tieu duong|gdm|đường huyết|duong huyet)/i.test(text)) push("tieu-duong-thai-ky");
  if (/(tiền sản giật|tien san giat|preeclampsia)/i.test(text)) push("tien-san-giat");
  if (/(siêu âm|sieu am|ultrasound)/i.test(text)) push("sieu-am");
  if (/(vitamin k)/i.test(text)) push("vitamin-k");
  if (/(hcg|beta)/i.test(text)) push("beta-hcg");
  if (/(cân nặng|can nang|weight)/i.test(text)) push("can-nang");
  if (/(khám thai|kham thai|prenatal)/i.test(text)) push("kham-thai");
  if (/(ăn dặm|an dam|weaning)/i.test(text)) push("an-dam");
  if (/(vitamin a)/i.test(text)) push("vitamin-a");
  if (tags.length === 0) push("suc-khoe");
  return tags.slice(0, 6);
}

function viContentTemplate(item: QueueItem) {
  return synthesizePost({
    title: item.title,
    snippet: item.snippet,
    sourceName: item.sourceName,
    url: item.url
  }).content;
}

function enContentTemplate(item: QueueItem) {
  return `## Summary\n\nThis post is a synthesized educational overview based on the public title/description from ${item.sourceName}. It is **not** a substitute for medical advice.\n\n## Key points\n\n- What the topic usually means in pregnancy/parenting context.\n- Common situations and risk factors.\n- What you can do safely at home.\n\n## Seek care urgently if\n\n- Symptoms worsen quickly or do not improve.\n- Heavy bleeding, severe pain, high fever, breathing difficulty, or fainting.\n- Clear decrease in fetal movement (especially later pregnancy).\n\n## Practical tips\n\n- Prioritize balanced meals, hydration, and sleep.\n- Avoid self-medicating or high-dose supplements without clinician guidance.\n- Write down symptoms and questions for your appointment.\n\n## References\n\nSee the original source link listed at the end of the post.`;
}

function makePost(item: QueueItem, slug: string): BlogPost {
  const category = guessCategory(item.title, item.snippet);
  const tags = extractTags(item.title, item.snippet);
  const trimester = guessTrimester(item.title, item.snippet);
  const publishedAt = item.publishedAt ?? item.fetchedAt ?? nowIso();

  return {
    title: item.title.trim(),
    slug,
    excerpt: item.snippet?.trim().slice(0, 180) || `Tổng hợp kiến thức sức khỏe liên quan — tham khảo ${item.sourceName}.`,
    content: viContentTemplate(item),
    category,
    tags,
    trimester,
    author: authorVi,
    reviewer: `Tham chiếu ${item.sourceName}`,
    sourceReferences: [
      { title: item.title.trim() || "Bài gốc", url: item.url, publisher: item.sourceName, accessedAt: new Date().toISOString().slice(0, 10) }
    ],
    publishedAt,
    updatedAt: nowIso(),
    readingTimeMinutes: 5,
    metaTitle: `${item.title.trim()} | Blog Bầu Ăn Gì?`,
    metaDescription: (item.snippet || `Tổng hợp kiến thức liên quan — tham khảo ${item.sourceName}.`).slice(0, 160),
    status: "published"
  };
}

function makeEnglishOverlay(item: QueueItem, slug: string, viPost: BlogPost): BlogPostTranslation {
  // Keep slug shared; English is a synthesized overlay.
  return {
    slug,
    title: viPost.title, // keep original title if already Vietnamese; still acceptable as overlay
    excerpt: viPost.excerpt,
    content: enContentTemplate(item),
    metaTitle: `${viPost.title} | Bầu Ăn Gì? Blog`,
    metaDescription: viPost.metaDescription,
    author: authorEn,
    reviewer: `References ${item.sourceName}`
  };
}

async function main() {
  fs.mkdirSync(postsDir, { recursive: true });
  fs.mkdirSync(enDir, { recursive: true });
  if (!fs.existsSync(queueDir)) {
    console.log("No queue directory.");
    return;
  }

  const queueFiles = fs.readdirSync(queueDir).filter((f) => f.endsWith(".json"));
  const drafts = queueFiles
    .map((f) => ({ file: f, full: path.join(queueDir, f) }))
    .map(({ file, full }) => ({ file, full, item: readJson<QueueItem>(full) }))
    .filter(({ item }) => item.status === "draft");

  if (drafts.length === 0) {
    console.log("No draft queue items.");
    return;
  }

  let published = 0;
  const maxPerRun = Number(process.env.BLOG_AUTO_PUBLISH_MAX ?? "10");
  const limit = Number.isFinite(maxPerRun) && maxPerRun > 0 ? maxPerRun : 10;

  for (const { full, item } of drafts.slice(0, limit)) {
    const baseSlug = slugFromUrl(item.url);
    const slug = ensureUniqueSlug(baseSlug);

    const viPost = makePost(item, slug);
    const outVi = path.join(postsDir, `${slug}.json`);
    const outEn = path.join(enDir, `${slug}.json`);

    if (!fs.existsSync(outVi)) writeJson(outVi, viPost);
    if (!fs.existsSync(outEn)) writeJson(outEn, makeEnglishOverlay(item, slug, viPost));

    const nextQueue: QueueItem = { ...item, status: "published", slug };
    writeJson(full, nextQueue);
    published++;
  }

  console.log(`Published ${published} posts from queue.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

