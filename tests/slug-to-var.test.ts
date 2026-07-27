import { describe, expect, it } from "vitest";
import { slugToVar, uniqueSlugVars } from "../scripts/lib/slugToVar";

describe("slugToVar", () => {
  it("keeps normal camelCase bindings", () => {
    expect(slugToVar("caffeine-khi-mang-thai")).toBe("caffeineKhiMangThai");
  });

  it("prefixes digit-leading slugs so generated imports stay valid", () => {
    expect(slugToVar("7-day-pregnancy-meal-plan-balanced-plates-for-busy-weeks")).toBe(
      "post7DayPregnancyMealPlanBalancedPlatesForBusyWeeks"
    );
    expect(slugToVar("7-day-pregnancy-meal-plan-balanced-plates-for-busy-weeks")).toMatch(
      /^[A-Za-z_$]/
    );
  });

  it("dedupes colliding bindings", () => {
    const vars = uniqueSlugVars(["a-b", "a-b", "7-day-plan"]);
    expect(vars.map((v) => v.varName)).toEqual(["aB", "aB2", "post7DayPlan"]);
  });
});
