import { afterEach, describe, expect, it, vi } from "vitest";
import { aiUnavailableMessage, mealPlanErrorMessage, type MealPlanErrorKind } from "@/lib/nutrition/aiUnavailable";
import { MealPlanAiError, MealPlanRequestError, PremiumLimitError, fetchMealPlan } from "@/lib/nutrition/fetchMealPlan";
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

  it("maps 429, Turnstile 403, other 5xx, 400, and abort to their own actions", async () => {
    const validationFallback = "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.";
    const leak = /@cf\/|<html|workers ai|llama-3|too many requests|turnstile|openai/i;

    async function expectMapped(
      response: Response | (() => Promise<Response> | Response),
      kind: MealPlanErrorKind,
      calls: number
    ) {
      const fetchMock = vi.fn(async () => (typeof response === "function" ? response() : response.clone()));
      vi.stubGlobal("fetch", fetchMock);

      const error = await fetchMealPlan(profile, "vi").then(
        () => {
          throw new Error("expected fetchMealPlan to fail");
        },
        (caught: unknown) => caught
      );

      expect(error).toBeInstanceOf(kind === "ai" ? MealPlanAiError : MealPlanRequestError);
      const caught = error as MealPlanRequestError;
      expect(caught.kind).toBe(kind);
      expect(caught.action).toBe(kind === "ai" ? "ai" : kind === "turnstile" || kind === "invalid" ? "recheck" : "retry");
      expect(caught.message).toBe(mealPlanErrorMessage("vi", kind));
      expect(caught.message).not.toBe(validationFallback);
      expect(caught.message).not.toMatch(leak);
      expect(fetchMock).toHaveBeenCalledTimes(calls);
    }

    await expectMapped(
      new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), { status: 429 }),
      "rate_limit",
      1
    );
    await expectMapped(
      new Response(JSON.stringify({ error: "Turnstile verification failed." }), { status: 403 }),
      "turnstile",
      1
    );
    await expectMapped(
      new Response(JSON.stringify({ error: "<html>@cf/meta/llama-3.1-8b-instruct-fp8</html>" }), { status: 500 }),
      "server",
      2
    );
    await expectMapped(
      new Response("<html><body><h1>503 Service Unavailable</h1>Workers AI</body></html>", {
        status: 503,
        headers: { "content-type": "text/html" }
      }),
      "server",
      2
    );
    await expectMapped(
      new Response(JSON.stringify({ error: "Dị ứng thực phẩm tối đa 200 ký tự. <html>@cf/meta/llama-3</html>" }), {
        status: 400
      }),
      "invalid",
      1
    );
    await expectMapped(() => {
      const aborted = new Error("The operation was aborted");
      aborted.name = "AbortError";
      throw aborted;
    }, "aborted", 1);

    expect(mealPlanErrorMessage("en", "rate_limit")).toMatch(/too quickly/i);
    expect(mealPlanErrorMessage("en", "invalid")).toMatch(/not accepted/i);
  });

  it("returns a clear daily-limit error when a 429 includes premium usage", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              error: "Đã hết lượt tạo thực đơn AI trong ngày. Bạn vẫn dùng được thực đơn cơ bản.",
              usage: { aiPlansUsed: 3, aiPlansLimit: 3 }
            }),
            { status: 429 }
          )
      )
    );

    const error = await fetchMealPlan(profile, "vi").then(
      () => {
        throw new Error("expected the daily limit to surface");
      },
      (caught: unknown) => caught
    );
    expect(error).toBeInstanceOf(PremiumLimitError);
    expect((error as PremiumLimitError).message).toMatch(/thực đơn cơ bản/);
    expect((error as PremiumLimitError).message).not.toMatch(/too many requests|@cf\/|<html/i);
  });
});
