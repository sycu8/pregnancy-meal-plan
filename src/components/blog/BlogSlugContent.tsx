import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostArticle } from "@/components/blog/BlogPostArticle";
import { BlogCard, BlogBreadcrumbs } from "@/components/blog/BlogCard";
import { BlogListing } from "@/components/blog/BlogListing";
import { getCategoryBySlug, isCategorySlug } from "@/lib/blog/categories";
import { getPostBySlug, getPostsByCategory, getRelatedPosts } from "@/lib/blog/posts";
import { filterPosts, paginatePosts, parseBlogListQuery } from "@/lib/blog/query";
import { blogCategoryMetadata, blogPostJsonLd, blogPostMetadata, blogBreadcrumbJsonLd } from "@/lib/blog/seo";
import { blogBasePath, getBlogUi } from "@/lib/blog/ui";
import { siteOrigin } from "@/lib/agentDiscovery";
import type { BlogCategorySlug, BlogLocale } from "@/types/blog";

type SearchParams = { q?: string; tag?: string; page?: string };

export async function blogSlugMetadata(slug: string, locale: BlogLocale) {
  if (isCategorySlug(slug)) {
    const category = getCategoryBySlug(slug, locale)!;
    return blogCategoryMetadata(category, locale);
  }
  const post = getPostBySlug(slug, locale);
  if (!post) return { title: locale === "en" ? "Not found | Blog" : "Không tìm thấy | Blog Bầu Ăn Gì?" };
  return blogPostMetadata(post, locale);
}

export function BlogSlugContent({ slug, locale, searchParams }: { slug: string; locale: BlogLocale; searchParams: SearchParams }) {
  if (isCategorySlug(slug)) {
    return <CategoryPage categorySlug={slug} locale={locale} searchParams={searchParams} />;
  }

  const post = getPostBySlug(slug, locale);
  if (!post) notFound();

  const ui = getBlogUi(locale);
  const base = blogBasePath(locale);
  const related = getRelatedPosts(post, locale);
  const category = getCategoryBySlug(post.category, locale);
  const breadcrumbs = blogBreadcrumbJsonLd([
    { name: ui.home, url: siteOrigin },
    { name: ui.breadcrumbBlog, url: `${siteOrigin}${base}` },
    ...(category ? [{ name: category.name, url: `${siteOrigin}${base}/${category.slug}` }] : []),
    { name: post.title, url: `${siteOrigin}${base}/${post.slug}` }
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <BlogPostArticle post={post} locale={locale} />

      {related.length > 0 && (
        <section className="mx-auto mt-12 max-w-3xl border-t border-border pt-10">
          <h2 className="text-xl font-semibold">{ui.related}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {related.map((item) => (
              <BlogCard key={item.slug} post={item} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostJsonLd(post, locale)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    </main>
  );
}

function CategoryPage({
  categorySlug,
  locale,
  searchParams
}: {
  categorySlug: BlogCategorySlug;
  locale: BlogLocale;
  searchParams: SearchParams;
}) {
  const ui = getBlogUi(locale);
  const base = blogBasePath(locale);
  const category = getCategoryBySlug(categorySlug, locale)!;
  const categoryPosts = getPostsByCategory(categorySlug, locale);
  const query = parseBlogListQuery(searchParams, categorySlug);
  const filtered = filterPosts(categoryPosts, query);
  const { items, total, totalPages, page } = paginatePosts(filtered, query.page);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <BlogBreadcrumbs items={[{ label: ui.breadcrumbBlog, href: base }, { label: category.name }]} />
      <BlogListing
        locale={locale}
        posts={items}
        allPostsForTags={categoryPosts}
        query={query}
        basePath={`${base}/${categorySlug}`}
        page={page}
        totalPages={totalPages}
        total={total}
        activeCategorySlug={categorySlug}
        header={
          <header className="mt-4 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{category.description}</p>
          </header>
        }
        emptyMessage={ui.emptyCategory}
      />
      <p className="mt-4">
        <Link href={base} className="text-sm font-medium text-accent underline underline-offset-2">
          {ui.allPostsLink}
        </Link>
      </p>
    </main>
  );
}
