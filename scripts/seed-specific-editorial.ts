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

  for (const id of ids) {
    const topic = EDITORIAL_TOPICS.find((t) => t.id === id);
    if (!topic) {
      console.warn(`[seed-specific] unknown topic id: ${id}`);
      continue;
    }

    const queueId = hashValue(`editorial:${topic.id}:batch-${new Date().toISOString().slice(0, 10)}`);
    const file = path.join(queueDir, `${queueId}.json`);
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
      categoryHint: topic.category,
      tagsHint: topic.tags
    };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2) + "\n", "utf8");
    seeded++;
    console.log(`[seed-specific] draft ${topic.id} -> ${path.basename(file)}`);
  }

  console.log(`Seeded ${seeded}/${ids.length} specific editorial topics.`);
}

main();
