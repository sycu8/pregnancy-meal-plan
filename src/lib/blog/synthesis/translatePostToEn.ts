import {
  gatewayChatCompletion,
  isBlogAiEnabled,
  readAiGatewayConfig,
  type AiGatewayConfig
} from "@/lib/cloudflare/aiGateway";
import { isUsableEnglishTranslation, looksVietnamese, looksVietnameseTitle } from "@/lib/blog/localize";
import { clampMetaDescription } from "@/lib/blog/synthesis/synthesizePost";
import type { BlogFaq, BlogPost, BlogPostTranslation } from "@/types/blog";

export type TranslatePostToEnResult = {
  translation: BlogPostTranslation | null;
  usedAi: boolean;
  reason?: string;
};

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

const TAGGED_KEYS = "TITLE|EXCERPT|META_TITLE|META_DESCRIPTION|CONTENT|FAQS";

function field(raw: string, name: string): string {
  const re = new RegExp(
    `(?:^|\\n)\\s*${name}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${TAGGED_KEYS})\\s*:|$)`,
    "i"
  );
  return raw.match(re)?.[1]?.trim() || "";
}

/** Parse TITLE:/CONTENT: tagged model output (more reliable than JSON with Llama). */
export function parseTaggedTranslation(raw: string): Record<string, unknown> | null {
  const text = raw.replace(/\r/g, "").trim();
  if (!text) return null;

  // Prefer tagged format
  if (/^\s*TITLE\s*:/im.test(text) || /\nTITLE\s*:/i.test(text)) {
    const title = field(text, "TITLE");
    const excerpt = field(text, "EXCERPT");
    const metaTitle = field(text, "META_TITLE");
    const metaDescription = field(text, "META_DESCRIPTION");
    const content = field(text, "CONTENT");
    const faqsRaw = field(text, "FAQS");
    const faqs: BlogFaq[] = [];
    if (faqsRaw) {
      const pairs = [...faqsRaw.matchAll(/Q\d*\s*:\s*([\s\S]*?)\n\s*A\d*\s*:\s*([\s\S]*?)(?=\n\s*Q\d*\s*:|$)/gi)];
      for (const pair of pairs) {
        const question = pair[1]?.trim();
        const answer = pair[2]?.trim();
        if (question && answer) faqs.push({ question, answer });
      }
    }
    if (!title || !content) return null;
    return {
      title,
      excerpt,
      metaTitle,
      metaDescription,
      content,
      faqs: faqs.length ? faqs : undefined
    };
  }

  return parseJsonObject(text);
}

function normalizeFaqs(value: unknown): BlogFaq[] | undefined {
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
    .filter((item): item is BlogFaq => Boolean(item))
    .slice(0, 5);
  return faqs.length ? faqs : undefined;
}

function toTranslation(slug: string, parsed: Record<string, unknown>): BlogPostTranslation | null {
  const title = String(parsed.title ?? "").trim();
  const excerpt = String(parsed.excerpt ?? "").trim();
  let content = String(parsed.content ?? "").trim();
  if (!title || content.length < 400) return null;
  if (looksVietnameseTitle(title) || looksVietnamese(title)) return null;
  if (content.includes("synthesized educational overview") && content.length < 900) return null;

  // Ensure markdown has at least one heading
  if (!/^##\s+/m.test(content)) {
    content = `## Summary\n\n${content}`;
  }

  const translation: BlogPostTranslation = {
    slug,
    title,
    excerpt: excerpt.slice(0, 220) || content.replace(/[#>*`\[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 220),
    content,
    metaTitle: String(parsed.metaTitle || `${title} | Pregnancy Meal Planner`).trim().slice(0, 70),
    metaDescription: clampMetaDescription(String(parsed.metaDescription || excerpt), title, "en"),
    author: "Pregnancy Meal Planner Team",
    reviewer: "Pregnancy Meal Planner Editorial",
    faqs: normalizeFaqs(parsed.faqs)
  };

  return isUsableEnglishTranslation(translation) ? translation : null;
}

/**
 * Translate / rewrite a Vietnamese canonical post into a usable English overlay
 * via Cloudflare Workers AI (AI Gateway).
 */
export async function translatePostToEn(
  post: BlogPost,
  options: { config?: AiGatewayConfig | null } = {}
): Promise<TranslatePostToEnResult> {
  const config = options.config ?? readAiGatewayConfig();
  if (!isBlogAiEnabled() && !config) {
    return { translation: null, usedAi: false, reason: "AI Gateway not configured" };
  }
  if (!config) {
    return { translation: null, usedAi: false, reason: "Missing CLOUDFLARE_API_TOKEN / ACCOUNT_ID" };
  }

  const sourceNote =
    post.sourceReferences?.[0] != null
      ? `${post.sourceReferences[0].publisher || "source"} — ${post.sourceReferences[0].url}`
      : "editorial topic";

  const system = `You are a maternal-child health editor for Pregnancy Meal Planner.
Translate and expand Vietnamese blog posts into natural English for pregnancymeal.tips/blog.
Educational reference only — do not diagnose or prescribe.
If the Vietnamese source is short, expand into a practical 700-1000 word English article on the same topic.
Return EXACTLY this tagged format (no JSON, no code fences):

TITLE: <English SEO title>
EXCERPT: <one English paragraph, <=220 chars>
META_TITLE: <English, <=60 chars>
META_DESCRIPTION: <English, 100-155 chars>
CONTENT:
## Summary
...
## Practical tips
...
## When to seek care
...
FAQS:
Q1: ...
A1: ...
Q2: ...
A2: ...
Q3: ...
A3: ...`;

  const user = `Slug: ${post.slug}
Category: ${post.category}
Vietnamese title: ${post.title}
Vietnamese excerpt: ${post.excerpt}
Vietnamese content:
${post.content.slice(0, 5500)}

Source note (do not copy verbatim): ${sourceNote}
Keywords: pregnancy meal planner, prenatal nutrition, postpartum diet`;

  try {
    const raw = await gatewayChatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      { config, temperature: 0.3, maxTokens: 5500 }
    );
    if (!raw) return { translation: null, usedAi: true, reason: "empty AI response" };

    const parsed = parseTaggedTranslation(raw);
    if (!parsed) return { translation: null, usedAi: true, reason: "tagged/JSON parse failed" };

    const translation = toTranslation(post.slug, parsed);
    if (!translation) {
      return { translation: null, usedAi: true, reason: "EN output failed quality gate" };
    }
    return { translation, usedAi: true };
  } catch (error) {
    return {
      translation: null,
      usedAi: true,
      reason: error instanceof Error ? error.message : "AI request failed"
    };
  }
}

/** Export for unit tests. */
export const __translateTestUtils = { parseJsonObject, parseTaggedTranslation, toTranslation };
