#!/usr/bin/env tsx
/**
 * Marketing MVP — publish generated drafts (dry-run by default).
 *
 * Usage:
 *   npx tsx scripts/marketing-publish.ts --slug=pregnancy-snack-ideas
 *   npx tsx scripts/marketing-publish.ts --slug=pregnancy-snack-ideas --live --platforms=x,facebook
 *
 * Requires env vars from brand/social/CONNECT.md when --live is set.
 */
import { getPostBySlug, getAllPosts } from "../src/lib/blog/posts";
import { draftsFromBlogPost } from "../src/lib/marketing/drafts";
import { publishDraft } from "../src/lib/marketing/publishers";
import type { Locale } from "../src/lib/i18n";
import { isMarketingPlatform, type MarketingPlatform } from "../src/lib/marketing/drafts";

function arg(name: string) {
  const hit = process.argv.find((part) => part.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

const live = process.argv.includes("--live");
const slug = arg("slug");
const locale = (arg("locale") as Locale | undefined) ?? "en";
const platforms = new Set<MarketingPlatform>(
  (arg("platforms") ?? "facebook,x")
    .split(",")
    .map((value) => value.trim())
    .filter(isMarketingPlatform)
);

const post = slug ? getPostBySlug(slug, locale) : getAllPosts(locale)[0];
if (!post) {
  console.error("No post found.");
  process.exit(1);
}

const drafts = draftsFromBlogPost(post, [locale]).filter((draft) => platforms.has(draft.platform));

async function main() {
  console.log(`${live ? "LIVE" : "DRY-RUN"} publish for ${post!.slug} (${drafts.length} drafts)`);
  for (const draft of drafts) {
    const result = await publishDraft(draft, { dryRun: !live });
    const state = result.dryRun ? "dry-run" : result.ok ? "ok" : "fail";
    console.log(`[${state}] ${draft.platform}: ${result.id ?? result.error ?? ""}`);
    if (!result.ok && !result.dryRun) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
