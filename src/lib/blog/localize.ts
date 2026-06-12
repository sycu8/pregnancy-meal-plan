import type { BlogLocale, BlogPost, BlogPostTranslation } from "@/types/blog";
import { estimateReadingTimeMinutes } from "@/lib/blog/readingTime";
import { enTranslationBySlug } from "@/lib/blog/en-post-manifest";

export function localizePost(post: BlogPost, locale: BlogLocale): BlogPost {
  if (locale === "vi") return post;

  const translation = enTranslationBySlug.get(post.slug);
  if (!translation) return post;

  return applyTranslation(post, translation);
}

export function applyTranslation(post: BlogPost, translation: BlogPostTranslation): BlogPost {
  return {
    ...post,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
    metaTitle: translation.metaTitle,
    metaDescription: translation.metaDescription,
    author: translation.author ?? "Bầu Ăn Gì? Team",
    reviewer: translation.reviewer ?? post.reviewer,
    readingTimeMinutes: estimateReadingTimeMinutes(translation.content)
  };
}
