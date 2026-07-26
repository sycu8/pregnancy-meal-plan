import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";
import { assertMarketingAuth } from "@/lib/marketing/auth";
import { draftsFromBlogPost } from "@/lib/marketing/drafts";
import { publishDraft } from "@/lib/marketing/publishers";
import { appendMarketingActivity } from "@/lib/marketing/activity";
import type { SocialPlatform } from "@/lib/social/profiles";

export const runtime = "nodejs";

type PublishBody = {
  slug?: string;
  locale?: string;
  platforms?: string[] | string;
  live?: boolean | string | number;
  source?: "portal" | "api" | "cron" | "zapier" | "n8n";
};

function parsePlatforms(value: PublishBody["platforms"]): Set<SocialPlatform> {
  const raw = Array.isArray(value)
    ? value
    : String(value ?? "x,facebook")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
  return new Set(raw.filter((p): p is SocialPlatform => p === "x" || p === "facebook" || p === "tiktok"));
}

function parseLive(value: PublishBody["live"], url: URL) {
  if (url.searchParams.get("live") === "1") return true;
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  return false;
}

/** Publish drafts — Zapier/n8n action. Default dry-run unless live=true. */
export async function POST(request: Request) {
  const auth = assertMarketingAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const body = (await request.json().catch(() => ({}))) as PublishBody;
  const locale = body.locale === "vi" || url.searchParams.get("locale") === "vi" ? "vi" : "en";
  const live = parseLive(body.live, url);
  const platforms = parsePlatforms(body.platforms ?? url.searchParams.get("platforms") ?? undefined);
  const source = body.source ?? "api";

  const slug = body.slug?.trim() || url.searchParams.get("slug")?.trim();
  const post = slug ? getPostBySlug(slug, locale) : getAllPosts(locale)[0];
  if (!post) {
    return NextResponse.json({ error: "no_posts", slug }, { status: 404 });
  }

  const drafts = draftsFromBlogPost(post, [locale]).filter((draft) => platforms.has(draft.platform));
  const results = [];
  for (const draft of drafts) {
    results.push(await publishDraft(draft, { dryRun: !live }));
  }

  await appendMarketingActivity({
    action: "publish",
    source,
    live,
    slug: post.slug,
    locale,
    platforms: [...platforms],
    results
  });

  return NextResponse.json({
    ok: results.every((result) => result.ok),
    live,
    slug: post.slug,
    locale,
    results
  });
}

export async function GET() {
  return NextResponse.json({
    message: "POST JSON { slug?, locale, platforms, live } with Authorization: Bearer <key>",
    example: {
      slug: "pregnancy-snack-ideas",
      locale: "en",
      platforms: ["x", "facebook"],
      live: false
    }
  });
}
