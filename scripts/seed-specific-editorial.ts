/**
 * Seed specific editorial topic IDs into the blog queue as drafts.
 *
 * Usage:
 *   BLOG_EDITORIAL_TOPIC_IDS=id1,id2 npx tsx scripts/seed-specific-editorial.ts
 */
import fs from "node:fs";
import path from "node:path";
import { hashValue } from "../src/lib/blog/ingestion/dedupe.ts";
import { EDITORIAL_TOPICS } from "../src/lib/blog/synthesis/editorialTopics.ts";

const queueDir = path.join(process.cwd(), "content/blog/queue");
const postsDir = path.join(process.cwd(), "content/blog/posts");
const enDir = path.join(process.cwd(), "content/blog/posts-en");

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function alreadyPublished(topic: (typeof EDITORIAL_TOPICS)[number]) {
  if (!fs.existsSync(postsDir)) return false;
  if (fs.existsSync(path.join(postsDir, `${topic.id}.json`))) return true;

  const titleTargets = new Set([normalize(topic.title), normalize(topic.titleVi)]);
  for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith(".json"))) {
    try {
      const vi = JSON.parse(fs.readFileSync(path.join(postsDir, file), "utf8")) as { title?: string; slug?: string };
      if (vi.slug && normalize(vi.slug).includes(topic.id.replace(/-/g, "").slice(0, 18))) {
        // weak slug containment is not enough alone; check titles too
      }
      if (vi.title && titleTargets.has(normalize(vi.title))) return true;
      const enFile = path.join(enDir, file);
      if (fs.existsSync(enFile)) {
        const en = JSON.parse(fs.readFileSync(enFile, "utf8")) as { title?: string };
        if (en.title && titleTargets.has(normalize(en.title))) return true;
      }
    } catch {
      // ignore bad files
    }
  }
  return false;
}

function main() {
  const ids = (process.env.BLOG_EDITORIAL_TOPIC_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    console.error("Set BLOG_EDITORIAL_TOPIC_IDS=id1,id2,...");
    process.exit(1);
  }

  fs.mkdirSync(queueDir, { recursive: true });
  let seeded = 0;
  let skipped = 0;

  for (const id of ids) {
    const topic = EDITORIAL_TOPICS.find((t) => t.id === id);
    if (!topic) {
      console.warn(`[seed-specific] unknown topic id: ${id}`);
      continue;
    }

    if (alreadyPublished(topic) && process.env.BLOG_FORCE_RESEED !== "true") {
      console.log(`[seed-specific] skip ${topic.id}: already published`);
      skipped++;
      continue;
    }

    const queueId = hashValue(`editorial:${topic.id}`);
    const file = path.join(queueDir, `${queueId}.json`);
    if (fs.existsSync(file)) {
      try {
        const existing = JSON.parse(fs.readFileSync(file, "utf8")) as { status?: string };
        if (existing.status === "draft" || existing.status === "published") {
          console.log(`[seed-specific] skip ${topic.id}: queue already ${existing.status}`);
          skipped++;
          continue;
        }
      } catch {
        // rewrite below
      }
    }

    const payload = {
      id: queueId,
      sourceName: "Pregnancy Meal Planner Editorial",
      title: topic.title,
      titleVi: topic.titleVi,
      url: `https://pregnancymeal.tips/blog/${topic.id}`,
      snippet: topic.snippet,
      snippetVi: topic.snippetVi,
      fetchedAt: new Date().toISOString(),
      status: "draft" as const,
      note: "Priority editorial seed — professional nutritionist voice, >=300 words, authoritative sources, Workers AI + Flux.",
      editorial: true,
      topicId: topic.id,
      categoryHint: topic.category,
      tagsHint: topic.tags
    };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n", "utf8");
    seeded++;
    console.log(`[seed-specific] draft ${topic.id} -> ${path.basename(file)}`);
  }

  console.log(`Seeded ${seeded}/${ids.length} specific editorial topics (skipped ${skipped}).`);
}

main();
