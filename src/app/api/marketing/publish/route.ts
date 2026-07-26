import { NextResponse } from "next/server";
import { assertMarketingAuth } from "@/lib/marketing/auth";
import { isMarketingPlatform, type MarketingPlatform } from "@/lib/marketing/drafts";
import { publishMarketingDrafts } from "@/lib/marketing/publishFlow";

export const runtime = "nodejs";

type PublishBody = {
  slug?: string;
  locale?: string;
  platforms?: string[] | string;
  live?: boolean | string | number;
  source?: "portal" | "api" | "cron" | "zapier" | "n8n";
};

function parsePlatforms(value: PublishBody["platforms"]): Set<MarketingPlatform> {
  const raw = Array.isArray(value)
    ? value
    : String(value ?? "x,facebook")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
  return new Set(raw.filter(isMarketingPlatform));
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
  const slug = body.slug?.trim() || url.searchParams.get("slug")?.trim() || undefined;

  const result = await publishMarketingDrafts({
    locale,
    live,
    platforms,
    source,
    slug
  });

  if (!result.drafts.length) {
    return NextResponse.json({ error: "no_posts", slug }, { status: 404 });
  }

  return NextResponse.json({
    ok: result.ok,
    live: result.live,
    slug: result.slug,
    locale: result.locale,
    results: result.results
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
