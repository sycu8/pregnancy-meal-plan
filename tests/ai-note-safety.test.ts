import { describe, expect, it } from "vitest";
import { parseModelPayload } from "@/lib/cloudflare/aiClient";
import { filterEchoedAiNotes, filterSafeAiNotes } from "@/lib/nutrition/aiNoteSafety";
import { partitionWeightNotes, reviewWeightLossNote } from "@/lib/nutrition/weightLossReview";
import { buildMealPlanPrompt } from "@/lib/nutrition/aiPromptBuilder";
import { prepareNote } from "@/lib/nutrition/teenNote";
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
    expect(prompt).toMatch(/2 or 3 items in Vietnamese only/);
    expect(prompt).toMatch(/at most 12 words/);
    expect(prompt).toMatch(/weight loss/i);
    expect(prompt).toMatch(/do not restate/i);
    expect(prompt).not.toContain(getConditionSpecificWarnings(gdm, "vi")[0]);
    expect(prompt).not.toContain(getGeneralPregnancyFoodWarnings("vi")[0]);
    expect(prompt).not.toMatch(/chọn cá ít thủy ngân và nấu chín kỹ/i);
    expect(buildMealPlanPrompt(profile, "en")).not.toContain(getConditionSpecificWarnings(profile, "en")[0]);
    expect(buildMealPlanPrompt(profile, "en")).not.toMatch(/low-mercury fish and cook it thoroughly/i);
  });

  it("sends weight control as healthy pregnancy weight gain", () => {
    const prompt = buildMealPlanPrompt({ ...profile, goals: ["weight_control", "balanced"] }, "en");
    expect(prompt).not.toContain("weight_control");
    expect(prompt).toMatch(/pregnancy weight gain/i);
    expect(prompt).toMatch(/not weight loss/i);
    expect(prompt).toMatch(/Do not recommend weight loss/i);
    expect(prompt).toContain("balanced");
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
  "An nhieu hoa qua va mit.",
  "Ăn mit với sữa chua.",
  "Một phần nhỏ sầu riêng.",
  "Eat durian, one small piece.",
  "không cần hạn chế xoài.",
  "Don't limit mango.",
  "Ko cần hạn chế mít.",
  "Milk tea after lunch.",
  "Bubble tea is a snack.",
  "Uống trà sữa.",
  "Ăn nhãn tươi mỗi ngày.",
  "Thử phở cho bữa trưa.",
  "Try pho for lunch.",
  "Pho ga is an easy lunch.",
  "An thom chin sau bua trua.",
  "Them mit vao sua chua.",
  "An chuoi chin moi sang.",
  "A cola with the rice bowl.",
  "Uong tra dao da moi chieu.",
  "Nuoc co ga khi khat.",
  "Them siro vao sua moi toi.",
  "Replace brown rice with white rice.",
  "Swap oats for white rice.",
  "Đổi gạo lứt sang cơm trắng.",
  "không cần phải hạn chế xoài.",
  "There is no need to limit mango.",
  "Durian, a small bowl, is plenty.",
  "An mitj sau com trua.",
  "Uong nuocws ngotj khi khat.",
  "An xoai2 chin moi sang.",
  "Mot lon sting khi khat.",
  "Pepsi with the rice bowl.",
  "A can of 7up.",
  "Tra tac da sau com.",
  "Unlimited mango at lunch.",
  "Khong can thiet phai han che xoai.",
  "Khong nhat thiet han che mit.",
  "You need not limit watermelon.",
  "No limit on grapes.",
  "Coca-cola with ice.",
  "Have ice cream after lunch.",
  "An kem sau com.",
  "A slice of chocolate cake.",
  "Uong bo huc khi khat.",
  "Red Bull before a walk.",
  "Mirinda with ice.",
  "Tra chanh da sau com.",
  "Sweet foods at the afternoon snack.",
  "An keo sau bua.",
  "An nho den sau com trua.",
  "Vai thieu moi chieu.",
  "An traicay giua buoi.",
  "You don't have to limit mango.",
  "Choose white rice instead of oats.",
  "Trade brown rice for white rice."
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
  "Eat mango, one small piece.",
  "Have one small apple with nuts instead of juice.",
  "Replace white rice with brown rice.",
  "Swap white rice for brown rice.",
  "No mango.",
  "Have mango, just a small bowl.",
  "Xoài chỉ một lát sau bữa.",
  "Watermelon: half a cup.",
  "Ko an mit.",
  "Đọc nhãn dinh dưỡng trước khi mua.",
  "Have a kiwi or an apple.",
  "Ăn ổi và táo.",
  "Không ăn sầu riêng.",
  "Ưu tiên phô mai tiệt trùng.",
  "Cá phổ biến nên nấu chín.",
  "Giữ chuỗi bữa nhỏ trong ngày.",
  "Chọn món ít chế biến sẵn.",
  "Eat less sugar with meals.",
  "Khong gioi han rau xanh.",
  "Uu tien tinh bot cham vao bua trua.",
  "Use oats instead of white rice."
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
  "Ăn cá sống kiểu Nhật.",
  "Pâté lạnh trên bánh mì.",
  "Ăn giò lụa nguội.",
  "Thịt nguội và xúc xích.",
  "A ham and salami sandwich.",
  "Sausage for breakfast.",
  "Một ly bia sau bữa tối.",
  "A glass of wine.",
  "Try a cocktail tonight.",
  "Soju with dinner.",
  "Giá sống trong món gỏi.",
  "Raw sprouts on the salad.",
  "Một phần nhỏ gan mỗi tuần.",
  "Ăn xúc xích chưa làm nóng.",
  "Order oysters on the half shell.",
  "Prawns that are under-cooked.",
  "Hàu tươi cho bữa tối.",
  "Tôm tái với rau thơm.",
  "An so huyet truoc com.",
  "A small bowl of tiết canh.",
  "Thuong thuc tiet canh vit.",
  "Duck blood soup is warming.",
  "Pour a little whiskey into the sauce.",
  "Champagne at dinner is festive.",
  "A gin and tonic.",
  "Farm raw milk on porridge.",
  "Sữa bò chưa thanh trùng mỗi sáng.",
  "Sua song moi vat uong lien.",
  "Milk that has not been pasteurised.",
  "Skip raw fish but pâté is fine.",
  "Không ăn sushi nhưng pate thì được.",
  "Avoid cold cuts; pâté on toast is alright.",
  "Don't avoid pâté at breakfast.",
  "Ăn ít tinh bột để giảm cân.",
  "A light dinner helps with weight loss.",
  "Cut calories at week twenty.",
  "Try fasting on two mornings.",
  "Bo bua sang de giu dang.",
  "Count calories before each meal.",
  "A low-carb plate at lunch.",
  "Cut carbs from the rice bowl.",
  "Keto snacks between meals.",
  "Dot mo bang mon luoc.",
  "An it lai vao buoi toi.",
  "Start a short detox this week.",
  "Thanh loc co the bang nuoc.",
  "Giam tinh bot de eo thon.",
  "She skips breakfast to slim down.",
  "Cap the day at 1400 calories.",
  "Dem calo cho tung bua.",
  "Khong an thit nguoi, pate thi duoc.",
  "Avoid deli meat except pâté.",
  "Don't have to skip pâté.",
  "No need to avoid pâté.",
  "Drink herbal tea after dinner.",
  "Uong thuoc nam moi toi.",
  "Them ngai cuu vao lau.",
  "Goi du du xanh truoc com.",
  "Green papaya salad at lunch.",
  "Milk from the farm on the oats.",
  "Farm-fresh milk with porridge.",
  "Fresh from the cow this morning.",
  "Add alfalfa sprouts to the bowl.",
  "Thuong thuc tieets canh voi com.",
  "Uong suwax soongs moi vat.",
  "Sua chuwa thanh trungf moi sang.",
  "Uong tie6t1 canh toi nay.",
  "Add bean sprouts to the noodle bowl.",
  "Sprouted beans on the salad.",
  "Rau mầm sống trộn gỏi.",
  "Giá đỗ sống cho món cuốn.",
  "An gia do song moi sang.",
  "Toss on some rau mam.",
  "Stir-fried alfalfa on the rice.",
  "Sữa tươi sống mỗi sáng.",
  "Sữa bò sống pha với bột.",
  "Sữa chưa qua thanh trùng.",
  "Uống sữa nông trại.",
  "Sua nong trai moi sang.",
  "Non-pasteurized milk on oats.",
  "Milk straight from the cow.",
  "A smaller dinner will curb your appetite.",
  "Eat less at dinner so the scale stays put.",
  "Keep your weight down through week eight.",
  "Aim for your pre-pregnancy weight.",
  "Watch your weight between visits.",
  "Limit weight gain until the next checkup.",
  "Không tăng cân trong tháng này.",
  "Kiểm soát cân nặng bằng bữa tối nhẹ.",
  "Cắt cảm giác đói bằng nước lọc.",
  "Bớt ăn vào buổi chiều.",
  "Không phải kiêng pate.",
  "Pâté is allowed at lunch.",
  "Pate cũng được với bánh mì.",
  "Don't have to abstain from pâté.",
  "Ngaix cuuws nau voi mat ong.",
  "Uong suwax nong trai moi sang."
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
  "Không ăn gỏi cá, nem chua hay đồ tái sống.",
  "Cooked salmon for dinner.",
  "Cá hồi nấu chín cho bữa tối.",
  "Một phần nhỏ gan gà nấu chín mỗi tuần.",
  "Reheat deli meat until steaming hot.",
  "Hâm nóng xúc xích trước khi ăn.",
  "Don't drink wine.",
  "No alcohol tonight.",
  "Đeo trang sức vàng.",
  "Steamed mussels with garlic.",
  "Tôm hấp chín với bún.",
  "Không ăn pate.",
  "Không uống sữa chưa thanh trùng.",
  "Use pasteurised milk in the oats.",
  "Giảm đồ ngọt và chia nhỏ bữa.",
  "She should not eat pâté.",
  "She should not eat blood soup.",
  "She only eats cooked oysters.",
  "Chi an hau da nau chin.",
  "Khong an hau song; hau nau chin thi duoc.",
  "Don't drink herbal tea.",
  "She should not eat green papaya.",
  "Khong uong thuoc nam.",
  "Eat bananas and grapes.",
  "Use 100g of chicken in the soup.",
  "Breakfast is oats and yoghurt.",
  "Khong duoc an pate.",
  "Don't skip breakfast.",
  "Khong nhin an giua cac bua.",
  "She should not fast.",
  "She must not drink farm milk.",
  "Du du chin mot lat.",
  "Eat less sugar with breakfast.",
  "Giá xào với tỏi.",
  "Stir-fried bean sprouts with garlic.",
  "Không ăn rau mầm.",
  "Don't eat raw sprouts.",
  "Sữa tươi tiệt trùng mỗi sáng.",
  "Không giảm cân trong thai kỳ.",
  "Đừng giảm cân khi nghén.",
  "Don't lose weight this trimester.",
  "You can add oats to breakfast.",
  "Pate thì không được.",
  "Pâté is not allowed.",
  "She should not eat bean sprouts.",
  "Không ăn rau mầm.".normalize("NFD")
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
    { locale: "en", text: "Limit mango to one small piece.", block: false },
    { locale: "vi", text: "Ăn mit với sữa chua.", block: true },
    { locale: "vi", text: "Một phần nhỏ sầu riêng.", block: true },
    { locale: "en", text: "Eat durian, one small piece.", block: true },
    { locale: "vi", text: "không cần hạn chế xoài.", block: true },
    { locale: "en", text: "Don't limit mango.", block: true },
    { locale: "vi", text: "Pâté lạnh trên bánh mì.", block: true },
    { locale: "vi", text: "Ăn giò lụa nguội.", block: true },
    { locale: "en", text: "A ham and salami sandwich.", block: true },
    { locale: "vi", text: "Một ly bia sau bữa tối.", block: true },
    { locale: "en", text: "A glass of wine.", block: true },
    { locale: "en", text: "Try a cocktail tonight.", block: true },
    { locale: "en", text: "Soju with dinner.", block: true },
    { locale: "vi", text: "Giá sống trong món gỏi.", block: true },
    { locale: "en", text: "Milk tea after lunch.", block: true },
    { locale: "en", text: "Bubble tea is a snack.", block: true },
    { locale: "vi", text: "Ăn nhãn tươi mỗi ngày.", block: true },
    { locale: "vi", text: "Thử phở cho bữa trưa.".normalize("NFD"), block: true },
    { locale: "vi", text: "Ăn chè.".normalize("NFD"), block: true },
    { locale: "en", text: "Eat mango, one small piece.", block: false },
    { locale: "en", text: "Replace white rice with brown rice.", block: false },
    { locale: "en", text: "Cooked salmon for dinner.", block: false },
    { locale: "vi", text: "Cá hồi nấu chín cho bữa tối.", block: false },
    { locale: "vi", text: "Đọc nhãn dinh dưỡng trước khi mua.", block: false },
    { locale: "en", text: "No mango.", block: false },
    { locale: "vi", text: "Ko an mit.", block: false },
    { locale: "vi", text: "Một phần nhỏ gan gà nấu chín mỗi tuần.", block: false },
    { locale: "en", text: "Try pho for lunch.", block: true },
    { locale: "en", text: "Order oysters on the half shell.", block: true },
    { locale: "vi", text: "Tôm tái với rau thơm.", block: true },
    { locale: "vi", text: "Thuong thuc tiet canh vit.", block: true },
    { locale: "en", text: "A gin and tonic.", block: true },
    { locale: "vi", text: "Sữa bò chưa thanh trùng mỗi sáng.", block: true },
    { locale: "en", text: "Skip raw fish but pâté is fine.", block: true },
    { locale: "vi", text: "An thom chin sau bua trua.", block: true },
    { locale: "vi", text: "Uong tra dao da moi chieu.", block: true },
    { locale: "en", text: "Replace brown rice with white rice.", block: true },
    { locale: "vi", text: "Ăn ít tinh bột để giảm cân.", block: true },
    { locale: "en", text: "Have mango, just a small bowl.", block: false },
    { locale: "en", text: "Steamed mussels with garlic.", block: false },
    { locale: "vi", text: "Không ăn pate.", block: false },
    { locale: "en", text: "Have a kiwi or an apple.", block: false },
    { locale: "vi", text: "Ăn ổi và táo.", block: false },
    { locale: "vi", text: "Không ăn sầu riêng.", block: false },
    { locale: "en", text: "Reheat deli meat until steaming hot.", block: true },
    { locale: "en", text: "Eat animal liver once a week.", block: true },
    { locale: "vi", text: "Thuong thuc tieets canh voi com.", block: true },
    { locale: "vi", text: "Uong suwax soongs moi vat.", block: true },
    { locale: "vi", text: "An mitj sau com trua.", block: true },
    { locale: "vi", text: "Uong nuocws ngotj khi khat.", block: true },
    { locale: "en", text: "Try fasting on two mornings.", block: true },
    { locale: "vi", text: "Bo bua sang de giu dang.", block: true },
    { locale: "en", text: "She skips breakfast to slim down.", block: true },
    { locale: "en", text: "A low-carb plate at lunch.", block: true },
    { locale: "vi", text: "Khong an thit nguoi, pate thi duoc.", block: true },
    { locale: "en", text: "Avoid deli meat except pâté.", block: true },
    { locale: "en", text: "Green papaya salad at lunch.", block: true },
    { locale: "en", text: "Milk from the farm on the oats.", block: true },
    { locale: "en", text: "Add alfalfa sprouts to the bowl.", block: true },
    { locale: "vi", text: "Uong thuoc nam moi toi.", block: true },
    { locale: "en", text: "No limit on grapes.", block: true },
    { locale: "en", text: "She should not eat pâté.", block: false },
    { locale: "en", text: "She only eats cooked oysters.", block: false },
    { locale: "vi", text: "Khong an hau song; hau nau chin thi duoc.", block: false },
    { locale: "en", text: "She should not fast.", block: false },
    { locale: "en", text: "A smaller dinner will curb your appetite.", block: true },
    { locale: "en", text: "Keep your weight down through week eight.", block: true },
    { locale: "vi", text: "Không tăng cân trong tháng này.", block: true },
    { locale: "vi", text: "Không giảm cân trong thai kỳ.", block: false },
    { locale: "en", text: "Add bean sprouts to the noodle bowl.", block: true },
    { locale: "vi", text: "Giá xào với tỏi.", block: false },
    { locale: "en", text: "Milk straight from the cow.", block: true },
    { locale: "en", text: "Have ice cream after lunch.", block: true },
    { locale: "en", text: "Choose white rice instead of oats.", block: true },
    { locale: "en", text: "Use oats instead of white rice.", block: false },
    { locale: "vi", text: "Không phải kiêng pate.", block: true },
    { locale: "en", text: "Pâté is not allowed.", block: false }
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

describe("teen-code leftovers", () => {
  it("converts one Telex or VNI syllable and leaves English tokens alone", () => {
    expect(prepareNote("tieets canh").text).toBe("tiết canh");
    expect(prepareNote("suwax soongs").text).toBe("sữa sống");
    expect(prepareNote("chuwa thanh trungf").text).toBe("chưa thanh trùng");
    expect(prepareNote("tie6t1 canh").text).toBe("tiết canh");
    expect(prepareNote("su7a4 so6ng1").text).toBe("sữa sống");
    expect(prepareNote("xoai2").text).toBe("xoài");
    expect(prepareNote("mitj").text.normalize("NFC")).toBe("mịt");
    expect(prepareNote("nuocws ngotj").text).toBe("nước ngọt");
    expect(prepareNote("Eat bananas and grapes.").text).toBe("Eat bananas and grapes.");
    expect(prepareNote("A can of 7up.").text).toBe("A can of 7up.");
    expect(prepareNote("Use 100g of chicken.").text).toBe("Use 100g of chicken.");
    expect(prepareNote("Breakfast is oats.").text).toBe("Breakfast is oats.");
    expect(prepareNote("raw milk").text).toBe("raw milk");
    expect(prepareNote("ngaix").text.normalize("NFC")).toBe("ngãi");
    expect(prepareNote("cuuws").text.normalize("NFC")).toBe("cứu");
    expect(prepareNote("ngaix cuuws").text.normalize("NFC")).toBe("ngãi cứu");
    expect(prepareNote("breakfast is soft and raw.").text).toBe("breakfast is soft and raw.");
    expect(prepareNote("A box of bananas.").text).toBe("A box of bananas.");
    expect(prepareNote("see the liver.").text).toBe("see the liver.");
  });
});

describe("weight-loss second pass", () => {
  it("drops appetite and weight goals at any week and keeps the sugar exception", () => {
    expect(filterSafeAiNotes(["Curb your appetite before dinner."], { ...profile, pregnancyWeek: 8 })).toEqual([]);
    expect(filterSafeAiNotes(["Eat less sugar with breakfast."], { ...profile, pregnancyWeek: 8 })).toEqual([
      "Eat less sugar with breakfast."
    ]);
    expect(filterSafeAiNotes(["You can add oats to breakfast."], profile)).toEqual(["You can add oats to breakfast."]);
  });

  it("fails closed when the check throws and does not return the note", () => {
    const review = reviewWeightLossNote("Drink water between meals.", () => {
      throw new Error("checker down");
    });
    expect(review).toEqual({ drop: true, reason: "classifier_error" });
    const parted = partitionWeightNotes(["Drink water between meals.", "Curb your appetite before dinner."], (note) => {
      if (note.startsWith("Drink")) throw new Error("checker down");
      return note.toLowerCase().includes("appetite");
    });
    expect(parted.kept).toEqual([]);
    expect(parted.droppedReason).toBe("classifier_error");
  });
});

describe("class probe extras", () => {
  it("treats NFD phở and English pho as high-GI for gestational diabetes", () => {
    const nfd = "Thử phở cho bữa trưa.".normalize("NFD");
    expect(nfd.normalize("NFC")).not.toBe(nfd);
    expect(filterSafeAiNotes([nfd], gdm)).toEqual([]);
    expect(filterSafeAiNotes(["Try pho for lunch."], gdm)).toEqual([]);
    expect(filterSafeAiNotes(["Phở gà nấu chín là bữa dễ ăn."], profile)).toEqual(["Phở gà nấu chín là bữa dễ ăn."]);
  });

  it("keeps a cooked oyster clause and an NFD negation", () => {
    const nfdCooked = "Hàu đã nấu chín.".normalize("NFD");
    const nfdNegated = "Không ăn pate.".normalize("NFD");
    expect(nfdCooked.normalize("NFC")).not.toBe(nfdCooked);
    expect(filterSafeAiNotes([nfdCooked], profile)).toEqual([nfdCooked]);
    expect(filterSafeAiNotes([nfdNegated], profile)).toEqual([nfdNegated]);
    expect(filterSafeAiNotes(["Không ăn hàu sống; hàu nấu chín thì được."], profile)).toEqual([
      "Không ăn hàu sống; hàu nấu chín thì được."
    ]);
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
