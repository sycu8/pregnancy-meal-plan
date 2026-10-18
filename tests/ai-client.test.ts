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
  AiProviderError,
  RETIRED_WORKERS_AI_MODEL_IDS,
  WORKERS_AI_MAX_TOKENS,
  WORKERS_AI_MODEL,
  assertSupportedWorkersAiModel,
  createAIClient
} from "@/lib/cloudflare/aiClient";
import { aiUnavailableMessage } from "@/lib/nutrition/aiUnavailable";

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
      expect.objectContaining({ max_tokens: WORKERS_AI_MAX_TOKENS })
    );
  });

  it("sizes max_tokens to the specialNotes JSON instead of a 16384 cap", async () => {
    aiRun.mockResolvedValue({ response: JSON.stringify({ specialNotes: ["Drink water through the day."] }) });

    const plan = await createAIClient().generateMealPlan(profile, "en");

    expect(WORKERS_AI_MAX_TOKENS).toBeGreaterThan(256);
    expect(WORKERS_AI_MAX_TOKENS).toBeLessThan(16384);
    expect(aiRun).toHaveBeenCalledWith(
      WORKERS_AI_MODEL,
      expect.objectContaining({ max_tokens: WORKERS_AI_MAX_TOKENS })
    );
    expect(plan.specialNotes.join(" ")).toContain("Drink water");
  });

  it("drops non-string specialNotes and caps count and length", async () => {
    const long = `B${"e".repeat(500)}`;
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

    expect(aiRun).toHaveBeenCalledWith(WORKERS_AI_MODEL, expect.any(Object));
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
});
