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
 * Weight-control advice in static copy. Serving words such as "phần ăn" stay.
 * "ăn ít muối" is blood-pressure guidance and is not this class.
 */
const BANNED: { name: string; pattern: RegExp }[] = [
  { name: "khẩu phần", pattern: /khẩu phần/iu },
  { name: "kiểm soát cân", pattern: /kiểm soát\s+(?:tăng\s+)?cân/iu },
  { name: "portion control", pattern: /portion control/i },
  { name: "portion guidance", pattern: /portion guidance/i },
  { name: "keep portions moderate", pattern: /keep (?:the |your )?portions? moderate/i },
  { name: "weight-gain control", pattern: /weight-?gain control|control weight/i },
  { name: "giữ dáng", pattern: /giữ dáng/iu },
  { name: "ăn ít", pattern: /(?<![\p{L}\p{N}])ăn ít(?!\s+muối)(?![\p{L}\p{N}])/iu },
  { name: "eat less", pattern: /(?<![\p{L}\p{N}])eat less(?!\s+(?:salt|sugar|sweet))(?![\p{L}\p{N}])/iu }
];

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
    expect(english.reason).not.toMatch(/portion control|weight/i);
  });

  it("scans static Vietnamese and English strings for weight-control phrasing", () => {
    const hits: string[] = [];
    for (const file of staticFiles()) {
      const lines = readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        for (const rule of BANNED) {
          if (rule.pattern.test(line)) hits.push(`${file}:${index + 1} ${rule.name}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });
});
