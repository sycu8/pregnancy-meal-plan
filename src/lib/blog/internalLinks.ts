import type { BlogCategorySlug, BlogLocale } from "@/types/blog";
import { localizedPath } from "@/lib/i18n";

export type InternalLinkPick = {
  id: string;
  href: string;
  anchor: string;
};

export type InternalLinkContext = {
  slug: string;
  category: BlogCategorySlug;
  tags: string[];
  locale: BlogLocale;
  /** Optional related post slugs to deep-link within the blog graph */
  relatedSlugs?: string[];
  /** Optional titles for prettier related-post anchors (parallel to relatedSlugs) */
  relatedTitles?: string[];
};

type TargetDef = {
  id: string;
  /** Path without locale prefix */
  path: string;
  query?: Record<string, string>;
  anchorEn: string;
  anchorVi: string;
  categories?: BlogCategorySlug[];
  tags?: string[];
  /** Always consider this target */
  always?: boolean;
  weight: number;
};

/**
 * Internal backlink graph: blog articles should point at product + hub pages
 * (not only external citations). Targets are diversified by category/tags/slug.
 */
const TARGETS: TargetDef[] = [
  {
    id: "planner-default",
    path: "/planner",
    anchorEn: "free 7-day pregnancy meal planner",
    anchorVi: "công cụ thực đơn mẹ bầu 7 ngày miễn phí",
    always: true,
    weight: 100
  },
  {
    id: "planner-iron",
    path: "/planner",
    query: { health: "anemia", goal: "increase_iron_calcium_protein" },
    anchorEn: "iron-focused pregnancy meal plan",
    anchorVi: "thực đơn mẹ bầu bổ sung sắt",
    tags: ["iron", "anemia", "folate", "thieu-mau"],
    weight: 90
  },
  {
    id: "planner-nausea",
    path: "/planner",
    query: { health: "morning_sickness", goal: "reduce_nausea" },
    anchorEn: "nausea-friendly pregnancy meal plan",
    anchorVi: "thực đơn giảm nghén",
    tags: ["nausea", "nghen", "morning-sickness"],
    weight: 90
  },
  {
    id: "planner-gdm",
    path: "/planner",
    query: { health: "gestational_diabetes", goal: "blood_sugar_control" },
    anchorEn: "gestational diabetes meal ideas in the planner",
    anchorVi: "thực đơn tiểu đường thai kỳ trên công cụ lập kế hoạch",
    tags: ["gestational-diabetes", "tieu-duong", "blood-sugar"],
    weight: 90
  },
  {
    id: "premium",
    path: "/premium",
    anchorEn: "Pregnancy Meal Planner Premium",
    anchorVi: "Pregnancy Meal Planner Premium",
    always: true,
    weight: 70
  },
  {
    id: "blog-index",
    path: "/blog",
    anchorEn: "pregnancy nutrition blog",
    anchorVi: "blog dinh dưỡng mẹ bầu",
    always: true,
    weight: 60
  },
  {
    id: "topics-hub",
    path: "/blog/topics",
    anchorEn: "topic hubs for pregnancy nutrition",
    anchorVi: "các chủ đề dinh dưỡng thai kỳ",
    always: true,
    weight: 65
  },
  {
    id: "cat-dinh-duong",
    path: "/blog/dinh-duong-ba-bau",
    anchorEn: "prenatal nutrition articles",
    anchorVi: "bài viết dinh dưỡng bà bầu",
    categories: ["dinh-duong-ba-bau"],
    weight: 85
  },
  {
    id: "cat-thuc-don",
    path: "/blog/thuc-don-ba-bau",
    anchorEn: "pregnancy meal plan articles",
    anchorVi: "bài viết thực đơn bà bầu",
    categories: ["thuc-don-ba-bau"],
    weight: 85
  },
  {
    id: "cat-truoc-sinh",
    path: "/blog/truoc-sinh",
    anchorEn: "birth preparation guides",
    anchorVi: "hướng dẫn chuẩn bị trước sinh",
    categories: ["truoc-sinh"],
    weight: 80
  },
  {
    id: "cat-sau-sinh",
    path: "/blog/sau-sinh",
    anchorEn: "postpartum recovery articles",
    anchorVi: "bài viết hồi phục sau sinh",
    categories: ["sau-sinh"],
    weight: 80
  },
  {
    id: "cat-cham-con",
    path: "/blog/cham-con-0-24-thang",
    anchorEn: "baby nutrition 0–24 months",
    anchorVi: "chăm con và dinh dưỡng 0–24 tháng",
    categories: ["cham-con-0-24-thang"],
    weight: 80
  },
  {
    id: "topic-trimester1",
    path: "/blog/topics/tam-ca-nguyet-1",
    anchorEn: "first-trimester topic hub",
    anchorVi: "chủ đề tam cá nguyệt 1",
    tags: ["first-trimester", "tam-ca-nguyet-1", "3-thang-dau"],
    weight: 75
  },
  {
    id: "topic-gdm",
    path: "/blog/topics/tieu-duong-thai-ky",
    anchorEn: "gestational diabetes topic hub",
    anchorVi: "chủ đề tiểu đường thai kỳ",
    tags: ["gestational-diabetes", "tieu-duong"],
    weight: 75
  },
  {
    id: "topic-nausea",
    path: "/blog/topics/nghen",
    anchorEn: "nausea and eating topic hub",
    anchorVi: "chủ đề nghén và ăn uống",
    tags: ["nausea", "nghen"],
    weight: 75
  },
  {
    id: "topic-weaning",
    path: "/blog/topics/an-dam",
    anchorEn: "starting solids topic hub",
    anchorVi: "chủ đề ăn dặm",
    tags: ["weaning", "an-dam", "6-months"],
    weight: 75
  },
  {
    id: "support",
    path: "/support",
    anchorEn: "support and contact page",
    anchorVi: "trang hỗ trợ",
    weight: 40
  },
  {
    id: "home",
    path: "/",
    anchorEn: "Pregnancy Meal Planner home",
    anchorVi: "trang chủ Pregnancy Meal Planner",
    weight: 35
  }
];

const SECTION_HEADING_EN = "## Explore on Pregnancy Meal Planner";
const SECTION_HEADING_VI = "## Khám phá thêm trên Pregnancy Meal Planner";

export function isInternalSiteHref(href: string): boolean {
  if (!href) return false;
  if (href.startsWith("/")) return true;
  try {
    const url = new URL(href);
    return (
      url.hostname === "pregnancymeal.tips" ||
      url.hostname.endsWith(".pregnancymeal.tips") ||
      url.hostname.endsWith(".workers.dev")
    );
  } catch {
    return false;
  }
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function normalizeTags(tags: string[]) {
  return tags.map((t) => t.toLowerCase().replace(/\s+/g, "-"));
}

function hrefFor(def: TargetDef, locale: BlogLocale) {
  const base = localizedPath(locale, def.path);
  if (!def.query || Object.keys(def.query).length === 0) return base;
  const params = new URLSearchParams(def.query);
  return `${base}?${params.toString()}`;
}

/** Pick diversified internal destinations for a post (planner + hubs + rotating extras). */
export function pickInternalLinks(ctx: InternalLinkContext, count = 4): InternalLinkPick[] {
  const tags = normalizeTags(ctx.tags);
  const scored = TARGETS.map((def) => {
    let score = def.weight;
    if (def.always) score += 20;
    if (def.categories?.includes(ctx.category)) score += 40;
    if (def.tags?.some((t) => tags.includes(t))) score += 45;
    // Light rotation so neighboring posts do not all promote the same secondary page.
    score += hashString(`${ctx.slug}:${def.id}`) % 17;
    return { def, score };
  })
    .filter(({ def, score }) => def.always || score >= def.weight + 20 || def.categories?.includes(ctx.category) || def.tags?.some((t) => tags.includes(t)))
    .sort((a, b) => b.score - a.score);

  const picks: InternalLinkPick[] = [];
  const seenPaths = new Set<string>();

  const push = (def: TargetDef) => {
    const href = hrefFor(def, ctx.locale);
    const pathKey = href.split("?")[0] || href;
    // Allow one planner variant only.
    if (pathKey.endsWith("/planner") || pathKey === "/planner" || pathKey === "/vi/planner") {
      if ([...seenPaths].some((p) => p.endsWith("/planner") || p === "/planner" || p === "/vi/planner")) return;
    }
    if (seenPaths.has(pathKey)) return;
    seenPaths.add(pathKey);
    picks.push({
      id: def.id,
      href,
      anchor: ctx.locale === "en" ? def.anchorEn : def.anchorVi
    });
  };

  // Guarantee planner + category hub when available.
  const planner =
    scored.find((s) => s.def.path === "/planner" && s.def.tags?.some((t) => tags.includes(t)))?.def ||
    TARGETS.find((t) => t.id === "planner-default")!;
  push(planner);

  const categoryTarget = TARGETS.find((t) => t.categories?.includes(ctx.category));
  if (categoryTarget) push(categoryTarget);

  // Reserve one slot for /premium so commercial page always gets equity.
  const premiumDef = TARGETS.find((t) => t.id === "premium")!;
  const targetCount = Math.max(count, 4);

  for (const row of scored) {
    if (picks.length >= targetCount - 1) break;
    if (row.def.id === "premium") continue;
    push(row.def);
  }
  push(premiumDef);

  // Related blog posts: swap in after hubs when provided (keeps graph dense).
  const relatedSlugs = ctx.relatedSlugs ?? [];
  for (let i = 0; i < relatedSlugs.length; i++) {
    const related = relatedSlugs[i]!;
    if (!related || related === ctx.slug) continue;
    const href = localizedPath(ctx.locale, `/blog/${related}`);
    if (seenPaths.has(href)) continue;
    const titled = ctx.relatedTitles?.[i]?.trim();
    const relatedPick: InternalLinkPick = {
      id: `related:${related}`,
      href,
      anchor:
        titled ||
        (ctx.locale === "en"
          ? `related article: ${related.replace(/-/g, " ")}`
          : `bài liên quan: ${related.replace(/-/g, " ")}`)
    };
    // Replace a non-planner, non-category, non-premium hub if we are at capacity.
    if (picks.length >= targetCount) {
      const replaceIdx = picks.findIndex(
        (p) =>
          !p.href.includes("/planner") &&
          !p.href.includes(`/${ctx.category}`) &&
          !p.href.includes("/premium") &&
          !p.id.startsWith("related:")
      );
      if (replaceIdx >= 0) {
        seenPaths.delete((picks[replaceIdx]!.href.split("?")[0] || picks[replaceIdx]!.href));
        picks[replaceIdx] = relatedPick;
        seenPaths.add(href);
      }
    } else {
      seenPaths.add(href);
      picks.push(relatedPick);
    }
    break;
  }

  return picks.slice(0, targetCount);
}

export function buildInternalLinksSection(ctx: InternalLinkContext, count = 4): string {
  const picks = pickInternalLinks(ctx, count);
  const heading = ctx.locale === "en" ? SECTION_HEADING_EN : SECTION_HEADING_VI;
  const intro =
    ctx.locale === "en"
      ? "Use these Pregnancy Meal Planner pages next — each link goes to a different part of the site:"
      : "Tiếp theo, dùng các trang sau trên Pregnancy Meal Planner — mỗi liên kết dẫn tới một phần khác của website:";
  const bullets = picks.map((p) => `- [${p.anchor}](${p.href})`).join("\n");
  return `${heading}\n\n${intro}\n\n${bullets}\n`;
}

export function contentHasInternalLinksSection(content: string): boolean {
  return content.includes(SECTION_HEADING_EN) || content.includes(SECTION_HEADING_VI);
}

/** Count unique on-site destinations already present in markdown. */
export function countInternalHrefs(content: string): number {
  const hrefs = new Set<string>();
  const re = /\[[^\]]*]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content))) {
    const href = match[1] || "";
    if (isInternalSiteHref(href)) hrefs.add(href.split("#")[0] || href);
  }
  return hrefs.size;
}

/**
 * Ensure article markdown includes a diversified internal-link block.
 * Idempotent: replaces an existing section rather than stacking duplicates.
 */
export function ensureInternalLinks(content: string, ctx: InternalLinkContext): string {
  const section = buildInternalLinksSection(ctx).trim();
  const heading = ctx.locale === "en" ? SECTION_HEADING_EN : SECTION_HEADING_VI;
  const headingAlt = ctx.locale === "en" ? SECTION_HEADING_VI : SECTION_HEADING_EN;

  let body = content.trim();
  const stripSection = (text: string, h: string) => {
    const idx = text.indexOf(h);
    if (idx < 0) return text;
    const after = text.slice(idx + h.length);
    const nextHeading = after.search(/\n## /);
    const end = nextHeading >= 0 ? idx + h.length + nextHeading : text.length;
    return `${text.slice(0, idx).trim()}\n\n${text.slice(end).trim()}`.trim();
  };

  body = stripSection(body, heading);
  body = stripSection(body, headingAlt);

  // Place before source footnotes / inspiration blockquotes when present.
  const sourceMarkers = ["\n## Nguồn", "\n## Sources", "\n> Nội dung tổng hợp", "\n> Educational overview"];
  let insertAt = body.length;
  for (const marker of sourceMarkers) {
    const idx = body.lastIndexOf(marker);
    if (idx >= 0) insertAt = Math.min(insertAt, idx);
  }

  const before = body.slice(0, insertAt).trim();
  const after = body.slice(insertAt).trim();
  return `${before}\n\n${section}\n${after ? `\n${after}\n` : "\n"}`;
}

export function internalLinkPromptRules(locale: BlogLocale = "en"): string {
  const planner = localizedPath(locale, "/planner");
  const premium = localizedPath(locale, "/premium");
  const topics = localizedPath(locale, "/blog/topics");
  return `
INTERNAL LINKS (required SEO backlinks to this website):
- Inside the article body, include 1–2 natural markdown links to on-site pages such as ${planner}, ${premium}, ${topics}, or /blog/{category-slug}.
- Prefer contextual anchors (e.g. "meal planner", "prenatal nutrition category") — never naked "click here".
- Do NOT invent blog post slugs. Only link to known site paths: /planner, /premium, /blog, /blog/topics, /blog/topics/*, /blog/dinh-duong-ba-bau, /blog/thuc-don-ba-bau, /blog/truoc-sinh, /blog/sau-sinh, /blog/cham-con-0-24-thang, /support, /.
- Use locale-correct paths (${locale === "vi" ? "prefix /vi for Vietnamese pages" : "English pages are unprefixed"}).
- External citations (WHO/CDC/NHS…) stay as normal source links; internal links are additional, not replacements.
`.trim();
}
