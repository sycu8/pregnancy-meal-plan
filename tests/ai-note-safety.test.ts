import { describe, expect, it } from "vitest";
import { parseModelPayload } from "@/lib/cloudflare/aiClient";
import { filterEchoedAiNotes, filterSafeAiNotes } from "@/lib/nutrition/aiNoteSafety";
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

describe("meal-plan prompt", () => {
  it("asks for structured notes and does not paste warnings the model would restate", () => {
    const prompt = buildMealPlanPrompt(gdm, "vi");
    expect(prompt).toContain('"kind":"portion|swap|timing|prep|other"');
    expect(prompt).toMatch(/3 to 5 items in Vietnamese only/);
    expect(prompt).toMatch(/do not restate/i);
    expect(prompt).not.toContain(getConditionSpecificWarnings(gdm, "vi")[0]);
    expect(prompt).not.toContain(getGeneralPregnancyFoodWarnings("vi")[0]);
    expect(prompt).not.toMatch(/chọn cá ít thủy ngân và nấu chín kỹ/i);
    expect(buildMealPlanPrompt(profile, "en")).not.toContain(getConditionSpecificWarnings(profile, "en")[0]);
    expect(buildMealPlanPrompt(profile, "en")).not.toMatch(/low-mercury fish and cook it thoroughly/i);
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
  "Drink fruit juice.",
  "Drink sugary drinks in moderation.",
  "Chọn thực phẩm giàu chất xơ như rau, củ, quả để hỗ trợ tiêu hóa.",
  "Ăn sầu riêng sau bữa tối.",
  "Ăn nhãn và vải.",
  "Ăn dưa hấu.",
  "An mit moi ngay.",
  "An nhieu hoa qua va mit."
];

const gdmSafe = [
  "Chia nhỏ bữa và ưu tiên tinh bột chậm.",
  "Avoid sugary drinks and juices.",
  "Limit fruit to one small serving.",
  "Một phần nhỏ trái cây sau bữa.",
  "Eat a small serving of fruit.",
  "Drink water between meals.",
  "Ưu tiên ngũ cốc nguyên hạt và rau.",
  "Choose brown rice over white rice.",
  "Hạn chế đồ ngọt.",
  "Han che do ngot.",
  "Limit mango to one small piece.",
  "Have one small apple with nuts instead of juice.",
  "Ưu tiên phô mai tiệt trùng.",
  "Cá phổ biến nên nấu chín.",
  "Giữ chuỗi bữa nhỏ trong ngày.",
  "Chọn món ít chế biến sẵn."
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
  "Try pickled vegetables.",
  "Ăn kim chi mỗi ngày.",
  "An kim chi moi ngay.",
  "Have a soft-boiled egg.",
  "Lòng đỏ còn chảy vẫn dùng được.",
  "Ăn cá sống kiểu Nhật."
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
  "Tránh trà gần bữa chính.",
  "Không ăn gỏi cá, nem chua hay đồ tái sống."
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
        "Uống thêm nước lọc giữa các bữa.",
        "Nấu chín kỹ thịt, cá, trứng và hải sản.",
        "Chọn cá ít thủy ngân và nấu chín kỹ.",
        "Hãy hỏi bác sĩ về lượng tinh bột phù hợp.",
        "Ưu tiên tinh bột chậm và chia nhỏ bữa.",
        "Quy tắc: không nhắc lại cảnh báo an toàn."
      ],
      gdm,
      "vi"
    );
    expect(kept).toEqual(["Không ăn đồ muối chua hoặc dưa muối.", "Uống thêm nước lọc giữa các bữa."]);
  });

  it("drops English paraphrases of the safety panel and the GDM warning", () => {
    const kept = filterEchoedAiNotes(
      [
        "Cook meat, fish, eggs, and seafood thoroughly.",
        "Choose low-mercury fish and cook it thoroughly.",
        "Select pasteurized milk and cheese.",
        "Prioritize slow-digesting carbohydrates and split meals into smaller portions.",
        "Ask your clinician about the right carbohydrate amount.",
        "Avoid sugary drinks and juice.",
        "Drink water between meals."
      ],
      gdm,
      "en"
    );
    expect(kept).toEqual(["Drink water between meals."]);
  });
});

describe("authored GDM plans", () => {
  const gdmOnly: PregnancyProfile = {
    ...profile,
    healthConditions: ["gestational_diabetes"],
    goals: ["blood_sugar_control"]
  };
  const plans: { locale: "vi" | "en"; text: string; block: boolean }[] = [
    { locale: "vi", text: "Chọn thực phẩm giàu chất xơ như rau, củ, quả để hỗ trợ tiêu hóa.", block: true },
    { locale: "vi", text: "Nấu chín kỹ thịt, cá, trứng và hải sản.", block: true },
    { locale: "vi", text: "Chọn cá ít thủy ngân và nấu chín kỹ.", block: true },
    { locale: "vi", text: "Ăn một phần nhỏ táo sau bữa trưa.", block: false },
    { locale: "vi", text: "Đổi cơm trắng sang cơm gạo lứt vào bữa trưa.", block: false },
    { locale: "vi", text: "Hạn chế đồ ngọt.", block: false },
    { locale: "vi", text: "Hạn chế đồ ngọt và nước ngọt có ga.", block: true },
    { locale: "vi", text: "Ăn sầu riêng sau bữa tối.", block: true },
    { locale: "vi", text: "Uống thêm nước lọc giữa các bữa.", block: false },
    { locale: "vi", text: "Hãy hỏi bác sĩ về lượng tinh bột phù hợp.", block: true },
    { locale: "vi", text: "Quy tắc: không nhắc lại cảnh báo an toàn.", block: true },
    { locale: "vi", text: "Ưu tiên tinh bột chậm và chia nhỏ bữa.", block: true },
    { locale: "vi", text: "Tránh nước ép và nước ngọt.", block: true },
    { locale: "vi", text: "Chọn sữa và phô mai đã tiệt trùng.", block: true },
    { locale: "vi", text: "Ăn nhãn và vải mỗi ngày.", block: true },
    { locale: "vi", text: "An mit moi ngay.", block: true },
    { locale: "en", text: "Prioritize slow-digesting carbohydrates and split meals into smaller portions.", block: true },
    { locale: "en", text: "Choose brown rice over white rice.", block: false },
    { locale: "en", text: "Drink sugary drinks in moderation.", block: true },
    { locale: "en", text: "Cook meat, fish, eggs, and seafood thoroughly.", block: true },
    { locale: "en", text: "Choose low-mercury fish and cook it thoroughly.", block: true },
    { locale: "en", text: "Select pasteurized milk and cheese.", block: true },
    { locale: "en", text: "Have one small apple with nuts instead of juice.", block: false },
    { locale: "en", text: "Eat plenty of watermelon and mango.", block: true },
    { locale: "en", text: "Drink water between meals.", block: false },
    { locale: "en", text: "Ask your clinician about the right carbohydrate amount.", block: true },
    { locale: "en", text: "Avoid sugary drinks and juice.", block: true },
    { locale: "en", text: "Eat two small snacks at 10:00 and 15:00.", block: false },
    { locale: "en", text: "Have a soft-boiled egg with rice.", block: true },
    { locale: "en", text: "Enjoy kim chi with dinner.", block: true },
    { locale: "en", text: "Limit mango to one small piece.", block: false }
  ];

  it("keeps only new notes on 3 Vietnamese and 3 English plans", () => {
    let shouldBlock = 0;
    let blockedHits = 0;
    let shouldKeep = 0;
    let keptHits = 0;
    const misses: string[] = [];
    for (const item of plans) {
      const kept = filterEchoedAiNotes(filterSafeAiNotes([item.text], gdmOnly), gdmOnly, item.locale);
      const blocked = kept.length === 0;
      if (item.block) {
        shouldBlock += 1;
        if (blocked) blockedHits += 1;
        else misses.push(`kept: ${item.text}`);
      } else {
        shouldKeep += 1;
        if (!blocked) keptHits += 1;
        else misses.push(`dropped: ${item.text}`);
      }
    }
    const predictedBlock = blockedHits + (shouldKeep - keptHits);
    const precision = predictedBlock === 0 ? 0 : blockedHits / predictedBlock;
    const recall = blockedHits / shouldBlock;
    expect({ precision, recall, misses }).toEqual({ precision: 1, recall: 1, misses: [] });
    expect(shouldBlock + shouldKeep).toBe(plans.length);
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
