import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";
import { assertMarketingAuth } from "@/lib/marketing/auth";
import { draftsFromBlogPost } from "@/lib/marketing/drafts";
import { appendMarketingActivity } from "@/lib/marketing/activity";

export const runtime = "nodejs";

/** List platform-ready drafts — Zapier polling trigger / n8n HTTP Request. */
export async function GET(request: Request) {
  const auth = assertMarketingAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "vi" ? "vi" : "en";
  const limit = Math.min(10, Math.max(1, Number(url.searchParams.get("limit") ?? "3")));
  const slug = url.searchParams.get("slug")?.trim();
  const platform = url.searchParams.get("platform")?.trim();

  const posts = slug
    ? [getPostBySlug(slug, locale)].filter(Boolean)
    : getAllPosts(locale).slice(0, limit);

  const drafts = posts
    .flatMap((post) => draftsFromBlogPost(post!, [locale]))
    .filter((draft) => (platform ? draft.platform === platform : true));

  await appendMarketingActivity({
    action: "drafts",
    source: "api",
    live: false,
    locale,
    slug: slug || posts[0]?.slug,
    note: `Returned ${drafts.length} drafts`
  });

  return NextResponse.json({
    ok: true,
    locale,
    count: drafts.length,
    drafts
  });
}
