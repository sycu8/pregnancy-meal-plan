import { describe, expect, it } from "vitest";
import {
  BRAND_NAME,
  faqPageStructuredData,
  localizedPath,
  pageSeo,
  stripLocaleFromPath,
  structuredData
} from "@/lib/i18n";

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

  it("keeps primary meta descriptions in the 100-130 character window", () => {
    expect(BRAND_NAME).toBe("Pregnancy Meal Planner");
    expect(pageSeo.en.home.title).toContain("Pregnancy Meal Planner");
    expect(pageSeo.vi.home.title).toContain("Pregnancy Meal Planner");

    for (const locale of ["en", "vi"] as const) {
      for (const page of Object.keys(pageSeo[locale]) as Array<keyof (typeof pageSeo)["en"]>) {
        const length = pageSeo[locale][page].description.length;
        expect(length, `${locale}.${page}`).toBeGreaterThanOrEqual(100);
        expect(length, `${locale}.${page}`).toBeLessThanOrEqual(130);
      }
    }
  });

  it("emits homepage structured data without FAQPage or MobileApplication", () => {
    const data = structuredData("en");
    const types = data["@graph"].map((node) => node["@type"]);
    expect(types).toEqual(["WebSite", "Organization", "WebApplication"]);
    expect(JSON.stringify(data)).not.toContain("FAQPage");
    expect(JSON.stringify(data)).not.toContain("MobileApplication");
    expect(JSON.stringify(data)).not.toContain("suggestedGender");
  });

  it("keeps FAQPage structured data on support pages only", () => {
    const faq = faqPageStructuredData("en");
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity.length).toBeGreaterThan(0);
    expect(faq.url).toContain("/support");
  });
});
