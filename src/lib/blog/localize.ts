import type { BlogFaq, BlogLocale, BlogPost, BlogPostTranslation } from "@/types/blog";
import { isUsableEnglishTranslation } from "@/lib/blog/enQuality";
import { estimateReadingTimeMinutes } from "@/lib/blog/readingTime";
import { enTranslationBySlug } from "@/lib/blog/en-post-manifest";

export {
  isUsableEnglishTranslation,
  looksVietnamese,
  looksVietnameseTitle
} from "@/lib/blog/enQuality";

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
