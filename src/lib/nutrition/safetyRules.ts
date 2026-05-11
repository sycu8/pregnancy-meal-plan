import type { PregnancyProfile } from "@/types/pregnancy";

export const MEDICAL_DISCLAIMER =
  "Thực đơn được tạo tự động dựa trên thông tin bạn cung cấp và chỉ mang tính tham khảo. Ứng dụng không chẩn đoán, điều trị hoặc thay thế tư vấn từ bác sĩ sản khoa/chuyên gia dinh dưỡng. Nếu bạn có tiểu đường thai kỳ, tăng huyết áp, tiền sản giật, thiếu máu nặng, thai chậm tăng trưởng hoặc bất kỳ vấn đề y khoa nào, hãy hỏi bác sĩ trước khi áp dụng.";

export const LOCAL_PRIVACY_NOTICE =
  "Ở phiên bản miễn phí đầu tiên, thông tin của bạn được lưu trên trình duyệt bằng localStorage. Ứng dụng chưa đồng bộ dữ liệu lên server.";

export function getGeneralPregnancyFoodWarnings(): string[] {
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

export function getConditionSpecificWarnings(profile: PregnancyProfile): string[] {
  const conditions = new Set(profile.healthConditions.filter((condition) => condition !== "none"));
  const notes: string[] = [];

  if (conditions.has("gestational_diabetes") || profile.goals.includes("blood_sugar_control")) {
    notes.push(
      "Tiểu đường thai kỳ: ưu tiên tinh bột chậm, chia nhỏ bữa, tránh nước ép/nước ngọt và hỏi bác sĩ về lượng tinh bột phù hợp."
    );
  }
  if (conditions.has("anemia") || profile.goals.includes("increase_iron_calcium_protein")) {
    notes.push("Thiếu máu/thiếu sắt: tăng thực phẩm giàu sắt kèm vitamin C, tránh trà/cà phê gần bữa chính.");
  }
  if (conditions.has("constipation") || profile.goals.includes("relieve_constipation")) {
    notes.push("Táo bón: tăng chất xơ, nước, sữa chua, rau xanh, đậu và khoai lang theo mức dung nạp.");
  }
  if (conditions.has("morning_sickness") || profile.goals.includes("reduce_nausea")) {
    notes.push("Nghén: chia nhỏ bữa, chọn món ít mùi, mềm, dễ tiêu; có thể thử bánh mì, cháo, khoai hoặc trái cây ít chua.");
  }
  if (conditions.has("fast_weight_gain") || profile.goals.includes("weight_control")) {
    notes.push("Tăng cân nhanh: giảm đồ ngọt, nước ngọt, tinh bột tinh chế; tăng rau, đạm nạc và món hấp/luộc.");
  }
  if (conditions.has("slow_weight_gain") || conditions.has("small_fetus") || profile.goals.includes("healthy_weight_gain")) {
    notes.push("Tăng cân chậm/thai nhỏ: tăng năng lượng lành mạnh từ đạm, sữa tiệt trùng, đậu, hạt và chất béo tốt.");
  }
  if (conditions.has("hypertension") || conditions.has("edema")) {
    notes.push("Tăng huyết áp/phù: giảm món quá mặn, đồ chế biến sẵn; theo dõi theo hướng dẫn của bác sĩ.");
  }
  if (conditions.has("reflux")) {
    notes.push("Trào ngược: ăn lượng nhỏ, tránh nằm ngay sau ăn, hạn chế món nhiều dầu, cay hoặc quá chua nếu làm khó chịu.");
  }
  if (conditions.has("large_fetus")) {
    notes.push("Thai lớn hơn chuẩn: ưu tiên bữa cân bằng, hạn chế đồ ngọt; trao đổi bác sĩ về theo dõi đường huyết nếu cần.");
  }

  return notes;
}

export function detectUrgentWarnings(profile: PregnancyProfile): string[] {
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
      "Bạn có ghi chú có thể liên quan đến dấu hiệu cần theo dõi y tế. Hãy liên hệ bác sĩ hoặc cơ sở y tế sớm để được hướng dẫn."
    ];
  }

  return [];
}
