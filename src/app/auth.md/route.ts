import { authMd, requestOrigin } from "@/lib/agentDiscovery";

export function GET(request: Request) {
  return new Response(authMd(requestOrigin(request)), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
