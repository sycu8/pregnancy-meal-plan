import { describe, expect, it } from "vitest";
import { BRAND_NAME, footerCredit, localizedPath, pageSeo, stripLocaleFromPath } from "@/lib/i18n";

describe("i18n routing", () => {
  it("keeps English routes at the root and prefixes Vietnamese routes with /vi", () => {
    expect(localizedPath("en", "/")).toBe("/");
    expect(localizedPath("en", "/planner")).toBe("/planner");
    expect(localizedPath("vi", "/")).toBe("/vi");
    expect(localizedPath("vi", "/planner")).toBe("/vi/planner");
  });

  it("normalizes Vietnamese paths back to their canonical route key", () => {
    expect(stripLocaleFromPath("/vi")).toBe("/");
    expect(stripLocaleFromPath("/vi/history")).toBe("/history");
    expect(stripLocaleFromPath("/profile")).toBe("/profile");
  });

  it("provides SEO copy for both primary languages under Pregnancy Meal Planner", () => {
    expect(BRAND_NAME).toBe("Pregnancy Meal Planner");
    expect(pageSeo.en.home.title).toContain("Pregnancy Meal Planner");
    expect(pageSeo.vi.home.title).toContain("Pregnancy Meal Planner");
    expect(pageSeo.vi.home.description.length).toBeGreaterThan(120);
    expect(pageSeo.en.home.description.length).toBeGreaterThan(120);
  });

  it("exposes the creator credit and LinkedIn URL for the shared footer", () => {
    expect(footerCredit.label).toBe("Created by Lê Sỹ Cường");
    expect(footerCredit.href).toBe("https://www.linkedin.com/in/sycule/");
  });
});
