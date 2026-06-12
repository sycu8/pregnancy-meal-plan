import { NextRequest } from "next/server";
import { markdownForPath } from "@/lib/agentDiscovery";

const markdownPaths = new Set(["/", "/en"]);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accept = request.headers.get("accept") ?? "";

  if (markdownPaths.has(pathname) && accept.toLowerCase().includes("text/markdown")) {
    const markdown = markdownForPath(pathname);
    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": estimateTokens(markdown).toString(),
        Link: [
          `</.well-known/api-catalog>; rel="api-catalog"`,
          `</openapi.json>; rel="service-desc"; type="application/openapi+json"`,
          `</api-docs>; rel="service-doc"; type="text/markdown"`,
          `</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"`
        ].join(", ")
      }
    });
  }
}

export const config = {
  matcher: ["/", "/en"]
};

function estimateTokens(value: string) {
  return Math.ceil(value.trim().split(/\s+/).length * 1.25);
}
