import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PregnancyProfile } from "@/types/pregnancy";

const { aiRun, getBindingsMock } = vi.hoisted(() => {
  const aiRun = vi.fn();
  const getBindingsMock = vi.fn(async (): Promise<{ AI?: { run: typeof aiRun } }> => ({ AI: { run: aiRun } }));
  return { aiRun, getBindingsMock };
});

vi.mock("@/lib/cloudflare/bindings", () => ({
  getBindings: getBindingsMock,
  readFeatureFlag: vi.fn(async (key: string, fallback = false) => {
    const flag = process.env[`FEATURE_${String(key).toUpperCase()}`];
    if (flag === "true") return true;
    if (flag === "false") return false;
    return fallback;
  })
}));

import { POST } from "@/app/api/generate-meal-plan/route";
import {
  AI_CALL_TIMEOUT_MS,
  AiProviderError,
  MEAL_PLAN_RESPONSE_FORMAT,
  RETIRED_WORKERS_AI_MODEL_IDS,
  WORKERS_AI_MAX_TOKENS,
  WORKERS_AI_MODEL,
  assertSupportedWorkersAiModel,
  createAIClient,
  mealPlanServedAi,
  parseModelPayload
} from "@/lib/cloudflare/aiClient";
import { aiUnavailableMessage } from "@/lib/nutrition/aiUnavailable";
import { buildMealPlanPrompt } from "@/lib/nutrition/aiPromptBuilder";
import { incrementUsage, resetUsageMemoryForTests } from "@/lib/premium/serverUsage";

const profile: PregnancyProfile = {
  pregnancyWeek: 24,
  pregnancyType: "singleton",
  age: 30,
  heightCm: 160,
  prePregnancyWeightKg: 52,
  currentWeightKg: 58,
  activityLevel: "light",
  healthConditions: ["anemia"],
  cuisinePreferences: ["vietnamese_rice"],
  budget: "medium",
  cookingTime: "around_30",
  goals: ["balanced"]
};

const originalEnv = { ...process.env };

function loggedFallbacks(spy: { mock: { calls: unknown[][] } }) {
  return spy.mock.calls.flatMap((call) => {
    try {
      const parsed = JSON.parse(String(call[0])) as { event?: string };
      return parsed.event === "meal-plan-ai-fallback" ? [parsed] : [];
    } catch {
      return [];
    }
  });
}

describe("Workers AI model catalog", () => {
  it("uses a text model that is not a known retired id", () => {
    expect(WORKERS_AI_MODEL).toBe("@cf/meta/llama-3.1-8b-instruct-fp8");
    expect(RETIRED_WORKERS_AI_MODEL_IDS).not.toContain(WORKERS_AI_MODEL);
    expect(() => assertSupportedWorkersAiModel(WORKERS_AI_MODEL)).not.toThrow();
  });

  it("fails on known retired model ids", () => {
    expect(RETIRED_WORKERS_AI_MODEL_IDS).toContain("@cf/meta/llama-3.1-8b-instruct");
    expect(RETIRED_WORKERS_AI_MODEL_IDS).toContain("@cf/meta/llama-3.1-8b-instruct-fast");

    for (const model of RETIRED_WORKERS_AI_MODEL_IDS) {
      expect(() => assertSupportedWorkersAiModel(model)).toThrow(AiProviderError);
      expect(() => assertSupportedWorkersAiModel(model)).toThrow(
        new RegExp(`Workers AI model ${model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} was retired`)
      );
    }
  });
});

describe("failed AI calls", () => {
  beforeEach(() => {
    aiRun.mockReset();
    getBindingsMock.mockReset();
    getBindingsMock.mockImplementation(async () => ({ AI: { run: aiRun } }));
    process.env.AI_PROVIDER = "workers-ai";
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_GATEWAY_URL;
    delete process.env.FEATURE_AI_PLANNER_ENABLED;
    delete process.env.AI_CALL_TIMEOUT_MS;
    resetUsageMemoryForTests();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("surfaces a Workers AI exception with the model id and the provider error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    aiRun.mockRejectedValue(new Error("5016: No such model @cf/meta/llama-3.1-8b-instruct"));

    await expect(createAIClient().generateMealPlan(profile, "en")).rejects.toMatchObject({
      name: "AiProviderError",
      provider: "workers-ai",
      message: `Workers AI request failed for ${WORKERS_AI_MODEL}: 5016: No such model @cf/meta/llama-3.1-8b-instruct`
    });
    const providerLog = loggedFallbacks(errorSpy).find((event) => (event as { reason?: string }).reason === "provider_error") as {
      detail?: string;
    };
    expect(providerLog.detail).toContain("5016");
    expect(providerLog.detail).toContain(WORKERS_AI_MODEL);
    expect(providerLog.detail).toMatch(/^AiProviderError: 5016:/);
    expect((providerLog.detail ?? "").length).toBeLessThanOrEqual(80);

    aiRun.mockRejectedValueOnce(new Error("upstream 504 from the gateway (code 3043)"));
    await expect(createAIClient().generateMealPlan(profile, "en")).rejects.toBeInstanceOf(AiProviderError);
    const coded = loggedFallbacks(errorSpy).find((event) => String((event as { detail?: string }).detail).includes("3043")) as {
      detail?: string;
    };
    expect(coded.detail).toMatch(/^AiProviderError: 3043:/);
    expect(coded.detail).not.toMatch(/^AiProviderError: 504:/);
    expect((coded.detail ?? "").length).toBeLessThanOrEqual(80);
    expect(loggedFallbacks(errorSpy)).toContainEqual(
      expect.objectContaining({
        event: "meal-plan-ai-fallback",
        reason: "provider_error",
        provider: "workers-ai",
        errorName: "AiProviderError"
      })
    );
    errorSpy.mockRestore();
    expect(aiRun).toHaveBeenCalledWith(
      WORKERS_AI_MODEL,
      expect.objectContaining({ max_tokens: WORKERS_AI_MAX_TOKENS }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("asks only for short notes and caps the token budget below a full plan", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    aiRun.mockResolvedValue({ response: JSON.stringify({ specialNotes: ["Drink water through the day."] }) });

    const prompt = buildMealPlanPrompt(profile, "en");
    expect(prompt).toMatch(/Do not write a meal plan/);
    expect(prompt).toMatch(/2 or 3 items in English only/);
    expect(prompt).toContain('"kind":"portion|swap|timing|prep|other"');
    expect(prompt).toMatch(/do not restate/i);
    expect(prompt).not.toMatch(/7-day/i);
    expect(prompt).not.toMatch(/draft english/i);
    expect(buildMealPlanPrompt(profile, "vi")).toMatch(/2 or 3 items in Vietnamese only/);
    expect(prompt).toMatch(/at most 12 words/);
    expect(prompt).toMatch(/weight loss/i);

    const plan = await createAIClient().generateMealPlan(profile, "en");

    expect(WORKERS_AI_MAX_TOKENS).toBe(256);
    expect(aiRun).toHaveBeenCalledWith(
      WORKERS_AI_MODEL,
      expect.objectContaining({
        max_tokens: WORKERS_AI_MAX_TOKENS,
        response_format: MEAL_PLAN_RESPONSE_FORMAT
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    const request = aiRun.mock.calls[0]?.[1] as { messages?: { content?: string }[] };
    expect(request.messages?.map((message) => message.content).join("\n")).not.toMatch(/7-day|draft english/i);
    expect(plan.specialNotes.join(" ")).toContain("Drink water");
    const ok = logSpy.mock.calls.map((call) => JSON.parse(String(call[0])) as { event?: string; noteCount?: number });
    expect(ok).toContainEqual(expect.objectContaining({ event: "meal-plan-ai-ok", noteCount: expect.any(Number), durationMs: expect.any(Number) }));
    expect(JSON.stringify(ok)).not.toContain("Drink water");
    logSpy.mockRestore();
  });

  it("drops non-string specialNotes and caps count and length", async () => {
    const long = `B${"e".repeat(238)}.${"e".repeat(300)}`;
    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: [
          "Drink water through the day.",
          1,
          { bad: true },
          null,
          long,
          ...Array.from({ length: 20 }, (_, index) => `Extra note ${index} about rest.`)
        ]
      })
    });

    const plan = await createAIClient().generateMealPlan(profile, "en");

    expect(plan.specialNotes.every((note) => typeof note === "string")).toBe(true);
    expect(plan.specialNotes.length).toBeLessThanOrEqual(8);
    expect(plan.specialNotes.every((note) => note.length <= 240)).toBe(true);
    expect(plan.specialNotes.join(" ")).toContain("Drink water");
    expect(plan.specialNotes.join(" ")).not.toContain("[object Object]");
    expect(plan.specialNotes.some((note) => note.startsWith("Beee") && note.length === 240)).toBe(true);
  });

  it("surfaces an error payload from Workers AI instead of a silent fallback", async () => {
    aiRun.mockResolvedValue({ errors: [{ message: "Model is retired" }] });

    await expect(createAIClient().generateMealPlan(profile, "vi")).rejects.toThrow(
      `Workers AI request failed for ${WORKERS_AI_MODEL}: Model is retired`
    );
  });

  it("surfaces a missing Workers AI binding", async () => {
    getBindingsMock.mockResolvedValue({});

    await expect(createAIClient().generateMealPlan(profile, "en")).rejects.toThrow(
      "Workers AI binding is unavailable, so the meal plan request could not be sent."
    );
  });

  it("surfaces a failed OpenAI response status", async () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "test-openai-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("invalid_api_key", { status: 401, statusText: "Unauthorized" }))
    );

    await expect(createAIClient().generateMealPlan(profile, "en")).rejects.toThrow(
      "OpenAI request failed (401 Unauthorized): invalid_api_key."
    );
  });

  it("returns a friendly localized error and hides provider text and HTML", async () => {
    aiRun.mockRejectedValue(
      new Error("<html><body>502 Bad Gateway</body></html> Workers AI request failed for @cf/meta/llama-3.1-8b-instruct-fp8")
    );

    const response = await POST(
      new Request("http://localhost/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept-Language": "vi" },
        body: JSON.stringify({ profile, locale: "vi" })
      })
    );
    const body = (await response.json()) as { error: string; code: string };

    expect(response.status).toBe(502);
    expect(body).toEqual({ error: aiUnavailableMessage("vi"), code: "ai_unavailable" });
    expect(body.error).not.toMatch(/@cf\/|@hf\/|llama-3|workers ai|<html|openai/i);
    expect(body.error).toMatch(/thực đơn cơ bản/);
  });

  it("calls Workers AI from the AI binding when AI_PROVIDER is unset", async () => {
    delete process.env.AI_PROVIDER;
    aiRun.mockResolvedValue({ response: JSON.stringify({ specialNotes: ["Drink water through the day."] }) });

    const plan = await createAIClient().generateMealPlan(profile, "en");

    expect(aiRun).toHaveBeenCalledWith(WORKERS_AI_MODEL, expect.any(Object), expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(plan.specialNotes.join(" ")).toContain("Drink water");
  });

  it("reads an object response without calling trim", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    aiRun.mockResolvedValue({ response: { specialNotes: ["Uống đủ nước trong ngày."] } });

    const plan = await createAIClient().generateMealPlan(profile, "vi");

    expect(plan.specialNotes.join(" ")).toContain("Uống đủ nước trong ngày.");
    expect(loggedFallbacks(errorSpy)).toHaveLength(0);
    errorSpy.mockRestore();
  });

  it("reads a streamed SSE response and a fenced JSON string", async () => {
    const payload = JSON.stringify({ specialNotes: ["Drink water through the day."] });
    const encoder = new TextEncoder();
    aiRun.mockResolvedValueOnce(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: payload.slice(0, 12) })}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: payload.slice(12) })}\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n"));
          controller.close();
        }
      })
    );

    const streamed = await createAIClient().generateMealPlan(profile, "en");
    expect(streamed.specialNotes.join(" ")).toContain("Drink water");

    async function* chunks() {
      yield { response: payload.slice(0, 8) };
      yield { response: payload.slice(8) };
    }
    aiRun.mockResolvedValueOnce(chunks());
    const iterated = await createAIClient().generateMealPlan(profile, "en");
    expect(iterated.specialNotes.join(" ")).toContain("Drink water");

    aiRun.mockResolvedValueOnce({ response: "```json\n" + payload + "\n```" });
    const fenced = await createAIClient().generateMealPlan(profile, "en");
    expect(fenced.specialNotes.join(" ")).toContain("Drink water");
  });

  it("logs empty output, bad output, and thrown errors without secrets", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    aiRun.mockResolvedValueOnce({ response: "   " });
    await createAIClient().generateMealPlan(profile, "en");

    aiRun.mockResolvedValueOnce({ response: "not json sk-live-abc123xyz" });
    await createAIClient().generateMealPlan(profile, "en");

    getBindingsMock.mockRejectedValueOnce(new Error("Authorization: Bearer sk-live-abc123xyz"));
    const fallenBack = await createAIClient().generateMealPlan(profile, "en");

    const events = loggedFallbacks(errorSpy);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: "meal-plan-ai-fallback", reason: "empty_output", provider: "workers-ai" }),
        expect.objectContaining({
          event: "meal-plan-ai-fallback",
          reason: "bad_output",
          provider: "workers-ai",
          detail: "unparseable_json"
        }),
        expect.objectContaining({ event: "meal-plan-ai-fallback", reason: "thrown", provider: "workers-ai", errorName: "Error" })
      ])
    );
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain("sk-live");
    expect(serialized).not.toContain("not json");
    expect(serialized).not.toMatch(/bearer\s+sk/i);
    expect(fallenBack.days).toHaveLength(7);
    expect(fallenBack.specialNotes.join(" ")).not.toContain("Drink water");
    errorSpy.mockRestore();
  });

  it("stays on the rule-based plan when the binding and provider are missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.AI_PROVIDER;
    getBindingsMock.mockResolvedValue({});

    const plan = await createAIClient().generateMealPlan(profile, "en");

    expect(aiRun).not.toHaveBeenCalled();
    expect(plan.days).toHaveLength(7);
    expect(loggedFallbacks(errorSpy)).toContainEqual(
      expect.objectContaining({ event: "meal-plan-ai-fallback", reason: "no_provider", provider: "none" })
    );
    errorSpy.mockRestore();
  });

  it("does not call Workers AI when the planner flag is false", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.FEATURE_AI_PLANNER_ENABLED = "false";

    const plan = await createAIClient().generateMealPlan(profile, "en");

    expect(aiRun).not.toHaveBeenCalled();
    expect(plan.days).toHaveLength(7);
    expect(loggedFallbacks(errorSpy)).toContainEqual(
      expect.objectContaining({ event: "meal-plan-ai-fallback", reason: "ai_disabled", provider: "workers-ai" })
    );
    errorSpy.mockRestore();
  });

  it("falls back to the basic plan when the model hangs", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.AI_CALL_TIMEOUT_MS = "40";
    let signal: AbortSignal | undefined;
    aiRun.mockImplementation((_model, _input, options?: { signal?: AbortSignal }) => {
      signal = options?.signal;
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => {
          const aborted = new Error("The operation was aborted");
          aborted.name = "AbortError";
          reject(aborted);
        });
      });
    });

    const started = Date.now();
    const response = await POST(planRequest("203.0.113.21"));
    const body = (await response.json()) as { plan: { days: unknown[]; specialNotes: string[] }; usage: { aiPlansUsed: number } };

    expect(response.status).toBe(200);
    expect(body.plan.days).toHaveLength(7);
    expect(body.usage.aiPlansUsed).toBe(0);
    expect(Date.now() - started).toBeLessThan(2_000);
    expect(loggedFallbacks(errorSpy)).toContainEqual(
      expect.objectContaining({
        event: "meal-plan-ai-fallback",
        reason: "timeout",
        provider: "workers-ai",
        errorName: "AiCallTimeoutError",
        detail: "ai_timeout"
      })
    );
    expect(signal?.aborted).toBe(true);
    expect(AI_CALL_TIMEOUT_MS).toBe(28_000);
    expect(AI_CALL_TIMEOUT_MS).toBeLessThan(30_000);
    errorSpy.mockRestore();
  });

  it("translates once when the notes are in the wrong language", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    aiRun
      .mockResolvedValueOnce({ response: JSON.stringify({ specialNotes: ["Drink water through the day."] }) })
      .mockResolvedValueOnce({ response: JSON.stringify({ specialNotes: ["Uống đủ nước trong ngày."] }) });

    const plan = await createAIClient().generateMealPlan(profile, "vi");

    expect(aiRun).toHaveBeenCalledTimes(2);
    const retryPrompt = String(aiRun.mock.calls[1]?.[1] && JSON.stringify(aiRun.mock.calls[1][1]));
    expect(retryPrompt).toMatch(/Vietnamese/);
    expect(retryPrompt).toMatch(/do not add safety rules/i);
    expect(retryPrompt).not.toContain("Thiếu máu/thiếu sắt");
    expect(retryPrompt).not.toContain("Không ăn đồ sống/tái");
    expect(plan.specialNotes.join(" ")).toContain("Uống đủ nước trong ngày.");
    expect(plan.specialNotes.join(" ")).not.toContain("Drink water");
    expect(mealPlanServedAi(plan)).toBe(true);
    expect(loggedFallbacks(errorSpy)).toHaveLength(0);
    errorSpy.mockRestore();
  });

  it("does not count a plan when the note cap hides every AI note", async () => {
    aiRun.mockResolvedValue({
      response: JSON.stringify({ specialNotes: ["Uống thêm nước lọc giữa các bữa trong ngày."] })
    });
    const crowded: PregnancyProfile = {
      ...profile,
      healthConditions: [
        "morning_sickness",
        "constipation",
        "anemia",
        "gestational_diabetes",
        "hypertension",
        "edema",
        "reflux",
        "fast_weight_gain",
        "slow_weight_gain",
        "small_fetus",
        "large_fetus"
      ]
    };

    const plan = await createAIClient().generateMealPlan(crowded, "vi");

    expect(plan.specialNotes).not.toContain("Uống thêm nước lọc giữa các bữa trong ngày.");
    expect(mealPlanServedAi(plan)).toBe(false);
  });

  it("logs locale_filtered when a retry still returns the wrong language", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    aiRun.mockResolvedValue({ response: JSON.stringify({ specialNotes: ["Drink water through the day."] }) });

    const plan = await createAIClient().generateMealPlan(plantedProfile(), "vi");

    expect(aiRun).toHaveBeenCalledTimes(2);
    expect(mealPlanServedAi(plan)).toBe(false);
    expect(plan.specialNotes.join(" ")).not.toContain("Drink water");
    expect(loggedFallbacks(errorSpy)).toContainEqual(
      expect.objectContaining({
        event: "meal-plan-ai-fallback",
        reason: "locale_filtered",
        provider: "workers-ai",
        detail: "wrong_language"
      })
    );
    expect(JSON.stringify(loggedFallbacks(errorSpy))).not.toContain("PEANUTMARKER");
    expect(JSON.stringify(loggedFallbacks(errorSpy))).not.toContain("Drink water");
    errorSpy.mockRestore();
  });

  it("logs an error class and a sanitised detail instead of the raw message", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const marker = "ALLERGYMARKERALLERGYMARKERALLERGY";
    aiRun.mockRejectedValueOnce(new Error(`user@example.com 203.0.113.8 ${marker} sk-live-abc123secret`));

    await expect(createAIClient().generateMealPlan(plantedProfile(), "vi")).rejects.toBeInstanceOf(AiProviderError);

    getBindingsMock.mockRejectedValueOnce(new Error(`Authorization: Bearer sk-live-abc123secret ${marker} user@example.com`));
    const fallenBack = await createAIClient().generateMealPlan(plantedProfile(), "en");

    const events = loggedFallbacks(errorSpy);
    const providerLog = events.find((event) => (event as { reason?: string }).reason === "provider_error") as { detail?: string };
    const thrownLog = events.find((event) => (event as { reason?: string }).reason === "thrown") as { detail?: string };
    expect(providerLog.detail).toContain(WORKERS_AI_MODEL);
    expect(providerLog.detail).toMatch(/^AiProviderError: /);
    expect(thrownLog.detail).toBe("Error");
    expect((providerLog.detail ?? "").length).toBeLessThanOrEqual(80);
    expect((thrownLog.detail ?? "").length).toBeLessThanOrEqual(80);
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain(marker);
    expect(serialized).not.toContain("user@example.com");
    expect(serialized).not.toContain("203.0.113.8");
    expect(serialized).not.toContain("sk-live");
    expect(serialized).not.toContain("PEANUTMARKER");
    expect(serialized).not.toContain("BITTERMELONMARKER");
    expect(mealPlanServedAi(fallenBack)).toBe(false);
    errorSpy.mockRestore();
  });

  it("counts the daily quota only when AI notes were served", async () => {
    const ip = "203.0.113.40";
    aiRun.mockResolvedValueOnce({ response: "not json" });
    const fallback = await POST(planRequest(ip, undefined, { profile: plantedProfile(), locale: "vi" }));
    const fallbackBody = (await fallback.json()) as { usage: { aiPlansUsed: number; aiPlansLimit: number } };
    expect(fallback.status).toBe(200);
    expect(fallbackBody.usage).toEqual({ aiPlansUsed: 0, aiPlansLimit: 3 });

    const setCookie = fallback.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/bau_device=[a-f0-9]{32}/);
    expect(setCookie).not.toContain("PEANUTMARKER");
    expect(setCookie).not.toContain("doctor-note");

    aiRun.mockResolvedValueOnce({ response: JSON.stringify({ specialNotes: ["Uống đủ nước trong ngày."] }) });
    const served = await POST(planRequest(ip, setCookie.split(";")[0], { profile, locale: "vi" }));
    const servedBody = (await served.json()) as { plan: { specialNotes: string[] }; usage: { aiPlansUsed: number } };
    expect(served.status).toBe(200);
    expect(servedBody.usage.aiPlansUsed).toBe(1);
    expect(servedBody.plan.specialNotes.join(" ")).toContain("Uống đủ nước");
    expect(served.headers.get("set-cookie")).toBeNull();
  });

  it("returns 429 with the basic-plan message when the device or network quota is spent", async () => {
    const device = "a".repeat(32);
    const deviceRequest = () =>
      new Request("http://localhost/api/generate-meal-plan", {
        headers: { cookie: `bau_device=${device}`, "cf-connecting-ip": "203.0.113.41" }
      });
    for (let i = 0; i < 3; i += 1) {
      await incrementUsage(deviceRequest(), "ai-plan", { deviceId: device });
    }

    aiRun.mockResolvedValue({ response: JSON.stringify({ specialNotes: ["Uống đủ nước trong ngày."] }) });
    const limited = await POST(planRequest("203.0.113.41", `bau_device=${device}`));
    const limitedBody = (await limited.json()) as { error: string; scope?: string; usage: { aiPlansUsed: number; aiPlansLimit: number } };
    expect(limited.status).toBe(429);
    expect(limitedBody.error).toMatch(/thực đơn cơ bản/);
    expect(limitedBody.scope).toBe("device");
    expect(limitedBody.usage).toEqual({ aiPlansUsed: 3, aiPlansLimit: 3 });
    expect(aiRun).not.toHaveBeenCalled();

    const network = "203.0.113.42";
    for (let i = 0; i < 30; i += 1) {
      const id = i.toString(16).padStart(32, "b");
      await incrementUsage(
        new Request("http://localhost/api/generate-meal-plan", { headers: { "cf-connecting-ip": network, cookie: `bau_device=${id}` } }),
        "ai-plan",
        { deviceId: id }
      );
    }
    const blocked = await POST(planRequest(network, `bau_device=${"c".repeat(32)}`));
    const blockedBody = (await blocked.json()) as { error: string; scope?: string; usage: { aiPlansLimit: number } };
    expect(blocked.status).toBe(429);
    expect(blockedBody.scope).toBe("ip");
    expect(blockedBody.error).toMatch(/Mạng này đã tạo quá nhiều/);
    expect(blockedBody.error).not.toMatch(/3 thực đơn|3 AI plan/);
    expect(blockedBody.usage.aiPlansLimit).toBe(30);
    expect(aiRun).not.toHaveBeenCalled();
  });

  it("repairs a specialNotes object that is missing its closing brace", async () => {
    aiRun.mockResolvedValue({ response: TRUNCATED_SPECIAL_NOTES_JSON });

    const parsed = parseModelPayload(TRUNCATED_SPECIAL_NOTES_JSON);
    expect(parsed.specialNotes).toEqual([
      "Uống đủ nước lọc trong ngày.",
      "Chia nhỏ bữa nếu buồn nôn.",
      "Nấu chín thịt, cá và trứng."
    ]);

    const plan = await createAIClient().generateMealPlan(profile, "vi");
    expect(plan.specialNotes.join(" ")).toContain("Uống đủ nước lọc trong ngày.");
    expect(mealPlanServedAi(plan)).toBe(true);
  });

  it("drops GDM notes that contradict the condition warning and serves none when nothing safe remains", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const gdm: PregnancyProfile = { ...profile, healthConditions: ["gestational_diabetes"], goals: ["blood_sugar_control"] };
    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: ["Nên ăn nhiều trái cây.", "Thử phở hoặc cơm tấm cho bữa trưa.", "Uống nước ép trái cây."]
      })
    });

    const plan = await createAIClient().generateMealPlan(gdm, "vi");
    const notes = plan.specialNotes.join(" ");

    expect(notes).not.toContain("Nên ăn nhiều trái cây");
    expect(notes).not.toMatch(/phở|cơm tấm|nước ép trái cây/);
    expect(notes).toContain("Tiểu đường thai kỳ");
    expect(mealPlanServedAi(plan)).toBe(false);
    expect(loggedFallbacks(errorSpy)).toContainEqual(
      expect.objectContaining({ reason: "bad_output", detail: "safety_filtered" })
    );
    expect(JSON.stringify(loggedFallbacks(errorSpy))).not.toContain("trái cây");
    expect(JSON.stringify(loggedFallbacks(errorSpy))).not.toContain("phở");
    errorSpy.mockRestore();
  });

  it("keeps a safe GDM note after dropping contradictory ones", async () => {
    const gdm: PregnancyProfile = { ...profile, healthConditions: ["gestational_diabetes"], goals: ["balanced"] };
    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: ["Nên ăn nhiều trái cây.", "Uống thêm nước lọc giữa các bữa."]
      })
    });

    const plan = await createAIClient().generateMealPlan(gdm, "vi");
    const notes = plan.specialNotes.join(" ");
    expect(notes).toContain("Uống thêm nước lọc giữa các bữa.");
    expect(notes).not.toContain("Nên ăn nhiều trái cây");
    expect(notes).toContain("Tiểu đường thai kỳ");
    expect(mealPlanServedAi(plan)).toBe(true);
  });

  it("does not render a cut-off note fragment", async () => {
    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: ["Uống đủ nước", "Uống thêm nước lọc giữa các bữa.", "Drink water and"]
      })
    });

    const plan = await createAIClient().generateMealPlan(profile, "vi");
    const notes = plan.specialNotes.join(" ");
    expect(notes).toContain("Uống thêm nước lọc giữa các bữa.");
    expect(notes).not.toContain("Uống đủ nước");
    expect(notes).not.toContain("Drink water and");
    expect(mealPlanServedAi(plan)).toBe(true);
  });

  it("drops English pho, com tam, and plenty-of-fruit notes for gestational diabetes", async () => {
    const gdm: PregnancyProfile = { ...profile, healthConditions: ["gestational_diabetes"], goals: ["balanced"] };
    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: ["Try pho or com tam for lunch.", "Eat plenty of fruit.", "Drink water between meals."]
      })
    });

    const plan = await createAIClient().generateMealPlan(gdm, "en");
    const notes = plan.specialNotes.join(" ");
    expect(notes).toContain("Drink water between meals.");
    expect(notes).not.toMatch(/\bpho\b|com tam|plenty of fruit/i);
    expect(notes).toContain("Gestational diabetes");
    expect(mealPlanServedAi(plan)).toBe(true);
  });

  it("does not deny pho when gestational diabetes is not selected", async () => {
    aiRun.mockResolvedValue({
      response: JSON.stringify({ specialNotes: ["Phở gà nấu chín là bữa dễ ăn."] })
    });

    const plan = await createAIClient().generateMealPlan(profile, "vi");
    expect(plan.specialNotes.join(" ")).toContain("Phở gà nấu chín là bữa dễ ăn.");
    expect(mealPlanServedAi(plan)).toBe(true);
  });

  it("drops notes that say to avoid overcooking or that suggest pickled food", async () => {
    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: ["Avoid overcooking vegetables.", "Try pickled vegetables as a snack.", "Drink water through the day."]
      })
    });

    const plan = await createAIClient().generateMealPlan(profile, "en");
    const notes = plan.specialNotes.join(" ");
    expect(notes).not.toMatch(/overcooking|pickled/i);
    expect(notes).toContain("Drink water through the day.");
    expect(mealPlanServedAi(plan)).toBe(true);
  });

  it("does not serve a gestational-diabetes note that recommends fruits with whole grains", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const gdm: PregnancyProfile = { ...profile, healthConditions: ["gestational_diabetes"], goals: ["blood_sugar_control"] };
    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: [
          "As a pregnant woman with gestational diabetes, prioritize slow-digesting carbohydrates such as whole grains, fruits, and vegetables."
        ]
      })
    });

    const plan = await createAIClient().generateMealPlan(gdm, "en");
    expect(plan.specialNotes.join(" ")).not.toMatch(/\bfruits\b/i);
    expect(plan.specialNotes.join(" ")).toContain("Gestational diabetes");
    expect(mealPlanServedAi(plan)).toBe(false);
    expect(loggedFallbacks(errorSpy)).toContainEqual(expect.objectContaining({ detail: "safety_filtered" }));
    errorSpy.mockRestore();
  });

  it("does not count notes that copy the safety panel or the prompt rules", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const gdm: PregnancyProfile = { ...profile, healthConditions: ["gestational_diabetes"], goals: ["balanced"] };
    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: [
          "Tiểu đường thai kỳ: ưu tiên tinh bột chậm, chia nhỏ bữa, tránh nước ép/nước ngọt và hỏi bác sĩ về lượng tinh bột phù hợp.",
          "Không ăn đồ sống/tái; nấu chín kỹ thịt, cá, trứng và hải sản.",
          "Không khuyên đồ muối chua hoặc dưa muối."
        ]
      })
    });

    const echoed = await createAIClient().generateMealPlan(gdm, "vi");
    expect(echoed.specialNotes.join(" ")).toContain("Tiểu đường thai kỳ");
    expect(echoed.specialNotes.join(" ")).not.toContain("Không khuyên");
    expect(echoed.specialNotes.join(" ")).not.toContain("Không ăn đồ sống");
    expect(mealPlanServedAi(echoed)).toBe(false);
    expect(loggedFallbacks(errorSpy)).toContainEqual(expect.objectContaining({ detail: "echo_filtered" }));

    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: [
          "Không khuyên đồ muối chua hoặc dưa muối.",
          "Uống thêm nước lọc giữa các bữa."
        ]
      })
    });
    const mixed = await createAIClient().generateMealPlan(gdm, "vi");
    expect(mixed.specialNotes.join(" ")).toContain("Uống thêm nước lọc giữa các bữa.");
    expect(mixed.specialNotes.join(" ")).not.toContain("Không khuyên");
    expect(mealPlanServedAi(mixed)).toBe(true);
    const ok = logSpy.mock.calls.map((call) => JSON.parse(String(call[0])) as { event?: string; noteCount?: number });
    expect(ok).toContainEqual(expect.objectContaining({ event: "meal-plan-ai-ok", noteCount: 1 }));
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  it("drops omega-3 fish advice and does not keep a restatement of the fish rule", async () => {
    aiRun.mockResolvedValue({
      response: JSON.stringify({
        specialNotes: [
          "Ăn cá hồi giàu omega-3.",
          "Chọn cá ít thủy ngân, nấu chín kỹ.",
          "Nấu chín cá, thịt và trứng.",
          "Ăn một nắm hạt điều vào bữa xế."
        ]
      })
    });

    const plan = await createAIClient().generateMealPlan(profile, "vi");
    const notes = plan.specialNotes.join(" ");
    expect(notes).not.toMatch(/omega-3|cá hồi|thủy ngân|Nấu chín cá/);
    expect(notes).toContain("Ăn một nắm hạt điều vào bữa xế.");
    expect(mealPlanServedAi(plan)).toBe(true);
  });

  it("reads structured notes and does not spend a plan credit on echoed warnings", async () => {
    aiRun.mockResolvedValueOnce({
      response: JSON.stringify({
        specialNotes: [{ text: "Uống thêm nước lọc giữa các bữa.", kind: "timing", foods: ["water"] }]
      })
    });
    const served = await POST(planRequest("203.0.113.77"));
    const servedBody = (await served.json()) as { plan: { specialNotes: string[] }; usage: { aiPlansUsed: number } };
    expect(served.status).toBe(200);
    expect(servedBody.plan.specialNotes.join(" ")).toContain("Uống thêm nước lọc giữa các bữa.");
    expect(servedBody.usage.aiPlansUsed).toBe(1);

    aiRun.mockResolvedValueOnce({
      response: JSON.stringify({
        specialNotes: [
          { text: "Nấu chín kỹ thịt, cá, trứng và hải sản.", kind: "prep", foods: ["meat", "fish"] },
          { text: "Chọn cá ít thủy ngân và nấu chín kỹ.", kind: "prep", foods: ["fish"] },
          { text: "Hãy hỏi bác sĩ về lượng tinh bột phù hợp.", kind: "other", foods: [] }
        ]
      })
    });
    const echoed = await POST(
      planRequest("203.0.113.78", undefined, {
        profile: { ...profile, healthConditions: ["gestational_diabetes"], goals: ["blood_sugar_control"] },
        locale: "vi"
      })
    );
    const echoedBody = (await echoed.json()) as { usage: { aiPlansUsed: number } };
    expect(echoed.status).toBe(200);
    expect(echoedBody.usage.aiPlansUsed).toBe(0);
  });
});

/** Closed notes array with the object's final brace missing. */
const TRUNCATED_SPECIAL_NOTES_JSON =
  '{"specialNotes":["Uống đủ nước lọc trong ngày.","Chia nhỏ bữa nếu buồn nôn.","Nấu chín thịt, cá và trứng."]';

function plantedProfile(): PregnancyProfile {
  return {
    ...profile,
    allergies: "PEANUTMARKERPEANUTMARKERPEANUT",
    dislikedFoods: "BITTERMELONMARKERBITTERMELON1",
    doctorNote: "doctor-note-marker-should-not-log"
  };
}

function planRequest(ip: string, cookie?: string, body?: unknown) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": "vi",
    "cf-connecting-ip": ip
  };
  if (cookie) headers.cookie = cookie;
  return new Request("http://localhost/api/generate-meal-plan", {
    method: "POST",
    headers,
    body: JSON.stringify(body ?? { profile, locale: "vi" })
  });
}
