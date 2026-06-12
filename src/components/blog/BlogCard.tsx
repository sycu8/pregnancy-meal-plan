import Link from "next/link";
import type { BlogLocale, BlogPost } from "@/types/blog";
import { babyAgeLabels, getBlogCategories, getCategoryBySlug, trimesterLabels } from "@/lib/blog/categories";
import { blogBasePath, getBlogUi } from "@/lib/blog/ui";
import { buildBlogListHref, formatTagLabel } from "@/lib/blog/query";

export function BlogCard({ post, locale = "vi" }: { post: BlogPost; locale?: BlogLocale }) {
  const ui = getBlogUi(locale);
  const base = blogBasePath(locale);
  const category = getCategoryBySlug(post.category, locale);

  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-soft transition hover:border-accent/40">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {category && (
          <Link href={`${base}/${category.slug}`} className="rounded-md bg-muted px-2 py-1 font-medium text-accent hover:bg-accent/10">
            {category.name}
          </Link>
        )}
        <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, locale)}</time>
        <span aria-hidden="true">·</span>
        <span>{ui.minRead(post.readingTimeMinutes)}</span>
      </div>
      <h2 className="mt-3 text-lg font-semibold leading-snug">
        <Link href={`${base}/${post.slug}`} className="hover:text-accent">
          {post.title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {post.trimester && (
          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">{trimesterLabels[locale][post.trimester]}</span>
        )}
        {post.babyAgeRange && (
          <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">{babyAgeLabels[locale][post.babyAgeRange]}</span>
        )}
        {post.tags.slice(0, 3).map((tag) => (
          <Link
            key={tag}
            href={buildBlogListHref(base, { tag })}
            className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground transition hover:border-accent/40 hover:text-accent"
          >
            #{formatTagLabel(tag)}
          </Link>
        ))}
      </div>
    </article>
  );
}

export function BlogBreadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CategoryNav({ activeSlug, locale = "vi" }: { activeSlug?: string; locale?: BlogLocale }) {
  const ui = getBlogUi(locale);
  const base = blogBasePath(locale);
  const categories = getBlogCategories(locale);

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={base}
        className={`rounded-md border px-3 py-1.5 text-sm transition ${!activeSlug ? "border-accent bg-accent text-accent-foreground" : "border-border bg-white hover:bg-muted"}`}
      >
        {ui.allPosts}
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`${base}/${cat.slug}`}
          className={`rounded-md border px-3 py-1.5 text-sm transition ${activeSlug === cat.slug ? "border-accent bg-accent text-accent-foreground" : "border-border bg-white hover:bg-muted"}`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}

function formatBlogDate(iso: string, locale: BlogLocale) {
  const tag = locale === "en" ? "en-US" : "vi-VN";
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}
