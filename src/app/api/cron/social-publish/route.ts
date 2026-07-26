import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog/posts";
import { draftsFromBlogPost, isMarketingPlatform } from "@/lib/marketing/drafts";
import { publishDraft } from "@/lib/marketing/publishers";
import { assertMarketingAuth } from "@/lib/marketing/auth";
import { appendMarketingActivity } from "@/lib/marketing/activity";

export const runtime = "nodejs";

/**
 * Cron entrypoint for auto-posting.
 * Secure with Authorization: Bearer <MARKETING_API_KEY|CRON_SECRET>
 *
 * POST /api/cron/social-publish?locale=en&platforms=x,facebook&live=1
 */
export async function POST(request: Request) {
  const auth = assertMarketingAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "vi" ? "vi" : "en";
  const live = url.searchParams.get("live") === "1";
  const platforms = new Set(
    (url.searchParams.get("platforms") ?? "x,facebook")
      .split(",")
      .map((value) => value.trim())
      .filter(isMarketingPlatform)
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

  await appendMarketingActivity({
    action: "publish",
    source: "cron",
    live,
    slug: post.slug,
    locale,
    platforms: [...platforms],
    results
  });

  return NextResponse.json({
    slug: post.slug,
    live,
    results
  });
}

export async function GET() {
  return NextResponse.json({
    message: "POST with Authorization: Bearer $CRON_SECRET (or MARKETING_API_KEY). Default dry-run unless live=1."
  });
}
