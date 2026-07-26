/**
 * Seed SEO-focused editorial topics into content/blog/queue as drafts.
 * Complements crawl ingestion so nutrition/meal-plan coverage stays dense.
 *
 * Run: npx tsx scripts/seed-editorial-queue.ts
 */
import fs from "node:fs";
import path from "node:path";
import { hashValue } from "../src/lib/blog/ingestion/dedupe.ts";
import { pickEditorialTopics } from "../src/lib/blog/synthesis/editorialTopics.ts";

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
  editorial?: boolean;
  categoryHint?: string;
  tagsHint?: string[];
};

const queueDir = path.join(process.cwd(), "content/blog/queue");
const postsDir = path.join(process.cwd(), "content/blog/posts");

function existingSlugs() {
  if (!fs.existsSync(postsDir)) return new Set<string>();
  return new Set(
    fs
      .readdirSync(postsDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
  );
}

function isTemplateOnlyPost(slug: string) {
  const file = path.join(postsDir, `${slug}.json`);
  if (!fs.existsSync(file)) return false;
  try {
    const post = JSON.parse(fs.readFileSync(file, "utf8")) as { content?: string };
    const content = post.content ?? "";
    return content.includes("## Gợi ý thực hành") && content.length < 900;
  } catch {
    return false;
  }
}

function existingQueueTitles() {
  if (!fs.existsSync(queueDir)) return new Set<string>();
  const titles = new Set<string>();
  for (const file of fs.readdirSync(queueDir).filter((f) => f.endsWith(".json"))) {
    try {
      const item = JSON.parse(fs.readFileSync(path.join(queueDir, file), "utf8")) as QueuedItem;
      titles.add(item.title.trim().toLowerCase());
    } catch {
      // skip bad queue files
    }
  }
  return titles;
}

function main() {
  fs.mkdirSync(queueDir, { recursive: true });
  const maxSeed = Number(process.env.BLOG_EDITORIAL_SEED_MAX ?? "3");
  const limit = Number.isFinite(maxSeed) && maxSeed > 0 ? maxSeed : 3;
  const topics = pickEditorialTopics(limit * 2);
  const slugs = existingSlugs();
  const titles = existingQueueTitles();

  let seeded = 0;
  for (const topic of topics) {
    if (seeded >= limit) break;
    const needsRewrite = isTemplateOnlyPost(topic.id);
    if (slugs.has(topic.id) && !needsRewrite) continue;
    if (!needsRewrite && titles.has(topic.title.trim().toLowerCase())) continue;

    const id = hashValue(`editorial:${topic.id}`);
    const file = path.join(queueDir, `${id}.json`);
    if (fs.existsSync(file) && !needsRewrite) {
      try {
        const existing = JSON.parse(fs.readFileSync(file, "utf8")) as QueuedItem;
        if (existing.status === "draft") continue;
      } catch {
        // rewrite file below
      }
    }

    const payload: QueuedItem = {
      id,
      sourceName: "Bầu Ăn Gì? Editorial",
      title: topic.title,
      url: `https://mebauangi.info/blog/topics#${topic.id}`,
      snippet: topic.snippet,
      fetchedAt: new Date().toISOString(),
      status: "draft",
      note: needsRewrite
        ? "Re-queue template-only post for AI rewrite."
        : "Editorial SEO topic seed — synthesize original content; do not copy external articles.",
      editorial: true,
      categoryHint: topic.category,
      tagsHint: topic.tags
    };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n", "utf8");
    seeded++;
  }

  console.log(`Seeded ${seeded} editorial queue items.`);
}

main();
