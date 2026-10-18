import { afterEach, describe, expect, it, vi } from "vitest";
import { aiUnavailableMessage } from "@/lib/nutrition/aiUnavailable";
import { MealPlanAiError, fetchMealPlan } from "@/lib/nutrition/fetchMealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";

const profile: PregnancyProfile = {
  pregnancyWeek: 24,
  pregnancyType: "singleton",
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

const html502 =
  "<html><head><title>502 Bad Gateway</title></head><body><h1>502</h1>Workers AI @cf/meta/llama-3.1-8b-instruct-fp8</body></html>";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("meal plan error UX", () => {
  it("turns an HTML 502 into a friendly Vietnamese error without the body or model id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(html502, { status: 502, headers: { "content-type": "text/html" } }))
    );

    await expect(fetchMealPlan(profile, "vi")).rejects.toMatchObject({
      name: "MealPlanAiError",
      message: aiUnavailableMessage("vi")
    });
    await expect(fetchMealPlan(profile, "vi")).rejects.toBeInstanceOf(MealPlanAiError);

    try {
      await fetchMealPlan(profile, "vi");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      expect(message).not.toMatch(/@cf\/|<html|workers ai|llama-3/i);
      expect(message).toMatch(/Thử lại|thử lại/);
      expect(message).toMatch(/thực đơn cơ bản/);
    }
  });

  it("hides an English provider payload from Vietnamese users", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: "Workers AI request failed for @cf/meta/llama-3.1-8b-instruct-fp8: model retired"
            }),
            { status: 502, headers: { "content-type": "application/json" } }
          )
      )
    );

    await expect(fetchMealPlan(profile, "vi")).rejects.toMatchObject({
      message: aiUnavailableMessage("vi")
    });
  });

  it("keeps a Vietnamese validation message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "Dị ứng thực phẩm tối đa 200 ký tự." }), {
            status: 400,
            headers: { "content-type": "application/json" }
          })
      )
    );

    await expect(fetchMealPlan(profile, "vi")).rejects.toThrow("Dị ứng thực phẩm tối đa 200 ký tự.");
  });
});
