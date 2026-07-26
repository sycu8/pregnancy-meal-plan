import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";
import { assertMarketingAuth } from "@/lib/marketing/auth";
import { draftsFromBlogPost, isMarketingPlatform, type MarketingPlatform } from "@/lib/marketing/drafts";
import { publishDraft } from "@/lib/marketing/publishers";
import { appendMarketingActivity } from "@/lib/marketing/activity";

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
      id: `zapier-${platform}-${Date.now()}`,
      platform,
      locale: locale as "en" | "vi",
      text: body.text,
      link: body.link || "",
      sourceSlug: body.slug || "zapier",
      createdAt: new Date().toISOString()
    };
    const result = await publishDraft(draft, { dryRun: !live });
    await appendMarketingActivity({
      action: "publish",
      source: "zapier",
      live,
      slug: draft.sourceSlug,
      locale,
      platforms: [platform],
      results: [result]
    });
    return NextResponse.json({ ok: result.ok, live, results: [result] });
  }

  const post = body.slug ? getPostBySlug(body.slug, locale) : getAllPosts(locale)[0];
  if (!post) return NextResponse.json({ error: "no_posts" }, { status: 404 });

  const drafts = draftsFromBlogPost(post, [locale]).filter((d) => platforms.has(d.platform));
  const results = [];
  for (const draft of drafts) {
    results.push(await publishDraft(draft, { dryRun: !live }));
  }

  await appendMarketingActivity({
    action: "publish",
    source: "zapier",
    live,
    slug: post.slug,
    locale,
    platforms: [...platforms],
    results
  });

  return NextResponse.json({ ok: results.every((r) => r.ok), live, slug: post.slug, results });
}
