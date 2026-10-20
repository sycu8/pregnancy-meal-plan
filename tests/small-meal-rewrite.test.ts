import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { synthesizePost } from "@/lib/blog/synthesis/synthesizePost";
import {
  BLOOD_SUGAR_EN,
  BLOOD_SUGAR_VI,
  HYDRATION_EN,
  HYDRATION_VI,
  RULING_EN,
  RULING_VI,
  findRewriteProblems
} from "@/lib/blog/synthesis/smallMealCopy";

const SCAN_DIRS = ["content/blog/posts", "content/blog/posts-en", "content/blog/queue"];
const SCAN_FILES = [
  "scripts/blog-en-bodies.mjs",
  "scripts/blog-en-translations-data.mjs",
  "scripts/add-blog-seeds.ts",
  "scripts/fix-new-blog-accuracy.ts",
  "src/lib/blog/synthesis/editorialTopics.ts",
  "src/lib/blog/synthesis/synthesizePost.ts",
  "src/lib/nutrition/safetyRules.ts"
];

function readStrings(file: string): string[] {
  const raw = fs.readFileSync(file, "utf8");
  if (!file.endsWith(".json")) return [raw];
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") out.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(JSON.parse(raw) as unknown);
  return out;
}

function filesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => path.join(dir, name));
}

describe("small-meal rewrite generator", () => {
  it("ends every rewritten sentence with punctuation and has no capital after a comma", () => {
    const problems: string[] = [];
    const files = [...SCAN_DIRS.flatMap(filesIn), ...SCAN_FILES.filter((file) => fs.existsSync(file))];
    for (const file of files) {
      for (const text of readStrings(file)) {
        for (const problem of findRewriteProblems(text)) {
          problems.push(`${file} [${problem.kind}] ${problem.snippet}`);
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("keeps ruling (a), hydration, and the blood-sugar reason as their own sentences", () => {
    const synthesized = synthesizePost({
      title: "Iron-rich 7-day pregnancy meal plan",
      titleVi: "Thực đơn mẹ bầu 7 ngày giàu sắt",
      snippet: "Meal ideas that help boost iron intake during pregnancy.",
      snippetVi: "Gợi ý món giúp bổ sung sắt khi mang thai.",
      sourceName: "Editorial",
      url: "https://pregnancymeal.tips/blog/topics#demo"
    });
    expect(synthesized.content).toContain(`${RULING_VI}.`);
    expect(synthesized.content).toContain(HYDRATION_VI);
    expect(synthesized.en.content).toContain(`${RULING_EN}.`);
    expect(synthesized.en.content).toContain(HYDRATION_EN);
    expect(synthesized.content).not.toContain("khẩu phần");
    expect(synthesized.en.content).not.toMatch(/\bportions?\b/i);

    const viGdm = fs.readFileSync(
      "content/blog/posts/gestational-diabetes-meal-ideas-balanced-carbs-protein-and-fiber-b465ff.json",
      "utf8"
    );
    const enGdm = fs.readFileSync(
      "content/blog/posts-en/gestational-diabetes-meal-ideas-balanced-carbs-protein-and-fiber-b465ff.json",
      "utf8"
    );
    expect(viGdm).toContain(`${RULING_VI}.`);
    expect(viGdm).toContain(BLOOD_SUGAR_VI);
    expect(enGdm).toContain(`${RULING_EN}.`);
    expect(enGdm).toContain(BLOOD_SUGAR_EN);
    expect(viGdm).not.toMatch(/cảm giác đói|no lâu|giảm cân/);
    expect(enGdm).not.toMatch(/feel full|portion control|weight loss/i);
  });
});
