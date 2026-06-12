import { mcpServerCard } from "@/lib/agentDiscovery";

export function GET() {
  return Response.json(mcpServerCard, {
    headers: {
      "Cache-Control": "public, max-age=3600"
    }
  });
}
