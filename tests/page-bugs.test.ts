import { describe, expect, it, vi } from "vitest";
import { getTopicCluster } from "@/components/blog/BlogTopics";
import { LOCAL_PRIVACY_NOTICE } from "@/lib/nutrition/safetyRules";
import { DEFAULT_STRIPE_CHECKOUT_URL } from "@/app/api/premium/checkout/route";
import { buildPlanShareText } from "@/lib/share/planShare";
import type { MealPlan } from "@/types/mealPlan";

vi.mock("@/lib/auth/session", () => ({
  resolveUserIdFromRequest: vi.fn(async () => null)
}));

vi.mock("@/lib/auth/user", () => ({
  getUserById: vi.fn(async () => null)
}));

describe("page bug regressions", () => {
  it("has EN topic hub clusters that match VI routes", () => {
    for (const slug of ["tam-ca-nguyet-1", "tieu-duong-thai-ky", "nghen", "an-dam"]) {
      expect(getTopicCluster(slug)).toBeTruthy();
      expect(getTopicCluster(slug)?.en).toBeTruthy();
    }
  });

  it("does not grant premium from spoofed x-premium-tier header", async () => {
    const { resolvePremiumTier } = await import("@/lib/premium/resolveTier");
    const tier = await resolvePremiumTier(
      new Request("http://localhost/api/generate-meal-plan", {
        headers: { "x-premium-tier": "premium" }
      })
    );
    expect(tier).toBe("free");
  });

  it("keeps Stripe Payment Link configured for /premium", () => {
    expect(DEFAULT_STRIPE_CHECKOUT_URL).toContain("buy.stripe.com/");
  });

  it("updates privacy copy to mention opt-in sync", () => {
    expect(LOCAL_PRIVACY_NOTICE.toLowerCase()).toContain("opt-in");
    expect(LOCAL_PRIVACY_NOTICE).not.toMatch(/chưa đồng bộ dữ liệu lên server/i);
  });

  it("builds postpartum share text without pregnancy-week wording", () => {
    const plan = {
      id: "p1",
      createdAt: "2026-07-01T00:00:00.000Z",
      profileSnapshot: {
        pregnancyWeek: 0,
        lifeStage: "postpartum",
        babyAgeMonths: 6,
        pregnancyType: "singleton",
        heightCm: 160,
        prePregnancyWeightKg: 52,
        currentWeightKg: 55,
        activityLevel: "light",
        healthConditions: ["none"],
        cuisinePreferences: ["vietnamese_rice"],
        budget: "medium",
        cookingTime: "around_30",
        goals: ["balanced"]
      },
      days: [
        {
          day: 1,
          breakfast: { name: "Cháo" },
          lunch: { name: "Cá" },
          dinner: { name: "Canh" }
        }
      ],
      summary: { message: "ok", disclaimer: "ref" }
    } as unknown as MealPlan;

    expect(buildPlanShareText(plan, "vi")).toContain("sau sinh");
    expect(buildPlanShareText(plan, "vi")).not.toContain("tuần thai 0");
  });
});
