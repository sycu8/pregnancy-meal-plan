/**
 * Build English blog overlays from Vietnamese posts + enBodies.
 * Run: node scripts/build-blog-en.mjs && npm run sync:blog:en
 */
import fs from "node:fs";
import path from "node:path";
import { enBodies } from "./blog-en-bodies.mjs";

const viDir = path.join(process.cwd(), "content/blog/posts");
const enDir = path.join(process.cwd(), "content/blog/posts-en");

fs.mkdirSync(enDir, { recursive: true });

const viFiles = fs.readdirSync(viDir).filter((f) => f.endsWith(".json"));
const missing = [];

let written = 0;
for (const file of viFiles) {
  const slug = file.replace(/\.json$/, "");
  const body = enBodies[slug];
  const existingOutPath = path.join(enDir, file);
  const alreadyHasOverlay = fs.existsSync(existingOutPath);

  // If we have a curated body, always overwrite.
  if (!body) {
    // Allow auto-generated overlays (created by other scripts) to exist without forcing a curated entry.
    if (alreadyHasOverlay) continue;
    // Otherwise, record missing to help authors keep parity for older posts.
    missing.push(slug);
    continue;
  }

  const vi = JSON.parse(fs.readFileSync(path.join(viDir, file), "utf8"));
  const viHeadings = (vi.content.match(/^## .+/gm) ?? []).map((h) => h.replace(/^## /, ""));
  const enHeadings = (body.content.match(/^## .+/gm) ?? []).map((h) => h.replace(/^## /, ""));
  if (viHeadings.length !== enHeadings.length) {
    console.warn(
      `Warning: ${slug} has ${viHeadings.length} VI sections vs ${enHeadings.length} EN sections`
    );
  }

  const en = {
    slug,
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    metaTitle: body.metaTitle,
    metaDescription: body.metaDescription,
    author: "Bầu Ăn Gì? Team",
    reviewer: body.reviewer,
  };

  fs.writeFileSync(existingOutPath, JSON.stringify(en, null, 2) + "\n", "utf8");
  written++;
}

// For auto-generated posts, we allow existing posts-en/*.json files to satisfy EN overlays.
// We only error if a VI post has no curated body AND no existing overlay.
if (missing.length) {
  console.warn("Missing enBodies for (no existing overlay):", missing.join(", "));
}

const extra = Object.keys(enBodies).filter(
  (s) => !viFiles.some((f) => f.replace(/\.json$/, "") === s)
);
if (extra.length) {
  console.warn("enBodies entries without VI post:", extra.join(", "));
}

console.log(`Built ${written} English blog overlays.`);
