import { NextResponse } from "next/server";
import { isMarketingPlatform } from "@/lib/marketing/drafts";
import { assertMarketingAuth } from "@/lib/marketing/auth";
import { publishMarketingDrafts } from "@/lib/marketing/publishFlow";

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

  const result = await publishMarketingDrafts({
    locale,
    live,
    platforms,
    source: "cron",
    slug: url.searchParams.get("slug")?.trim() || undefined
  });

  if (!result.drafts.length) {
    return NextResponse.json({ error: "no_posts" }, { status: 404 });
  }

  return NextResponse.json({
    ok: result.ok,
    slug: result.slug,
    live: result.live,
    results: result.results
  });
}

export async function GET() {
  return NextResponse.json({
    message: "POST with Authorization: Bearer $CRON_SECRET (or MARKETING_API_KEY). Default dry-run unless live=1."
  });
}
