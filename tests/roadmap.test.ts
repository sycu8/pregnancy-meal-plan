import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/generate-meal-plan/route";
import { buildBlogRssFeed } from "@/lib/blog/rssFeed";
import { synthesizePost } from "@/lib/blog/synthesis/synthesizePost";
import { regenerateMealInPlan, ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import type { PregnancyProfile } from "@/types/pregnancy";

const sampleProfile: PregnancyProfile = {
  pregnancyWeek: 24,
  pregnancyType: "singleton",
  heightCm: 160,
  prePregnancyWeightKg: 52,
  currentWeightKg: 58,
  activityLevel: "light",
  healthConditions: ["none"],
  cuisinePreferences: ["vietnamese_rice"],
  budget: "medium",
  cookingTime: "around_30",
  goals: ["balanced"]
};

describe("generate meal plan API", () => {
  it("returns a 7-day plan for valid profile", async () => {
    const request = new Request("http://localhost/api/generate-meal-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: sampleProfile, locale: "vi" })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = (await response.json()) as { plan: { days: unknown[] } };
    expect(json.plan.days).toHaveLength(7);
  });
});

describe("regenerateMealInPlan", () => {
  it("swaps only the requested meal", () => {
    const plan = ruleBasedMealPlanner(sampleProfile, "vi");
    const before = plan.days[0].breakfast.name;
    const next = regenerateMealInPlan(plan, sampleProfile, 1, "breakfast", "vi");
    expect(next.days[0].breakfast.name).not.toBe(before);
    expect(next.days[1].breakfast.name).toBe(plan.days[1].breakfast.name);
  });
});

describe("blog RSS feed", () => {
  it("renders valid RSS xml", () => {
    const xml = buildBlogRssFeed("vi", 5);
    expect(xml).toContain("<rss");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("</rss>");
  });
});

describe("editorial synthesis", () => {
  it("creates structured VI content without copying source body", () => {
    const output = synthesizePost({
      title: "Ăn uống khi nghén",
      snippet: "Gợi ý giảm nghén tam cá nguyệt 1",
      sourceName: "Vinmec",
      url: "https://example.com/nghen"
    });
    expect(output.content).toContain("## Tóm tắt");
    expect(output.tags).toContain("nghen");
  });
});
