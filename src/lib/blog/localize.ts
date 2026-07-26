import type { BlogFaq, BlogLocale, BlogPost, BlogPostTranslation } from "@/types/blog";
import { estimateReadingTimeMinutes } from "@/lib/blog/readingTime";
import { enTranslationBySlug } from "@/lib/blog/en-post-manifest";

const VI_DIACRITICS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const ENGLISH_TITLE_HINT =
  /\b(the|and|for|during|pregnancy|postpartum|nutrition|meal|foods|how|what|when|with|from|your|baby|breastfeeding|trimester)\b/i;

export function looksVietnamese(text: string) {
  return VI_DIACRITICS.test(text);
}

/** Titles that are primarily Vietnamese (not English with a loanword like "phở"). */
export function looksVietnameseTitle(title: string) {
  if (!VI_DIACRITICS.test(title)) return false;
  if (ENGLISH_TITLE_HINT.test(title)) return false;
  const diacritics = title.match(VI_DIACRITICS)?.length ?? 0;
  return diacritics >= 2;
}

/** True when the EN overlay is real English content (not a VI leak / stub). */
export function isUsableEnglishTranslation(translation: BlogPostTranslation) {
  const title = translation.title?.trim() ?? "";
  const content = translation.content?.trim() ?? "";
  if (!title || content.length < 200) return false;
  if (looksVietnameseTitle(title)) return false;
  if (content.includes("synthesized educational overview") && content.length < 900) return false;
  return true;
}

export function hasUsableEnglishTranslation(slug: string) {
  const translation = enTranslationBySlug.get(slug);
  return Boolean(translation && isUsableEnglishTranslation(translation));
}

/**
 * Localize a post for the active web locale.
 * - `vi`: canonical Vietnamese post
 * - `en`: English overlay only (null when missing/unusable — never fall back to Vietnamese)
 */
export function localizePost(post: BlogPost, locale: BlogLocale): BlogPost | null {
  if (locale === "vi") return post;

  const translation = enTranslationBySlug.get(post.slug);
  if (!translation || !isUsableEnglishTranslation(translation)) return null;

  return applyTranslation(post, translation);
}

export function applyTranslation(post: BlogPost, translation: BlogPostTranslation): BlogPost {
  const faqs: BlogFaq[] | undefined = translation.faqs?.length ? translation.faqs : undefined;

  return {
    ...post,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
    metaTitle: translation.metaTitle,
    metaDescription: translation.metaDescription,
    author: translation.author ?? "Pregnancy Meal Planner Team",
    reviewer: translation.reviewer ?? post.reviewer,
    readingTimeMinutes: estimateReadingTimeMinutes(translation.content),
    // Prefer locale FAQs; omit VI FAQs on EN pages when EN FAQs are absent
    faqs
  };
}
