/**
 * Backfill diversified on-site backlinks into blog post bodies (VI + EN).
 *
 * Usage:
 *   npx tsx scripts/apply-internal-links.ts
 *   BLOG_INTERNAL_LINK_SLUGS=slug1,slug2 npx tsx scripts/apply-internal-links.ts
 */
import fs from "node:fs";
import path from "node:path";
import { estimateReadingTimeMinutes } from "../src/lib/blog/readingTime.ts";
import {
  countInternalHrefs,
  ensureInternalLinks,
  pickInternalLinks
} from "../src/lib/blog/internalLinks.ts";
import type { BlogCategorySlug } from "../src/types/blog.ts";

const postsDir = path.join(process.cwd(), "content/blog/posts");
const enDir = path.join(process.cwd(), "content/blog/posts-en");

type ViPost = {
  slug: string;
  category: BlogCategorySlug;
  tags: string[];
  content: string;
  updatedAt?: string;
  readingTimeMinutes?: number;
};

type EnPost = {
  slug: string;
  content: string;
};

/** Pair neighboring nutritionist posts so they deep-link each other. */
const RELATED: Record<string, string[]> = {
  "common-vietnamese-dishes-in-pregnancy-what-to-keep-tweak-or-skip": [
    "vietnamese-foods-that-support-a-healthy-pregnancy-plate",
    "pregnancy-food-safety-analysis-sushi-salads-bbq-and-cheese-boards"
  ],
  "pregnancy-food-safety-analysis-sushi-salads-bbq-and-cheese-boards": [
    "common-vietnamese-dishes-in-pregnancy-what-to-keep-tweak-or-skip",
    "international-pantry-staples-for-pregnancy-nutrition"
  ],
  "vietnamese-foods-that-support-a-healthy-pregnancy-plate": [
    "common-vietnamese-dishes-in-pregnancy-what-to-keep-tweak-or-skip",
    "pregnancy-recipes-iron-and-folate-bowls-you-can-cook-in-30-minutes"
  ],
  "international-pantry-staples-for-pregnancy-nutrition": [
    "pregnancy-food-safety-analysis-sushi-salads-bbq-and-cheese-boards",
    "delicious-weeknight-pregnancy-menus-5-cook-once-recipes"
  ],
  "pregnancy-recipes-iron-and-folate-bowls-you-can-cook-in-30-minutes": [
    "delicious-weeknight-pregnancy-menus-5-cook-once-recipes",
    "vietnamese-foods-that-support-a-healthy-pregnancy-plate"
  ],
  "delicious-weeknight-pregnancy-menus-5-cook-once-recipes": [
    "pregnancy-recipes-iron-and-folate-bowls-you-can-cook-in-30-minutes",
    "international-pantry-staples-for-pregnancy-nutrition"
  ]
};

function writeJson(file: string, value: unknown) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function main() {
  const only = (process.env.BLOG_INTERNAL_LINK_SLUGS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const files = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".json"))
    .filter((f) => (only.length ? only.includes(f.replace(/\.json$/, "")) : true));

  let updated = 0;
  for (const file of files) {
    const slug = file.replace(/\.json$/, "");
    const viPath = path.join(postsDir, file);
    const enPath = path.join(enDir, file);
    if (!fs.existsSync(enPath)) continue;

    const vi = JSON.parse(fs.readFileSync(viPath, "utf8")) as ViPost;
    const en = JSON.parse(fs.readFileSync(enPath, "utf8")) as EnPost;
    const relatedSlugs = RELATED[slug] ?? [];
    const relatedTitlesEn = relatedSlugs.map((rel) => {
      try {
        const relEn = JSON.parse(fs.readFileSync(path.join(enDir, `${rel}.json`), "utf8")) as { title?: string };
        return relEn.title?.trim() || rel;
      } catch {
        return rel;
      }
    });
    const relatedTitlesVi = relatedSlugs.map((rel) => {
      try {
        const relVi = JSON.parse(fs.readFileSync(path.join(postsDir, `${rel}.json`), "utf8")) as { title?: string };
        return relVi.title?.trim() || rel;
      } catch {
        return rel;
      }
    });

    const nextVi = ensureInternalLinks(vi.content, {
      slug,
      category: vi.category,
      tags: vi.tags ?? [],
      locale: "vi",
      relatedSlugs,
      relatedTitles: relatedTitlesVi
    });
    const nextEn = ensureInternalLinks(en.content, {
      slug,
      category: vi.category,
      tags: vi.tags ?? [],
      locale: "en",
      relatedSlugs,
      relatedTitles: relatedTitlesEn
    });

    if (nextVi === vi.content && nextEn === en.content) continue;

    vi.content = nextVi;
    vi.updatedAt = new Date().toISOString();
    vi.readingTimeMinutes = estimateReadingTimeMinutes(nextVi);
    en.content = nextEn;
    writeJson(viPath, vi);
    writeJson(enPath, en);
    updated++;

    const picks = pickInternalLinks({
      slug,
      category: vi.category,
      tags: vi.tags ?? [],
      locale: "en",
      relatedSlugs
    });
    console.log(
      `[internal-links] ${slug} viHrefs=${countInternalHrefs(nextVi)} enHrefs=${countInternalHrefs(nextEn)} -> ${picks.map((p) => p.href).join(", ")}`
    );
  }

  console.log(`Updated internal links on ${updated} bilingual post(s).`);
}

main();
