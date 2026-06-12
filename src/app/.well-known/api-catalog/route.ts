import { apiCatalog } from "@/lib/agentDiscovery";

export function GET() {
  return Response.json(apiCatalog, {
    headers: {
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
