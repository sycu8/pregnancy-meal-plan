import Link from "next/link";
import { BlogListing } from "@/components/blog/BlogListing";
import { getAllPosts } from "@/lib/blog/posts";
import { filterPosts, paginatePosts, parseBlogListQuery } from "@/lib/blog/query";
import { blogListMetadata } from "@/lib/blog/seo";
import { blogBasePath, getBlogUi } from "@/lib/blog/ui";
import { localizedPath } from "@/lib/i18n";
import { siteOrigin } from "@/lib/agentDiscovery";
import type { BlogLocale } from "@/types/blog";

type SearchParams = { q?: string; tag?: string; page?: string };

export function blogIndexMetadata(locale: BlogLocale) {
  return blogListMetadata(locale);
}

export function BlogIndexContent({ locale, searchParams }: { locale: BlogLocale; searchParams: SearchParams }) {
  const ui = getBlogUi(locale);
  const base = blogBasePath(locale);
  const allPosts = getAllPosts(locale);
  const query = parseBlogListQuery(searchParams);
  const filtered = filterPosts(allPosts, query);
  const { items, total, totalPages, page } = paginatePosts(filtered, query.page);
  const meta = blogListMetadata(locale);
  const description = typeof meta.description === "string" ? meta.description : ui.listIntro;
  const plannerHref = localizedPath(locale, "/planner");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <BlogListing
        locale={locale}
        posts={items}
        allPostsForTags={allPosts}
        query={query}
        basePath={base}
        page={page}
        totalPages={totalPages}
        total={total}
        header={
          <header className="max-w-3xl">
            <p className="text-sm font-medium text-accent">Blog</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{ui.listTitle}</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{ui.listIntro}</p>
            <p className="mt-4">
              <Link href={plannerHref} className="text-sm font-medium text-accent underline underline-offset-2 hover:text-accent/80">
                {ui.plannerCta}
              </Link>
            </p>
          </header>
        }
        emptyMessage={ui.emptyList}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: locale === "en" ? "Bầu Ăn Gì? Blog" : "Blog Bầu Ăn Gì?",
            url: `${siteOrigin}${base}`,
            description,
            inLanguage: locale === "en" ? "en-US" : "vi-VN",
            publisher: { "@type": "Organization", name: "Bầu Ăn Gì?", url: siteOrigin }
          })
        }}
      />
    </main>
  );
}
