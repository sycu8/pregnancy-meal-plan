/** Shared cache for public documents. Browsers revalidate within a minute; the edge keeps a copy for 10 minutes. */
export const PUBLIC_DOCUMENT_CACHE_CONTROL = "public, max-age=60, s-maxage=600";

export const NOINDEX_ROBOTS_TAG = "noindex, nofollow";

/** Path patterns that receive Cache-Control from next.config. Personalized routes are omitted. */
export const PUBLIC_CACHE_HEADER_SOURCES = [
  "/",
  "/vi",
  "/planner",
  "/vi/planner",
  "/support",
  "/vi/support",
  "/premium",
  "/vi/premium",
  "/privacy",
  "/vi/privacy",
  "/terms",
  "/vi/terms",
  "/social",
  "/vi/social",
  "/blog",
  "/blog/:path*",
  "/vi/blog",
  "/vi/blog/:path*",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/openapi.json"
] as const;
