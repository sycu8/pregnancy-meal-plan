import type { BlogCategorySlug } from "@/types/blog";

export type EditorialTopic = {
  id: string;
  title: string;
  snippet: string;
  category: BlogCategorySlug;
  tags: string[];
};

/** English-first topic bank for international SEO/GEO (pregnancy nutrition & meal plans). */
export const EDITORIAL_TOPICS: EditorialTopic[] = [
  {
    id: "7-day-pregnancy-meal-plan",
    title: "7-day pregnancy meal plan: balanced plates for busy weeks",
    snippet:
      "A practical 7-day pregnancy meal plan with protein, iron, folate, calcium and fiber — plus snack ideas and grocery batching tips.",
    category: "thuc-don-ba-bau",
    tags: ["meal-plan", "pregnancy", "nutrition"]
  },
  {
    id: "first-trimester-nutrition-checklist",
    title: "First trimester nutrition checklist: folate, iron and safer foods",
    snippet:
      "What to prioritize in weeks 1–12: folic acid, iron-rich foods, hydration, and foods to cook thoroughly during early pregnancy.",
    category: "dinh-duong-ba-bau",
    tags: ["first-trimester", "folate", "iron"]
  },
  {
    id: "nausea-friendly-meals",
    title: "Nausea-friendly pregnancy meals that still cover key nutrients",
    snippet:
      "Smaller meals, gentler textures, and nutrient-dense snacks when morning sickness makes eating hard.",
    category: "thuc-don-ba-bau",
    tags: ["nausea", "meal-plan"]
  },
  {
    id: "gestational-diabetes-meal-ideas",
    title: "Gestational diabetes meal ideas: balanced carbs, protein and fiber",
    snippet:
      "Educational plate-building ideas for gestational diabetes monitoring — always follow your clinician’s targets.",
    category: "thuc-don-ba-bau",
    tags: ["gestational-diabetes", "meal-plan"]
  },
  {
    id: "foods-to-limit-in-pregnancy",
    title: "Foods to limit or cook thoroughly during pregnancy",
    snippet:
      "Food-safety guidance inspired by CDC/NHS/FDA themes: deli meats, unpasteurized dairy, high-mercury fish, and undercooked foods.",
    category: "dinh-duong-ba-bau",
    tags: ["food-safety", "pregnancy"]
  },
  {
    id: "omega-3-dha-pregnancy",
    title: "Omega-3 and DHA in pregnancy: food sources and supplement cautions",
    snippet:
      "Why DHA matters for fetal development, low-mercury fish options, and when to ask a clinician about supplements.",
    category: "dinh-duong-ba-bau",
    tags: ["omega-3", "dha"]
  },
  {
    id: "iron-deficiency-pregnancy-meals",
    title: "Iron-rich pregnancy meals (with vitamin C pairing tips)",
    snippet:
      "Heme and non-heme iron meal ideas, vitamin C pairings, and tea/coffee timing notes for iron absorption.",
    category: "thuc-don-ba-bau",
    tags: ["iron", "anemia"]
  },
  {
    id: "third-trimester-meal-plan",
    title: "Third trimester meal plan: energy, fiber and reflux-friendly plates",
    snippet:
      "Later-pregnancy meal ideas with slightly higher energy needs, fiber for constipation, and smaller dinners for reflux.",
    category: "thuc-don-ba-bau",
    tags: ["third-trimester", "meal-plan"]
  },
  {
    id: "postpartum-breastfeeding-nutrition",
    title: "Postpartum and breastfeeding nutrition: recovery plates that work",
    snippet:
      "Protein, fluids, calcium and practical meal prep for the early postpartum weeks while breastfeeding.",
    category: "sau-sinh",
    tags: ["postpartum", "breastfeeding"]
  },
  {
    id: "starting-solids-6-months",
    title: "Starting solids around 6 months: readiness signs and first foods",
    snippet:
      "Baby-led and spoon-fed approaches, iron-rich first foods, allergen introduction basics, and choking-safety reminders.",
    category: "cham-con-0-24-thang",
    tags: ["weaning", "6-months"]
  },
  {
    id: "pregnancy-snack-ideas",
    title: "Healthy pregnancy snacks under 15 minutes",
    snippet:
      "Ten snack ideas with protein and fiber for between-meal energy — yogurt, eggs, fruit, nuts and whole grains.",
    category: "thuc-don-ba-bau",
    tags: ["snacks", "meal-plan"]
  },
  {
    id: "toddler-12-24-month-nutrition",
    title: "Toddler nutrition 12–24 months: joining family meals safely",
    snippet:
      "How to transition toward family meals, limit added sugar/salt, and keep portions age-appropriate.",
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
