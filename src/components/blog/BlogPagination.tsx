import Link from "next/link";
import type { ReactNode } from "react";
import type { BlogLocale } from "@/types/blog";
import { getBlogUi } from "@/lib/blog/ui";
import { buildBlogListHref, type BlogListQuery } from "@/lib/blog/query";

type BlogPaginationProps = {
  basePath: string;
  query: Pick<BlogListQuery, "q" | "tag">;
  page: number;
  totalPages: number;
  total: number;
  locale?: BlogLocale;
};

export function BlogPagination({ basePath, query, page, totalPages, total, locale = "vi" }: BlogPaginationProps) {
  const ui = getBlogUi(locale);
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav className="mt-10 flex flex-col items-center gap-3" aria-label={locale === "en" ? "Pagination" : "Phân trang"}>
      <p className="text-sm text-muted-foreground">{ui.paginationSummary(page, totalPages, total)}</p>
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {page > 1 ? (
            <PaginationLink href={buildBlogListHref(basePath, query, page - 1)} label={ui.prevPage}>
              ←
            </PaginationLink>
          ) : (
            <span className="inline-flex min-w-9 items-center justify-center rounded-md px-2 py-1.5 text-sm text-muted-foreground/40" aria-hidden="true">
              ←
            </span>
          )}
        </li>
        {pages.map((p, i) =>
          p === "…" ? (
            <li key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              {p === page ? (
                <span
                  className="inline-flex min-w-9 items-center justify-center rounded-md border border-accent bg-accent px-2 py-1.5 text-sm font-medium text-accent-foreground"
                  aria-current="page"
                >
                  {p}
                </span>
              ) : (
                <PaginationLink href={buildBlogListHref(basePath, query, p)} label={ui.pageLabel(p)}>
                  {p}
                </PaginationLink>
              )}
            </li>
          )
        )}
        <li>
          {page < totalPages ? (
            <PaginationLink href={buildBlogListHref(basePath, query, page + 1)} label={ui.nextPage}>
              →
            </PaginationLink>
          ) : (
            <span className="inline-flex min-w-9 items-center justify-center rounded-md px-2 py-1.5 text-sm text-muted-foreground/40" aria-hidden="true">
              →
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

function PaginationLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-w-9 items-center justify-center rounded-md border border-border bg-white px-2 py-1.5 text-sm transition hover:border-accent/40 hover:bg-muted"
      aria-label={label}
    >
      {children}
    </Link>
  );
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}
