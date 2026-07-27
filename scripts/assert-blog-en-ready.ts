#!/usr/bin/env tsx
/**
 * Fail if any published VI post is missing a usable English overlay.
 * Run before sync/deploy so incomplete translations never go live.
 *
 *   npx tsx scripts/assert-blog-en-ready.ts
 */
import fs from "node:fs";
import path from "node:path";
import { isUsableEnglishTranslation } from "../src/lib/blog/localize.ts";
import type { BlogPost, BlogPostTranslation } from "../src/types/blog.ts";

const postsDir = path.join(process.cwd(), "content/blog/posts");
const enDir = path.join(process.cwd(), "content/blog/posts-en");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

const missing: string[] = [];
const weak: string[] = [];

for (const file of fs.readdirSync(postsDir).filter((f) => f.endsWith(".json")).sort()) {
  const slug = file.replace(/\.json$/, "");
  const vi = readJson<BlogPost>(path.join(postsDir, file));
  if (vi.status && vi.status !== "published") continue;

  const enPath = path.join(enDir, `${slug}.json`);
  if (!fs.existsSync(enPath)) {
    missing.push(slug);
    continue;
  }
  const en = readJson<BlogPostTranslation>(enPath);
  if (!isUsableEnglishTranslation(en)) weak.push(slug);
}

if (missing.length || weak.length) {
  console.error("[assert-blog-en] English must be complete before web publish.");
  if (missing.length) {
    console.error(`Missing EN overlays (${missing.length}):`);
    for (const slug of missing.slice(0, 30)) console.error(`  - ${slug}`);
  }
  if (weak.length) {
    console.error(`Unusable EN overlays (${weak.length}):`);
    for (const slug of weak.slice(0, 30)) console.error(`  - ${slug}`);
  }
  process.exit(1);
}

const published = fs
  .readdirSync(postsDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => readJson<BlogPost>(path.join(postsDir, f)))
  .filter((p) => !p.status || p.status === "published").length;

console.log(`[assert-blog-en] OK — ${published} published posts have usable English overlays.`);
