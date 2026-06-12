import { BlogCard, CategoryNav } from "@/components/blog/BlogCard";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogToolbar } from "@/components/blog/BlogToolbar";
import { getTagCounts, type BlogListQuery } from "@/lib/blog/query";
import type { BlogCategorySlug, BlogLocale, BlogPost } from "@/types/blog";
import type { ReactNode } from "react";
import { getBlogUi } from "@/lib/blog/ui";

type BlogListingProps = {
  posts: BlogPost[];
  allPostsForTags: BlogPost[];
  query: BlogListQuery;
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
  activeCategorySlug?: BlogCategorySlug;
  header: ReactNode;
  emptyMessage?: string;
  locale?: BlogLocale;
};

export function BlogListing({
  posts,
  allPostsForTags,
  query,
  basePath,
  page,
  totalPages,
  total,
  activeCategorySlug,
  header,
  emptyMessage,
  locale = "vi"
}: BlogListingProps) {
  const ui = getBlogUi(locale);
  const tags = getTagCounts(allPostsForTags);

  return (
    <>
      {header}

      <div className="mt-8">
        <CategoryNav activeSlug={activeCategorySlug} locale={locale} />
      </div>

      <div className="mt-6">
        <BlogToolbar basePath={basePath} query={query} tags={tags} resultCount={total} locale={locale} />
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label={ui.postListAria}>
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} locale={locale} />
        ))}
      </section>

      {posts.length === 0 && (
        <p className="mt-8 rounded-lg border border-border bg-muted p-6 text-sm text-muted-foreground">
          {emptyMessage ?? ui.emptyList}
        </p>
      )}

      <BlogPagination basePath={basePath} query={query} page={page} totalPages={totalPages} total={total} locale={locale} />
    </>
  );
}
