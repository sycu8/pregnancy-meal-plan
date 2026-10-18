import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BLOG_WEIGHT_LEXICON, findWeightLexiconHits, foldLexiconText } from "@/lib/nutrition/weightLexicon";

/**
 * PMP-WL-02: published blog prose must not promote weight loss, weight control, or satiety.
 * Matching lives in the shared lexicon (NFC plus an accent-folded copy).
 * Clinical red-flag wording that is not advice is allowlisted by exact context.
 * Blog posts use the blog phrase list, not the planner stems for fetal weight or appetite.
 */

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
const PLANNER_FILES = ["src/lib/nutrition/mealLocales.ts", "src/lib/nutrition/nutrientGuidance.ts"];

const UNACCENTED_PHRASES = ["giam can", "lay lai voc dang", "eo thon", "no lau", "chac bung", "do doi"];
const NFD_PHRASES = ["giảm cân", "lấy lại vóc dáng", "eo thon", "no lâu", "chắc bụng", "đỡ đói"];
const ENGLISH_PHRASES = [
  "weight management",
  "shed pounds",
  "slim down",
  "stay full",
  "curb appetite",
  "prevent hunger",
  "support healthy weight",
  "healthy weight"
];

type Hit = { file: string; field: string; name: string; snippet: string };

export function findLexiconHits(text: string, field = "text"): Hit[] {
  const folded = foldLexiconText(text);
  return findWeightLexiconHits(text, BLOG_WEIGHT_LEXICON, ALLOWED_CONTEXTS).map((hit) => {
    const start = Math.max(0, hit.index - 40);
    const end = Math.min(folded.length, hit.index + hit.length + 40);
    return {
      file: "",
      field,
      name: hit.name,
      snippet: folded.slice(start, end).replace(/\s+/g, " ")
    };
  });
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
    expect(findLexiconHits("mang theo thông tin thực phẩm đã dùng").length).toBe(0);
    expect(findLexiconHits("mang theo thong tin thuc pham da dung").length).toBe(0);
  });

  it("still allows severe-nausea and hyperemesis weight-loss warnings", () => {
    for (const context of ALLOWED_CONTEXTS) {
      expect(findLexiconHits(context).length, context).toBe(0);
    }
  });

  it("fails on unaccented and NFD promoting phrases and passes once they are gone", () => {
    for (const phrase of UNACCENTED_PHRASES) {
      expect(findLexiconHits(`Advice: ${phrase} now.`).length, phrase).toBeGreaterThan(0);
    }
    for (const phrase of NFD_PHRASES) {
      const nfc = phrase.normalize("NFC");
      const nfd = phrase.normalize("NFD");
      if ([...nfc].some((char) => char.normalize("NFD") !== char)) {
        expect(nfd, phrase).not.toBe(nfc);
      }
      expect(findLexiconHits(`Loi khuyen: ${nfd}.`).length, `NFD ${phrase}`).toBeGreaterThan(0);
    }
    for (const phrase of ENGLISH_PHRASES) {
      expect(findLexiconHits(`Advice: ${phrase} now.`).length, phrase).toBeGreaterThan(0);
    }

    expect(findLexiconHits("Advice: balanced plates with protein, vegetables, and starch.").length).toBe(0);
    expect(findLexiconHits("Bữa ăn đủ đạm, rau, và tinh bột.").length).toBe(0);
    expect(findLexiconHits("an uong can bang, du dam, rau, va tinh bot.").length).toBe(0);
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

  it("keeps the lexicon out of planner locale copy", () => {
    const hits: Hit[] = [];
    for (const file of PLANNER_FILES) {
      const text = fs.readFileSync(file, "utf8");
      for (const hit of findLexiconHits(text, "source")) {
        hits.push({ ...hit, file });
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
