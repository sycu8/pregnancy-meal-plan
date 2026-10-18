import type { Locale } from "@/lib/i18n";
import { getBindings, readFeatureFlag } from "@/lib/cloudflare/bindings";
import { getOptionalAiEnv } from "@/lib/cloudflare/env";
import { buildMealPlanPrompt } from "@/lib/nutrition/aiPromptBuilder";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import { filterNotesForLocale, localizeMealPlanForLocale, sanitizeSpecialNotes } from "@/lib/nutrition/localizeMealPlan";
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
 * (its docs page redirects to ?unavailable=). This client uses the FP8 build.
 * https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/
 */
export const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";

/**
 * The call only asks for `{ specialNotes: string[] }`. Size the budget to that
 * JSON. Workers AI otherwise defaults max_tokens to 256 and cuts the notes off.
 * Vietnamese text is estimated at 2 characters per token.
 */
const MEAL_PLAN_AI_OUTPUT = {
  specialNotes: [
    "Uống đủ nước trong ngày và chia nhỏ bữa nếu buồn nôn.",
    "Ưu tiên thực phẩm giàu sắt, ăn kèm trái cây giàu vitamin C.",
    "Hạn chế đồ ngọt, đồ chiên và nước ngọt; chọn tinh bột chậm.",
    "Ăn đủ đạm nạc, sữa tiệt trùng và rau xanh luộc chín.",
    "Đổi món dị ứng hoặc món không thích bằng nguyên liệu tương đương, nấu chín kỹ."
  ]
};

export const WORKERS_AI_MAX_TOKENS = Math.max(512, Math.ceil(JSON.stringify(MEAL_PLAN_AI_OUTPUT).length / 2));

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

/**
 * Bound a Workers AI or OpenAI call so a hung model returns the basic plan
 * well before Cloudflare's ~100s 524. Tests may shorten it via AI_CALL_TIMEOUT_MS.
 */
export const AI_CALL_TIMEOUT_MS = 28_000;

export class AiCallTimeoutError extends Error {
  constructor() {
    super("ai_timeout");
    this.name = "AiCallTimeoutError";
  }
}

function aiCallTimeoutMs(): number {
  if (process.env.NODE_ENV === "test") {
    const raw = Number(process.env.AI_CALL_TIMEOUT_MS);
    if (Number.isFinite(raw) && raw >= 1 && raw <= 30_000) return raw;
  }
  return AI_CALL_TIMEOUT_MS;
}

/** Race the model call against a shared deadline. The timeout is not a provider error. */
function withDeadline<T>(work: Promise<T>, deadlineAt: number): Promise<T> {
  const remaining = deadlineAt - Date.now();
  // A late rejection from the model must not surface as an unhandled rejection after we already timed out.
  void work.then(
    () => undefined,
    () => undefined
  );
  if (remaining <= 0) return Promise.reject(new AiCallTimeoutError());

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new AiCallTimeoutError()), remaining);
  });
  return Promise.race([work, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
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

const MAX_AI_TEXT_CHARS = 20_000;

type MealPlanProvider = "workers-ai" | "openai" | "none";

type FallbackReason =
  | "ai_disabled"
  | "no_provider"
  | "empty_output"
  | "bad_output"
  | "thrown"
  | "provider_error"
  | "timeout"
  | "locale_filtered";

const LOG_DETAIL_MAX = 80;

/**
 * Log an error class plus a short message. Strip markup, secrets, emails, IPs,
 * and long free-text tokens so profile fields and model text cannot land in logs.
 */
function sanitiseLogMessage(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/sk-[A-Za-z0-9_-]{6,}/g, "[redacted]")
    .replace(/bearer\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(api[_-]?key|token|secret|password|authorization)\b\s*[:=]\s*\S+/gi, "$1 [redacted]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[ip]")
    .replace(/\S{25,}/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LOG_DETAIL_MAX);
}

function fallbackDetail(error: unknown): string {
  const name = error instanceof Error && error.name.trim() ? error.name.trim() : "Error";
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const safe = sanitiseLogMessage(message);
  if (!safe) return name.slice(0, LOG_DETAIL_MAX);
  return `${name}: ${safe}`.slice(0, LOG_DETAIL_MAX);
}

function logMealPlanFallback(details: {
  reason: FallbackReason;
  provider: MealPlanProvider;
  errorName?: string;
  detail?: string;
}): void {
  const detail = details.detail ? sanitiseLogMessage(details.detail) : "";
  console.error(
    JSON.stringify({
      event: "meal-plan-ai-fallback",
      reason: details.reason,
      provider: details.provider,
      ...(details.errorName ? { errorName: details.errorName } : {}),
      ...(detail ? { detail } : {})
    })
  );
}

function isReadableStream(value: unknown): value is ReadableStream<Uint8Array | string> {
  return typeof ReadableStream !== "undefined" && value instanceof ReadableStream;
}

function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  return Boolean(value) && typeof value === "object" && typeof (value as AsyncIterable<unknown>)[Symbol.asyncIterator] === "function";
}

/**
 * Workers AI SSE lines look like `data: {"response":"..."}` and `data: [DONE]`.
 * Token deltas are concatenated. A normal JSON string is returned unchanged.
 */
function unwrapSse(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const dataLines = trimmed.split(/\r?\n/).filter((line) => line.trim().startsWith("data:"));
  if (dataLines.length === 0) return trimmed;

  const pieces: string[] = [];
  for (const line of dataLines) {
    const data = line.trim().slice(5).trim();
    if (!data || data === "[DONE]") continue;
    try {
      const parsed = JSON.parse(data) as unknown;
      const extracted = textFromUnknown(parsed);
      pieces.push(extracted || (typeof parsed === "string" ? parsed : ""));
    } catch {
      pieces.push(data);
    }
  }
  return pieces.join("").trim();
}

/** Read a string, a `{ response }` / `{ result }` wrapper, or a notes object. Never calls `.trim()` on a non-string. */
function textFromUnknown(value: unknown, depth = 0): string {
  if (depth > 4 || value == null) return "";
  if (typeof value === "string") return unwrapSse(value);
  if (typeof value !== "object") return "";
  if (value instanceof Uint8Array) return unwrapSse(new TextDecoder().decode(value));
  if (isReadableStream(value) || isAsyncIterable(value)) return "";

  const row = value as Record<string, unknown>;
  for (const key of ["response", "result", "output_text", "text", "content"]) {
    if (!(key in row)) continue;
    const inner = row[key];
    if (typeof inner === "string" && inner.trim()) return unwrapSse(inner);
    if (inner && typeof inner === "object") {
      const nested = textFromUnknown(inner, depth + 1);
      if (nested.trim()) return nested;
    }
  }
  if ("specialNotes" in row) return JSON.stringify(row);
  return "";
}

async function readLimitedStream(stream: ReadableStream<Uint8Array | string>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  try {
    while (text.length < MAX_AI_TEXT_CHARS) {
      const { done, value } = await reader.read();
      if (done) break;
      text += typeof value === "string" ? value : decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // The lock is already released when the stream closed.
    }
  }
  return text.slice(0, MAX_AI_TEXT_CHARS);
}

async function readLimitedIterable(source: AsyncIterable<unknown>): Promise<string> {
  let text = "";
  for await (const chunk of source) {
    if (text.length >= MAX_AI_TEXT_CHARS) break;
    if (typeof chunk === "string") text += chunk;
    else if (chunk instanceof Uint8Array) text += new TextDecoder().decode(chunk);
    else text += textFromUnknown(chunk);
  }
  return text.slice(0, MAX_AI_TEXT_CHARS);
}

async function coerceWorkersAiText(result: unknown): Promise<string> {
  const nested = result && typeof result === "object" ? (result as Record<string, unknown>).response ?? (result as Record<string, unknown>).result : undefined;
  const body = isReadableStream(result) || isAsyncIterable(result) ? result : nested;
  if (isReadableStream(body)) return unwrapSse(await readLimitedStream(body));
  if (isAsyncIterable(body)) return unwrapSse(await readLimitedIterable(body));
  return textFromUnknown(result);
}

function stripJsonFence(text: string): string {
  const fenced = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fenced ? fenced[1] : text).trim();
}

function parseModelPayload(raw: string): { specialNotes?: unknown } {
  const stripped = stripJsonFence(raw);
  const read = (text: string) => {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object") throw new SyntaxError("unparseable_json");
    return parsed as { specialNotes?: unknown };
  };
  try {
    return read(stripped);
  } catch {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start >= 0 && end > start) return read(stripped.slice(start, end + 1));
    throw new SyntaxError("unparseable_json");
  }
}

/**
 * Production has the Workers AI binding and no provider secret.
 * An explicit AI_PROVIDER still wins. Otherwise use that binding, then an OpenAI key.
 */
async function resolveMealPlanProvider(env: ReturnType<typeof getOptionalAiEnv>): Promise<MealPlanProvider> {
  if (env.AI_PROVIDER === "mock") return "none";
  if (env.AI_PROVIDER === "openai") return env.OPENAI_API_KEY ? "openai" : "none";
  if (env.AI_PROVIDER === "workers-ai") return "workers-ai";

  const { AI } = await getBindings();
  if (AI) return "workers-ai";
  if (env.OPENAI_API_KEY) return "openai";
  return "none";
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

  const data = (await response.json()) as { choices?: { message?: { content?: unknown } }[] };
  return textFromUnknown(data.choices?.[0]?.message?.content).trim();
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
      ],
      max_tokens: WORKERS_AI_MAX_TOKENS
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

  return (await coerceWorkersAiText(result)).trim();
}

const aiServedPlans = new WeakMap<MealPlan, true>();

/** True only when this plan object includes model notes that survived the locale filter. */
export function mealPlanServedAi(plan: MealPlan): boolean {
  return aiServedPlans.has(plan);
}

function planWithAiNotes(baseline: MealPlan, notes: string[], locale: Locale): MealPlan {
  const withNotes = {
    ...baseline,
    specialNotes: sanitizeSpecialNotes([...baseline.specialNotes, ...notes])
  };
  const plan = localizeMealPlanForLocale(withNotes, locale);
  aiServedPlans.set(plan, true);
  return plan;
}

function mealPlanPrompt(input: PregnancyProfile, locale: Locale): string {
  const language = locale === "vi" ? "Vietnamese" : "English";
  return `${buildMealPlanPrompt(input)}\nLocale: ${locale}\nReturn JSON with field "specialNotes" as string array customizing the baseline plan. Write specialNotes in ${language} only.`;
}

function translateNotesPrompt(notes: readonly string[], locale: Locale): string {
  const language = locale === "vi" ? "Vietnamese" : "English";
  const listed = notes.map((note) => `- ${note}`).join("\n");
  return [
    `The previous specialNotes were not in ${language}.`,
    `Translate only these notes into ${language}.`,
    `Locale: ${locale}.`,
    `Return JSON with field "specialNotes" as a string array in ${language} only.`,
    listed
  ].join("\n");
}

type ParsedNotes =
  | { ok: true; notes: string[] }
  | { ok: false; reason: "empty_output" | "bad_output"; detail?: string };

function parseNotes(raw: string): ParsedNotes {
  if (!raw.trim()) return { ok: false, reason: "empty_output" };
  try {
    const notes = sanitizeSpecialNotes(parseModelPayload(raw).specialNotes);
    if (notes.length === 0) return { ok: false, reason: "empty_output", detail: "no_special_notes" };
    return { ok: true, notes };
  } catch {
    return { ok: false, reason: "bad_output", detail: "unparseable_json" };
  }
}

export function createAIClient(): AIClient {
  const env = getOptionalAiEnv();

  return {
    async generateMealPlan(input, locale = "vi") {
      const baseline = localizeMealPlanForLocale(ruleBasedMealPlanner(input, locale), locale);
      const provider = await resolveMealPlanProvider(env);
      // The flag defaults on whenever a provider is configured. KV `ai_planner_enabled=false`
      // or FEATURE_AI_PLANNER_ENABLED=false still turns it off. An env true overrides KV.
      // Prod has the AI binding and no flag.
      const aiEnabled = await readFeatureFlag("ai_planner_enabled", provider !== "none");

      if (provider === "none") {
        logMealPlanFallback({ reason: "no_provider", provider: "none" });
        return baseline;
      }
      if (!aiEnabled) {
        logMealPlanFallback({ reason: "ai_disabled", provider });
        return baseline;
      }

      const deadlineAt = Date.now() + aiCallTimeoutMs();

      const callModel = (prompt: string) => {
        const work =
          provider === "workers-ai"
            ? callWorkersAi(prompt)
            : callOpenAi(prompt, env.OPENAI_API_KEY ?? "", env.AI_GATEWAY_URL);
        return withDeadline(work, deadlineAt);
      };

      try {
        const first = parseNotes(await callModel(mealPlanPrompt(input, locale)));
        if (!first.ok) {
          logMealPlanFallback({
            reason: first.reason,
            provider,
            ...(first.reason === "bad_output" ? { errorName: "SyntaxError" } : {}),
            ...(first.detail ? { detail: first.detail } : {})
          });
          return baseline;
        }

        let notes = first.notes;
        if (filterNotesForLocale(notes, locale).length === 0) {
          const retry = parseNotes(await callModel(translateNotesPrompt(notes, locale)));
          const retryNotes = retry.ok ? filterNotesForLocale(retry.notes, locale) : [];
          if (retryNotes.length === 0) {
            logMealPlanFallback({ reason: "locale_filtered", provider, detail: "wrong_language" });
            return baseline;
          }
          notes = retryNotes;
        }

        return planWithAiNotes(baseline, notes, locale);
      } catch (error) {
        if (error instanceof AiCallTimeoutError) {
          logMealPlanFallback({
            reason: "timeout",
            provider,
            errorName: error.name,
            detail: "ai_timeout"
          });
          return baseline;
        }
        if (error instanceof AiProviderError) {
          logMealPlanFallback({
            reason: "provider_error",
            provider: error.provider,
            errorName: error.name,
            detail: fallbackDetail(error)
          });
          throw error;
        }
        logMealPlanFallback({
          reason: "thrown",
          provider,
          errorName: error instanceof Error ? error.name : "Error",
          detail: fallbackDetail(error)
        });
        return baseline;
      }
    }
  };
}
