#!/usr/bin/env tsx
/**
 * Marketing MVP — generate social drafts from recent blog posts.
 *
 * Usage:
 *   npx tsx scripts/marketing-drafts.ts
 *   npx tsx scripts/marketing-drafts.ts --slug=pregnancy-snack-ideas --locale=en --out=tmp/drafts.md
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getAllPosts, getPostBySlug } from "../src/lib/blog/posts";
import { draftsFromBlogPost, formatDraftQueue } from "../src/lib/marketing/drafts";
import type { Locale } from "../src/lib/i18n";

function arg(name: string) {
  const hit = process.argv.find((part) => part.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

const slug = arg("slug");
const locale = (arg("locale") as Locale | undefined) ?? "en";
const limit = Number(arg("limit") ?? "3");
const out = arg("out") ?? "tmp/marketing-drafts.md";

const posts = slug
  ? [getPostBySlug(slug, locale)].filter(Boolean)
  : getAllPosts(locale).slice(0, Math.max(1, limit));

if (!posts.length) {
  console.error("No posts found.");
  process.exit(1);
}

const drafts = posts.flatMap((post) => draftsFromBlogPost(post!, [locale]));
const markdown = `# Marketing drafts\n\nGenerated: ${new Date().toISOString()}\n\n${formatDraftQueue(drafts)}\n`;
const target = resolve(process.cwd(), out);
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, markdown, "utf8");

console.log(`Wrote ${drafts.length} drafts → ${target}`);
for (const draft of drafts) {
  console.log(`- ${draft.platform}/${draft.locale}: ${draft.sourceSlug}`);
}
