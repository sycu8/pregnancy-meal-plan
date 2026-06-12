import { absoluteUrl } from "@/lib/agentDiscovery";

export function GET() {
  const body = `# Bầu Ăn Gì? API

## Generate Meal Plan

POST ${absoluteUrl("/api/generate-meal-plan")}

Creates a reference 7-day pregnancy meal plan from a pregnancy profile. The response contains a \`plan\` object with meals, shopping lists, safety warnings and cost estimates.

## Health

GET ${absoluteUrl("/api/health")}

Returns service status for automated monitors and API catalog discovery.

## Authentication

The current public API does not require OAuth credentials. Discovery metadata is published so agents can understand the resource policy if protected endpoints are added later.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
