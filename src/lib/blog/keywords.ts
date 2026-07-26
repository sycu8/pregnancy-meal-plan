import type { BlogCategorySlug, BlogLocale, BlogPost } from "@/types/blog";

/** Core English SEO keywords for the blog index and related surfaces. */
export const BLOG_CORE_KEYWORDS_EN = [
  "pregnancy meal planner",
  "prenatal nutrition",
  "pregnancy meal plan",
  "7 day pregnancy meal plan",
  "gestational diabetes meal plan",
  "postpartum diet",
  "breastfeeding nutrition",
  "baby weaning",
  "starting solids",
  "first trimester nutrition",
  "second trimester meals",
  "third trimester diet",
  "foods to avoid in pregnancy",
  "pregnancy snack ideas",
  "infant nutrition",
  "healthy meals for pregnant women"
] as const;

const CATEGORY_KEYWORDS_EN: Record<BlogCategorySlug, string[]> = {
  "dinh-duong-ba-bau": ["prenatal nutrition", "pregnancy diet", "nutrients in pregnancy"],
  "thuc-don-ba-bau": ["pregnancy meal plan", "prenatal meal planner", "weekly pregnancy menu"],
  "truoc-sinh": ["birth preparation", "prenatal checkup", "third trimester"],
  "sau-sinh": ["postpartum diet", "breastfeeding nutrition", "postpartum recovery"],
  "cham-con-0-24-thang": ["baby nutrition", "starting solids", "infant feeding"]
};

/**
 * Map stored tag slugs (often Vietnamese kebab-case) to English keyword phrases.
 * Used for metadata, JSON-LD, and visible labels on English blog pages.
 */
export const TAG_KEYWORDS_EN: Record<string, string> = {
  "dinh-duong": "prenatal nutrition",
  "suc-khoe": "pregnancy health",
  "sau-sinh": "postpartum",
  "thuc-don": "pregnancy meal plan",
  "an-toan": "food safety in pregnancy",
  "an-toan-thuc-pham": "food safety in pregnancy",
  "cho-con-bu": "breastfeeding",
  "3-thang-cuoi": "third trimester",
  "3-thang-dau": "first trimester",
  "3-thang-giua": "second trimester",
  "tieu-duong-thai-ky": "gestational diabetes",
  "tieu-duong": "gestational diabetes",
  "kham-thai": "prenatal checkup",
  "an-dam": "starting solids",
  "can-gap": "when to seek care",
  sat: "iron in pregnancy",
  "thieu-mau": "iron deficiency anemia",
  "tien-san-giat": "preeclampsia",
  "so-sinh": "newborn care",
  "me-bau": "pregnant women",
  folate: "folate",
  "duong-huyet": "blood sugar in pregnancy",
  "tang-huyet-ap": "high blood pressure in pregnancy",
  "tao-bon": "constipation in pregnancy",
  "tang-can": "pregnancy weight gain",
  "tam-soat": "prenatal screening",
  "lan-dau": "first pregnancy",
  "cu-dong-thai": "fetal movement",
  magie: "magnesium in pregnancy",
  "xet-nghiem": "pregnancy lab tests",
  "mo-lay-thai": "cesarean recovery",
  "omega-3": "omega-3 in pregnancy",
  dha: "DHA in pregnancy",
  "an-chay": "vegetarian pregnancy diet",
  vitamin: "prenatal vitamins",
  "chat-xo": "fiber in pregnancy",
  "vitamin-a": "vitamin A in pregnancy",
  canxi: "calcium in pregnancy",
  "san-khoa": "obstetric care",
  "tiem-chung": "pregnancy vaccines",
  pregnancy: "pregnancy",
  nutrition: "prenatal nutrition",
  "meal-plan": "pregnancy meal plan",
  nausea: "morning sickness",
  nghen: "morning sickness",
  constipation: "constipation in pregnancy",
  postpartum: "postpartum",
  breastfeeding: "breastfeeding",
  weaning: "baby weaning",
  toddler: "toddler nutrition",
  snacks: "pregnancy snacks",
  iron: "iron in pregnancy",
  anemia: "iron deficiency anemia",
  "food-safety": "food safety in pregnancy",
  "first-trimester": "first trimester",
  "third-trimester": "third trimester",
  "6-months": "starting solids at 6 months",
  "gestational-diabetes": "gestational diabetes",
  "pregnancy-meal-plan": "pregnancy meal plan",
  "prenatal-nutrition": "prenatal nutrition",
  nuoc: "hydration in pregnancy",
  protein: "protein in pregnancy",
  caffeine: "caffeine in pregnancy",
  fish: "fish in pregnancy",
  mercury: "mercury in fish",
  listeria: "listeria in pregnancy"
};

function foldKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "-");
}

function uniqueKeywords(values: Array<string | undefined | null>, limit = 12): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const next = value?.trim().replace(/\s+/g, " ");
    if (!next) continue;
    const key = next.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(next);
    if (out.length >= limit) break;
  }
  return out;
}

/** English display label for a stored tag slug. */
export function englishKeywordLabel(tag: string): string {
  const key = foldKey(tag);
  return TAG_KEYWORDS_EN[key] ?? key.replace(/-/g, " ");
}

/** Locale-aware tag label — English phrases on EN pages, readable local labels on VI. */
export function keywordLabel(tag: string, locale: BlogLocale = "en"): string {
  if (locale === "en") return englishKeywordLabel(tag);
  return tag.replace(/-/g, " ");
}

/** English keywords for the main blog listing page. */
export function buildBlogListKeywords(locale: BlogLocale = "en"): string[] {
  if (locale === "en") return [...BLOG_CORE_KEYWORDS_EN];
  // Keep a few English brand terms on VI pages for bilingual SEO.
  return [
    "thực đơn mẹ bầu",
    "dinh dưỡng thai kỳ",
    "thực đơn bà bầu 7 ngày",
    "sau sinh",
    "ăn dặm",
    "pregnancy meal planner",
    "prenatal nutrition"
  ];
}

/** English keywords for a category landing page. */
export function buildCategoryKeywords(category: BlogCategorySlug, locale: BlogLocale = "en"): string[] {
  const categoryKeywords = CATEGORY_KEYWORDS_EN[category] ?? [];
  if (locale === "en") {
    return uniqueKeywords([...categoryKeywords, ...BLOG_CORE_KEYWORDS_EN.slice(0, 6)]);
  }
  return uniqueKeywords([...categoryKeywords, ...buildBlogListKeywords("vi")]);
}

/**
 * Build English-first keywords for an article from category + tags + core terms.
 * These feed <meta name="keywords">, JSON-LD, and the on-page keyword row.
 */
export function buildPostKeywords(post: BlogPost, locale: BlogLocale = "en"): string[] {
  const fromTags = post.tags.map((tag) => englishKeywordLabel(tag));
  const fromCategory = CATEGORY_KEYWORDS_EN[post.category] ?? [];
  const trimesterKeyword =
    post.trimester === "3-thang-dau"
      ? "first trimester nutrition"
      : post.trimester === "3-thang-giua"
        ? "second trimester meals"
        : post.trimester === "3-thang-cuoi"
          ? "third trimester diet"
          : undefined;
  const babyKeyword =
    post.babyAgeRange === "0-6-thang"
      ? "newborn feeding"
      : post.babyAgeRange === "6-12-thang"
        ? "starting solids"
        : post.babyAgeRange === "12-24-thang"
          ? "toddler nutrition"
          : undefined;

  const english = uniqueKeywords(
    [
      ...fromTags,
      ...fromCategory,
      trimesterKeyword,
      babyKeyword,
      "pregnancy meal planner",
      "prenatal nutrition"
    ],
    12
  );

  if (locale === "en") return english;

  // VI pages still expose English SEO keywords plus a few Vietnamese phrases.
  return uniqueKeywords([...english.slice(0, 8), "thực đơn mẹ bầu", "dinh dưỡng thai kỳ", "mẹ bầu"], 12);
}

export function keywordsMetaValue(keywords: string[]): string {
  return keywords.join(", ");
}
