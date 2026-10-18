import type { Locale } from "@/lib/i18n";
import { getBindings, readFeatureFlag } from "@/lib/cloudflare/bindings";
import { getOptionalAiEnv } from "@/lib/cloudflare/env";
import { buildMealPlanPrompt } from "@/lib/nutrition/aiPromptBuilder";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import { localizeMealPlanForLocale } from "@/lib/nutrition/localizeMealPlan";
import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";

export type GenerateMealPlanInput = PregnancyProfile;

export type AIClient = {
  generateMealPlan(input: GenerateMealPlanInput, locale?: Locale): Promise<MealPlan>;
};

/**
 * Text model confirmed against the Workers AI catalog on 2026-10-18.
 * `@cf/meta/llama-3.1-8b-instruct` was retired on 2026-05-30.
 * `@cf/meta/llama-3.1-8b-instruct-fast` is no longer in the catalog
 * ("deprecated, removed, or not found"). The remaining Llama 3.1 8B
 * instruct text model is the FP8 build.
 * https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/
 */
export const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

/**
 * Model ids Cloudflare retired on 2026-05-30, plus later catalog removals
 * that must not be selected again.
 * https://developers.cloudflare.com/changelog/post/2026-05-08-planned-model-deprecations/
 */
export const RETIRED_WORKERS_AI_MODEL_IDS = [
  "@cf/moonshotai/kimi-k2.5",
  "@hf/meta-llama/meta-llama-3-8b-instruct",
  "@cf/meta/llama-3-8b-instruct",
  "@cf/meta/llama-3-8b-instruct-awq",
  "@cf/meta/llama-3.1-8b-instruct",
  "@cf/meta/llama-3.1-8b-instruct-awq",
  "@cf/meta/llama-3.1-8b-instruct-fast",
  "@cf/meta/llama-3.1-70b-instruct",
  "@cf/meta/llama-2-7b-chat-int8",
  "@cf/meta/llama-2-7b-chat-fp16",
  "@cf/mistral/mistral-7b-instruct-v0.1",
  "@hf/mistral/mistral-7b-instruct-v0.2",
  "@hf/google/gemma-7b-it",
  "@cf/google/gemma-3-12b-it",
  "@hf/nousresearch/hermes-2-pro-mistral-7b",
  "@cf/microsoft/phi-2",
  "@cf/defog/sqlcoder-7b-2",
  "@cf/unum/uform-gen2-qwen-500m",
  "@cf/facebook/bart-large-cnn"
] as const;

export class AiProviderError extends Error {
  readonly provider: "workers-ai" | "openai";

  constructor(provider: "workers-ai" | "openai", message: string) {
    super(message);
    this.name = "AiProviderError";
    this.provider = provider;
  }
}

export function assertSupportedWorkersAiModel(model: string): void {
  if ((RETIRED_WORKERS_AI_MODEL_IDS as readonly string[]).includes(model)) {
    throw new AiProviderError(
      "workers-ai",
      `Workers AI model ${model} was retired and is no longer supported. Use ${WORKERS_AI_MODEL}.`
    );
  }
}

function describeFailure(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (typeof error === "string" && error.trim()) return error.trim();
  return "Unknown error";
}

function clipDetail(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 240);
}

function workersAiFailureDetail(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  const row = result as {
    error?: unknown;
    errors?: { message?: unknown }[];
    success?: boolean;
  };
  if (typeof row.error === "string" && row.error.trim()) return clipDetail(row.error);
  const messages = (row.errors ?? [])
    .map((item) => (typeof item?.message === "string" ? item.message.trim() : ""))
    .filter(Boolean);
  if (messages.length > 0) return clipDetail(messages.join("; "));
  if (row.success === false) return "Workers AI reported an unsuccessful response.";
  return null;
}

async function callOpenAi(prompt: string, apiKey: string, gatewayUrl?: string): Promise<string> {
  const url = gatewayUrl ? `${gatewayUrl.replace(/\/$/, "")}/chat/completions` : "https://api.openai.com/v1/chat/completions";
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Author meal-plan guidance in English first, then translate to the requested locale. Return only valid JSON with a specialNotes string array."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.4
      })
    });
  } catch (error) {
    throw new AiProviderError("openai", `OpenAI request failed: ${describeFailure(error)}`);
  }

  if (!response.ok) {
    const detail = clipDetail(await response.text().catch(() => ""));
    const status = `${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
    throw new AiProviderError("openai", `OpenAI request failed (${status})${detail ? `: ${detail}` : ""}.`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) {
    throw new AiProviderError("openai", "OpenAI returned an empty response.");
  }
  return content;
}

async function callWorkersAi(prompt: string): Promise<string> {
  assertSupportedWorkersAiModel(WORKERS_AI_MODEL);

  const { AI } = await getBindings();
  if (!AI) {
    throw new AiProviderError("workers-ai", "Workers AI binding is unavailable, so the meal plan request could not be sent.");
  }

  let result: unknown;
  try {
    result = await AI.run(WORKERS_AI_MODEL, {
      messages: [
        {
          role: "system",
          content:
            "You assist with pregnancy meal planning. Draft English first, then adapt to the requested locale. Respond concisely as JSON."
        },
        { role: "user", content: prompt }
      ]
    });
  } catch (error) {
    throw new AiProviderError(
      "workers-ai",
      `Workers AI request failed for ${WORKERS_AI_MODEL}: ${describeFailure(error)}`
    );
  }

  const failure = workersAiFailureDetail(result);
  if (failure) {
    throw new AiProviderError("workers-ai", `Workers AI request failed for ${WORKERS_AI_MODEL}: ${failure}`);
  }

  const response = (result as { response?: string }).response?.trim() ?? "";
  if (!response) {
    throw new AiProviderError("workers-ai", `Workers AI returned an empty response for ${WORKERS_AI_MODEL}.`);
  }
  return response;
}

export function createAIClient(): AIClient {
  const env = getOptionalAiEnv();

  return {
    async generateMealPlan(input, locale = "vi") {
      const baseline = localizeMealPlanForLocale(ruleBasedMealPlanner(input, locale), locale);
      const aiEnabled = await readFeatureFlag("ai_planner_enabled", Boolean(env.OPENAI_API_KEY || env.AI_PROVIDER === "workers-ai"));

      if (!aiEnabled) return baseline;

      const hasProvider = Boolean(env.OPENAI_API_KEY || env.AI_PROVIDER === "workers-ai" || env.AI_GATEWAY_URL);
      if (!hasProvider) return baseline;

      try {
        const prompt = `${buildMealPlanPrompt(input)}\nLocale: ${locale}\nReturn JSON with field "specialNotes" as string array customizing the baseline plan. For locale=vi write specialNotes in Vietnamese only.`;
        const raw =
          env.AI_PROVIDER === "workers-ai"
            ? await callWorkersAi(prompt)
            : env.OPENAI_API_KEY
              ? await callOpenAi(prompt, env.OPENAI_API_KEY, env.AI_GATEWAY_URL)
              : null;

        if (!raw) return baseline;

        const parsed = JSON.parse(raw) as { specialNotes?: string[] };
        if (Array.isArray(parsed.specialNotes) && parsed.specialNotes.length > 0) {
          const withNotes = {
            ...baseline,
            specialNotes: [...new Set([...baseline.specialNotes, ...parsed.specialNotes])]
          };
          return localizeMealPlanForLocale(withNotes, locale);
        }
      } catch (error) {
        if (error instanceof AiProviderError) throw error;
        // Malformed model JSON still falls back to the rule-based plan.
      }

      return baseline;
    }
  };
}
