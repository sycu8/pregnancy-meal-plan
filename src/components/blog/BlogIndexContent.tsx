import Link from "next/link";
import { BlogListing } from "@/components/blog/BlogListing";
import { FeaturedBlogSection } from "@/components/blog/FeaturedBlogSection";
import { buildBlogListKeywords, keywordsMetaValue } from "@/lib/blog/keywords";
import { excludeFeatured, pickFeaturedPosts } from "@/lib/blog/featured";
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
  const showFeatured = query.page <= 1 && !query.q && !query.tag;
  const featured = showFeatured ? pickFeaturedPosts(filtered) : [];
  const listingSource = showFeatured ? excludeFeatured(filtered, featured) : filtered;
  const { items, total, totalPages, page } = paginatePosts(listingSource, query.page);
  const meta = blogListMetadata(locale);
  const description = typeof meta.description === "string" ? meta.description : ui.listIntro;
  const plannerHref = localizedPath(locale, "/planner");
  const keywords = buildBlogListKeywords(locale);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-accent">Blog</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{ui.listTitle}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{ui.listIntro}</p>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{ui.popularKeywords}</p>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label={ui.keywordsAria}>
            {keywords.slice(0, 10).map((keyword) => (
              <li key={keyword}>
                <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{keyword}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 flex flex-wrap gap-4">
          <Link href={plannerHref} className="text-sm font-medium text-accent underline underline-offset-2 hover:text-accent/80">
            {ui.plannerCta}
          </Link>
          <Link href={`${base}/feed.xml`} className="text-sm font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground">
            RSS
          </Link>
          <Link href={`${base}/topics`} className="text-sm font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground">
            {locale === "en" ? "Topics" : "Chủ đề"}
          </Link>
        </p>
      </header>

      {showFeatured && <FeaturedBlogSection posts={featured} locale={locale} />}

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
          showFeatured ? (
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{ui.moreArticles}</h2>
            </div>
          ) : (
            <div className="mt-2" />
          )
        }
        emptyMessage={ui.emptyList}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: locale === "en" ? "Pregnancy Meal Planner Blog" : "Blog Pregnancy Meal Planner",
            url: `${siteOrigin}${base}`,
            description,
            keywords: keywordsMetaValue(keywords),
            inLanguage: locale === "en" ? "en-US" : "vi-VN",
            publisher: { "@type": "Organization", name: "Pregnancy Meal Planner", url: siteOrigin },
            ...(featured.length
              ? {
                  hasPart: featured.slice(0, 3).map((post) => ({
                    "@type": "BlogPosting",
                    headline: post.title,
                    url: `${siteOrigin}${base}/${post.slug}`
                  }))
                }
              : {})
          })
        }}
      />
    </main>
  );
}
