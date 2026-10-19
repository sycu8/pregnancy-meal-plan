import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { breakfastMeals, findMealRecordByName, flattenMealIngredients, mainMeals, snackMeals } from "@/lib/nutrition/mealDatabase";
import { localizeMealText } from "@/lib/nutrition/mealLocales";
import { NOTE_LIBRARY } from "@/lib/nutrition/noteLibrary";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import { getConditionSpecificWarnings, getGeneralPregnancyFoodWarnings } from "@/lib/nutrition/safetyRules";
import { WEIGHT_LEXICON, findWeightLexiconHits, foldLexiconText } from "@/lib/nutrition/weightLexicon";
import { synthesizePost } from "@/lib/blog/synthesis/synthesizePost";
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
  "src/lib/blog/synthesis/synthesizePost.ts",
  "src/lib/blog/synthesis/contentStandards.ts",
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
    { ...sampleProfile, healthConditions: ["morning_sickness"], goals: ["weight_control"] },
    { ...sampleProfile, healthConditions: ["morning_sickness", "fast_weight_gain"], goals: ["balanced"] },
    { ...sampleProfile, healthConditions: ["morning_sickness", "reflux"], goals: ["weight_control"] },
    { ...sampleProfile, healthConditions: ["fast_weight_gain"], goals: ["weight_control"] },
    { ...sampleProfile, healthConditions: ["gestational_diabetes"], goals: ["blood_sugar_control"] }
  ];
  for (const profile of profiles) {
    lines.push(...getConditionSpecificWarnings(profile, "vi"), ...getConditionSpecificWarnings(profile, "en"));
  }
  lines.push(...getGeneralPregnancyFoodWarnings("vi"), ...getGeneralPregnancyFoodWarnings("en"));
  return lines;
}

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) collectStrings(child, out);
  }
}

/** Strings the meal planner and the fallback post generator emit. */
function generatorOutput(): string[] {
  const lines: string[] = [];
  const profiles: PregnancyProfile[] = [
    sampleProfile,
    { ...sampleProfile, healthConditions: ["reflux"] },
    { ...sampleProfile, healthConditions: ["morning_sickness"], goals: ["reduce_nausea"] },
    { ...sampleProfile, healthConditions: ["morning_sickness"], goals: ["weight_control"] },
    { ...sampleProfile, healthConditions: ["morning_sickness", "fast_weight_gain"], goals: ["balanced"] },
    { ...sampleProfile, healthConditions: ["morning_sickness", "reflux"], goals: ["weight_control"] },
    { ...sampleProfile, healthConditions: ["gestational_diabetes"], goals: ["blood_sugar_control"] },
    { ...sampleProfile, healthConditions: ["gestational_diabetes", "morning_sickness"], goals: ["blood_sugar_control"] },
    { ...sampleProfile, healthConditions: ["gestational_diabetes", "morning_sickness"], goals: ["weight_control"] },
    {
      ...sampleProfile,
      healthConditions: ["gestational_diabetes", "morning_sickness", "reflux"],
      goals: ["blood_sugar_control"]
    }
  ];
  for (const profile of profiles) {
    for (const locale of ["vi", "en"] as const) collectStrings(ruleBasedMealPlanner(profile, locale), lines);
  }
  const post = synthesizePost({
    title: "Iron and folate at lunch",
    snippet: "A practical note on cooked meals.",
    sourceName: "Clinic notes",
    url: "https://example.com/iron"
  });
  collectStrings(post, lines);
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
    expect(findWeightLexiconHits("give them an apple")).toEqual([]);
    expect(findWeightLexiconHits("how to use them and the plan")).toEqual([]);
    expect(findWeightLexiconHits("www them an vat")).toEqual([]);
    expect(findWeightLexiconHits("123 them an vat")).toEqual([]);
    expect(findWeightLexiconHits("them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("hay them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("rat them an tao").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("do them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("can them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("may them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("am them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("is them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("đó them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("cân them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("máy them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("ấm them an vat").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("đó thèm ăn táo").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("cân thèm ăn táo").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("máy thèm ăn táo").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("ấm thèm ăn táo").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("I can eat an apple")).toEqual([]);
    expect(findWeightLexiconHits("I can eat them an apple")).toEqual([]);
    expect(findWeightLexiconHits("plants them an apple")).toEqual([]);
    for (const sentence of [
      "give them an apple",
      "please give them an orange",
      "for them an apple",
      "feed them an apple",
      "ask them an apple",
      "tell them an apple",
      "show them an apple",
      "offer them an apple",
      "hand them an apple",
      "pass them an apple",
      "bring them an apple",
      "get them an apple",
      "I can eat them an apple"
    ]) {
      expect(findWeightLexiconHits(sentence), sentence).toEqual([]);
    }
    expect(findWeightLexiconHits("kiểm soát\tmỡ").map((hit) => hit.name)).toContain("kiểm soát mỡ");
    expect(findWeightLexiconHits("kiểm soát\u00A0mỡ").map((hit) => hit.name)).toContain("kiểm soát mỡ");
    expect(findWeightLexiconHits("kiểm soát\tmỡ máu")).toEqual([]);
    expect(findWeightLexiconHits("mệt\tthêm ăn").map((hit) => hit.name)).toContain("thèm ăn");
    for (const probe of ["mệt thêm ăn", "gọt thêm ăn", "lết thêm ăn", "sét thêm ăn", "típ thêm ăn", "đỏ thêm ăn", "mệt  thêm ăn"]) {
      expect(findWeightLexiconHits(probe).map((hit) => hit.name), probe).toContain("thèm ăn");
    }
    expect(findWeightLexiconHits("Thèm ăn táo").map((hit) => hit.name)).toContain("thèm ăn");
    expect(findWeightLexiconHits("Kiểm soát đường huyết")).toEqual([]);
    expect(findWeightLexiconHits("kiem soat duong huyet")).toEqual([]);
    for (const phrase of [
      "kiểm soát tăng cân",
      "kiem soat tang can",
      "kiểm soát cân nặng",
      "kiem soat can nang",
      "kiểm soát ăn uống",
      "kiem soat an uong",
      "kiểm soát calo",
      "kiem soat calo",
      "kiểm soát lượng calo",
      "kiem soat luong calo",
      "kiểm soát khẩu phần",
      "kiem soat khau phan",
      "kiểm soát vòng eo",
      "kiem soat vong eo",
      "kiểm soát lượng ăn",
      "kiem soat luong an",
      "kiểm soát lượng thức ăn",
      "kiem soat luong thuc an",
      "kiểm soát cơn đói",
      "kiem soat con doi",
      "kiểm soát cơn thèm",
      "kiem soat con them",
      "kiểm soát mỡ",
      "kiem soat mo",
      "kiểm soát mỡ bụng",
      "kiem soat mo bung",
      "kiểm soát mỡ thừa",
      "kiem soat mo thua"
    ]) {
      expect(findWeightLexiconHits(phrase).length, phrase).toBeGreaterThan(0);
    }
    expect(findWeightLexiconHits("kiểm soát mỡ máu")).toEqual([]);
    expect(findWeightLexiconHits("kiem soat mo mau")).toEqual([]);
    expect(findWeightLexiconHits("Kiểm soát mỡ máu khi mang thai")).toEqual([]);
    expect(findWeightLexiconHits("kiểm soát  mỡ máu")).toEqual([]);
    for (const phrase of ["kiểm soát mỡ mau chóng", "kiem soat mo mau chong", "kiểm soát  mỡ mau chóng", "kiem soat  mo"]) {
      expect(findWeightLexiconHits(phrase).map((hit) => hit.name), phrase).toContain("kiểm soát mỡ");
    }
  });

  it("scans static Vietnamese and English strings for weight-control phrasing", () => {
    const hits: string[] = [];
    for (const file of staticFiles()) {
      const lines = readFileSync(path.join(ROOT, file), "utf8").split(/\r?\n/);
      hits.push(...lexiconHits(lines, file));
    }
    hits.push(...lexiconHits(visibleCopy(), "visible"));
    hits.push(...lexiconHits(generatorOutput(), "generator"));
    expect(hits).toEqual([]);
  });

  it("keeps the reflux note as comfort copy and keeps several small meals out of the library", () => {
    expect(getConditionSpecificWarnings({ ...sampleProfile, healthConditions: ["morning_sickness"] }, "vi").join(" ")).toContain("chia nhỏ bữa");
    expect(getConditionSpecificWarnings({ ...sampleProfile, healthConditions: ["morning_sickness"] }, "en").join(" ")).toContain("eat smaller meals");
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
    const morningAndWeight: PregnancyProfile = {
      ...sampleProfile,
      healthConditions: ["morning_sickness"],
      goals: ["weight_control"]
    };
    const morningAndFast: PregnancyProfile = {
      ...sampleProfile,
      healthConditions: ["morning_sickness", "fast_weight_gain"],
      goals: ["balanced"]
    };
    const morningRefluxWeight: PregnancyProfile = {
      ...sampleProfile,
      healthConditions: ["morning_sickness", "reflux", "fast_weight_gain"],
      goals: ["weight_control"]
    };
    for (const profile of [morningAndWeight, morningAndFast, morningRefluxWeight]) {
      for (const locale of ["vi", "en"] as const) {
        const rendered = getConditionSpecificWarnings(profile, locale);
        const joined = rendered.join(" ");
        expect(joined, locale).not.toMatch(/chia nhỏ bữa|nhỏ bữa|bữa nhỏ|smaller meals|small meals/i);
        if (locale === "vi") expect(joined).toMatch(/chia bữa đều trong ngày/i);
        else expect(joined).toMatch(/spread meals across the day/i);
      }
    }
    const morningRefluxVi = getConditionSpecificWarnings(morningRefluxWeight, "vi");
    const morningRefluxEn = getConditionSpecificWarnings(morningRefluxWeight, "en");
    expect(morningRefluxVi.filter((note) => /chia bữa|nhỏ bữa|bữa nhỏ/i.test(note))).toEqual([
      "Chia bữa đều trong ngày, ăn chậm, không nằm ngay sau ăn. Chọn món ít mùi, mềm, dễ tiêu; có thể thử bánh mì, cháo, khoai hoặc trái cây ít chua."
    ]);
    expect(morningRefluxEn.filter((note) => /spread meals|smaller meals|small meals/i.test(note))).toEqual([
      "Spread meals across the day, eat slowly, and don't lie down right after eating. Choose mild-smelling, soft, easy-to-digest foods such as bread, porridge, potatoes or less acidic fruit."
    ]);
    const gdmNauseaProfile: PregnancyProfile = {
      ...sampleProfile,
      healthConditions: ["gestational_diabetes", "morning_sickness"],
      goals: ["blood_sugar_control"]
    };
    const gdmNausea = getConditionSpecificWarnings(gdmNauseaProfile, "vi").join(" ");
    expect(gdmNausea).toContain("bánh mì nguyên cám hoặc bánh quy nguyên cám, cháo yến mạch");
    expect(gdmNausea).not.toContain("bánh nguyên cám");
    expect(gdmNausea).toContain("Nghén: chia nhỏ bữa, ăn đều trong ngày");
    expect(gdmNausea).not.toMatch(/chia bữa đều trong ngày/);
    expect(gdmNausea).not.toMatch(/bánh mì(?! nguyên cám)|cháo(?! yến mạch)/);
    const gdmNauseaEn = getConditionSpecificWarnings(gdmNauseaProfile, "en").join(" ");
    expect(gdmNauseaEn).toContain("whole-grain bread or crackers, oat porridge");
    expect(gdmNauseaEn).toContain("Morning sickness: eat smaller meals spread through the day");
    expect(gdmNauseaEn).not.toMatch(/split meals across the day|Spread meals across the day/);
    expect(gdmNauseaEn).not.toMatch(/white bread|(?<!whole-grain )bread|(?<!oat )porridge/i);
    const gdmNauseaWeight = getConditionSpecificWarnings(
      { ...sampleProfile, healthConditions: ["gestational_diabetes", "morning_sickness"], goals: ["weight_control"] },
      "vi"
    ).join(" ");
    expect(gdmNauseaWeight).toContain("Nghén: chia bữa đều trong ngày");
    expect(gdmNauseaWeight).not.toContain("chia nhỏ bữa, ăn đều trong ngày");
    expect(
      getConditionSpecificWarnings(
        { ...sampleProfile, healthConditions: ["gestational_diabetes", "morning_sickness"], goals: ["weight_control"] },
        "en"
      ).join(" ")
    ).toContain("Morning sickness: spread meals across the day");
    const gdmNauseaReflux = getConditionSpecificWarnings(
      { ...sampleProfile, healthConditions: ["gestational_diabetes", "morning_sickness", "reflux"], goals: ["blood_sugar_control"] },
      "vi"
    );
    expect(gdmNauseaReflux.filter((note) => /chia bữa|nhỏ bữa|bữa nhỏ|ăn đều trong ngày/i.test(note))).toEqual([
      "Chia nhỏ bữa, ăn đều trong ngày, ăn chậm, không nằm ngay sau ăn. Chọn món ít mùi, mềm, dễ tiêu; có thể thử bánh mì nguyên cám hoặc bánh quy nguyên cám, cháo yến mạch, khoai hoặc trái cây ít chua."
    ]);
    const gdmReflux: PregnancyProfile = {
      ...sampleProfile,
      healthConditions: ["gestational_diabetes", "reflux"],
      goals: ["blood_sugar_control"]
    };
    expect(getConditionSpecificWarnings(gdmReflux, "vi")).toContain(
      "Chia nhỏ bữa, ăn đều trong ngày, ăn chậm, không nằm ngay sau ăn."
    );
    expect(getConditionSpecificWarnings(gdmReflux, "en")).toContain(
      "Split meals into smaller ones, eaten evenly through the day; eat slowly, and don't lie down right after eating."
    );
    const bloodSugarReflux: PregnancyProfile = {
      ...sampleProfile,
      healthConditions: ["reflux"],
      goals: ["blood_sugar_control"]
    };
    expect(getConditionSpecificWarnings(bloodSugarReflux, "vi")).toContain(
      "Chia nhỏ bữa, ăn đều trong ngày, ăn chậm, không nằm ngay sau ăn."
    );
    expect(getConditionSpecificWarnings(bloodSugarReflux, "en")).toContain(
      "Split meals into smaller ones, eaten evenly through the day; eat slowly, and don't lie down right after eating."
    );
    const gdmRefluxWeight: PregnancyProfile = {
      ...gdmReflux,
      healthConditions: ["gestational_diabetes", "reflux", "fast_weight_gain"],
      goals: ["weight_control"]
    };
    expect(getConditionSpecificWarnings(gdmRefluxWeight, "vi").join(" ")).toContain("Chia bữa đều trong ngày, ăn chậm, không nằm ngay sau ăn.");
    expect(getConditionSpecificWarnings(gdmRefluxWeight, "vi").join(" ")).not.toContain("Chia nhỏ bữa, ăn đều trong ngày.");
    expect(getConditionSpecificWarnings(gdmRefluxWeight, "en").join(" ")).toContain(
      "Spread meals across the day, eat slowly, and don't lie down right after eating."
    );
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
    expect(leftovers?.vi).toBe("Thịt hoặc cá đã nấu chín: cất tủ lạnh trong vòng 2 giờ, dùng trong 24 giờ, hâm nóng kỹ đến khi bốc hơi.");
    expect(leftovers?.en).toBe("Cooked meat or fish: refrigerate within 2 hours, eat within 24 hours, and reheat until steaming hot.");
    expect(leftovers?.vi.toLowerCase()).not.toContain("ăn trong ngày");
    expect(leftovers?.en.toLowerCase()).toContain("refrigerate within 2 hours");
    expect(leftovers?.en.toLowerCase()).toContain("within 24 hours");
    expect(leftovers?.en.toLowerCase()).toContain("reheat until steaming hot");
    expect(leftovers?.en.toLowerCase()).not.toContain("same day");
  });

  it("shows at most one meal-spacing line for every condition combo", () => {
    const spacing = /chia nhỏ bữa|chia bữa đều|nhỏ bữa|ăn đều trong ngày|smaller meals|small meals|spread meals|split meals/i;
    const flags = [false, true];
    for (const gdm of flags) {
      for (const morningSickness of flags) {
        for (const reflux of flags) {
          for (const weightControl of flags) {
            const healthConditions: PregnancyProfile["healthConditions"] = [];
            if (gdm) healthConditions.push("gestational_diabetes");
            if (morningSickness) healthConditions.push("morning_sickness");
            if (reflux) healthConditions.push("reflux");
            if (weightControl) healthConditions.push("fast_weight_gain");
            if (healthConditions.length === 0) healthConditions.push("none");
            const profile: PregnancyProfile = {
              ...sampleProfile,
              healthConditions,
              goals: weightControl ? ["weight_control"] : ["balanced"]
            };
            for (const locale of ["vi", "en"] as const) {
              const notes = getConditionSpecificWarnings(profile, locale);
              const spacingNotes = notes.filter((note) => spacing.test(note));
              expect(spacingNotes, `${locale} ${healthConditions.join("+")}`).toHaveLength(Math.min(spacingNotes.length, 1));
              if (!weightControl || (!gdm && !morningSickness && !reflux)) continue;
              const joined = notes.join(" ");
              expect(joined, locale).not.toMatch(/chia nhỏ bữa|smaller meals|small meals/i);
              expect(joined, locale).toMatch(locale === "vi" ? /chia bữa đều trong ngày/i : /spread meals across the day|split meals across the day/i);
            }
          }
        }
      }
    }
  });
});
