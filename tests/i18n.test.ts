import { describe, expect, it } from "vitest";
import { footerCredit, localizedPath, pageSeo, stripLocaleFromPath } from "@/lib/i18n";

describe("i18n routing", () => {
  it("keeps Vietnamese routes at the root and prefixes English routes with /en", () => {
    expect(localizedPath("vi", "/")).toBe("/");
    expect(localizedPath("vi", "/planner")).toBe("/planner");
    expect(localizedPath("en", "/")).toBe("/en");
    expect(localizedPath("en", "/planner")).toBe("/en/planner");
  });

  it("normalizes English paths back to their canonical route key", () => {
    expect(stripLocaleFromPath("/en")).toBe("/");
    expect(stripLocaleFromPath("/en/history")).toBe("/history");
    expect(stripLocaleFromPath("/profile")).toBe("/profile");
  });

  it("provides SEO copy for both primary languages", () => {
    expect(pageSeo.vi.home.title).toContain("Bầu Ăn Gì");
    expect(pageSeo.en.home.title).toContain("Pregnancy Meal Planner");
    expect(pageSeo.vi.home.description.length).toBeGreaterThan(120);
    expect(pageSeo.en.home.description.length).toBeGreaterThan(120);
  });

  it("exposes the creator credit and LinkedIn URL for the shared footer", () => {
    expect(footerCredit.label).toBe("Created by Lê Sỹ Cường");
    expect(footerCredit.href).toBe("https://www.linkedin.com/in/sycule/");
  });
});
