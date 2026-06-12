import { openApiSpec } from "@/lib/agentDiscovery";

export function GET() {
  return Response.json(openApiSpec, {
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
