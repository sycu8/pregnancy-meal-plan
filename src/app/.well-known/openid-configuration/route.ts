import { openIdConfiguration, requestOrigin } from "@/lib/agentDiscovery";

export function GET(request: Request) {
  return Response.json(
    openIdConfiguration(requestOrigin(request)),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    }
  );
}
