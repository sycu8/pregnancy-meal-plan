import { NextRequest, NextResponse } from "next/server";
import { ingestBlogSources } from "@/lib/blog/ingestion/ingest";

export const runtime = "nodejs";

/**
 * Protected cron endpoint for daily RSS metadata ingestion.
 * Set BLOG_INGEST_SECRET in environment and pass ?secret= or Authorization: Bearer.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.BLOG_INGEST_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "BLOG_INGEST_SECRET not configured" }, { status: 503 });
  }

  const urlSecret = request.nextUrl.searchParams.get("secret");
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (urlSecret !== expected && bearer !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await ingestBlogSources();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Ingestion failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
