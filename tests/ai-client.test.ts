import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PregnancyProfile } from "@/types/pregnancy";

const { aiRun, getBindingsMock } = vi.hoisted(() => {
  const aiRun = vi.fn();
  const getBindingsMock = vi.fn(async (): Promise<{ AI?: { run: typeof aiRun } }> => ({ AI: { run: aiRun } }));
  return { aiRun, getBindingsMock };
});

vi.mock("@/lib/cloudflare/bindings", () => ({
  getBindings: getBindingsMock,
  readFeatureFlag: vi.fn(async (_key: string, fallback = false) => fallback)
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
    aiRun.mockRejectedValue(new Error("5016: No such model @cf/meta/llama-3.1-8b-instruct"));

    await expect(createAIClient().generateMealPlan(profile, "en")).rejects.toMatchObject({
      name: "AiProviderError",
      provider: "workers-ai",
      message: `Workers AI request failed for ${WORKERS_AI_MODEL}: 5016: No such model @cf/meta/llama-3.1-8b-instruct`
    });
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
});
