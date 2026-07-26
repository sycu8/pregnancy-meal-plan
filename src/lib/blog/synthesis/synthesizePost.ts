import { gatewayChatCompletion, isBlogAiEnabled, type AiGatewayConfig } from "@/lib/cloudflare/aiGateway";
import type { BlogCategorySlug } from "@/types/blog";

export type SynthesisInput = {
  title: string;
  snippet: string;
  sourceName: string;
  url: string;
};

export type SynthesisFaq = {
  question: string;
  answer: string;
};

export type SynthesisOutput = {
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategorySlug;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  imagePrompt?: string;
  faqs?: SynthesisFaq[];
  en?: {
    title: string;
    excerpt: string;
    content: string;
    metaTitle: string;
    metaDescription: string;
  };
  usedAi: boolean;
};

const CATEGORY_SLUGS: BlogCategorySlug[] = [
  "dinh-duong-ba-bau",
  "thuc-don-ba-bau",
  "truoc-sinh",
  "sau-sinh",
  "cham-con-0-24-thang"
];

export function synthesizePost(input: SynthesisInput): SynthesisOutput {
  const category = guessCategory(input.title, input.snippet);
  const tags = guessTags(input.title, input.snippet);

  const excerpt =
    input.snippet.trim().slice(0, 220) ||
    `Tổng hợp tham khảo về ${input.title.toLowerCase()} cho mẹ bầu và gia đình, dựa trên chủ đề từ ${input.sourceName}.`;

  const content = [
    `## Tóm tắt`,
    ``,
    excerpt,
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

  return {
    title: input.title.trim(),
    excerpt,
    content,
    category,
    tags,
    imagePrompt: buildImagePrompt(input.title, category),
    faqs: [
      {
        question: `${input.title.trim()} — mẹ bầu cần lưu ý gì?`,
        answer: excerpt
      }
    ],
    usedAi: false
  };
}

export async function synthesizePostWithAi(
  input: SynthesisInput,
  options: { config?: AiGatewayConfig | null } = {}
): Promise<SynthesisOutput> {
  const fallback = synthesizePost(input);
  if (!isBlogAiEnabled() && !options.config) return fallback;

  const system = `You are a maternal–child health editor for Pregnancy Meal Planner (mebauangi.info), targeting an international English-first audience.
Write clear, practical, educational content optimized for SEO/GEO on prenatal nutrition, pregnancy meal plans, postpartum recovery, and baby feeding.
HARD RULES:
- Do NOT copy source articles verbatim; use only the title + short snippet as inspiration.
- Do not diagnose or prescribe; remind readers to consult a clinician when needed.
- Prioritize actionable guidance: meal ideas, nutrient groups, food safety, red-flag symptoms.
- Return EXACTLY one JSON object (no markdown fences), schema:
{
  "title": string (Vietnamese title for the VI post file),
  "excerpt": string (<=220 chars, Vietnamese),
  "content": string (Vietnamese markdown with ## headings; 500-900 words),
  "category": one of ${CATEGORY_SLUGS.join("|")},
  "tags": string[] (3-6 kebab-case, English preferred),
  "metaTitle": string (<=60 chars, Vietnamese),
  "metaDescription": string (<=155 chars, Vietnamese),
  "imagePrompt": string (English, photorealistic, no text overlays, pregnancy/baby nutrition safe),
  "faqs": [{"question": string, "answer": string}] (3 items; English preferred for GEO),
  "en": {
    "title": string (PRIMARY English SEO title),
    "excerpt": string (<=220 chars),
    "content": string (PRIMARY English markdown, 700-1200 words, richest section),
    "metaTitle": string (<=60 chars, include "Pregnancy Meal Planner" when natural),
    "metaDescription": string (<=155 chars)
  }
}
English in "en" is the primary quality target for international ranking. Vietnamese fields remain for /vi readers.`;

  const user = `Topic: ${input.title}
Short description: ${input.snippet || "(none)"}
Inspiration source (do not copy): ${input.sourceName} — ${input.url}
Priority SEO keywords: pregnancy meal planner, prenatal nutrition, gestational diabetes meals, postpartum diet, baby weaning.`;

  try {
    const raw = await gatewayChatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      { config: options.config, temperature: 0.4, maxTokens: 4500 }
    );
    if (!raw) {
      console.warn("[synthesize] empty AI response — using template fallback");
      return fallback;
    }

    const parsed = parseJsonObject(raw);
    if (!parsed) {
      console.warn(`[synthesize] JSON parse failed — using template. raw head: ${raw.slice(0, 220)}`);
      return fallback;
    }

    const category = normalizeCategory(parsed.category) ?? fallback.category;
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.map((t) => String(t).toLowerCase().replace(/\s+/g, "-")).filter(Boolean).slice(0, 6)
      : fallback.tags;

    const title = String(parsed.title || input.title).trim();
    const excerpt = String(parsed.excerpt || fallback.excerpt).trim().slice(0, 220);
    const content = String(parsed.content || "").trim();
    if (content.length < 400) {
      console.warn(`[synthesize] content too short (${content.length}) — using template fallback`);
      return fallback;
    }

    const faqs = normalizeFaqs(parsed.faqs) ?? fallback.faqs;
    const en = normalizeEn(parsed.en);

    return {
      title,
      excerpt,
      content: ensureSourceNote(content, input),
      category,
      tags: tags.length ? tags : fallback.tags,
      metaTitle: String(parsed.metaTitle || `${title} | Pregnancy Meal Planner`).slice(0, 70),
      metaDescription: String(parsed.metaDescription || excerpt).slice(0, 160),
      imagePrompt: String(parsed.imagePrompt || buildImagePrompt(title, category)).slice(0, 500),
      faqs,
      en,
      usedAi: true
    };
  } catch (error) {
    console.warn("[synthesize] AI failed, using template:", error);
    return fallback;
  }
}

export function buildImagePrompt(title: string, category: BlogCategorySlug): string {
  const sceneByCategory: Record<BlogCategorySlug, string> = {
    "dinh-duong-ba-bau": "balanced Vietnamese pregnancy meal with vegetables, eggs, and soup on a wooden table",
    "thuc-don-ba-bau": "top-down weekly meal prep of healthy Vietnamese dishes for an expectant mother",
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

function ensureSourceNote(content: string, input: SynthesisInput) {
  if (content.includes(input.url)) return content;
  return `${content.trim()}\n\n> Nội dung tổng hợp tham khảo chủ đề từ [${input.sourceName}](${input.url}), không sao chép nguyên văn.\n`;
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

function normalizeEn(value: unknown): SynthesisOutput["en"] | undefined {
  if (!value || typeof value !== "object") return undefined;
  const row = value as Record<string, unknown>;
  const title = String(row.title ?? "").trim();
  const excerpt = String(row.excerpt ?? "").trim();
  const content = String(row.content ?? "").trim();
  if (!title || !content || content.length < 200) return undefined;
  return {
    title,
    excerpt: excerpt.slice(0, 220),
    content,
    metaTitle: String(row.metaTitle || `${title} | Pregnancy Meal Planner`).slice(0, 70),
    metaDescription: String(row.metaDescription || excerpt).slice(0, 160)
  };
}

function guessCategory(title: string, snippet: string): BlogCategorySlug {
  const text = `${title} ${snippet}`.toLowerCase();
  if (/(sau sinh|hậu sản|postpartum|cho con bú)/i.test(text)) return "sau-sinh";
  if (/(trẻ|sơ sinh|ăn dặm|baby|infant)/i.test(text)) return "cham-con-0-24-thang";
  if (/(thực đơn|menu|đường huyết|tiểu đường)/i.test(text)) return "thuc-don-ba-bau";
  if (/(vitamin|folate|sắt|canxi|dinh dưỡng|omega)/i.test(text)) return "dinh-duong-ba-bau";
  return "truoc-sinh";
}

function guessTags(title: string, snippet: string): string[] {
  const text = `${title} ${snippet}`.toLowerCase();
  const tags = new Set<string>();
  if (/nghén|nghen|nausea/i.test(text)) tags.add("nghen");
  if (/tiểu đường|tieu duong|gdm/i.test(text)) tags.add("tieu-duong");
  if (/thiếu máu|thieu mau|anemia/i.test(text)) tags.add("thieu-mau");
  if (/táo bón|tao bon|constipation/i.test(text)) tags.add("tao-bon");
  if (/thực đơn|thuc don|menu/i.test(text)) tags.add("thuc-don");
  if (tags.size === 0) tags.add("me-bau");
  return [...tags].slice(0, 5);
}
