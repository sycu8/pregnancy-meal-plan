import { gatewayChatCompletion, isBlogAiEnabled, type AiGatewayConfig } from "@/lib/cloudflare/aiGateway";
import { looksVietnamese, looksVietnameseTitle } from "@/lib/blog/localize";
import type { BlogCategorySlug } from "@/types/blog";

export type SynthesisInput = {
  title: string;
  snippet: string;
  sourceName: string;
  url: string;
  /** Optional Vietnamese title hint when the queue title is English */
  titleVi?: string;
  snippetVi?: string;
};

export type SynthesisFaq = {
  question: string;
  answer: string;
};

export type SynthesisLocaleBlock = {
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  faqs: SynthesisFaq[];
};

export type SynthesisOutput = {
  /** Vietnamese (canonical post file) */
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategorySlug;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  imagePrompt?: string;
  faqs?: SynthesisFaq[];
  /** English overlay — required for publish */
  en: SynthesisLocaleBlock;
  usedAi: boolean;
};

const CATEGORY_SLUGS: BlogCategorySlug[] = [
  "dinh-duong-ba-bau",
  "thuc-don-ba-bau",
  "truoc-sinh",
  "sau-sinh",
  "cham-con-0-24-thang"
];

/** Always-bilingual template used when AI is off or incomplete. */
export function synthesizePost(input: SynthesisInput): SynthesisOutput {
  const category = guessCategory(input.title, input.snippet);
  const tags = guessTags(input.title, input.snippet);
  const topicEn = looksVietnamese(input.title) ? stripForEnglishTitle(input.title) : input.title.trim();
  const topicVi = input.titleVi?.trim() || (looksVietnamese(input.title) ? input.title.trim() : `${input.title.trim()} (tham khảo)`);
  const snippetEn = input.snippet.trim().slice(0, 220) || `Educational overview of ${topicEn} for pregnancy and early parenthood.`;
  const snippetVi =
    input.snippetVi?.trim().slice(0, 220) ||
    (looksVietnamese(input.snippet)
      ? input.snippet.trim().slice(0, 220)
      : `Tổng hợp tham khảo về ${topicVi} cho mẹ bầu và gia đình, dựa trên chủ đề từ ${input.sourceName}.`);

  const contentVi = [
    `## Tóm tắt`,
    ``,
    snippetVi,
    ``,
    `## Gợi ý thực hành`,
    ``,
    `- Ưu tiên thực phẩm nấu chín kỹ, rửa sạch rau củ và bảo quản đúng cách.`,
    `- Chia nhỏ bữa ăn nếu nghén hoặc khó ăn no; uống đủ nước trong ngày.`,
    `- Theo dõi phản ứng cơ thể và hỏi bác sĩ sản khoa trước khi thay đổi lớn về dinh dưỡng hoặc thuốc bổ.`,
    ``,
    `## Khi nào cần gặp bác sĩ`,
    ``,
    `Nếu có chảy máu, sốt cao, đau bụng dữ dội, giảm cử động thai hoặc triệu chứng bất thường kéo dài, hãy đến cơ sở y tế ngay.`,
    ``,
    `> Nội dung được tổng hợp tham khảo từ tiêu đề/chủ đề nguồn [${input.sourceName}](${input.url}), không sao chép nguyên văn bài gốc.`
  ].join("\n");

  const contentEn = [
    `## Summary`,
    ``,
    snippetEn,
    ``,
    `## Practical tips`,
    ``,
    `- Prefer thoroughly cooked foods, wash produce well, and store leftovers safely.`,
    `- Eat smaller meals if nausea makes large portions hard; stay hydrated through the day.`,
    `- Track how you feel and ask your obstetrician or midwife before major diet or supplement changes.`,
    ``,
    `## Seek care urgently if`,
    ``,
    `Heavy bleeding, high fever, severe abdominal pain, reduced fetal movement, or symptoms that worsen quickly need prompt medical care.`,
    ``,
    `> Educational overview inspired by the topic from [${input.sourceName}](${input.url}). Not a copy of the source article.`
  ].join("\n");

  const faqsVi: SynthesisFaq[] = [
    {
      question: `${topicVi} — mẹ bầu cần lưu ý gì?`,
      answer: snippetVi
    },
    {
      question: "Nội dung này có thay thế bác sĩ không?",
      answer: "Không. Đây chỉ là thông tin giáo dục tham khảo. Hãy hỏi bác sĩ hoặc chuyên gia dinh dưỡng trước khi thay đổi chế độ ăn."
    },
    {
      question: "Khi nào nên đi khám?",
      answer: "Khi có chảy máu, sốt cao, đau dữ dội, giảm cử động thai hoặc triệu chứng bất thường kéo dài."
    }
  ];

  const faqsEn: SynthesisFaq[] = [
    {
      question: `What should I know about ${topicEn}?`,
      answer: snippetEn
    },
    {
      question: "Does this replace medical advice?",
      answer: "No. This is educational information only. Ask your obstetrician or dietitian before changing your diet."
    },
    {
      question: "When should I seek care?",
      answer: "Seek care for heavy bleeding, high fever, severe pain, reduced fetal movement, or symptoms that worsen quickly."
    }
  ];

  return {
    title: topicVi,
    excerpt: snippetVi,
    content: contentVi,
    category,
    tags,
    metaTitle: `${topicVi} | Pregnancy Meal Planner`.slice(0, 70),
    metaDescription: clampMetaDescription(snippetVi, topicVi, "vi"),
    imagePrompt: buildImagePrompt(topicEn, category),
    faqs: faqsVi,
    en: {
      title: topicEn,
      excerpt: snippetEn,
      content: contentEn,
      metaTitle: `${topicEn} | Pregnancy Meal Planner`.slice(0, 70),
      metaDescription: clampMetaDescription(snippetEn, topicEn, "en"),
      faqs: faqsEn
    },
    usedAi: false
  };
}

export async function synthesizePostWithAi(
  input: SynthesisInput,
  options: { config?: AiGatewayConfig | null } = {}
): Promise<SynthesisOutput> {
  const fallback = synthesizePost(input);
  if (!isBlogAiEnabled() && !options.config) return fallback;

  const system = `You are a bilingual maternal–child health editor for Pregnancy Meal Planner (pregnancymeal.tips).
Write EVERY post in BOTH English and Vietnamese. The website shows English on /blog and Vietnamese on /vi/blog.
HARD RULES:
- Do NOT copy source articles verbatim; use only the title + short snippet as inspiration.
- Do not diagnose or prescribe; remind readers to consult a clinician when needed.
- Prioritize actionable guidance: meal ideas, nutrient groups, food safety, red-flag symptoms.
- Vietnamese fields must be natural Vietnamese. English fields must be natural English (no Vietnamese diacritics in English titles).
- Return EXACTLY one JSON object (no markdown fences), schema:
{
  "title": string (Vietnamese title),
  "excerpt": string (<=220 chars, Vietnamese),
  "content": string (Vietnamese markdown with ## headings; 500-900 words),
  "category": one of ${CATEGORY_SLUGS.join("|")},
  "tags": string[] (3-6 English kebab-case SEO tags, e.g. pregnancy-meal-plan, prenatal-nutrition, postpartum),
  "metaTitle": string (<=60 chars, Vietnamese),
  "metaDescription": string (100-155 chars, Vietnamese),
  "imagePrompt": string (English, photorealistic, no text overlays),
  "faqs": [{"question": string, "answer": string}] (3 Vietnamese FAQ items),
  "en": {
    "title": string (English SEO title),
    "excerpt": string (<=220 chars, English),
    "content": string (English markdown, 700-1200 words),
    "metaTitle": string (<=60 chars, English),
    "metaDescription": string (100-155 chars, English),
    "faqs": [{"question": string, "answer": string}] (3 English FAQ items)
  }
}
Both languages are required. Do not leave "en" empty.`;

  const user = `Topic: ${input.title}
Vietnamese title hint: ${input.titleVi || "(derive natural Vietnamese title)"}
Short description: ${input.snippet || "(none)"}
Vietnamese snippet hint: ${input.snippetVi || "(derive natural Vietnamese excerpt)"}
Inspiration source (do not copy): ${input.sourceName} — ${input.url}
SEO keywords EN: pregnancy meal planner, prenatal nutrition, gestational diabetes meals, postpartum diet, baby weaning
SEO keywords VI: thực đơn mẹ bầu, dinh dưỡng thai kỳ, tiểu đường thai kỳ, sau sinh, ăn dặm`;

  try {
    const raw = await gatewayChatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      { config: options.config, temperature: 0.4, maxTokens: 5500 }
    );
    if (!raw) {
      console.warn("[synthesize] empty AI response — using bilingual template fallback");
      return fallback;
    }

    const parsed = parseJsonObject(raw);
    if (!parsed) {
      console.warn(`[synthesize] JSON parse failed — using bilingual template. raw head: ${raw.slice(0, 220)}`);
      return fallback;
    }

    const category = normalizeCategory(parsed.category) ?? fallback.category;
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.map((t) => String(t).toLowerCase().replace(/\s+/g, "-")).filter(Boolean).slice(0, 6)
      : fallback.tags;

    const title = String(parsed.title || fallback.title).trim();
    const excerpt = String(parsed.excerpt || fallback.excerpt).trim().slice(0, 220);
    const content = String(parsed.content || "").trim();
    if (content.length < 400) {
      console.warn(`[synthesize] VI content too short (${content.length}) — using bilingual template fallback`);
      return fallback;
    }

    const faqs = normalizeFaqs(parsed.faqs) ?? fallback.faqs;
    const en = normalizeEn(parsed.en) ?? fallback.en;
    if (!normalizeEn(parsed.en)) {
      console.warn("[synthesize] EN block missing/weak — filled from bilingual template EN");
    }

    return {
      title,
      excerpt,
      content: ensureSourceNoteVi(content, input),
      category,
      tags: tags.length ? tags : fallback.tags,
      metaTitle: String(parsed.metaTitle || `${title} | Pregnancy Meal Planner`).slice(0, 70),
      metaDescription: clampMetaDescription(String(parsed.metaDescription || excerpt), title, "vi"),
      imagePrompt: String(parsed.imagePrompt || buildImagePrompt(en.title, category)).slice(0, 500),
      faqs,
      en: {
        ...en,
        content: ensureSourceNoteEn(en.content, input)
      },
      usedAi: true
    };
  } catch (error) {
    console.warn("[synthesize] AI failed, using bilingual template:", error);
    return fallback;
  }
}

export function buildImagePrompt(title: string, category: BlogCategorySlug): string {
  const sceneByCategory: Record<BlogCategorySlug, string> = {
    "dinh-duong-ba-bau": "balanced pregnancy meal with vegetables, eggs, and soup on a wooden table",
    "thuc-don-ba-bau": "top-down weekly meal prep of healthy dishes for an expectant mother",
    "truoc-sinh": "calm prenatal care atmosphere with healthy snacks and a pregnancy notebook",
    "sau-sinh": "warm postpartum recovery scene with nutritious soup and soft natural light",
    "cham-con-0-24-thang": "gentle baby weaning bowls with soft vegetables, natural daylight, no faces"
  };

  return [
    "Photorealistic editorial photo,",
    sceneByCategory[category],
    `inspired by topic "${title}",`,
    "soft natural light, shallow depth of field, no text, no watermark, no logos, respectful family-safe imagery"
  ].join(" ");
}

function stripForEnglishTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .trim();
}

function ensureSourceNoteVi(content: string, input: SynthesisInput) {
  if (content.includes(input.url)) return content;
  return `${content.trim()}\n\n> Nội dung tổng hợp tham khảo chủ đề từ [${input.sourceName}](${input.url}), không sao chép nguyên văn.\n`;
}

function ensureSourceNoteEn(content: string, input: SynthesisInput) {
  if (content.includes(input.url)) return content;
  return `${content.trim()}\n\n> Educational overview inspired by [${input.sourceName}](${input.url}). Not a verbatim copy.\n`;
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidate = fenced || raw.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeCategory(value: unknown): BlogCategorySlug | null {
  const slug = String(value ?? "");
  return CATEGORY_SLUGS.includes(slug as BlogCategorySlug) ? (slug as BlogCategorySlug) : null;
}

function normalizeFaqs(value: unknown): SynthesisFaq[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const faqs = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { question?: unknown; answer?: unknown };
      const question = String(row.question ?? "").trim();
      const answer = String(row.answer ?? "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is SynthesisFaq => Boolean(item))
    .slice(0, 5);
  return faqs.length ? faqs : undefined;
}

function normalizeEn(value: unknown): SynthesisLocaleBlock | undefined {
  if (!value || typeof value !== "object") return undefined;
  const row = value as Record<string, unknown>;
  const title = String(row.title ?? "").trim();
  const excerpt = String(row.excerpt ?? "").trim();
  const content = String(row.content ?? "").trim();
  if (!title || !content || content.length < 200) return undefined;
  if (looksVietnameseTitle(title)) return undefined;
  const faqs = normalizeFaqs(row.faqs) ?? [
    {
      question: `What should I know about ${title}?`,
      answer: excerpt || content.slice(0, 180)
    }
  ];
  return {
    title,
    excerpt: excerpt.slice(0, 220),
    content,
    metaTitle: String(row.metaTitle || `${title} | Pregnancy Meal Planner`).slice(0, 70),
    metaDescription: clampMetaDescription(String(row.metaDescription || excerpt), title, "en"),
    faqs
  };
}

/** Keep SERP snippets in the 100–155 character band used site-wide. */
export function clampMetaDescription(input: string, title: string, locale: "en" | "vi"): string {
  const MIN = 100;
  const MAX = 155;
  let text = String(input || "").trim().replace(/\s+/g, " ");
  if (!text) text = title.trim();
  if (!/[.!?…]$/.test(text)) text += ".";

  if (text.length < MIN) {
    const suffix =
      locale === "en"
        ? " Practical tips for pregnancy and early parenting — educational reference only."
        : " Gợi ý thực tế cho mẹ bầu và chăm con nhỏ — chỉ mang tính tham khảo giáo dục.";
    text = `${text.replace(/[.!?…]$/, "")}.${suffix}`.replace(/\s+/g, " ").trim();
  }

  if (text.length > MAX) {
    text = text.slice(0, MAX - 1).replace(/\s+\S*$/, "").trim();
    if (!/[.!?…]$/.test(text)) text += ".";
  }

  if (text.length < MIN) {
    const pad = locale === "en" ? " Read more on Pregnancy Meal Planner." : " Đọc thêm trên Pregnancy Meal Planner.";
    text = `${text.replace(/[.!?…]$/, "")}.${pad}`.trim().slice(0, MAX);
  }

  return text;
}

function guessCategory(title: string, snippet: string): BlogCategorySlug {
  const text = `${title} ${snippet}`.toLowerCase();
  if (/(sau sinh|hậu sản|postpartum|cho con bú|breastfeed)/i.test(text)) return "sau-sinh";
  if (/(trẻ|sơ sinh|ăn dặm|baby|infant|weaning|toddler)/i.test(text)) return "cham-con-0-24-thang";
  if (/(thực đơn|menu|meal plan|đường huyết|tiểu đường|gestational diabetes)/i.test(text)) return "thuc-don-ba-bau";
  if (/(vitamin|folate|sắt|iron|canxi|calcium|dinh dưỡng|nutrition|omega)/i.test(text)) return "dinh-duong-ba-bau";
  return "truoc-sinh";
}

function guessTags(title: string, snippet: string): string[] {
  const text = `${title} ${snippet}`.toLowerCase();
  // Prefer English SEO-friendly tags; UI maps them to localized labels.
  const tags = new Set<string>();
  if (/nghén|nghen|nausea|morning sickness/i.test(text)) {
    tags.add("nausea");
  }
  if (/tiểu đường|tieu duong|gdm|gestational diabetes/i.test(text)) {
    tags.add("gestational-diabetes");
  }
  if (/thiếu máu|thieu mau|anemia|iron/i.test(text)) {
    tags.add("iron");
  }
  if (/táo bón|tao bon|constipation/i.test(text)) {
    tags.add("constipation");
  }
  if (/thực đơn|thuc don|meal plan|menu/i.test(text)) {
    tags.add("meal-plan");
  }
  if (/sau sinh|postpartum|cho con bú|breastfeed/i.test(text)) {
    tags.add("postpartum");
  }
  if (/ăn dặm|an dam|weaning|starting solids/i.test(text)) {
    tags.add("weaning");
  }
  if (tags.size === 0) {
    tags.add("pregnancy");
    tags.add("nutrition");
  }
  return [...tags].slice(0, 6);
}
