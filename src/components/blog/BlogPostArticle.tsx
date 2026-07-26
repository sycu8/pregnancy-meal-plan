import type { BlogLocale, BlogPost } from "@/types/blog";
import { babyAgeLabels, getCategoryBySlug, medicalDisclaimer, trimesterLabels } from "@/lib/blog/categories";
import { renderBlogMarkdown } from "@/lib/blog/markdown";
import { BlogBreadcrumbs } from "@/components/blog/BlogCard";
import { BlogPlannerCta } from "@/components/blog/BlogPlannerCta";
import { blogBasePath, getBlogUi } from "@/lib/blog/ui";

export function BlogPostArticle({ post, locale = "vi" }: { post: BlogPost; locale?: BlogLocale }) {
  const ui = getBlogUi(locale);
  const base = blogBasePath(locale);
  const category = getCategoryBySlug(post.category, locale);
  const html = renderBlogMarkdown(post.content);
  const dateLocale = locale === "en" ? "en-US" : "vi-VN";

  return (
    <article className="mx-auto max-w-3xl">
      <BlogBreadcrumbs
        items={[
          { label: ui.breadcrumbBlog, href: base },
          ...(category ? [{ label: category.name, href: `${base}/${category.slug}` }] : []),
          { label: post.title }
        ]}
      />

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {category && <span className="font-medium text-accent">{category.name}</span>}
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, dateLocale)}</time>
          <span aria-hidden="true">·</span>
          <span>{ui.minRead(post.readingTimeMinutes)}</span>
          {post.updatedAt !== post.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>{ui.updated(formatDate(post.updatedAt, dateLocale))}</span>
            </>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground">{post.title}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{post.excerpt}</p>
        {post.ogImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.ogImage}
            alt={post.title}
            className="mt-6 w-full rounded-lg border border-border object-cover"
            loading="eager"
          />
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {post.trimester && <MetaPill label={trimesterLabels[locale][post.trimester]} />}
          {post.babyAgeRange && <MetaPill label={babyAgeLabels[locale][post.babyAgeRange]} />}
          {post.tags.map((tag) => (
            <MetaPill key={tag} label={`#${tag}`} />
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {post.author}
          {post.reviewer ? ` · ${post.reviewer}` : ""}
        </p>
      </header>

      <div className="prose-blog mt-8 border-t border-border pt-8" dangerouslySetInnerHTML={{ __html: html }} />

      {post.faqs && post.faqs.length > 0 && (
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-xl font-semibold">{ui.faqTitle}</h2>
          <dl className="mt-5 space-y-5">
            {post.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-medium text-foreground">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-7 text-muted-foreground">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <BlogPlannerCta category={post.category} tags={post.tags} locale={locale} />

      <aside className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-medium">{ui.medicalNote}</p>
        <p className="mt-1">{medicalDisclaimer[locale]}</p>
      </aside>

      <footer className="mt-10 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">{ui.references}</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {post.sourceReferences.map((ref) => (
            <li key={ref.url} className="leading-6 text-muted-foreground">
              <a
                href={normalizeReferenceUrl(ref.url, post.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2"
              >
                {ref.title}
              </a>
              <span className="block text-xs">
                — {ref.publisher}
                {ref.accessedAt ? ` · ${ui.accessed(ref.accessedAt)}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}

/** Editorial seeds used /blog/topics#slug — point readers to the canonical post instead. */
function normalizeReferenceUrl(url: string, slug: string) {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.includes("/blog/topics") && parsed.hash) {
      return `${parsed.origin}/blog/${slug}`;
    }
  } catch {
    // keep original
  }
  return url;
}

function MetaPill({ label }: { label: string }) {
  return <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">{label}</span>;
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}
