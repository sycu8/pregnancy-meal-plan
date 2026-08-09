import Link from "next/link";
import type { BlogLocale, BlogPost } from "@/types/blog";
import { getCategoryBySlug } from "@/lib/blog/categories";
import { blogBasePath, getBlogUi } from "@/lib/blog/ui";

function formatBlogDate(iso: string, locale: BlogLocale) {
  const tag = locale === "en" ? "en-US" : "vi-VN";
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function FeaturedBlogSection({
  posts,
  locale = "en"
}: {
  posts: BlogPost[];
  locale?: BlogLocale;
}) {
  const ui = getBlogUi(locale);
  const base = blogBasePath(locale);
  if (posts.length === 0) return null;

  const [hero, ...rest] = posts;
  const side = rest.slice(0, 2);
  const strip = rest.slice(2, 5);

  return (
    <section className="mt-10" aria-labelledby="featured-blog-heading">
      <div className="mb-5 max-w-2xl">
        <p className="text-sm font-medium text-accent">{ui.featuredBadge}</p>
        <h2 id="featured-blog-heading" className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          {ui.featuredTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">{ui.featuredIntro}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
        {hero && <FeaturedHeroCard post={hero} locale={locale} base={base} className="lg:col-span-3" />}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
          {side.map((post, index) => (
            <FeaturedSideCard key={post.slug} post={post} locale={locale} base={base} rank={index + 2} />
          ))}
        </div>
      </div>

      {strip.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {strip.map((post, index) => (
            <li key={post.slug}>
              <FeaturedStripCard post={post} locale={locale} base={base} rank={index + 4} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FeaturedHeroCard({
  post,
  locale,
  base,
  className = ""
}: {
  post: BlogPost;
  locale: BlogLocale;
  base: string;
  className?: string;
}) {
  const ui = getBlogUi(locale);
  const category = getCategoryBySlug(post.category, locale);
  const href = `${base}/${post.slug}`;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/10 via-white to-muted/40 shadow-soft ${className}`}
    >
      <Link href={href} className="flex h-full min-h-[280px] flex-col md:min-h-[320px]">
        {post.ogImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.ogImage}
            alt=""
            className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.02] md:h-52"
            loading="eager"
          />
        ) : (
          <div className="flex h-44 items-end bg-gradient-to-br from-accent/30 to-accent/5 p-5 md:h-52">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-accent">{ui.featuredBadge}</span>
          </div>
        )}
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-accent px-2.5 py-0.5 font-semibold text-accent-foreground">{ui.featuredBadge}</span>
            {category && <span className="font-medium text-accent">{category.name}</span>}
            <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt, locale)}</time>
            <span aria-hidden="true">·</span>
            <span>{ui.minRead(post.readingTimeMinutes)}</span>
          </div>
          <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-foreground transition group-hover:text-accent md:text-2xl">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground md:text-base">{post.excerpt}</p>
          <span className="mt-4 inline-flex text-sm font-semibold text-accent underline-offset-2 group-hover:underline">
            {ui.featuredReadMore} →
          </span>
        </div>
      </Link>
    </article>
  );
}

function FeaturedSideCard({
  post,
  locale,
  base,
  rank
}: {
  post: BlogPost;
  locale: BlogLocale;
  base: string;
  rank: number;
}) {
  const ui = getBlogUi(locale);
  const category = getCategoryBySlug(post.category, locale);
  const href = `${base}/${post.slug}`;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-white shadow-soft transition hover:border-accent/40">
      <Link href={href} className="flex h-full flex-col sm:flex-row lg:flex-col">
        {post.ogImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.ogImage}
            alt=""
            className="h-28 w-full object-cover sm:h-auto sm:w-32 lg:h-32 lg:w-full"
            loading="lazy"
          />
        ) : (
          <div className="flex h-28 w-full items-center justify-center bg-accent/10 text-2xl font-bold text-accent sm:h-auto sm:w-32 lg:h-32 lg:w-full">
            #{rank}
          </div>
        )}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-accent">#{rank}</span>
            {category && <span>{category.name}</span>}
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug transition group-hover:text-accent">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{post.excerpt}</p>
          <span className="mt-3 text-xs text-muted-foreground">{ui.minRead(post.readingTimeMinutes)}</span>
        </div>
      </Link>
    </article>
  );
}

function FeaturedStripCard({
  post,
  locale,
  base,
  rank
}: {
  post: BlogPost;
  locale: BlogLocale;
  base: string;
  rank: number;
}) {
  const ui = getBlogUi(locale);
  const category = getCategoryBySlug(post.category, locale);
  const href = `${base}/${post.slug}`;

  return (
    <article className="group h-full rounded-xl border border-border bg-white p-4 shadow-soft transition hover:border-accent/40">
      <Link href={href} className="flex h-full flex-col">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
            {rank}
          </span>
          {category && <span className="font-medium text-accent">{category.name}</span>}
        </div>
        <h3 className="mt-2 text-sm font-semibold leading-snug transition group-hover:text-accent">{post.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-muted-foreground">{post.excerpt}</p>
        <span className="mt-3 text-xs text-muted-foreground">{ui.minRead(post.readingTimeMinutes)}</span>
      </Link>
    </article>
  );
}
