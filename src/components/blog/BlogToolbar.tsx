import Link from "next/link";
import type { BlogLocale } from "@/types/blog";
import { getBlogUi } from "@/lib/blog/ui";
import { buildBlogListHref, formatTagLabel, type BlogListQuery } from "@/lib/blog/query";

type TagCount = { tag: string; count: number };

type BlogToolbarProps = {
  basePath: string;
  query: Pick<BlogListQuery, "q" | "tag">;
  tags: TagCount[];
  resultCount?: number;
  locale?: BlogLocale;
};

export function BlogToolbar({ basePath, query, tags, resultCount, locale = "vi" }: BlogToolbarProps) {
  const ui = getBlogUi(locale);

  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-soft md:p-5">
      <form action={basePath} method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {query.tag ? <input type="hidden" name="tag" value={query.tag} /> : null}
        <label htmlFor={`blog-search-${locale}`} className="sr-only">
          {ui.searchLabel}
        </label>
        <input
          id={`blog-search-${locale}`}
          name="q"
          type="search"
          defaultValue={query.q ?? ""}
          placeholder={ui.searchPlaceholder}
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-accent/30 placeholder:text-muted-foreground focus:border-accent focus:ring-2"
          autoComplete="off"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent/90"
        >
          {ui.searchButton}
        </button>
        {(query.q || query.tag) && (
          <Link
            href={basePath}
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            {ui.clearFilters}
          </Link>
        )}
      </form>

      {typeof resultCount === "number" && (query.q || query.tag) && (
        <p className="mt-3 text-sm text-muted-foreground">
          {resultCount > 0
            ? ui.resultsFound(resultCount, query.q, query.tag ? formatTagLabel(query.tag) : undefined)
            : ui.noResults}
        </p>
      )}

      {tags.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{ui.popularKeywords}</p>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label={ui.keywordsAria}>
            {tags.map(({ tag, count }) => {
              const active = query.tag === tag;
              return (
                <li key={tag}>
                  <Link
                    href={buildBlogListHref(basePath, { q: query.q, tag: active ? undefined : tag })}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-muted/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                    }`}
                    aria-current={active ? "true" : undefined}
                  >
                    <span>{formatTagLabel(tag)}</span>
                    <span className={active ? "text-accent-foreground/80" : "text-muted-foreground/70"}>({count})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
