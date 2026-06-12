import { sitemapXml } from "@/lib/agentDiscovery";

export function GET() {
  return new Response(sitemapXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
