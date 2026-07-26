import { NextRequest } from "next/server";
import { markdownForPath } from "@/lib/agentDiscovery";

function wantsMarkdown(accept: string) {
  return accept.toLowerCase().includes("text/markdown");
}

function isMarkdownPath(pathname: string) {
  if (pathname === "/" || pathname === "/en") return true;
  if (pathname === "/blog" || pathname === "/en/blog") return true;
  if (/^\/blog\/[^/]+$/.test(pathname) || /^\/en\/blog\/[^/]+$/.test(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accept = request.headers.get("accept") ?? "";

  if (isMarkdownPath(pathname) && wantsMarkdown(accept)) {
    const markdown = markdownForPath(pathname);
    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": estimateTokens(markdown).toString(),
        Link: [
          `</.well-known/api-catalog>; rel="api-catalog"`,
          `</openapi.json>; rel="service-desc"; type="application/openapi+json"`,
          `</api-docs>; rel="service-doc"; type="text/markdown"`,
          `</llms.txt>; rel="alternate"; type="text/plain"`,
          `</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"`
        ].join(", ")
      }
    });
  }
}

export const config = {
  matcher: ["/", "/en", "/blog", "/blog/:slug", "/en/blog", "/en/blog/:slug"]
};

function estimateTokens(value: string) {
  return Math.ceil(value.trim().split(/\s+/).length * 1.25);
}
