import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { breakfastMeals, findMealRecordByName, flattenMealIngredients, mainMeals, snackMeals } from "@/lib/nutrition/mealDatabase";
import { localizeMealText } from "@/lib/nutrition/mealLocales";
import { NOTE_LIBRARY } from "@/lib/nutrition/noteLibrary";
import { getConditionSpecificWarnings, getGeneralPregnancyFoodWarnings } from "@/lib/nutrition/safetyRules";
import { WEIGHT_LEXICON, findWeightLexiconHits, foldLexiconText } from "@/lib/nutrition/weightLexicon";
import type { PregnancyProfile } from "@/types/pregnancy";

const ROOT = path.resolve(__dirname, "..");

/** Shown to users. The model ban and the note filter name these ideas on purpose. */
const SKIP_FILES = new Set([
  "src/lib/nutrition/aiNoteSafety.ts",
  "src/lib/nutrition/aiPromptBuilder.ts",
  "src/lib/nutrition/weightLossReview.ts",
  "src/lib/nutrition/weightLexicon.ts",
  "src/lib/cloudflare/aiClient.ts"
]);

const SCAN_ROOTS = [
  "src/app",
  "src/components",
  "src/lib/nutrition",
  "src/lib/i18n.ts",
  "src/lib/faq.ts",
  "src/lib/legal",
  "src/lib/blog/categories.ts",
  "src/lib/blog/synthesis/editorialTopics.ts",
  "docs/STORE_SUBMISSION.md"
];

function lexiconHits(lines: readonly string[], label: string): string[] {
  const hits: string[] = [];
  lines.forEach((line, index) => {
    for (const hit of findWeightLexiconHits(line)) hits.push(`${label}:${index + 1} ${hit.name}`);
  });
  return hits;
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
    expect(findWeightLexiconHits(english.reason)).toEqual([]);
  });

  it("names the satiety stems the guard used to miss", () => {
    const names = WEIGHT_LEXICON.map((phrase) => phrase.name);
    for (const name of [
      "filling",
      "hearty",
      "satisfying",
      "satisfied",
      "satiated",
      "no ăn lâu",
      "chắc bụng",
      "đỡ đói",
      "fullness",
      "smaller plate",
      "bữa nhỏ",
      "lượng nhỏ",
      "ăn ít",
      "eat less",
      "hunger",
      "cravings",
      "thèm ăn"
    ]) {
      expect(names).toContain(name);
    }
  });

  it("matches unaccented text and NFD text", () => {
    const samples = [
      "giam can",
      "giảm cân".normalize("NFD"),
      "chac bung",
      "chắc bụng".normalize("NFD"),
      "do doi",
      "đỡ đói".normalize("NFD"),
      "bua nho",
      "bữa nhỏ".normalize("NFD"),
      "luong nho",
      "lượng nhỏ".normalize("NFD"),
      "an it",
      "ăn ít".normalize("NFD"),
      "them an",
      "thèm ăn".normalize("NFD"),
      "no lau",
      "no lâu".normalize("NFD"),
      "smaller plate",
      "eat less",
      "hunger",
      "cravings",
      "satisfied",
      "satiated"
    ];
    for (const sample of samples) {
      expect(findWeightLexiconHits(sample).length, sample).toBeGreaterThan(0);
    }
    expect(foldLexiconText("Giảm cân".normalize("NFD"))).toBe("giam can");
    expect(findWeightLexiconHits("a fulfilling plate").map((hit) => hit.name)).not.toContain("filling");
    expect(findWeightLexiconHits("w-full")).toEqual([]);
    expect(findWeightLexiconHits("fully cooked")).toEqual([]);
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
    const refluxAndWeight: PregnancyProfile = {
      ...sampleProfile,
      healthConditions: ["reflux", "fast_weight_gain"],
      goals: ["weight_control"]
    };
    expect(getConditionSpecificWarnings(refluxAndWeight, "vi")).toContain("Chia bữa đều trong ngày, ăn chậm, không nằm ngay sau ăn.");
    expect(getConditionSpecificWarnings(refluxAndWeight, "en")).toContain(
      "Spread meals across the day, eat slowly, and don't lie down right after eating."
    );
    expect(getConditionSpecificWarnings(refluxAndWeight, "en").join(" ")).not.toMatch(/small meals/i);
    expect(getConditionSpecificWarnings(refluxAndWeight, "vi").join(" ")).not.toMatch(/bữa nhỏ|nhỏ bữa/);
    const gdm = getConditionSpecificWarnings({ ...sampleProfile, healthConditions: ["gestational_diabetes"] }, "vi");
    expect(gdm.join(" ")).toContain("chia bữa đều trong ngày");
    expect(gdm.join(" ")).not.toMatch(/chia nhỏ bữa/);
    expect(getConditionSpecificWarnings({ ...sampleProfile, healthConditions: ["gestational_diabetes"] }, "en").join(" ")).toContain(
      "split meals across the day"
    );
    expect(NOTE_LIBRARY.map((note) => note.id)).not.toContain("safety-same-day");
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
