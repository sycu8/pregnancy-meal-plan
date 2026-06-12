import { absoluteUrl, mealPlannerSkill } from "@/lib/agentDiscovery";

export async function GET() {
  const digest = await sha256Digest(mealPlannerSkill);
  return Response.json(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name: "pregnancy-meal-planner",
          type: "skill-md",
          description: "Create a reference pregnancy meal plan with bilingual navigation, food-safety guidance and grocery planning.",
          url: absoluteUrl("/.well-known/agent-skills/pregnancy-meal-planner/SKILL.md"),
          digest
        }
      ]
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600"
      }
    }
  );
}

async function sha256Digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `sha256:${hex}`;
}
