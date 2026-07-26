import type { BlogCategorySlug } from "@/types/blog";

export type EditorialTopic = {
  id: string;
  /** English title (used on /blog and as AI EN seed) */
  title: string;
  /** English snippet */
  snippet: string;
  /** Vietnamese title (used on /vi/blog and as AI VI seed) */
  titleVi: string;
  /** Vietnamese snippet */
  snippetVi: string;
  category: BlogCategorySlug;
  tags: string[];
};

/** Bilingual topic bank — every seed publishes EN + VI content. */
export const EDITORIAL_TOPICS: EditorialTopic[] = [
  {
    id: "7-day-pregnancy-meal-plan",
    title: "7-day pregnancy meal plan: balanced plates for busy weeks",
    snippet:
      "A practical 7-day pregnancy meal plan with protein, iron, folate, calcium and fiber — plus snack ideas and grocery batching tips.",
    titleVi: "Thực đơn mẹ bầu 7 ngày: bữa ăn cân bằng cho tuần bận rộn",
    snippetVi:
      "Gợi ý thực đơn 7 ngày với đạm, sắt, folate, canxi và chất xơ — kèm bữa phụ và mẹo đi chợ theo đợt.",
    category: "thuc-don-ba-bau",
    tags: ["meal-plan", "pregnancy", "nutrition"]
  },
  {
    id: "first-trimester-nutrition-checklist",
    title: "First trimester nutrition checklist: folate, iron and safer foods",
    snippet:
      "What to prioritize in weeks 1–12: folic acid, iron-rich foods, hydration, and foods to cook thoroughly during early pregnancy.",
    titleVi: "Checklist dinh dưỡng 3 tháng đầu: folate, sắt và thực phẩm an toàn",
    snippetVi:
      "Ưu tiên axit folic, thực phẩm giàu sắt, đủ nước và nấu chín kỹ trong tuần 1–12.",
    category: "dinh-duong-ba-bau",
    tags: ["first-trimester", "folate", "iron"]
  },
  {
    id: "nausea-friendly-meals",
    title: "Nausea-friendly pregnancy meals that still cover key nutrients",
    snippet:
      "Smaller meals, gentler textures, and nutrient-dense snacks when morning sickness makes eating hard.",
    titleVi: "Thực đơn khi nghén: món dễ ăn vẫn đủ chất",
    snippetVi: "Chia nhỏ bữa, chọn món dễ tiêu và bữa phụ giàu dinh dưỡng khi nghén nặng.",
    category: "thuc-don-ba-bau",
    tags: ["nausea", "meal-plan"]
  },
  {
    id: "gestational-diabetes-meal-ideas",
    title: "Gestational diabetes meal ideas: balanced carbs, protein and fiber",
    snippet:
      "Educational plate-building ideas for gestational diabetes monitoring — always follow your clinician’s targets.",
    titleVi: "Gợi ý thực đơn tiểu đường thai kỳ: tinh bột, đạm và chất xơ cân bằng",
    snippetVi:
      "Cách xếp đĩa ăn khi theo dõi đường huyết thai kỳ — mang tính tham khảo, cần bác sĩ chỉ định.",
    category: "thuc-don-ba-bau",
    tags: ["gestational-diabetes", "meal-plan"]
  },
  {
    id: "foods-to-limit-in-pregnancy",
    title: "Foods to limit or cook thoroughly during pregnancy",
    snippet:
      "Food-safety guidance inspired by CDC/NHS/FDA themes: deli meats, unpasteurized dairy, high-mercury fish, and undercooked foods.",
    titleVi: "Thực phẩm mẹ bầu nên hạn chế hoặc nấu chín kỹ",
    snippetVi:
      "Gợi ý an toàn thực phẩm: thịt nguội, sữa chưa tiệt trùng, cá thủy ngân cao và đồ sống/tái.",
    category: "dinh-duong-ba-bau",
    tags: ["food-safety", "pregnancy"]
  },
  {
    id: "omega-3-dha-pregnancy",
    title: "Omega-3 and DHA in pregnancy: food sources and supplement cautions",
    snippet:
      "Why DHA matters for fetal development, low-mercury fish options, and when to ask a clinician about supplements.",
    titleVi: "Omega-3 và DHA khi mang thai: nguồn thực phẩm và lưu ý viên uống",
    snippetVi: "Vai trò DHA, cá ít thủy ngân và khi nào cần hỏi bác sĩ trước khi dùng viên uống.",
    category: "dinh-duong-ba-bau",
    tags: ["omega-3", "dha"]
  },
  {
    id: "iron-deficiency-pregnancy-meals",
    title: "Iron-rich pregnancy meals (with vitamin C pairing tips)",
    snippet:
      "Heme and non-heme iron meal ideas, vitamin C pairings, and tea/coffee timing notes for iron absorption.",
    titleVi: "Thực đơn giàu sắt cho mẹ bầu (kết hợp vitamin C)",
    snippetVi: "Món giàu sắt heme/non-heme, kết hợp vitamin C và lưu ý trà/cà phê.",
    category: "thuc-don-ba-bau",
    tags: ["iron", "anemia"]
  },
  {
    id: "third-trimester-meal-plan",
    title: "Third trimester meal plan: energy, fiber and reflux-friendly plates",
    snippet:
      "Later-pregnancy meal ideas with slightly higher energy needs, fiber for constipation, and smaller dinners for reflux.",
    titleVi: "Thực đơn 3 tháng cuối: đủ năng lượng, giảm ợ nóng",
    snippetVi: "Tăng nhẹ năng lượng, ưu tiên chất xơ và chia nhỏ bữa tối để giảm trào ngược.",
    category: "thuc-don-ba-bau",
    tags: ["third-trimester", "meal-plan"]
  },
  {
    id: "postpartum-breastfeeding-nutrition",
    title: "Postpartum and breastfeeding nutrition: recovery plates that work",
    snippet:
      "Protein, fluids, calcium and practical meal prep for the early postpartum weeks while breastfeeding.",
    titleVi: "Dinh dưỡng sau sinh và cho con bú: bữa ăn phục hồi thực tế",
    snippetVi: "Đạm, nước, canxi và cách chuẩn bị bữa ăn những tuần đầu sau sinh.",
    category: "sau-sinh",
    tags: ["postpartum", "breastfeeding"]
  },
  {
    id: "starting-solids-6-months",
    title: "Starting solids around 6 months: readiness signs and first foods",
    snippet:
      "Baby-led and spoon-fed approaches, iron-rich first foods, allergen introduction basics, and choking-safety reminders.",
    titleVi: "Bắt đầu ăn dặm khoảng 6 tháng: dấu hiệu sẵn sàng và món đầu tay",
    snippetVi: "BLW hoặc thìa, món giàu sắt, giới thiệu dị nguyên và lưu ý chống hóc.",
    category: "cham-con-0-24-thang",
    tags: ["weaning", "6-months"]
  },
  {
    id: "pregnancy-snack-ideas",
    title: "Healthy pregnancy snacks under 15 minutes",
    snippet:
      "Ten snack ideas with protein and fiber for between-meal energy — yogurt, eggs, fruit, nuts and whole grains.",
    titleVi: "Bữa phụ mẹ bầu dưới 15 phút",
    snippetVi: "10 ý tưởng bữa phụ giàu đạm và chất xơ: sữa chua, trứng, trái cây, hạt, ngũ cốc nguyên cám.",
    category: "thuc-don-ba-bau",
    tags: ["snacks", "meal-plan"]
  },
  {
    id: "toddler-12-24-month-nutrition",
    title: "Toddler nutrition 12–24 months: joining family meals safely",
    snippet:
      "How to transition toward family meals, limit added sugar/salt, and keep portions age-appropriate.",
    titleVi: "Dinh dưỡng trẻ 12–24 tháng: chuyển sang ăn cùng gia đình",
    snippetVi: "Chuyển dần khẩu phần gia đình, hạn chế đường muối và giữ khẩu phần phù hợp tuổi.",
    category: "cham-con-0-24-thang",
    tags: ["toddler", "nutrition"]
  }
];

export function pickEditorialTopics(count: number, daySeed = new Date().toISOString().slice(0, 10)): EditorialTopic[] {
  if (count <= 0) return [];
  const offset = hashString(daySeed) % EDITORIAL_TOPICS.length;
  const picked: EditorialTopic[] = [];
  for (let i = 0; i < Math.min(count, EDITORIAL_TOPICS.length); i++) {
    picked.push(EDITORIAL_TOPICS[(offset + i) % EDITORIAL_TOPICS.length]!);
  }
  return picked;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
