import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { gatewayGenerateImage, readAiGatewayConfig, type AiGatewayConfig } from "@/lib/cloudflare/aiGateway";
import { siteOrigin } from "@/lib/agentDiscovery";

export type BlogImageResult = {
  r2Key: string;
  publicPath: string;
  ogImage: string;
  markdownImage: string;
};

export function blogImageR2Key(slug: string) {
  return `blog/images/${slug}.jpg`;
}

export function blogImagePublicPath(slug: string) {
  return `/api/blog/media/${blogImageR2Key(slug)}`;
}

export async function generateAndUploadBlogImage(options: {
  slug: string;
  prompt: string;
  alt: string;
  config?: AiGatewayConfig | null;
  bucket?: string;
}): Promise<BlogImageResult | null> {
  const config = options.config ?? readAiGatewayConfig();
  if (!config) return null;

  const bytes = await gatewayGenerateImage(options.prompt, { config });
  if (!bytes || bytes.byteLength < 1000) {
    console.warn(`[blog-image] empty image for ${options.slug}`);
    return null;
  }

  const bucket = options.bucket || process.env.BLOG_R2_BUCKET || "bau-an-gi-exports";
  const key = blogImageR2Key(options.slug);
  const uploaded = uploadToR2({ bucket, key, bytes, contentType: "image/jpeg" });
  if (!uploaded) return null;

  const publicPath = blogImagePublicPath(options.slug);
  const ogImage = `${siteOrigin}${publicPath}`;
  const markdownImage = `\n\n![${options.alt}](${ogImage})\n`;

  return { r2Key: key, publicPath, ogImage, markdownImage };
}

function uploadToR2(input: { bucket: string; key: string; bytes: Uint8Array; contentType: string }): boolean {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-img-"));
  const filePath = path.join(tmpDir, path.basename(input.key));
  try {
    fs.writeFileSync(filePath, input.bytes);

    // Prefer Wrangler remote R2 put (uses CLOUDFLARE_API_TOKEN / account).
    const result = spawnSync(
      "npx",
      [
        "wrangler",
        "r2",
        "object",
        "put",
        `${input.bucket}/${input.key}`,
        `--file=${filePath}`,
        `--content-type=${input.contentType}`,
        "--remote"
      ],
      {
        encoding: "utf8",
        env: process.env,
        timeout: 120_000
      }
    );

    if (result.status === 0) return true;
    console.warn(`[blog-image] wrangler r2 put failed: ${result.stderr || result.stdout}`);
    return false;
  } catch (error) {
    console.warn("[blog-image] upload error:", error);
    return false;
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
