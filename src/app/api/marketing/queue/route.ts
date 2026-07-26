import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog/posts";
import { assertMarketingAuth } from "@/lib/marketing/auth";
import { draftsFromBlogPost } from "@/lib/marketing/drafts";
import { clearAllQueuedDrafts, listClearedDraftIds } from "@/lib/marketing/queue";
import { appendMarketingActivity } from "@/lib/marketing/activity";
import { getMarketingStatus } from "@/lib/marketing/status";

export const runtime = "nodejs";

/** GET pending draft queue (auth required). */
export async function GET(request: Request) {
  const auth = assertMarketingAuth(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "vi" ? "vi" : "en";
  const status = await getMarketingStatus(locale);
  return NextResponse.json({
    ok: true,
    locale,
    queue: status.queue
  });
}

/** POST clear pending drafts for locale (auth required). Body: { locale?: "en"|"vi" } */
export async function POST(request: Request) {
  const auth = assertMarketingAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  const locale = body.locale === "vi" || url.searchParams.get("locale") === "vi" ? "vi" : "en";
  const already = new Set(await listClearedDraftIds());
  const pendingIds = getAllPosts(locale)
    .slice(0, 8)
    .flatMap((post) => draftsFromBlogPost(post, [locale]))
    .map((draft) => draft.id)
    .filter((id) => !already.has(id));

  const cleared = await clearAllQueuedDrafts(pendingIds);
  await appendMarketingActivity({
    action: "drafts",
    source: "api",
    live: false,
    locale,
    note: `Cleared ${cleared} draft(s) from queue`
  });

  return NextResponse.json({ ok: true, locale, cleared, pendingBefore: pendingIds.length });
}
