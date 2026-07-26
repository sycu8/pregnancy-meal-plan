import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { looksLikePersonNameTitle, reviewBlogSeedRelevance } from "@/lib/blog/ingestion/relevance";
import { blogSources } from "@/lib/blog/ingestion/sources";

describe("blog seed relevance review", () => {
  it("rejects Vinmec professional profile pages that previously slipped through", () => {
    const result = reviewBlogSeedRelevance({
      title: "Nguyen Thai Bao",
      snippet: "",
      url: "https://www.vinmec.com/eng/professionals/nguyen-thai-bao-51534-en"
    });
    expect(result.ok).toBe(false);
  });

  it("rejects Health Canada corporate evaluation reports", () => {
    const result = reviewBlogSeedRelevance({
      title: "Results at a glance: Evaluation of the Public Health Agency of Canada’s Blood Safety Contribution Program",
      snippet: "Evaluation findings for a federal blood safety program.",
      url: "https://www.canada.ca/en/public-health/corporate/transparency/corporate-management-reporting/evaluation/results-glance-blood-safety-contribution-program.html"
    });
    expect(result.ok).toBe(false);
  });

  it("accepts on-topic pregnancy nutrition articles", () => {
    const result = reviewBlogSeedRelevance({
      title: "Iron-rich meals for the second trimester",
      snippet: "Practical pregnancy nutrition tips for preventing anemia.",
      url: "https://example.com/blog/iron-rich-meals-second-trimester"
    });
    expect(result).toEqual({ ok: true });
  });

  it("accepts Vietnamese pregnancy diet topics", () => {
    const result = reviewBlogSeedRelevance({
      title: "Thực đơn dinh dưỡng cho mẹ bầu tam cá nguyệt 1",
      snippet: "Gợi ý ăn uống khi mang thai để giảm nghén.",
      url: "https://www.vinmec.com/vie/bai-viet/thuc-don-dinh-duong-me-bau"
    });
    expect(result).toEqual({ ok: true });
  });

  it("lets editorial seeds through even when the URL is unusual", () => {
    const result = reviewBlogSeedRelevance({
      title: "Custom planner tip",
      snippet: "",
      url: "https://pregnancymeal.tips/internal/seed",
      editorial: true
    });
    expect(result).toEqual({ ok: true });
  });

  it("detects person-name titles", () => {
    expect(looksLikePersonNameTitle("Nguyen Thai Hung")).toBe(true);
    expect(looksLikePersonNameTitle("Pregnancy snack ideas for week 20")).toBe(false);
  });

  it("tightens Vinmec source config away from /eng/ professionals", () => {
    const vinmec = blogSources.find((source) => source.name === "Vinmec");
    expect(vinmec?.allowedPaths?.some((p) => p === "/eng/")).toBe(false);
    expect(vinmec?.deniedPaths?.some((p) => p.includes("professionals"))).toBe(true);
    expect(vinmec?.topics.includes("thai")).toBe(false);
  });

  it("runs relevance review before AI synthesis in the publish script", () => {
    const source = readFileSync(join(process.cwd(), "scripts/publish-queued-posts.ts"), "utf8");
    expect(source).toContain("reviewBlogSeedRelevance");
    expect(source).toContain('status: "rejected"');
    expect(source.indexOf("reviewBlogSeedRelevance")).toBeLessThan(source.indexOf("synthesizePostWithAi"));
  });
});
