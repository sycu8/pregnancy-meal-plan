#!/usr/bin/env tsx
/**
 * Repair incomplete English blog overlays with Cloudflare Workers AI.
 *
 * Usage:
 *   npx tsx scripts/translate-blog-en.ts
 *   npx tsx scripts/translate-blog-en.ts --slug=bo-sung-dha-omega3
 *   npx tsx scripts/translate-blog-en.ts --limit=5 --force
 *
 * Env:
 *   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 *   FEATURE_BLOG_AI_ENABLED=true (optional)
 *   BLOG_TRANSLATE_MAX (default 25)
 */
import fs from "node:fs";
import path from "node:path";
import { isUsableEnglishTranslation } from "../src/lib/blog/enQuality.ts";
import { translatePostToEn } from "../src/lib/blog/synthesis/translatePostToEn.ts";
import { readAiGatewayConfig, isBlogAiEnabled } from "../src/lib/cloudflare/aiGateway.ts";
import type { BlogPost, BlogPostTranslation } from "../src/types/blog.ts";

function arg(name: string) {
  const hit = process.argv.find((part) => part.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

const postsDir = path.join(process.cwd(), "content/blog/posts");
const enDir = path.join(process.cwd(), "content/blog/posts-en");
const force = process.argv.includes("--force");
const onlySlug = arg("slug");
const limit = Number(arg("limit") ?? process.env.BLOG_TRANSLATE_MAX ?? "25");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function writeJson(file: string, value: unknown) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function listCandidateSlugs(): string[] {
  if (onlySlug) return [onlySlug];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

async function main() {
  const candidates: string[] = [];
  for (const slug of listCandidateSlugs()) {
    const viPath = path.join(postsDir, `${slug}.json`);
    if (!fs.existsSync(viPath)) {
      console.warn(`[translate-en] missing VI post: ${slug}`);
      continue;
    }
    const enPath = path.join(enDir, `${slug}.json`);
    const existing = fs.existsSync(enPath) ? readJson<BlogPostTranslation>(enPath) : null;
    if (!force && existing && isUsableEnglishTranslation(existing)) continue;
    candidates.push(slug);
  }

  if (candidates.length === 0) {
    console.log("[translate-en] All selected posts already have usable English — nothing to translate.");
    return;
  }

  const config = readAiGatewayConfig();
  if (!config || !isBlogAiEnabled()) {
    console.error(
      `[translate-en] ${candidates.length} post(s) need English, but AI Gateway is not configured. Set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID.`
    );
    process.exit(1);
  }
  console.log(`[translate-en] gateway=${config.gatewayId} model=${config.textModel}`);

  const work = candidates.slice(0, Math.max(1, limit));
  console.log(`[translate-en] ${candidates.length} incomplete · translating ${work.length}`);

  let ok = 0;
  let failed = 0;
  for (const slug of work) {
    const post = readJson<BlogPost>(path.join(postsDir, `${slug}.json`));
    process.stdout.write(`[translate-en] ${slug} … `);
    const result = await translatePostToEn(post, { config });
    if (!result.translation) {
      failed += 1;
      console.log(`FAIL (${result.reason || "unknown"})`);
      continue;
    }
    writeJson(path.join(enDir, `${slug}.json`), result.translation);
    ok += 1;
    console.log(`ok (${result.translation.content.length} chars)`);
  }

  console.log(`[translate-en] done ok=${ok} failed=${failed}`);
  if (ok > 0) {
    console.log("[translate-en] Run: npm run sync:blog:en");
  }
  if (failed > 0 && ok === 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
