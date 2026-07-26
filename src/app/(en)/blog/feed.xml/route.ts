import { buildBlogRssFeed } from "@/lib/blog/rssFeed";

export function GET() {
  const xml = buildBlogRssFeed("en");
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
