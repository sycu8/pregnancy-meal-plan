import { mealPlannerSkill } from "@/lib/agentDiscovery";

export function GET() {
  return new Response(mealPlannerSkill, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
