import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog/posts";
import { draftsFromBlogPost } from "@/lib/marketing/drafts";
import { publishDraft } from "@/lib/marketing/publishers";

export const runtime = "nodejs";

/**
 * Optional cron entrypoint for auto-posting.
 * Secure with CRON_SECRET header: Authorization: Bearer <CRON_SECRET>
 *
 * Cloudflare / GitHub Actions can hit:
 *   POST /api/cron/social-publish?locale=en&platforms=x,facebook
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "vi" ? "vi" : "en";
  const live = url.searchParams.get("live") === "1";
  const platforms = new Set(
    (url.searchParams.get("platforms") ?? "x,facebook")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );

  const post = getAllPosts(locale)[0];
  if (!post) {
    return NextResponse.json({ error: "no_posts" }, { status: 404 });
  }

  const drafts = draftsFromBlogPost(post, [locale]).filter((draft) => platforms.has(draft.platform));
  const results = [];
  for (const draft of drafts) {
    results.push(await publishDraft(draft, { dryRun: !live }));
  }

  return NextResponse.json({
    slug: post.slug,
    live,
    results
  });
}

export async function GET() {
  return NextResponse.json({
    message: "POST with Authorization: Bearer $CRON_SECRET to publish. Default is dry-run unless live=1."
  });
}
