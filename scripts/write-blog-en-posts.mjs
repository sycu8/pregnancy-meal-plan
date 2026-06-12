import fs from "node:fs";
import path from "node:path";
import { enPosts } from "./blog-en-translations-data.mjs";

const outDir = path.join(process.cwd(), "content/blog/posts-en");
const viDir = path.join(process.cwd(), "content/blog/posts");

fs.mkdirSync(outDir, { recursive: true });

const viSlugs = fs
  .readdirSync(viDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .sort();

const dataSlugs = enPosts.map((p) => p.slug).sort();
const missing = viSlugs.filter((s) => !dataSlugs.includes(s));
const extra = dataSlugs.filter((s) => !viSlugs.includes(s));

if (missing.length) {
  console.error("Missing English translations for:", missing.join(", "));
  process.exit(1);
}
if (extra.length) {
  console.error("Extra translations without VI post:", extra.join(", "));
  process.exit(1);
}

for (const post of enPosts) {
  const out = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    author: post.author,
    reviewer: post.reviewer,
  };
  fs.writeFileSync(
    path.join(outDir, `${post.slug}.json`),
    JSON.stringify(out, null, 2) + "\n",
    "utf8"
  );
}

console.log(`Wrote ${enPosts.length} English posts to content/blog/posts-en/`);
