import { agentIndex, requestOrigin } from "@/lib/agentDiscovery";

export function GET(request: Request) {
  return Response.json(agentIndex(requestOrigin(request)), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
