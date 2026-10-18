import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { breakfastMeals, findMealRecordByName, flattenMealIngredients, mainMeals, snackMeals } from "@/lib/nutrition/mealDatabase";
import { localizeMealText } from "@/lib/nutrition/mealLocales";
import { NOTE_LIBRARY } from "@/lib/nutrition/noteLibrary";
import { getConditionSpecificWarnings, getGeneralPregnancyFoodWarnings } from "@/lib/nutrition/safetyRules";
import type { PregnancyProfile } from "@/types/pregnancy";

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
  { name: "filling", pattern: new RegExp(`(?<!${EDGE})filling(?!${EDGE})`, "u") },
  { name: "fullness", pattern: new RegExp(`(?<!${EDGE})fullness(?!${EDGE})`, "u") },
  { name: "hearty", pattern: new RegExp(`(?<!${EDGE})hearty(?!${EDGE})`, "u") },
  { name: "satisfying", pattern: new RegExp(`(?<!${EDGE})satisfying(?!${EDGE})`, "u") },
  { name: "no ăn lâu", pattern: new RegExp(`(?<!${EDGE})no an lau(?!${EDGE})`, "u") },
  { name: "chắc bụng", pattern: new RegExp(`(?<!${EDGE})chac bung(?!${EDGE})`, "u") },
  { name: "đỡ đói", pattern: new RegExp(`(?<!${EDGE})do doi(?!${EDGE})`, "u") },
  { name: "no dai", pattern: new RegExp(`(?<!${EDGE})no dai(?!${EDGE})`, "u") },
  { name: "cảm giác no", pattern: new RegExp(`(?<!${EDGE})cam giac no(?!${EDGE})`, "u") },
  { name: "satiety", pattern: new RegExp(`(?<!${EDGE})satiety(?!${EDGE})`, "u") },
  { name: "calorie deficit", pattern: /calorie deficit/u },
  { name: "appetite", pattern: new RegExp(`(?<!${EDGE})appetite(?!${EDGE})`, "u") },
  { name: "several small meals", pattern: /several small meals/u },
  { name: "nhiều bữa nhỏ", pattern: new RegExp(`(?<!${EDGE})nhieu bua nho(?!${EDGE})`, "u") }
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

function lexiconHits(lines: readonly string[], label: string): string[] {
  const hits: string[] = [];
  lines.forEach((line, index) => {
    const folded = foldLine(line);
    for (const stem of STEMS) {
      if (stem.pattern.test(folded)) hits.push(`${label}:${index + 1} ${stem.name}`);
    }
  });
  return hits;
}

const sampleProfile: PregnancyProfile = {
  pregnancyWeek: 24,
  pregnancyType: "singleton",
  age: 30,
  heightCm: 160,
  prePregnancyWeightKg: 52,
  currentWeightKg: 58,
  activityLevel: "light",
  healthConditions: ["none"],
  cuisinePreferences: ["vietnamese_rice"],
  budget: "medium",
  cookingTime: "around_30",
  goals: ["balanced"]
};

function visibleCopy(): string[] {
  const lines: string[] = [];
  for (const meal of [...breakfastMeals, ...mainMeals, ...snackMeals]) {
    for (const locale of ["vi", "en"] as const) {
      const text = localizeMealText(meal.id, locale, {
        reason: meal.reason,
        nutrients: meal.nutrients,
        caution: meal.caution
      });
      lines.push(text.name, text.reason, text.caution ?? "", ...text.nutrients, ...flattenMealIngredients(meal));
    }
  }
  for (const note of NOTE_LIBRARY) lines.push(note.vi, note.en);
  const profiles: PregnancyProfile[] = [
    sampleProfile,
    { ...sampleProfile, healthConditions: ["reflux"] },
    { ...sampleProfile, healthConditions: ["morning_sickness"], goals: ["reduce_nausea"] },
    { ...sampleProfile, healthConditions: ["fast_weight_gain"], goals: ["weight_control"] },
    { ...sampleProfile, healthConditions: ["gestational_diabetes"], goals: ["blood_sugar_control"] }
  ];
  for (const profile of profiles) {
    lines.push(...getConditionSpecificWarnings(profile, "vi"), ...getConditionSpecificWarnings(profile, "en"));
  }
  lines.push(...getGeneralPregnancyFoodWarnings("vi"), ...getGeneralPregnancyFoodWarnings("en"));
  return lines;
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

  it("names the satiety stems beyond full and fuller", () => {
    const names = STEMS.map((stem) => stem.name);
    for (const name of ["filling", "hearty", "satisfying", "no ăn lâu", "chắc bụng", "đỡ đói", "fullness"]) {
      expect(names).toContain(name);
    }
  });

  it("scans static Vietnamese and English strings for weight-control phrasing", () => {
    const hits: string[] = [];
    for (const file of staticFiles()) {
      const lines = readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
      hits.push(...lexiconHits(lines, file));
    }
    hits.push(...lexiconHits(visibleCopy(), "visible"));
    expect(hits).toEqual([]);
  });

  it("keeps the reflux note as comfort copy and keeps several small meals out of the library", () => {
    expect(getConditionSpecificWarnings({ ...sampleProfile, healthConditions: ["reflux"] }, "vi")).toEqual([
      "Chia nhỏ bữa ăn, ăn chậm, không nằm ngay sau ăn."
    ]);
    expect(getConditionSpecificWarnings({ ...sampleProfile, healthConditions: ["reflux"] }, "en")).toEqual([
      "Eat smaller meals slowly, and don't lie down right after."
    ]);
    expect(getConditionSpecificWarnings({ ...sampleProfile, healthConditions: ["fast_weight_gain"], goals: ["weight_control"] }, "en").join(" ")).not.toMatch(
      /several small meals/i
    );
    for (const note of NOTE_LIBRARY) {
      expect(note.en).not.toMatch(/several small meals/i);
      expect(note.vi).not.toMatch(/nhiều bữa nhỏ/);
      const namesSprouts = /giá|mầm|sprout/i.test(`${note.vi} ${note.en}`);
      if (!namesSprouts) continue;
      expect(note.vi).toMatch(/nấu chín kỹ/);
      expect(note.en.toLowerCase()).toContain("well cooked");
    }
    const leftovers = NOTE_LIBRARY.find((note) => note.id === "safety-leftovers");
    expect(leftovers?.vi).toContain("2 giờ");
    expect(leftovers?.vi).toContain("24 giờ");
    expect(leftovers?.en.toLowerCase()).toContain("steaming hot all the way through");
    expect(leftovers?.en.toLowerCase()).toContain("same day");
  });
});
