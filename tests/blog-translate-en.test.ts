import { describe, expect, it } from "vitest";
import { __translateTestUtils } from "@/lib/blog/synthesis/translatePostToEn";
import { isUsableEnglishTranslation } from "@/lib/blog/localize";

describe("Workers AI EN translation helpers", () => {
  it("parses tagged TITLE/CONTENT model output", () => {
    const parsed = __translateTestUtils.parseTaggedTranslation(`TITLE: Iron tips for pregnancy
EXCERPT: Practical iron foods for pregnancy.
META_TITLE: Iron tips for pregnancy
META_DESCRIPTION: Practical iron meal ideas for pregnancy with food-first tips and clinician guidance for expectant parents.
CONTENT:
## Summary

Iron supports maternal blood volume.

## Practical tips

- Pair plant iron with vitamin C.
FAQS:
Q1: Do I need supplements?
A1: Ask your clinician first.
Q2: Which foods help?
A2: Lentils, eggs, and leafy greens.
Q3: When to seek care?
A3: Severe dizziness or fainting needs review.`);

    expect(parsed?.title).toBe("Iron tips for pregnancy");
    expect(String(parsed?.content)).toContain("## Summary");
    expect(String(parsed?.content)).not.toContain("FAQS:");
    expect(parsed?.faqs).toHaveLength(3);
  });

  it("accepts usable English overlays and rejects Vietnamese titles", () => {
    const body = [
      "## Summary",
      "",
      "Iron supports maternal blood volume and fetal growth during pregnancy. Food-first strategies help many people meet higher needs.",
      "",
      "## Practical tips",
      "",
      "- Pair plant iron with vitamin C at meals.",
      "- Include eggs, lentils, tofu, and dark leafy greens across the week.",
      "- Ask your clinician before high-dose iron supplements.",
      "- Keep hydrated and combine iron foods with balanced proteins and carbs.",
      "",
      "## Sample ideas",
      "",
      "Try lentil soup with citrus, egg-and-spinach bowls, or a fortified cereal breakfast with fruit.",
      "",
      "## Seek care",
      "",
      "Severe dizziness, fainting, or very low energy needs medical review. This article is educational only."
    ].join("\n");

    const good = __translateTestUtils.toTranslation("iron-tips", {
      title: "Iron-rich foods for pregnancy",
      excerpt: "Practical meal ideas to support iron intake during pregnancy.",
      content: body,
      metaTitle: "Iron-rich foods for pregnancy",
      metaDescription: "Practical iron meal ideas for pregnancy with food-first tips and clinician guidance.",
      faqs: [{ question: "Do I need supplements?", answer: "Ask your clinician; food-first is often preferred." }]
    });
    expect(good).not.toBeNull();
    expect(isUsableEnglishTranslation(good!)).toBe(true);

    const bad = __translateTestUtils.toTranslation("iron-tips", {
      title: "Bổ sung sắt cho mẹ bầu",
      excerpt: "Gợi ý thực phẩm",
      content: "Nội dung tiếng Việt ".repeat(40)
    });
    expect(bad).toBeNull();
  });
});
