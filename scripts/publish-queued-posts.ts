/**
 * Convert queued metadata items into synthesized blog posts (VI + EN overlays).
 * Uses Workers AI via Cloudflare AI Gateway when credentials are available.
 * Generates hero images with Flux and uploads to R2.
 *
 * IMPORTANT: Do not copy source text. Use only title/snippet as inspiration.
 *
 * Run: npx tsx scripts/publish-queued-posts.ts
 */
import fs from "node:fs";
import path from "node:path";
import type { BlogCategorySlug, BlogPost, BlogTrimester, BlogPostTranslation } from "../src/types/blog.ts";
import { hashValue } from "../src/lib/blog/ingestion/dedupe.ts";
import { estimateReadingTimeMinutes } from "../src/lib/blog/readingTime.ts";
import { synthesizePostWithAi } from "../src/lib/blog/synthesis/synthesizePost.ts";
import { generateAndUploadBlogImage } from "../src/lib/blog/synthesis/uploadBlogImage.ts";
import { isBlogAiEnabled, readAiGatewayConfig } from "../src/lib/cloudflare/aiGateway.ts";

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
  editorial?: boolean;
  categoryHint?: BlogCategorySlug;
  tagsHint?: string[];
};

const postsDir = path.join(process.cwd(), "content/blog/posts");
const enDir = path.join(process.cwd(), "content/blog/posts-en");
const queueDir = path.join(process.cwd(), "content/blog/queue");

const authorVi = "Đội ngũ Pregnancy Meal Planner";
const authorEn = "Pregnancy Meal Planner Team";

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
    .replace(/-s\d+-n\d+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function slugFromUrl(url: string) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "bai-viet";
  // Editorial anchors: /blog/topics#topic-id → use hash topic id
  if (parsed.hash) return normalizeSlug(parsed.hash.replace(/^#/, ""));
  return normalizeSlug(last);
}

function ensureUniqueSlug(base: string) {
  const slug = base || "bai-viet";
  if (!fs.existsSync(path.join(postsDir, `${slug}.json`))) return slug;
  const suffix = hashValue(`${slug}:${Date.now()}`).slice(0, 6);
  return `${slug}-${suffix}`;
}

function guessTrimester(title: string, snippet: string): BlogTrimester | undefined {
  const text = `${title} ${snippet}`.toLowerCase();
  if (/(3 tháng đầu|tam cá nguyệt 1|tcn1|first trimester)/i.test(text)) return "3-thang-dau";
  if (/(3 tháng giữa|tam cá nguyệt 2|tcn2|second trimester)/i.test(text)) return "3-thang-giua";
  if (/(3 tháng cuối|tam cá nguyệt 3|tcn3|third trimester|tuần 28|week 28)/i.test(text)) return "3-thang-cuoi";
  return undefined;
}

function enContentTemplate(item: QueueItem) {
  return `## Summary\n\nThis post is a synthesized educational overview based on the public title/description from ${item.sourceName}. It is **not** a substitute for medical advice.\n\n## Key points\n\n- What the topic usually means in pregnancy/parenting context.\n- Common situations and risk factors.\n- What you can do safely at home.\n\n## Seek care urgently if\n\n- Symptoms worsen quickly or do not improve.\n- Heavy bleeding, severe pain, high fever, breathing difficulty, or fainting.\n- Clear decrease in fetal movement (especially later pregnancy).\n\n## Practical tips\n\n- Prioritize balanced meals, hydration, and sleep.\n- Avoid self-medicating or high-dose supplements without clinician guidance.\n- Write down symptoms and questions for your appointment.\n\n## References\n\nSee the original source link listed at the end of the post.`;
}

async function main() {
  fs.mkdirSync(postsDir, { recursive: true });
  fs.mkdirSync(enDir, { recursive: true });
  if (!fs.existsSync(queueDir)) {
    console.log("No queue directory.");
    return;
  }

  const aiConfig = readAiGatewayConfig();
  const aiEnabled = isBlogAiEnabled();
  console.log(
    aiEnabled && aiConfig
      ? `[publish] AI Gateway enabled (gateway=${aiConfig.gatewayId}, text=${aiConfig.textModel}, image=${aiConfig.imageModel})`
      : "[publish] AI Gateway unavailable — using template synthesis (no images)."
  );

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
  const withImages = process.env.BLOG_AI_IMAGES !== "false";

  for (const { full, item } of drafts.slice(0, limit)) {
    const baseSlug = slugFromUrl(item.url);
    const existingPath = path.join(postsDir, `${baseSlug}.json`);
    const allowOverwrite =
      process.env.BLOG_OVERWRITE_POSTS === "true" ||
      (item.editorial === true && fs.existsSync(existingPath));
    const slug = allowOverwrite && baseSlug ? baseSlug : ensureUniqueSlug(baseSlug);

    const synthesized = await synthesizePostWithAi(
      {
        title: item.title,
        snippet: item.snippet,
        sourceName: item.sourceName,
        url: item.url
      },
      { config: aiConfig }
    );

    let content = synthesized.content;
    let ogImage: string | undefined;

    if (withImages && aiConfig) {
      const image = await generateAndUploadBlogImage({
        slug,
        prompt: synthesized.imagePrompt || `${item.title}, healthy pregnancy nutrition, photorealistic`,
        alt: synthesized.title,
        config: aiConfig
      });
      if (image) {
        // Hero is rendered from post.ogImage in the article header (avoid duplicate body image).
        ogImage = image.ogImage;
      }
    }

    const publishedAt = item.publishedAt ?? item.fetchedAt ?? nowIso();
    const category = item.categoryHint ?? synthesized.category;
    const tags = [...new Set([...(item.tagsHint ?? []), ...synthesized.tags])].slice(0, 6);

    const viPost: BlogPost = {
      title: synthesized.title,
      slug,
      excerpt: synthesized.excerpt,
      content,
      category,
      tags,
      trimester: guessTrimester(synthesized.title, synthesized.excerpt),
      author: authorVi,
      reviewer: item.editorial ? "Biên tập Pregnancy Meal Planner" : `Tham chiếu ${item.sourceName}`,
      sourceReferences: [
        {
          title: item.title.trim() || "Bài gốc",
          url: item.url,
          publisher: item.sourceName,
          accessedAt: new Date().toISOString().slice(0, 10)
        }
      ],
      publishedAt,
      updatedAt: nowIso(),
      readingTimeMinutes: estimateReadingTimeMinutes(content),
      metaTitle: synthesized.metaTitle || `${synthesized.title} | Pregnancy Meal Planner Blog`,
      metaDescription: synthesized.metaDescription || synthesized.excerpt.slice(0, 160),
      ...(ogImage ? { ogImage } : {}),
      ...(synthesized.faqs ? { faqs: synthesized.faqs } : {}),
      status: "published"
    };

    const enOverlay: BlogPostTranslation = synthesized.en
      ? {
          slug,
          title: synthesized.en.title,
          excerpt: synthesized.en.excerpt,
          content: synthesized.en.content,
          metaTitle: synthesized.en.metaTitle,
          metaDescription: synthesized.en.metaDescription,
          author: authorEn,
          reviewer: item.editorial ? "Pregnancy Meal Planner Editorial" : `References ${item.sourceName}`
        }
      : {
          slug,
          title: viPost.title,
          excerpt: viPost.excerpt,
          content: enContentTemplate(item),
          metaTitle: `${viPost.title} | Pregnancy Meal Planner Blog`,
          metaDescription: viPost.metaDescription,
          author: authorEn,
          reviewer: item.editorial ? "Pregnancy Meal Planner Editorial" : `References ${item.sourceName}`
        };

    const outVi = path.join(postsDir, `${slug}.json`);
    const outEn = path.join(enDir, `${slug}.json`);
    const overwrite = process.env.BLOG_OVERWRITE_POSTS === "true" || synthesized.usedAi;

    if (!fs.existsSync(outVi) || overwrite) writeJson(outVi, viPost);
    if (!fs.existsSync(outEn) || overwrite) writeJson(outEn, enOverlay);

    const nextQueue: QueueItem = { ...item, status: "published", slug };
    writeJson(full, nextQueue);
    published++;
    console.log(`Published ${slug} (ai=${synthesized.usedAi}, image=${Boolean(ogImage)})`);
  }

  console.log(`Published ${published} posts from queue.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
