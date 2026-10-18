import type { Locale } from "@/lib/i18n";
import { getBindings, readFeatureFlag } from "@/lib/cloudflare/bindings";
import { getOptionalAiEnv } from "@/lib/cloudflare/env";
import { filterEchoedAiNotes, filterSafeAiNotes, noteIsComplete } from "@/lib/nutrition/aiNoteSafety";
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
 * Ceiling for 2 or 3 short notes, not a 7-day plan. 192 cut the last note off;
 * the prompt tells the model to stop well before this budget.
 */
export const WORKERS_AI_MAX_TOKENS = 256;

/**
 * FP8 accepts response_format type json_object and rejects json_schema.
 * JSON mode keeps the model on one object instead of a long plan.
 */
export const MEAL_PLAN_RESPONSE_FORMAT = {
  type: "json_object"
} as const;

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

function isAbortLike(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/** Race the model call against a shared deadline and abort the underlying request. */
function withDeadline<T>(start: (signal: AbortSignal) => Promise<T>, deadlineAt: number): Promise<T> {
  const remaining = deadlineAt - Date.now();
  const controller = new AbortController();
  if (remaining <= 0) {
    controller.abort();
    return Promise.reject(new AiCallTimeoutError());
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new AiCallTimeoutError());
    }, remaining);
  });
  const work = start(controller.signal).catch((error: unknown) => {
    if (controller.signal.aborted || isAbortLike(error)) throw new AiCallTimeoutError();
    throw error;
  });
  void work.then(
    () => undefined,
    () => undefined
  );
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
    .replace(/\S{25,}/g, (token) => (/@(?:cf|hf)\/[A-Za-z0-9._/-]+/.test(token) ? token : "[redacted]"))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LOG_DETAIL_MAX);
}

/**
 * Prefer a parenthesized provider code, then a 4-digit code, over an earlier
 * HTTP status. "upstream 504 … (code 3043)" must log 3043, not 504.
 * IP octets are removed first so they are not treated as codes.
 */
function providerErrorCode(message: string): string | undefined {
  const withoutNetwork = message.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, " ");
  const parenthesized = withoutNetwork.match(/\(\s*(?:code\s*)?(\d{3,5})\s*\)/i);
  if (parenthesized) return parenthesized[1];
  const codes = [...withoutNetwork.matchAll(/\b(\d{3,5})\b/g)].map((match) => match[1]);
  return codes.find((code) => code.length >= 4) ?? codes[0];
}

function fallbackDetail(error: unknown): string {
  const name = error instanceof Error && error.name.trim() ? error.name.trim() : "Error";
  if (!(error instanceof Error) || !error.message.trim()) return name.slice(0, LOG_DETAIL_MAX);
  const code = providerErrorCode(error.message);
  const model = error.message.match(/@(?:cf|hf)\/[A-Za-z0-9._/-]+/)?.[0];
  const prefix = [name, code, model].filter((part): part is string => Boolean(part && part.trim())).join(": ");
  if (prefix.length >= LOG_DETAIL_MAX) return prefix.slice(0, LOG_DETAIL_MAX);

  let remainder = error.message;
  if (model) remainder = remainder.replace(model, " ");
  if (code) remainder = remainder.replace(new RegExp(`\\b${code}\\b`), " ");
  const safe = sanitiseLogMessage(remainder);
  const room = LOG_DETAIL_MAX - prefix.length - 2;
  if (room <= 8 || !safe) return prefix;
  return `${prefix}: ${safe}`.slice(0, LOG_DETAIL_MAX);
}

function logMealPlanOk(details: { provider: MealPlanProvider; locale: Locale; noteCount: number; durationMs: number }): void {
  console.log(
    JSON.stringify({
      event: "meal-plan-ai-ok",
      provider: details.provider,
      locale: details.locale,
      noteCount: details.noteCount,
      durationMs: details.durationMs
    })
  );
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

/**
 * Close a truncated specialNotes object. Handles a missing final `}`, a
 * missing `]}`, and a last string that was cut off before its quote.
 */
function repairTruncatedSpecialNotes(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let body = text.slice(start).trim();
  if (!/"specialNotes"\s*:/.test(body)) return null;

  let inString = false;
  let escape = false;
  const stack: Array<"{" | "["> = [];
  for (const char of body) {
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{" || char === "[") stack.push(char);
    else if ((char === "}" || char === "]") && stack.length > 0) stack.pop();
  }

  if (!inString && stack.length === 0) return null;
  if (inString) body += '"';
  body = body.replace(/,\s*$/, "");
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    body += stack[index] === "{" ? "}" : "]";
  }
  return body;
}

export function parseModelPayload(raw: string): { specialNotes?: unknown } {
  const stripped = stripJsonFence(raw);
  const read = (text: string) => {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object") throw new SyntaxError("unparseable_json");
    return parsed as { specialNotes?: unknown };
  };
  try {
    return read(stripped);
  } catch {
    // Try a complete object embedded in extra text, then a missing final brace.
  }

  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return read(stripped.slice(start, end + 1));
    } catch {
      // The slice was not valid JSON. Repair a truncated notes object next.
    }
  }

  const repaired = repairTruncatedSpecialNotes(stripped);
  if (repaired) {
    try {
      return read(repaired);
    } catch {
      // Still not JSON.
    }
  }
  throw new SyntaxError("unparseable_json");
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

const NOTES_SYSTEM_PROMPT =
  'Return exactly one JSON object {"specialNotes":[{"text":"...","kind":"portion|swap|timing|prep|other","foods":["..."]}]} with 2 or 3 notes of at most 12 words, each ending with a period, in the requested language. Do not restate safety rules. Do not recommend weight loss, dieting, fasting, or cutting calories. Do not write a meal plan.';

async function callOpenAi(prompt: string, apiKey: string, gatewayUrl: string | undefined, signal: AbortSignal): Promise<string> {
  const url = gatewayUrl ? `${gatewayUrl.replace(/\/$/, "")}/chat/completions` : "https://api.openai.com/v1/chat/completions";
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: NOTES_SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: MEAL_PLAN_RESPONSE_FORMAT
      })
    });
  } catch (error) {
    if (isAbortLike(error)) throw error;
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

async function callWorkersAi(prompt: string, signal: AbortSignal): Promise<string> {
  assertSupportedWorkersAiModel(WORKERS_AI_MODEL);

  const { AI } = await getBindings();
  if (!AI) {
    throw new AiProviderError("workers-ai", "Workers AI binding is unavailable, so the meal plan request could not be sent.");
  }

  let result: unknown;
  try {
    result = await AI.run(
      WORKERS_AI_MODEL,
      {
        messages: [
          { role: "system", content: NOTES_SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        max_tokens: WORKERS_AI_MAX_TOKENS,
        temperature: 0.2,
        response_format: MEAL_PLAN_RESPONSE_FORMAT
      },
      { signal }
    );
  } catch (error) {
    if (isAbortLike(error)) throw error;
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

function planWithAiNotes(baseline: MealPlan, notes: string[], locale: Locale): { plan: MealPlan; shown: number } {
  const kept = filterNotesForLocale(notes, locale);
  const withNotes = {
    ...baseline,
    specialNotes: sanitizeSpecialNotes([...baseline.specialNotes, ...kept])
  };
  const plan = localizeMealPlanForLocale(withNotes, locale);
  const visible = new Set(plan.specialNotes);
  const shown = kept.filter((note) => visible.has(note)).length;
  if (shown > 0) aiServedPlans.set(plan, true);
  return { plan, shown };
}

function mealPlanPrompt(input: PregnancyProfile, locale: Locale): string {
  return buildMealPlanPrompt(input, locale);
}

function translateNotesPrompt(notes: readonly string[], locale: Locale): string {
  const language = locale === "vi" ? "Vietnamese" : "English";
  const listed = notes.map((note) => `- ${note}`).join("\n");
  return [
    "Do not write a meal plan.",
    `The previous specialNotes were not in ${language}.`,
    `Translate only these notes into ${language}.`,
    'Return exactly one JSON object and nothing else: {"specialNotes":[{"text":"...","kind":"portion|swap|timing|prep|other","foods":["..."]}]}.',
    `Translate only the text into ${language}. Do not add safety rules, condition warnings, or fish rules.`,
    listed
  ].join("\n");
}

type ParsedNotes =
  | { ok: true; notes: string[] }
  | { ok: false; reason: "empty_output" | "bad_output"; detail?: string };

function parseNotes(raw: string): ParsedNotes {
  if (!raw.trim()) return { ok: false, reason: "empty_output" };
  try {
    const notes = sanitizeSpecialNotes(parseModelPayload(raw).specialNotes).filter(noteIsComplete);
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

      const startedAt = Date.now();
      const deadlineAt = startedAt + aiCallTimeoutMs();

      const callModel = (prompt: string) =>
        withDeadline(
          (signal) =>
            provider === "workers-ai"
              ? callWorkersAi(prompt, signal)
              : callOpenAi(prompt, env.OPENAI_API_KEY ?? "", env.AI_GATEWAY_URL, signal),
          deadlineAt
        );

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

        const safeNotes = filterSafeAiNotes(filterNotesForLocale(notes, locale), input);
        if (safeNotes.length === 0) {
          logMealPlanFallback({ reason: "bad_output", provider, detail: "safety_filtered" });
          return baseline;
        }
        const freshNotes = filterEchoedAiNotes(safeNotes, input, locale);
        if (freshNotes.length === 0) {
          logMealPlanFallback({ reason: "bad_output", provider, detail: "echo_filtered" });
          return baseline;
        }

        const served = planWithAiNotes(baseline, freshNotes, locale);
        if (served.shown > 0) {
          logMealPlanOk({
            provider,
            locale,
            noteCount: served.shown,
            durationMs: Date.now() - startedAt
          });
        } else {
          logMealPlanFallback({ reason: "empty_output", provider, detail: "no_visible_notes" });
        }
        return served.plan;
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
        const errorName = error instanceof Error && error.name.trim() ? error.name.trim() : "Error";
        logMealPlanFallback({
          reason: "thrown",
          provider,
          errorName,
          detail: errorName
        });
        return baseline;
      }
    }
  };
}
