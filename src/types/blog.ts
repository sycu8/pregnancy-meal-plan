export type BlogCategorySlug =
  | "dinh-duong-ba-bau"
  | "thuc-don-ba-bau"
  | "truoc-sinh"
  | "sau-sinh"
  | "cham-con-0-24-thang";

export type BlogTrimester = "3-thang-dau" | "3-thang-giua" | "3-thang-cuoi";

export type BabyAgeRange = "0-6-thang" | "6-12-thang" | "12-24-thang";

export type BlogPostStatus = "draft" | "published";

export type BlogLocale = "vi" | "en";

export type SourceCredibility = "official" | "medical" | "hospital" | "parenting";

export type SourceReference = {
  title: string;
  url: string;
  publisher: string;
  accessedAt?: string;
};

/** English (or other locale) text overlay — slug and metadata stay shared with the Vietnamese post. */
export type BlogPostTranslation = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  author?: string;
  reviewer?: string;
};

export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogCategorySlug;
  tags: string[];
  trimester?: BlogTrimester;
  babyAgeRange?: BabyAgeRange;
  author: string;
  reviewer?: string;
  sourceReferences: SourceReference[];
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogImage?: string;
  status: BlogPostStatus;
};

export type BlogCategory = {
  slug: BlogCategorySlug;
  name: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
};

export type SourceConfig = {
  name: string;
  baseUrl: string;
  rssUrl?: string;
  allowedPaths?: string[];
  topics: string[];
  credibility: SourceCredibility;
  language: "en" | "vi";
  enabled: boolean;
  crawlFrequencyHours: number;
};

export type IngestedFeedItem = {
  id: string;
  sourceName: string;
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  fetchedAt: string;
  titleHash: string;
  urlHash: string;
};
