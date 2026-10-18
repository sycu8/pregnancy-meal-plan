import { describe, expect, it } from "vitest";
import { parseModelPayload } from "@/lib/cloudflare/aiClient";
import { filterEchoedAiNotes, filterSafeAiNotes, pregnancyNoteHardRules } from "@/lib/nutrition/aiNoteSafety";
import { buildMealPlanPrompt } from "@/lib/nutrition/aiPromptBuilder";
import { notesPanelKind } from "@/lib/nutrition/notesPanel";
import { getConditionSpecificWarnings, getGeneralPregnancyFoodWarnings } from "@/lib/nutrition/safetyRules";
import type { PregnancyProfile } from "@/types/pregnancy";

const profile: PregnancyProfile = {
  pregnancyWeek: 24,
  pregnancyType: "singleton",
  age: 30,
  heightCm: 160,
  prePregnancyWeightKg: 52,
  currentWeightKg: 58,
  activityLevel: "light",
  healthConditions: ["anemia"],
  cuisinePreferences: ["vietnamese_rice"],
  budget: "medium",
  cookingTime: "around_30",
  goals: ["balanced"]
};

const gdm: PregnancyProfile = {
  ...profile,
  healthConditions: ["gestational_diabetes", "anemia"],
  goals: ["blood_sugar_control"]
};

/**
 * Shape captured when Workers AI closed the notes array and stopped before
 * the object's final brace. The repro file was not on this machine.
 */
const TRUNCATED_SPECIAL_NOTES_JSON =
  '{"specialNotes":["Nên ăn nhiều trái cây.","Thử phở hoặc cơm tấm.","Uống nước ép mỗi ngày."]';

describe("condition hard rules", () => {
  it("puts each selected condition warning into the prompt after the profile", () => {
    const prompt = buildMealPlanPrompt(gdm, "vi");
    const profileAt = prompt.indexOf('"healthConditions"');
    expect(profileAt).toBeGreaterThan(-1);
    for (const warning of getConditionSpecificWarnings(gdm, "vi")) {
      expect(prompt.indexOf(warning)).toBeGreaterThan(profileAt);
    }
    expect(pregnancyNoteHardRules(gdm, "en")).toContain(getConditionSpecificWarnings(gdm, "en")[0]);
  });

  it("adds pregnancy food-safety rules to the prompt", () => {
    for (const locale of ["en", "vi"] as const) {
      const prompt = buildMealPlanPrompt(gdm, locale);
      for (const rule of getGeneralPregnancyFoodWarnings(locale).slice(0, 3)) {
        expect(prompt).toContain(rule);
      }
    }
    const english = buildMealPlanPrompt(profile, "en");
    expect(english).toMatch(/cook meat, fish, eggs and seafood thoroughly/i);
    expect(english).toMatch(/high-mercury fish/i);
    expect(english).toMatch(/unpasteuri[sz]ed/i);
    expect(english).toMatch(/do not recommend pickled foods/i);
    expect(english).toMatch(/do not say to avoid overcooking/i);
    expect(english).toMatch(/low-mercury fish/i);
    expect(english).toMatch(/do not repeat them as notes/i);
  });
});

const gdmContradictions = [
  "Nên ăn nhiều trái cây.",
  "Ăn thêm trái cây tươi mỗi ngày.",
  "Ăn trái cây sau mỗi bữa ăn.",
  "Nên ăn nhiều hoa quả.",
  "An nhieu hoa qua moi ngay.",
  "Uống sinh tố trái cây.",
  "Uống nước ép trái cây không đường mỗi ngày.",
  "Uống nước ép cam tươi, không cần thêm đường.",
  "Ăn chè đậu xanh.",
  "Thêm mật ong vào sữa.",
  "Ăn xôi hoặc bánh mì trắng.",
  "Ăn cơm trắng mỗi bữa.",
  "Ăn bánh ngọt sau bữa.",
  "Ăn chuối hoặc xoài.",
  "Uống nước mía.",
  "Uống sữa đặc.",
  "Thử phở hoặc cơm tấm.",
  "Fruit juices are a healthy choice.",
  "A fruit smoothie is a healthy snack.",
  "Drink orange juice with no added sugar.",
  "Eat dried fruit between meals.",
  "Choose white rice with meals.",
  "Add honey to yogurt.",
  "Enjoy sweet desserts.",
  "Eat bananas and mangoes.",
  "Have a glass of juice in the afternoon to avoid low energy.",
  "As a pregnant woman with gestational diabetes, prioritize slow-digesting carbohydrates such as whole grains, fruits, and vegetables.",
  "Prioritize slow-digesting carbohydrates like whole grains, fruits, and vegetables.",
  "Try pho or com tam for lunch.",
  "Eat plenty of fruit.",
  "Drink fruit juice."
];

const gdmSafe = [
  "Chia nhỏ bữa và ưu tiên tinh bột chậm.",
  "Avoid sugary drinks and juices.",
  "Limit fruit to one small serving.",
  "Một phần nhỏ trái cây sau bữa.",
  "Eat a small serving of fruit.",
  "Drink water between meals.",
  "Ưu tiên ngũ cốc nguyên hạt và rau."
];

const unsafeFoods = [
  "Consider incorporating fermented foods like kimchi.",
  "Try kimchi as a side.",
  "Sushi is a light dinner.",
  "Enjoy brie or other soft cheese.",
  "A runny yolk is fine.",
  "Ăn trứng lòng đào.",
  "Ăn gỏi cá.",
  "Thử nem chua.",
  "Eat animal liver once a week.",
  "A rare steak is a good source of iron.",
  "Have a nightly glass of wine.",
  "Tuna steaks are rich in omega-3.",
  "Ăn cá ngừ đại dương.",
  "Avoid processed food and enjoy raw salads.",
  "Avoid overcooking vegetables.",
  "Đừng nấu quá chín.",
  "Try pickled vegetables."
];

const safeFoods = [
  "Avoid raw or undercooked food.",
  "Avoid fermented foods such as kimchi.",
  "Do not drink alcohol.",
  "Avoid high-mercury tuna.",
  "Đừng ăn sushi.",
  "Không ăn dưa muối.",
  "Nấu chín cá, thịt và trứng.",
  "Chọn cá ít thủy ngân và nấu chín kỹ.",
  "Tránh trà gần bữa chính."
];

describe("per-condition deny list", () => {
  it("drops GDM notes that recommend lots of fruit, pho, com tam, or juice", () => {
    const kept = filterSafeAiNotes(
      [
        "Nên ăn nhiều trái cây.",
        "Thử phở hoặc cơm tấm.",
        "Try pho or com tam for lunch.",
        "Eat plenty of fruit.",
        "Uống nước ép trái cây.",
        "Drink fruit juice.",
        "Chia nhỏ bữa và ưu tiên tinh bột chậm."
      ],
      gdm
    );
    expect(kept).toEqual(["Chia nhỏ bữa và ưu tiên tinh bột chậm."]);
  });

  it("keeps pho and a correct avoid-juice note when diabetes is not selected", () => {
    const kept = filterSafeAiNotes(
      ["Phở gà nấu chín là bữa dễ ăn.", "Avoid juice and sugary drinks.", "Drink water through the day."],
      profile
    );
    expect(kept).toEqual([
      "Phở gà nấu chín là bữa dễ ăn.",
      "Avoid juice and sugary drinks.",
      "Drink water through the day."
    ]);
  });

  it("drops tea with meals for anemia and added salt for hypertension", () => {
    const anemia = filterSafeAiNotes(["Uống trà cùng bữa chính.", "Ăn thực phẩm giàu sắt."], profile);
    expect(anemia).toEqual(["Ăn thực phẩm giàu sắt."]);

    const pressure: PregnancyProfile = { ...profile, healthConditions: ["hypertension"] };
    const salty = filterSafeAiNotes(["Add extra salt to each meal.", "Giảm món quá mặn."], pressure);
    expect(salty).toEqual(["Giảm món quá mặn."]);
  });

  it.each(gdmContradictions)("drops GDM phrasing: %s", (note) => {
    expect(filterSafeAiNotes([note], gdm)).toEqual([]);
  });

  it.each(gdmSafe)("keeps a GDM-safe note: %s", (note) => {
    expect(filterSafeAiNotes([note], gdm)).toEqual([note]);
  });

  it.each(unsafeFoods)("drops an unsafe food note: %s", (note) => {
    expect(filterSafeAiNotes([note], profile)).toEqual([]);
  });

  it.each(safeFoods)("keeps a safe food note: %s", (note) => {
    expect(filterSafeAiNotes([note], profile)).toEqual([note]);
  });

  it("drops avoid-overcooking, pickled foods, raw foods, and fish with no mercury caveat", () => {
    const kept = filterSafeAiNotes(
      [
        "Avoid overcooking vegetables.",
        "Đừng nấu quá chín.",
        "Try pickled vegetables.",
        "Nên ăn sashimi.",
        "Drink unpasteurised milk.",
        "Ăn cá hồi giàu omega-3.",
        "Eat more fish for omega-3.",
        "Chọn cá ít thủy ngân và nấu chín kỹ.",
        "Nấu chín cá, thịt và trứng.",
        "Avoid raw or undercooked food."
      ],
      profile
    );
    expect(kept).toEqual(["Chọn cá ít thủy ngân và nấu chín kỹ.", "Nấu chín cá, thịt và trứng.", "Avoid raw or undercooked food."]);
  });
});

describe("echoed safety notes", () => {
  const warning = "Tiểu đường thai kỳ: ưu tiên tinh bột chậm, chia nhỏ bữa, tránh nước ép/nước ngọt và hỏi bác sĩ về lượng tinh bột phù hợp.";
  const safety = "Không ăn đồ sống/tái; nấu chín kỹ thịt, cá, trứng và hải sản.";

  it("drops verbatim warnings, near-copies, and meta instructions", () => {
    const kept = filterEchoedAiNotes(
      [
        warning,
        safety,
        "Không khuyên đồ muối chua hoặc dưa muối.",
        "Không viết rằng nên tránh nấu quá chín.",
        "Do not recommend pickled foods.",
        "Do not say to avoid overcooking.",
        "Không ăn đồ muối chua hoặc dưa muối.",
        "Chia nhỏ bữa và uống nước lọc."
      ],
      gdm,
      "vi"
    );
    expect(kept).toEqual(["Chia nhỏ bữa và uống nước lọc."]);
  });
});

describe("truncated specialNotes JSON", () => {
  it("adds the missing brace before giving up", () => {
    expect(() => JSON.parse(TRUNCATED_SPECIAL_NOTES_JSON)).toThrow();
    expect(parseModelPayload(TRUNCATED_SPECIAL_NOTES_JSON)).toEqual({
      specialNotes: ["Nên ăn nhiều trái cây.", "Thử phở hoặc cơm tấm.", "Uống nước ép mỗi ngày."]
    });
  });

  it("closes a notes array that is missing ]} and a cut-off string", () => {
    expect(parseModelPayload('{"specialNotes":["Uống đủ nước trong ngày."')).toEqual({
      specialNotes: ["Uống đủ nước trong ngày."]
    });
    expect(parseModelPayload('{"specialNotes":["Uống đủ nước trong ngày."]')).toEqual({
      specialNotes: ["Uống đủ nước trong ngày."]
    });
    expect(parseModelPayload('{"specialNotes":["Uống đủ nước')).toEqual({
      specialNotes: ["Uống đủ nước"]
    });
  });
});

describe("notes panel heading", () => {
  it("uses a general heading only when notes exist and no condition is selected", () => {
    const none: PregnancyProfile = { ...profile, healthConditions: ["none"], goals: ["balanced"] };
    expect(notesPanelKind(none, 2)).toBe("general");
    expect(notesPanelKind({ ...none, healthConditions: [] }, 1)).toBe("general");
    expect(notesPanelKind(none, 0)).toBe("conditions");
    expect(notesPanelKind(profile, 2)).toBe("conditions");
    expect(notesPanelKind(gdm, 0)).toBe("conditions");
    expect(notesPanelKind({ ...none, goals: ["blood_sugar_control"] }, 2)).toBe("conditions");
  });
});
