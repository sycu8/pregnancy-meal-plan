import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findMealRecordByName } from "@/lib/nutrition/mealDatabase";
import { localizeMealText } from "@/lib/nutrition/mealLocales";

const ROOT = path.resolve(__dirname, "..");

/** Shown to users. The model ban and the note filter name these ideas on purpose. */
const SKIP_FILES = new Set([
  "src/lib/nutrition/aiNoteSafety.ts",
  "src/lib/nutrition/aiPromptBuilder.ts",
  "src/lib/nutrition/weightLossReview.ts",
  "src/lib/cloudflare/aiClient.ts"
]);

const SCAN_ROOTS = [
  "src/components",
  "src/lib/nutrition",
  "src/lib/i18n.ts",
  "src/lib/faq.ts",
  "src/lib/legal",
  "src/lib/blog/categories.ts",
  "src/lib/blog/synthesis/editorialTopics.ts",
  "docs/STORE_SUBMISSION.md"
];

/**
 * Accent-folded stems. full(er) matches full and fuller, not fully.
 * A hyphen or underscore is part of a code token (w-full, fast_weight_gain), not copy.
 */
const EDGE = "[\\p{L}\\p{N}_-]";
const STEMS: { name: string; pattern: RegExp }[] = [
  { name: "giảm cân", pattern: new RegExp(`(?<!${EDGE})giam can(?!${EDGE})`, "u") },
  { name: "kiểm soát", pattern: new RegExp(`(?<!${EDGE})kiem soat(?!${EDGE})`, "u") },
  { name: "khẩu phần", pattern: new RegExp(`(?<!${EDGE})khau phan(?!${EDGE})`, "u") },
  { name: "no lâu", pattern: new RegExp(`(?<!${EDGE})no lau(?!${EDGE})`, "u") },
  { name: "ít calo", pattern: new RegExp(`(?<!${EDGE})it calo(?!${EDGE})`, "u") },
  { name: "giữ dáng", pattern: new RegExp(`(?<!${EDGE})giu dang(?!${EDGE})`, "u") },
  { name: "weight", pattern: new RegExp(`(?<!${EDGE})weight(?!${EDGE})`, "u") },
  { name: "portion", pattern: new RegExp(`(?<!${EDGE})portions?(?!${EDGE})`, "u") },
  { name: "full(er)", pattern: new RegExp(`(?<!${EDGE})full(?:er)?(?!${EDGE})`, "u") },
  { name: "satiety", pattern: new RegExp(`(?<!${EDGE})satiety(?!${EDGE})`, "u") },
  { name: "calorie deficit", pattern: /calorie deficit/u },
  { name: "appetite", pattern: new RegExp(`(?<!${EDGE})appetite(?!${EDGE})`, "u") }
];

function foldLine(line: string): string {
  return line.normalize("NFC").normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
}

function filesUnder(relative: string): string[] {
  const absolute = path.join(ROOT, relative);
  const info = statSync(absolute);
  if (info.isFile()) return [relative];
  const found: string[] = [];
  for (const entry of readdirSync(absolute)) {
    const child = path.join(relative, entry);
    const childInfo = statSync(path.join(ROOT, child));
    if (childInfo.isDirectory()) found.push(...filesUnder(child));
    else if (/\.(ts|tsx|md)$/.test(entry)) found.push(child);
  }
  return found;
}

function staticFiles(): string[] {
  return SCAN_ROOTS.flatMap(filesUnder).filter((file) => !SKIP_FILES.has(file.split(path.sep).join("/")));
}

describe("static weight-control copy", () => {
  it("does not tell a weight-control profile to control portions", () => {
    const meal = findMealRecordByName("Gà luộc cơm rau luộc");
    expect(meal?.reason).toBe("Đơn giản, ít dầu, có rau và đạm nạc.");
    const english = localizeMealText("Gà luộc cơm rau luộc", "en", {
      reason: meal?.reason ?? "",
      nutrients: meal?.nutrients ?? []
    });
    expect(english.reason).toBe("Simple and low in oil, with greens and lean protein.");
    expect(foldLine(english.reason)).not.toMatch(new RegExp(`(?<!${EDGE})weight(?!${EDGE})`, "u"));
    expect(foldLine(english.reason)).not.toMatch(new RegExp(`(?<!${EDGE})portions?(?!${EDGE})`, "u"));
  });

  it("scans static Vietnamese and English strings for weight-control phrasing", () => {
    const hits: string[] = [];
    for (const file of staticFiles()) {
      const lines = readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        const folded = foldLine(line);
        for (const stem of STEMS) {
          if (stem.pattern.test(folded)) hits.push(`${file}:${index + 1} ${stem.name}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });
});
