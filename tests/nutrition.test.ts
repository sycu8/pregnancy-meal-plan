import { describe, expect, it } from "vitest";
import { calculateBmi, getBmiCategory } from "@/lib/nutrition/bmi";
import {
  estimateExpectedWeightGainRange,
  getWeightGainStatus
} from "@/lib/nutrition/weightGain";
import {
  detectUrgentWarnings,
  getConditionSpecificWarnings
} from "@/lib/nutrition/safetyRules";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import { localizeMealPlanForLocale, sanitizeSpecialNotes, MAX_SPECIAL_NOTE_CHARS, MAX_SPECIAL_NOTES } from "@/lib/nutrition/localizeMealPlan";
import { pregnancyProfileSchema, validationErrorToLocale } from "@/lib/nutrition/validation";
import type { PregnancyProfile } from "@/types/pregnancy";

const baseProfile: PregnancyProfile = {
  pregnancyWeek: 24,
  pregnancyType: "singleton",
  age: 30,
  heightCm: 160,
  prePregnancyWeightKg: 52,
  currentWeightKg: 58,
  activityLevel: "light",
  healthConditions: ["anemia", "constipation"],
  cuisinePreferences: ["vietnamese_rice"],
  budget: "medium",
  cookingTime: "around_30",
  goals: ["balanced", "increase_iron_calcium_protein"]
};

describe("nutrition calculations", () => {
  it("calculates and categorizes pre-pregnancy BMI", () => {
    expect(calculateBmi(52, 160)).toBe(20.3);
    expect(getBmiCategory(17)).toBe("underweight");
    expect(getBmiCategory(22)).toBe("normal");
    expect(getBmiCategory(27)).toBe("overweight");
    expect(getBmiCategory(31)).toBe("obese");
  });

  it("estimates trimester-aware expected weight gain ranges", () => {
    expect(estimateExpectedWeightGainRange({ pregnancyWeek: 10, bmiCategory: "normal" })).toEqual({
      min: 0.5,
      max: 2
    });
    expect(estimateExpectedWeightGainRange({ pregnancyWeek: 24, bmiCategory: "normal" })).toEqual({
      min: 4.4,
      max: 7.5
    });
    expect(getWeightGainStatus({ currentGainKg: 6, pregnancyWeek: 24, bmiCategory: "normal" })).toBe("normal");
    expect(getWeightGainStatus({ currentGainKg: 2, pregnancyWeek: 24, bmiCategory: "normal" })).toBe("low");
    expect(getWeightGainStatus({ currentGainKg: 10, pregnancyWeek: 24, bmiCategory: "normal" })).toBe("high");
  });
});

describe("pregnancy safety rules", () => {
  it("detects urgent doctor-note keywords without diagnosing", () => {
    expect(detectUrgentWarnings({ ...baseProfile, doctorNote: "Hôm nay thai máy giảm" })).toHaveLength(1);
    expect(detectUrgentWarnings({ ...baseProfile, doctorNote: "Bác sĩ dặn ăn thêm đạm" })).toEqual([]);
  });

  it("adds condition-specific food guidance", () => {
    const warnings = getConditionSpecificWarnings({
      ...baseProfile,
      healthConditions: ["gestational_diabetes", "anemia"]
    });
    expect(warnings.join(" ")).toContain("tinh bột chậm");
    expect(warnings.join(" ")).toContain("vitamin C");
  });
});

describe("rule-based meal planner", () => {
  it("creates a seven-day Vietnamese plan and respects food restrictions", () => {
    const plan = ruleBasedMealPlanner({
      ...baseProfile,
      cuisinePreferences: ["vietnamese_rice", "no_fish", "no_seafood"],
      allergies: "tôm"
    });

    expect(plan.days).toHaveLength(7);
    expect(plan.shoppingList.proteins.length).toBeGreaterThan(0);
    expect(plan.safetyWarnings).toContain("Không ăn đồ sống/tái; nấu chín kỹ thịt, cá, trứng và hải sản.");
    const selectedMealNames = plan.days
      .flatMap((day) => [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner])
      .map((meal) => meal.name.toLowerCase());
    const selectedProteins = plan.shoppingList.proteins.join(" ").toLowerCase();
    expect(selectedMealNames.some((name) => /(^|\s)cá(\s|$)|tôm|hải sản/.test(name))).toBe(false);
    expect(selectedProteins).not.toContain("tôm");
    expect(/(^|\s)cá(\s|$)/.test(selectedProteins)).toBe(false);
  });

  it("adds portion and calorie estimates plus daily shopping lists", () => {
    const plan = ruleBasedMealPlanner(baseProfile);
    const firstDay = plan.days[0];

    expect(firstDay.breakfast.portionGram).toBeGreaterThan(0);
    expect(firstDay.breakfast.estimatedCalories).toBeGreaterThan(0);
    expect(firstDay.lunch.portionGram).toBeGreaterThan(firstDay.morningSnack.portionGram);
    expect(firstDay.dailyShoppingList.proteins.length + firstDay.dailyShoppingList.vegetables.length).toBeGreaterThan(0);
  });

  it("groups shopping into fresh 2-3 day batches", () => {
    const plan = ruleBasedMealPlanner(baseProfile);

    expect(plan.shoppingBatches).toHaveLength(3);
    expect(plan.shoppingBatches.map((batch) => batch.label)).toEqual(["Ngày 1-2", "Ngày 3-4", "Ngày 5-7"]);
    expect(plan.shoppingBatches[0].days).toEqual([1, 2]);
    expect(plan.shoppingBatches[2].days).toEqual([5, 6, 7]);
    expect(plan.shoppingBatches[0].shoppingList.proteins.length + plan.shoppingBatches[0].shoppingList.vegetables.length).toBeGreaterThan(0);
  });

  it("estimates meal and shopping batch costs from a grocery price guide", () => {
    const plan = ruleBasedMealPlanner(baseProfile);
    const firstDay = plan.days[0];

    expect(firstDay.breakfast.estimatedCost).toBeGreaterThan(0);
    expect(firstDay.lunch.estimatedCost).toBeGreaterThan(firstDay.morningSnack.estimatedCost);
    expect(plan.shoppingBatches[0].estimatedCost).toBeGreaterThan(firstDay.breakfast.estimatedCost);
    expect(plan.costEstimate.sourceNames).toContain("Kingfoodmart");
    expect(plan.costEstimate.currency).toBe("VND");
    expect(plan.costEstimate.countryCode).toBe("VN");
  });

  it("localizes meal content to English while keeping Vietnamese source ids", () => {
    const plan = ruleBasedMealPlanner(baseProfile, "en");
    const breakfast = plan.days[0].breakfast;

    expect(breakfast.mealId).toBeTruthy();
    expect(breakfast.name).not.toMatch(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);
    expect(breakfast.nutrients.join(" ")).toMatch(/protein|iron|fiber|calcium|omega|starch|vitamin|plant|lean|healthy|energy|fluids|potassium|probiotic|choline|folate|zinc|iodine|beta/i);
  });

  it("uses local supermarket currency when residence is abroad", () => {
    const plan = ruleBasedMealPlanner({ ...baseProfile, residenceCountry: "US" }, "en");

    expect(plan.costEstimate.countryCode).toBe("US");
    expect(plan.costEstimate.currency).toBe("USD");
    expect(plan.costEstimate.sourceNames).toEqual(expect.arrayContaining(["Walmart"]));
    expect(plan.days[0].breakfast.estimatedCost).toBeGreaterThan(0);
    expect(plan.days[0].breakfast.estimatedCost).toBeLessThan(100);
    expect(plan.shoppingBatches[0].estimatedCost).toBeGreaterThan(0);
  });

  it("shows Vietnamese meal copy when an English plan is localized to vi", () => {
    const englishPlan = ruleBasedMealPlanner(baseProfile, "en");
    expect(englishPlan.days[0].breakfast.name).not.toMatch(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);

    const vietnamesePlan = localizeMealPlanForLocale(englishPlan, "vi");
    const breakfast = vietnamesePlan.days[0].breakfast;

    expect(breakfast.mealId).toBeTruthy();
    expect(breakfast.name).toBe(breakfast.mealId);
    expect(breakfast.reason).toMatch(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);
    expect(breakfast.nutrients.join(" ")).toMatch(/đạm|rau|tinh bột|canxi|chất|sắt|omega|vitamin|năng lượng|kali|nước|probiotic|choline|folate|kẽm|iodine|beta/i);
    expect(vietnamesePlan.shoppingList.proteins.join(" ")).toMatch(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);
    expect(vietnamesePlan.costEstimate.note).toContain("ước tính");
  });
});

describe("profile free-text limits", () => {
  it("caps allergies and disliked foods at 200 characters", () => {
    expect(pregnancyProfileSchema.safeParse({ ...baseProfile, allergies: "tôm", dislikedFoods: "mỡ" }).success).toBe(true);

    const tooLong = "a".repeat(201);
    const allergies = pregnancyProfileSchema.safeParse({ ...baseProfile, allergies: tooLong });
    expect(allergies.success).toBe(false);
    if (!allergies.success) {
      expect(allergies.error.issues[0]?.message).toBe("Dị ứng thực phẩm tối đa 200 ký tự.");
      expect(validationErrorToLocale(allergies.error, "en")).toBe("Food allergies must be 200 characters or fewer.");
      expect(validationErrorToLocale(allergies.error, "vi")).toBe("Dị ứng thực phẩm tối đa 200 ký tự.");
    }

    const disliked = pregnancyProfileSchema.safeParse({ ...baseProfile, dislikedFoods: tooLong });
    expect(disliked.success).toBe(false);
    if (!disliked.success) {
      expect(disliked.error.issues[0]?.message).toBe("Món không thích tối đa 200 ký tự.");
      expect(validationErrorToLocale(disliked.error, "en")).toBe("Disliked foods must be 200 characters or fewer.");
    }
  });
});

describe("special notes", () => {
  it("accepts only short strings so a non-string cannot reach the result list", () => {
    expect(sanitizeSpecialNotes("not-an-array")).toEqual([]);
    expect(sanitizeSpecialNotes({ note: "nope" })).toEqual([]);

    const long = "Ă".repeat(500);
    const notes = sanitizeSpecialNotes([
      "  Uống   đủ nước.  ",
      1,
      { bad: true },
      null,
      "",
      "   ",
      long,
      ...Array.from({ length: 20 }, (_, index) => `Ghi chú số ${index} về bữa ăn.`)
    ]);

    expect(notes.every((note) => typeof note === "string")).toBe(true);
    expect(notes).toHaveLength(MAX_SPECIAL_NOTES);
    expect(notes.every((note) => note.length <= MAX_SPECIAL_NOTE_CHARS)).toBe(true);
    expect(notes[0]).toBe("Uống đủ nước.");
    expect(notes[1]).toHaveLength(MAX_SPECIAL_NOTE_CHARS);
    expect(notes.join(" ")).not.toContain("[object Object]");

    const plan = ruleBasedMealPlanner(baseProfile, "vi");
    const localized = localizeMealPlanForLocale(
      {
        ...plan,
        specialNotes: ["Uống đủ nước.", 1, { bad: true }, null, long] as unknown as string[]
      },
      "vi"
    );
    expect(localized.specialNotes.every((note) => typeof note === "string")).toBe(true);
    expect(localized.specialNotes.length).toBeLessThanOrEqual(MAX_SPECIAL_NOTES);
    expect(localized.specialNotes.every((note) => note.length <= MAX_SPECIAL_NOTE_CHARS)).toBe(true);
    expect(localized.specialNotes.join(" ")).not.toContain("[object Object]");
    expect(localized.specialNotes.join(" ")).toContain("Uống đủ nước.");
  });

  it("renders morning sickness with weight control as one consistent meal line", () => {
    const cases: PregnancyProfile[] = [
      { ...baseProfile, healthConditions: ["morning_sickness"], goals: ["weight_control"] },
      { ...baseProfile, healthConditions: ["morning_sickness", "fast_weight_gain"], goals: ["balanced"] },
      { ...baseProfile, healthConditions: ["morning_sickness", "reflux", "fast_weight_gain"], goals: ["weight_control"] }
    ];
    for (const profile of cases) {
      for (const locale of ["vi", "en"] as const) {
        const plan = ruleBasedMealPlanner(profile, locale);
        const localized = localizeMealPlanForLocale(plan, locale);
        for (const rendered of [plan.safetyWarnings.join(" "), plan.specialNotes.join(" "), localized.specialNotes.join(" ")]) {
          expect(rendered, locale).not.toMatch(/chia nhỏ bữa|smaller meals|small meals/i);
          expect(rendered).toMatch(locale === "vi" ? /chia bữa đều trong ngày/i : /spread meals across the day/i);
        }
      }
    }

    const combined = ruleBasedMealPlanner(
      { ...baseProfile, healthConditions: ["morning_sickness", "reflux"], goals: ["weight_control"] },
      "vi"
    );
    const spacing = combined.specialNotes.filter((note) => /chia bữa|nhỏ bữa|bữa nhỏ/i.test(note));
    expect(spacing).toHaveLength(1);
    expect(spacing[0]).toContain("Chia bữa đều trong ngày, ăn chậm, không nằm ngay sau ăn.");
    expect(spacing[0]).not.toMatch(/chia nhỏ bữa/);
  });

  it("renders whole-grain options for morning sickness with gestational diabetes", () => {
    const profile: PregnancyProfile = {
      ...baseProfile,
      healthConditions: ["gestational_diabetes", "morning_sickness"],
      goals: ["blood_sugar_control"]
    };
    const vietnamese = ruleBasedMealPlanner(profile, "vi").specialNotes.join(" ");
    const english = ruleBasedMealPlanner(profile, "en").specialNotes.join(" ");
    expect(vietnamese).toContain("cháo yến mạch");
    expect(vietnamese).toContain("bánh mì nguyên cám hoặc bánh quy nguyên cám");
    expect(vietnamese).not.toContain("bánh nguyên cám");
    expect(vietnamese).toContain("Nghén: chia nhỏ bữa, ăn đều trong ngày");
    expect(vietnamese).not.toMatch(/chia bữa đều trong ngày/);
    expect(vietnamese).not.toMatch(/bánh mì(?! nguyên cám)|white bread|cháo(?! yến mạch)/);
    expect(english).toContain("whole-grain bread or crackers, oat porridge");
    expect(english).toContain("Morning sickness: eat smaller meals spread through the day");
    expect(english).not.toMatch(/split meals across the day|Spread meals across the day/);
    expect(english).not.toMatch(/white bread|(?<!whole-grain )bread|(?<!oat )porridge/i);
    const withWeight = ruleBasedMealPlanner(
      { ...profile, goals: ["weight_control", "blood_sugar_control"] },
      "vi"
    ).specialNotes.join(" ");
    const withWeightEn = ruleBasedMealPlanner(
      { ...profile, goals: ["weight_control", "blood_sugar_control"] },
      "en"
    ).specialNotes.join(" ");
    expect(withWeight).toContain("Nghén: chia bữa đều trong ngày");
    expect(withWeight).not.toContain("chia nhỏ bữa, ăn đều trong ngày");
    expect(withWeightEn).toContain("Morning sickness: spread meals across the day");
  });

  it("restores the spacing line for gestational diabetes with reflux and no nausea", () => {
    const profile: PregnancyProfile = {
      ...baseProfile,
      healthConditions: ["gestational_diabetes", "reflux"],
      goals: ["blood_sugar_control"]
    };
    const spacing = /chia nhỏ bữa|chia bữa đều|nhỏ bữa|ăn đều trong ngày|smaller meals|small meals|spread meals|split meals/i;
    for (const locale of ["vi", "en"] as const) {
      const plan = ruleBasedMealPlanner(profile, locale);
      const notes = plan.specialNotes.filter((note) => spacing.test(note));
      expect(notes, locale).toHaveLength(1);
      expect(notes[0], locale).toBe(
        locale === "vi"
          ? "Chia nhỏ bữa, ăn đều trong ngày, ăn chậm, không nằm ngay sau ăn."
          : "Split meals into smaller ones, eaten evenly through the day; eat slowly, and don't lie down right after eating."
      );
    }
  });

  it("keeps condition warnings without spending special-note slots", () => {
    const profile: PregnancyProfile = {
      ...baseProfile,
      goals: ["balanced"],
      healthConditions: [
        "morning_sickness",
        "constipation",
        "anemia",
        "gestational_diabetes",
        "hypertension",
        "reflux",
        "fast_weight_gain",
        "slow_weight_gain",
        "large_fetus"
      ]
    };
    const warnings = getConditionSpecificWarnings(profile, "vi");
    expect(warnings.length).toBeGreaterThanOrEqual(MAX_SPECIAL_NOTES);

    const modelNotes = Array.from({ length: MAX_SPECIAL_NOTES }, (_, index) => `Ghi chú AI số ${index} cho mẹ bầu.`);
    const plan = ruleBasedMealPlanner(profile, "vi");
    const localized = localizeMealPlanForLocale({ ...plan, specialNotes: [...warnings, ...modelNotes, "Ghi chú AI bị loại."] }, "vi");

    for (const warning of warnings) {
      expect(localized.specialNotes).toContain(warning);
    }
    for (const note of modelNotes) {
      expect(localized.specialNotes).toContain(note);
    }
    expect(localized.specialNotes).not.toContain("Ghi chú AI bị loại.");
    expect(localized.specialNotes.length).toBe(warnings.length + modelNotes.length);
  });
});
