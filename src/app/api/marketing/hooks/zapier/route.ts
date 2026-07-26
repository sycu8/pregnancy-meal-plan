import { NextResponse } from "next/server";
import { assertMarketingAuth } from "@/lib/marketing/auth";
import { draftsFromBlogPost, isMarketingPlatform, type MarketingPlatform } from "@/lib/marketing/drafts";
import { publishMarketingDrafts } from "@/lib/marketing/publishFlow";
import { getAllPosts } from "@/lib/blog/posts";

export const runtime = "nodejs";

/**
 * Zapier-friendly webhook.
 *
 * Trigger poll: GET → latest draft rows (array at top-level via `data` for Zapier).
 * Action: POST body from Zapier mapper.
 */
export async function GET(request: Request) {
  const auth = assertMarketingAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "vi" ? "vi" : "en";
  const limit = Math.min(10, Math.max(1, Number(url.searchParams.get("limit") ?? "3")));
  const posts = getAllPosts(locale).slice(0, limit);
  const data = posts.flatMap((post) =>
    draftsFromBlogPost(post, [locale]).map((draft) => ({
      id: draft.id,
      platform: draft.platform,
      locale: draft.locale,
      slug: draft.sourceSlug,
      text: draft.text,
      link: draft.link,
      title: post.title,
      createdAt: draft.createdAt
    }))
  );

  // Zapier polling prefers a bare array or { data: [] }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = assertMarketingAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    locale?: string;
    platform?: string;
    platforms?: string[] | string;
    text?: string;
    link?: string;
    live?: boolean | string;
  };

  const locale = body.locale === "vi" ? "vi" : "en";
  const live = body.live === true || body.live === "true" || body.live === "1";
  const platforms = new Set<MarketingPlatform>();
  if (body.platform && isMarketingPlatform(body.platform)) {
    platforms.add(body.platform);
  }
  const listed = Array.isArray(body.platforms)
    ? body.platforms
    : String(body.platforms ?? "x,facebook")
        .split(",")
        .map((p) => p.trim());
  for (const p of listed) {
    if (isMarketingPlatform(p)) platforms.add(p);
  }

  // If Zapier sends a fully composed text, publish that one platform draft.
  if (body.text && body.platform && platforms.size === 1) {
    const platform = [...platforms][0]!;
    const draft = {
      id: `${body.slug || "zapier"}-${locale}-${platform}`,
      platform,
      locale: locale as "en" | "vi",
      text: body.text,
      link: body.link || "",
      sourceSlug: body.slug || "zapier",
      createdAt: new Date().toISOString()
    };
    const result = await publishMarketingDrafts({
      locale,
      live,
      platforms,
      source: "zapier",
      customDrafts: [draft]
    });
    return NextResponse.json({ ok: result.ok, live, results: result.results });
  }

  const result = await publishMarketingDrafts({
    locale,
    live,
    platforms,
    source: "zapier",
    slug: body.slug?.trim() || undefined
  });

  if (!result.drafts.length) {
    return NextResponse.json({ error: "no_posts" }, { status: 404 });
  }

  return NextResponse.json({
    ok: result.ok,
    live: result.live,
    slug: result.slug,
    results: result.results
  });
}
