import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { howToStructuredData, shortFaq, shortFaqStructuredData } from "@/lib/aeo";
import { ORANGE_CLOUD_PERSON_ID } from "@/lib/orangeCloud";
import { structuredData } from "@/lib/i18n";

describe("homepage AEO schema", () => {
  it("publishes FAQPage and HowTo in both languages with the Orange Cloud person id", () => {
    for (const locale of ["vi", "en"] as const) {
      const faq = shortFaqStructuredData(locale);
      const howTo = howToStructuredData(locale);

      expect(faq["@type"]).toBe("FAQPage");
      expect(howTo["@type"]).toBe("HowTo");
      expect(faq.author).toEqual({ "@id": ORANGE_CLOUD_PERSON_ID });
      expect(howTo.author).toEqual({ "@id": ORANGE_CLOUD_PERSON_ID });
      expect(faq.mainEntity.map((item) => item.name)).toEqual(shortFaq[locale].map((item) => item.question));
      expect(faq.mainEntity.map((item) => item.acceptedAnswer.text)).toEqual(shortFaq[locale].map((item) => item.answer));
      expect(howTo.step).toHaveLength(4);
      expect(JSON.stringify({ faq, howTo })).not.toMatch(/\b(911|112|999|114)\b/);
    }

    expect(shortFaqStructuredData("vi").url).toBe("https://pregnancymeal.tips/vi");
    expect(shortFaqStructuredData("en").url).toBe("https://pregnancymeal.tips/");
    expect(structuredData("en")["@graph"][0]?.["@id"]).toBe(ORANGE_CLOUD_PERSON_ID);
  });

  it("links the live site, hub, and sibling projects from the README and footer", () => {
    const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
    const footer = readFileSync(join(process.cwd(), "src/components/shared/SiteFooter.tsx"), "utf8");
    const hub = readFileSync(join(process.cwd(), "src/lib/orangeCloud.ts"), "utf8");
    const wrangler = readFileSync(join(process.cwd(), "wrangler.jsonc"), "utf8");
    const home = readFileSync(join(process.cwd(), "src/components/home/HomeAeo.tsx"), "utf8");

    expect(readme).toContain("https://pregnancymeal.tips");
    expect(footer).toContain("ORANGE_CLOUD_HUB");
    expect(footer).toContain("siblingProjects");
    expect(hub).toContain('export const ORANGE_CLOUD_HUB = "https://orangecloud.vn"');
    expect(hub).toContain("https://onboarding.orangecloud.vn/");
    expect(hub).toContain("https://ready.orangecloud.vn/");
    expect(hub).toContain("https://blog.orangecloud.vn/");
    expect(wrangler).toContain('"workers_dev": false');
    expect(home).toContain("shortFaqStructuredData");
    expect(home).toContain("howToStructuredData");
  });
});
