import type { PregnancyProfile } from "@/types/pregnancy";
import type { Locale } from "@/lib/i18n";

export const MEDICAL_DISCLAIMER =
  "Thực đơn được tạo tự động dựa trên thông tin bạn cung cấp và chỉ mang tính tham khảo. Ứng dụng không chẩn đoán, điều trị hoặc thay thế tư vấn từ bác sĩ sản khoa/chuyên gia dinh dưỡng. Nếu bạn có tiểu đường thai kỳ, tăng huyết áp, tiền sản giật, thiếu máu nặng, thai chậm tăng trưởng hoặc bất kỳ vấn đề y khoa nào, hãy hỏi bác sĩ trước khi áp dụng.";

export const LOCAL_PRIVACY_NOTICE =
  "Ở phiên bản miễn phí đầu tiên, thông tin của bạn được lưu trên trình duyệt bằng localStorage. Ứng dụng chưa đồng bộ dữ liệu lên server.";

export const ENGLISH_MEDICAL_DISCLAIMER =
  "This meal plan is generated automatically from the information you provide and is for reference only. The app does not diagnose, treat or replace advice from an obstetrician or registered dietitian. If you have gestational diabetes, hypertension, preeclampsia risk, severe anemia, fetal growth concerns or any medical issue, ask your clinician before following the plan.";

export function getGeneralPregnancyFoodWarnings(locale: Locale = "vi"): string[] {
  if (locale === "en") {
    return [
      "Avoid raw or undercooked food; cook meat, fish, eggs and seafood thoroughly.",
      "Avoid high-mercury fish such as swordfish, shark and king mackerel; choose lower-mercury fish in moderate amounts.",
      "Avoid unpasteurized milk or cheese.",
      "Avoid chilled pate, deli meats or sausages unless reheated until steaming hot.",
      "Do not drink alcohol.",
      "Limit caffeine; ask your clinician if you drink coffee, strong tea or energy drinks daily.",
      "Be cautious with herbal remedies, traditional medicine or supplements from unclear sources.",
      "Do not eat too much animal liver because it may contain excess retinol-form vitamin A.",
      "Limit sugary drinks and high-sugar foods, especially if you have gestational diabetes."
    ];
  }

  return [
    "Không ăn đồ sống/tái; nấu chín kỹ thịt, cá, trứng và hải sản.",
    "Tránh cá thủy ngân cao như cá kiếm, cá mập, cá thu vua; ưu tiên cá ít thủy ngân và dùng lượng vừa phải.",
    "Tránh sữa hoặc phô mai chưa tiệt trùng.",
    "Tránh pate lạnh, thịt nguội hoặc xúc xích chưa làm nóng kỹ.",
    "Không dùng rượu bia.",
    "Hạn chế caffeine; hỏi bác sĩ nếu bạn đang uống cà phê, trà đặc hoặc nước tăng lực hằng ngày.",
    "Cẩn trọng với thảo mộc, thuốc nam hoặc thực phẩm bổ sung không rõ nguồn gốc.",
    "Không ăn quá nhiều gan động vật vì có thể dư vitamin A dạng retinol.",
    "Hạn chế nước ngọt và đồ nhiều đường, đặc biệt nếu có tiểu đường thai kỳ."
  ];
}

export function getConditionSpecificWarnings(profile: PregnancyProfile, locale: Locale = "vi"): string[] {
  const conditions = new Set(profile.healthConditions.filter((condition) => condition !== "none"));
  const notes: string[] = [];

  if (conditions.has("gestational_diabetes") || profile.goals.includes("blood_sugar_control")) {
    notes.push(
      locale === "vi"
        ? "Tiểu đường thai kỳ: ưu tiên tinh bột chậm, chia nhỏ bữa, tránh nước ép/nước ngọt và hỏi bác sĩ về lượng tinh bột phù hợp."
        : "Gestational diabetes: prioritize slow-digesting carbohydrates, split meals into smaller portions, avoid juice and sugary drinks, and ask your clinician about the right carbohydrate amount."
    );
  }
  if (conditions.has("anemia") || profile.goals.includes("increase_iron_calcium_protein")) {
    notes.push(
      locale === "vi"
        ? "Thiếu máu/thiếu sắt: tăng thực phẩm giàu sắt kèm vitamin C, tránh trà/cà phê gần bữa chính."
        : "Anemia or low iron: add iron-rich foods with vitamin C, and avoid tea or coffee close to main meals."
    );
  }
  if (conditions.has("constipation") || profile.goals.includes("relieve_constipation")) {
    notes.push(
      locale === "vi"
        ? "Táo bón: tăng chất xơ, nước, sữa chua, rau xanh, đậu và khoai lang theo mức dung nạp."
        : "Constipation: increase fiber, water, yogurt, leafy greens, beans and sweet potato as tolerated."
    );
  }
  if (conditions.has("morning_sickness") || profile.goals.includes("reduce_nausea")) {
    notes.push(
      locale === "vi"
        ? "Nghén: chia nhỏ bữa, chọn món ít mùi, mềm, dễ tiêu; có thể thử bánh mì, cháo, khoai hoặc trái cây ít chua."
        : "Morning sickness: eat smaller meals and choose mild-smelling, soft, easy-to-digest foods such as bread, porridge, potatoes or less acidic fruit."
    );
  }
  if (conditions.has("fast_weight_gain") || profile.goals.includes("weight_control")) {
    notes.push(
      locale === "vi"
        ? "Tăng cân nhanh: giảm đồ ngọt, nước ngọt, tinh bột tinh chế; tăng rau, đạm nạc và món hấp/luộc."
        : "Fast weight gain: reduce sweets, sugary drinks and refined starches; add vegetables, lean protein and steamed or boiled dishes."
    );
  }
  if (conditions.has("slow_weight_gain") || conditions.has("small_fetus") || profile.goals.includes("healthy_weight_gain")) {
    notes.push(
      locale === "vi"
        ? "Tăng cân chậm/thai nhỏ: tăng năng lượng lành mạnh từ đạm, sữa tiệt trùng, đậu, hạt và chất béo tốt."
        : "Slow weight gain or smaller fetal growth: add healthy energy from protein, pasteurized dairy, beans, nuts and healthy fats."
    );
  }
  if (conditions.has("hypertension") || conditions.has("edema")) {
    notes.push(
      locale === "vi"
        ? "Tăng huyết áp/phù: giảm món quá mặn, đồ chế biến sẵn; theo dõi theo hướng dẫn của bác sĩ."
        : "High blood pressure or swelling: reduce very salty foods and processed foods; follow your clinician's monitoring guidance."
    );
  }
  if (conditions.has("reflux")) {
    notes.push(
      locale === "vi"
        ? "Trào ngược: ăn lượng nhỏ, tránh nằm ngay sau ăn, hạn chế món nhiều dầu, cay hoặc quá chua nếu làm khó chịu."
        : "Reflux: eat smaller portions, avoid lying down right after meals, and limit oily, spicy or very sour foods if they trigger discomfort."
    );
  }
  if (conditions.has("large_fetus")) {
    notes.push(
      locale === "vi"
        ? "Thai lớn hơn chuẩn: ưu tiên bữa cân bằng, hạn chế đồ ngọt; trao đổi bác sĩ về theo dõi đường huyết nếu cần."
        : "Baby measuring larger: prioritize balanced meals, limit sweets and ask your clinician whether blood-sugar monitoring is needed."
    );
  }

  return notes;
}

export function detectUrgentWarnings(profile: PregnancyProfile, locale: Locale = "vi"): string[] {
  const note = profile.doctorNote?.toLowerCase() ?? "";
  const urgentKeywords = [
    "ra máu",
    "xuất huyết",
    "đau bụng dữ dội",
    "phù nhiều",
    "đau đầu dữ dội",
    "nhìn mờ",
    "huyết áp cao",
    "thai máy giảm",
    "nôn ói không ăn uống được"
  ];

  if (urgentKeywords.some((keyword) => note.includes(keyword))) {
    return [
      locale === "vi"
        ? "Bạn có ghi chú có thể liên quan đến dấu hiệu cần theo dõi y tế. Hãy liên hệ bác sĩ hoặc cơ sở y tế sớm để được hướng dẫn."
        : "Your note may mention symptoms that need medical follow-up. Contact your clinician or a healthcare facility soon for guidance."
    ];
  }

  return [];
}
