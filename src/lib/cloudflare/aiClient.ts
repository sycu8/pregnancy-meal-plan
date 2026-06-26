import type { Locale } from "@/lib/i18n";
import { getBindings, readFeatureFlag } from "@/lib/cloudflare/bindings";
import { getOptionalAiEnv } from "@/lib/cloudflare/env";
import { buildMealPlanPrompt } from "@/lib/nutrition/aiPromptBuilder";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";

export type GenerateMealPlanInput = PregnancyProfile;

export type AIClient = {
  generateMealPlan(input: GenerateMealPlanInput, locale?: Locale): Promise<MealPlan>;
};

const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct";

async function callOpenAi(prompt: string, apiKey: string, gatewayUrl?: string): Promise<string | null> {
  const url = gatewayUrl ? `${gatewayUrl.replace(/\/$/, "")}/chat/completions` : "https://api.openai.com/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return only valid JSON for a 7-day Vietnamese pregnancy meal plan structure." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? null;
}

async function callWorkersAi(prompt: string): Promise<string | null> {
  const { AI } = await getBindings();
  if (!AI) return null;

  const result = (await AI.run(WORKERS_AI_MODEL, {
    messages: [
      { role: "system", content: "You assist with pregnancy meal planning references. Respond concisely." },
      { role: "user", content: prompt }
    ]
  })) as { response?: string };

  return result.response ?? null;
}

export function createAIClient(): AIClient {
  const env = getOptionalAiEnv();

  return {
    async generateMealPlan(input, locale = "vi") {
      const baseline = ruleBasedMealPlanner(input, locale);
      const aiEnabled = await readFeatureFlag("ai_planner_enabled", Boolean(env.OPENAI_API_KEY || env.AI_PROVIDER === "workers-ai"));

      if (!aiEnabled) return baseline;

      const hasProvider = Boolean(env.OPENAI_API_KEY || env.AI_PROVIDER === "workers-ai" || env.AI_GATEWAY_URL);
      if (!hasProvider) return baseline;

      try {
        const prompt = `${buildMealPlanPrompt(input)}\nLocale: ${locale}\nReturn JSON with field "specialNotes" as string array customizing the baseline plan.`;
        const raw =
          env.AI_PROVIDER === "workers-ai"
            ? await callWorkersAi(prompt)
            : env.OPENAI_API_KEY
              ? await callOpenAi(prompt, env.OPENAI_API_KEY, env.AI_GATEWAY_URL)
              : null;

        if (!raw) return baseline;

        const parsed = JSON.parse(raw) as { specialNotes?: string[] };
        if (Array.isArray(parsed.specialNotes) && parsed.specialNotes.length > 0) {
          return {
            ...baseline,
            specialNotes: [...new Set([...baseline.specialNotes, ...parsed.specialNotes])]
          };
        }
      } catch {
        // Fall through to rule-based baseline.
      }

      return baseline;
    }
  };
}
