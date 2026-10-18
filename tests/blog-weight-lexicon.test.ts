import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * PMP-WL-02: published blog prose must not promote weight loss, weight control, or satiety.
 * Phrase and word-boundary matching so unrelated words (fulfilling, muslim) do not match.
 * Clinical red-flag wording that is not advice is allowlisted by exact context.
 */
const LEXICON: { name: string; pattern: RegExp }[] = [
  { name: "giảm cân", pattern: /giảm cân/iu },
  { name: "lấy lại vóc dáng", pattern: /lấy lại vóc dáng/iu },
  { name: "eo thon", pattern: /eo thon/iu },
  { name: "lose weight", pattern: /\blose weight\b/iu },
  { name: "losing weight", pattern: /\blosing weight\b/iu },
  { name: "lost weight", pattern: /\blost weight\b/iu },
  { name: "weight loss", pattern: /\bweight[\s-]*loss\b/iu },
  { name: "weight control", pattern: /\bweight control\b/iu },
  { name: "burn fat", pattern: /\bburn fat\b/iu },
  { name: "satiety", pattern: /\bsatiety\b/iu },
  { name: "slim down", pattern: /\bslim down\b/iu },
  { name: "slim", pattern: /\bslims?\b/iu },
  { name: "slimming", pattern: /\bslimming\b/iu },
  { name: "slimmer", pattern: /\bslimmer\b/iu },
  { name: "giảm béo", pattern: /giảm béo/iu },
  { name: "đốt mỡ", pattern: /đốt mỡ/iu },
  { name: "thon gọn", pattern: /thon gọn/iu },
  { name: "filling", pattern: /\bfilling\b/iu },
  { name: "fuller", pattern: /\bfuller\b/iu },
  { name: "fullness", pattern: /\bfullness\b/iu },
  { name: "feel full", pattern: /\bfeel full\b/iu },
  { name: "cảm giác no", pattern: /cảm giác no/iu },
  { name: "no lâu", pattern: /no lâu/iu },
  { name: "kiểm soát cân", pattern: /kiểm soát cân/iu },
  { name: "support healthy weight", pattern: /\bsupport healthy weight\b/iu },
  { name: "low in calories", pattern: /\blow in calories\b/iu },
  { name: "low calorie", pattern: /\blow[\s-]calorie\b/iu }
];

/** Exact contexts that are symptoms or care warnings, not weight or satiety advice. */
const ALLOWED_CONTEXTS = [
  "Unable to keep fluids 24 hours, weight loss, or dizziness",
  "Weight loss or failure to gain weight",
  "persistent vomiting, weight loss, and dehydration",
  "obvious weight loss",
  "if you are losing weight",
  "you may feel full quickly",
  "Reflux, early fullness, and blood glucose"
];

const CONTENT_DIRS = ["content/blog/posts", "content/blog/posts-en"];

type Hit = { file: string; field: string; name: string; snippet: string };

function isAllowed(text: string, index: number, length: number): boolean {
  return ALLOWED_CONTEXTS.some((context) => {
    const at = text.indexOf(context);
    if (at < 0) return false;
    return index >= at && index + length <= at + context.length;
  });
}

export function findLexiconHits(text: string, field = "text"): Hit[] {
  const hits: Hit[] = [];
  for (const { name, pattern } of LEXICON) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const re = new RegExp(pattern.source, flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      if (isAllowed(text, match.index, match[0].length)) continue;
      const start = Math.max(0, match.index - 40);
      const end = Math.min(text.length, match.index + match[0].length + 40);
      hits.push({
        file: "",
        field,
        name,
        snippet: text.slice(start, end).replace(/\s+/g, " ")
      });
    }
  }
  return hits;
}

function walkStrings(value: unknown, field: string, out: { field: string; text: string }[]) {
  if (typeof value === "string") {
    out.push({ field, text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, `${field}[${index}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walkStrings(child, field ? `${field}.${key}` : key, out);
    }
  }
}

function blogJsonFiles(): string[] {
  const files: string[] = [];
  for (const dir of CONTENT_DIRS) {
    for (const name of fs.readdirSync(dir)) {
      if (name.endsWith(".json")) files.push(path.join(dir, name));
    }
  }
  return files;
}

describe("blog weight-loss lexicon", () => {
  it("matches promotional phrases and ignores unrelated words", () => {
    expect(findLexiconHits("new mothers who want to lose weight").map((hit) => hit.name)).toContain("lose weight");
    expect(findLexiconHits("postpartum weight loss diet").map((hit) => hit.name)).toContain("weight loss");
    expect(findLexiconHits("weight-loss advice").map((hit) => hit.name)).toContain("weight loss");
    expect(findLexiconHits("a fulfilling plate of rice").length).toBe(0);
    expect(findLexiconHits("muslim communities and family meals").length).toBe(0);
    expect(findLexiconHits("Unable to keep fluids 24 hours, weight loss, or dizziness").length).toBe(0);
    expect(findLexiconHits("you may feel full quickly").length).toBe(0);
  });

  it("keeps weight-loss and satiety wording out of blog posts", () => {
    const hits: Hit[] = [];
    for (const file of blogJsonFiles()) {
      const post = JSON.parse(fs.readFileSync(file, "utf8")) as unknown;
      const strings: { field: string; text: string }[] = [];
      walkStrings(post, "", strings);
      for (const entry of strings) {
        for (const hit of findLexiconHits(entry.text, entry.field)) {
          hits.push({ ...hit, file });
        }
      }
    }

    expect(hits, hits.map((hit) => `${hit.file} [${hit.name}] ${hit.snippet}`).join("\n")).toEqual([]);
  });

  it("removed the ash-gourd weight-loss FAQ from the English article", () => {
    const file = path.join(
      "content/blog/posts-en",
      "bat-mi-phu-nu-sau-sinh-an-muop-duoc-khong-va-nhung-cong-dung-tu-muop-cho-san-phu.json"
    );
    const post = JSON.parse(fs.readFileSync(file, "utf8")) as {
      content: string;
      metaDescription?: string;
      faqs?: unknown;
    };
    expect(post.content).not.toMatch(/weight[\s-]*loss/i);
    expect(post.content).not.toMatch(/\blose weight\b/i);
    expect(post.content).not.toMatch(/\blow in calories\b/i);
    expect(post.content).toMatch(/Q1:/);
    expect(post.content).toMatch(/Q2: Are there any potential interactions/);
    expect(post.content).not.toMatch(/Q3:/);
    expect(post.metaDescription ?? "").not.toMatch(/weight[\s-]*loss|\blose weight\b/i);
    expect(post.faqs).toBeUndefined();
  });
});
