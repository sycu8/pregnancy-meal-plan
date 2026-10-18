import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { WEIGHT_LEXICON, findWeightLexiconHits, foldLexiconText } from "@/lib/nutrition/weightLexicon";

/**
 * PMP-WL-02: published blog prose must not promote weight loss, weight control, or satiety.
 * Phrase and word-boundary matching so unrelated words (fulfilling, muslim) do not match.
 * Scanned text is NFC-normalized, and an accent-folded copy is matched too
 * (đ→d, then strip combining diacritics / tone marks) so unaccented and NFD text hit.
 * Clinical red-flag wording that is not advice is allowlisted by exact context.
 * The scan uses the full shared list, including the stems the earlier subset skipped.
 */
const LEXICON: { name: string; pattern: RegExp }[] = [
  { name: "giảm cân", pattern: /giảm cân/iu },
  { name: "giam can", pattern: /\bgiam can\b/iu },
  { name: "lấy lại vóc dáng", pattern: /lấy lại vóc dáng/iu },
  { name: "lay lai voc dang", pattern: /\blay lai voc dang\b/iu },
  { name: "eo thon", pattern: /\beo thon\b/iu },
  { name: "lose weight", pattern: /\blose weight\b/iu },
  { name: "losing weight", pattern: /\blosing weight\b/iu },
  { name: "lost weight", pattern: /\blost weight\b/iu },
  { name: "weight loss", pattern: /\bweight[\s-]*loss\b/iu },
  { name: "weight control", pattern: /\bweight control\b/iu },
  { name: "weight management", pattern: /\bweight management\b/iu },
  { name: "shed pounds", pattern: /\bshed pounds\b/iu },
  { name: "burn fat", pattern: /\bburn fat\b/iu },
  { name: "satiety", pattern: /\bsatiety\b/iu },
  { name: "slim down", pattern: /\bslim down\b/iu },
  { name: "slim", pattern: /\bslims?\b/iu },
  { name: "slimming", pattern: /\bslimming\b/iu },
  { name: "slimmer", pattern: /\bslimmer\b/iu },
  { name: "giảm béo", pattern: /giảm béo/iu },
  { name: "đốt mỡ", pattern: /đốt mỡ/iu },
  { name: "thon gọn", pattern: /thon gọn/iu },
  { name: "chắc bụng", pattern: /chắc bụng/iu },
  { name: "chac bung", pattern: /\bchac bung\b/iu },
  { name: "đỡ đói", pattern: /đỡ đói/iu },
  { name: "do doi", pattern: /\bdo doi\b/iu },
  { name: "filling", pattern: /\bfilling\b/iu },
  { name: "fuller", pattern: /\bfuller\b/iu },
  { name: "fullness", pattern: /\bfullness\b/iu },
  { name: "feel full", pattern: /\bfeel full\b/iu },
  { name: "stay full", pattern: /\bstay full\b/iu },
  { name: "cảm giác no", pattern: /cảm giác no/iu },
  { name: "no lâu", pattern: /no lâu/iu },
  { name: "no lau", pattern: /\bno lau\b/iu },
  { name: "kiểm soát cân", pattern: /kiểm soát cân/iu },
  { name: "curb appetite", pattern: /\bcurb appetite\b/iu },
  { name: "prevent hunger", pattern: /\bprevent hunger\b/iu },
  { name: "support healthy weight", pattern: /\bsupport healthy weight\b/iu },
  { name: "healthy weight", pattern: /\bhealthy weight\b/iu },
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

/** đ→d, then drop combining marks. Input is NFC so precomposed tones decompose first. */
function foldAccents(text: string): string {
  return text.normalize("NFD").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/\p{M}/gu, "");
}

function withBoundaries(pattern: RegExp): RegExp {
  const source = pattern.source;
  const start = source.startsWith("\\b") ? source : `\\b(?:${source})`;
  const full = start.endsWith("\\b") ? start : `${start}\\b`;
  return new RegExp(full, pattern.flags);
}

function foldedPattern(pattern: RegExp): RegExp {
  return withBoundaries(new RegExp(foldAccents(pattern.source), pattern.flags));
}

function isAllowed(text: string, index: number, length: number): boolean {
  return ALLOWED_CONTEXTS.some((context) => {
    const foldedContext = foldAccents(context.normalize("NFC"));
    const candidates = context === foldedContext ? [context] : [context, foldedContext];
    return candidates.some((candidate) => {
      const at = text.indexOf(candidate);
      if (at < 0) return false;
      return index >= at && index + length <= at + candidate.length;
    });
  });
}

function collectHits(text: string, lexicon: { name: string; pattern: RegExp }[], field: string): Hit[] {
  const hits: Hit[] = [];
  for (const { name, pattern } of lexicon) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const re = new RegExp(pattern.source, flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      if (match[0].length === 0) break;
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

export function findLexiconHits(text: string, field = "text"): Hit[] {
  const nfc = text.normalize("NFC");
  const hits = collectHits(nfc, LEXICON, field);
  const folded = foldAccents(nfc);
  if (folded !== nfc) {
    const foldedLexicon = LEXICON.map(({ name, pattern }) => ({
      name,
      pattern: foldedPattern(pattern)
    }));
    hits.push(...collectHits(folded, foldedLexicon, field));
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
    expect(findLexiconHits("keeps you full").map((hit) => hit.name)).toContain("full(er)");
    expect(findLexiconHits("full thaw in the fridge").length).toBe(0);
    expect(findLexiconHits("nó lâu rồi mới nói").length).toBe(0);
    expect(findLexiconHits("no lâu hơn").map((hit) => hit.name)).toContain("no lâu");
    expect(findLexiconHits("ăn ít nhất 2 phần").length).toBe(0);
    expect(findLexiconHits("ăn ít muối khi tăng huyết áp").length).toBe(0);
    expect(findLexiconHits("kiểm soát đường huyết theo bác sĩ").length).toBe(0);
    expect(findLexiconHits("thêm an toàn khi rửa rau").length).toBe(0);
    expect(findLexiconHits("give them an apple").length).toBe(0);
    expect(findLexiconHits("please give them an orange").length).toBe(0);
    expect(findLexiconHits("for them an apple").length).toBe(0);
    expect(findLexiconHits("feed them an apple").length).toBe(0);
    expect(findLexiconHits("mổ bụng").length).toBe(0);
    expect(findLexiconHits("chống đối").length).toBe(0);
    expect(findLexiconHits("con đòi").length).toBe(0);
    expect(findLexiconHits("còn đói").length).toBe(0);
    expect(findLexiconHits("liều lượng an toàn").length).toBe(0);
    expect(findLexiconHits("healthy weight gain in pregnancy").length).toBe(0);
    expect(findLexiconHits("a cooked protein portion of 100 g").length).toBe(0);
    expect(findLexiconHits("một lượng nhỏ omega-3").length).toBe(0);
    expect(findLexiconHits("thèm ăn đất, bột sắn").length).toBe(0);
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
