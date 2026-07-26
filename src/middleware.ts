import { NextRequest, NextResponse } from "next/server";
import { markdownForPath } from "@/lib/agentDiscovery";
import { buildCanonicalRedirectUrl, shouldRedirectHost } from "@/lib/canonicalHost";

function wantsMarkdown(accept: string) {
  return accept.toLowerCase().includes("text/markdown");
}

function isMarkdownPath(pathname: string) {
  if (pathname === "/" || pathname === "/vi") return true;
  if (pathname === "/blog" || pathname === "/vi/blog") return true;
  if (/^\/blog\/[^/]+$/.test(pathname) || /^\/vi\/blog\/[^/]+$/.test(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");

  // Prefer a single public origin so crawlers do not index duplicate hosts.
  if (shouldRedirectHost(host)) {
    const target = buildCanonicalRedirectUrl(request.nextUrl.pathname, request.nextUrl.search);
    return NextResponse.redirect(target, 301);
  }

  const pathname = request.nextUrl.pathname;
  const accept = request.headers.get("accept") ?? "";

  if (isMarkdownPath(pathname) && wantsMarkdown(accept)) {
    const markdown = markdownForPath(pathname);
    if (!markdown) {
      return new Response("# Not found\n", {
        status: 404,
        headers: { "Content-Type": "text/markdown; charset=utf-8" }
      });
    }
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

  return NextResponse.next();
}

export const config = {
  // Include `/` explicitly; skip Next internals and binary/static assets only.
  matcher: [
    "/",
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"
  ]
};

function estimateTokens(value: string) {
  return Math.ceil(value.trim().split(/\s+/).length * 1.25);
}
