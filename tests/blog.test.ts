import { describe, expect, it } from "vitest";
import { getCategoryBySlug, isCategorySlug } from "@/lib/blog/categories";
import { parseRssOrAtom } from "@/lib/blog/ingestion/rss";
import { dedupeFeedItems, topicMatches } from "@/lib/blog/ingestion/dedupe";
import { renderBlogMarkdown } from "@/lib/blog/markdown";
import { getAllPosts, getPostBySlug, getPostsByCategory } from "@/lib/blog/posts";
import { BLOG_PAGE_SIZE, filterPosts, paginatePosts, parseBlogListQuery } from "@/lib/blog/query";

describe("blog posts", () => {
  it("loads published seed posts", () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThanOrEqual(50);
    expect(posts.every((p) => p.status === "published")).toBe(true);
    expect(posts.every((p) => p.sourceReferences.length >= 1)).toBe(true);
  });

  it("resolves post by slug", () => {
    const post = getPostBySlug("dinh-duong-3-thang-dau-thai-ky");
    expect(post?.title).toContain("3 tháng đầu");
  });

  it("filters by category", () => {
    const posts = getPostsByCategory("cham-con-0-24-thang");
    expect(posts.length).toBeGreaterThanOrEqual(2);
  });
});

describe("blog query", () => {
  it("searches posts by keyword in content", () => {
    const posts = getAllPosts("vi");
    const filtered = filterPosts(posts, { q: "folate" });
    expect(filtered.length).toBeGreaterThan(0);
  });

  it("loads English localized posts", () => {
    const enPosts = getAllPosts("en");
    expect(enPosts.length).toBeGreaterThanOrEqual(50);
    const sample = enPosts.find((p) => p.slug === "caffeine-khi-mang-thai");
    expect(sample?.title).toMatch(/Caffeine/i);
    expect(sample?.content.length).toBeGreaterThan(100);
  });

  it("filters by tag", () => {
    const posts = getAllPosts();
    const filtered = filterPosts(posts, { tag: "an-dam" });
    expect(filtered.every((p) => p.tags.includes("an-dam"))).toBe(true);
  });

  it("paginates results", () => {
    const posts = getAllPosts();
    const page1 = paginatePosts(posts, 1, BLOG_PAGE_SIZE);
    const page2 = paginatePosts(posts, 2, BLOG_PAGE_SIZE);
    expect(page1.items.length).toBeLessThanOrEqual(BLOG_PAGE_SIZE);
    expect(page1.page).toBe(1);
    if (posts.length > BLOG_PAGE_SIZE) {
      expect(page2.page).toBe(2);
      expect(page1.items[0]?.slug).not.toBe(page2.items[0]?.slug);
    }
  });

  it("parses search params", () => {
    const query = parseBlogListQuery({ q: "  sắt ", tag: "SAT", page: "2" });
    expect(query.q).toBe("sắt");
    expect(query.tag).toBe("sat");
    expect(query.page).toBe(2);
  });
});

describe("blog categories", () => {
  it("recognizes category slugs", () => {
    expect(isCategorySlug("dinh-duong-ba-bau")).toBe(true);
    expect(isCategorySlug("not-a-category")).toBe(false);
    expect(getCategoryBySlug("sau-sinh")?.name).toContain("Sau sinh");
  });
});

describe("blog markdown", () => {
  it("renders headings and links", () => {
    const html = renderBlogMarkdown("## Title\n\nHello **world** [WHO](https://www.who.int)");
    expect(html).toContain("<h2");
    expect(html).toContain("<strong>world</strong>");
    expect(html).toContain('href="https://www.who.int"');
  });
});

describe("rss parser", () => {
  it("parses RSS items", () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title>Pregnancy nutrition</title><link>https://example.com/a</link><description>Safe food tips</description></item></channel></rss>`;
    const items = parseRssOrAtom(xml);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Pregnancy nutrition");
  });
});

describe("dedupe", () => {
  it("skips duplicate urls", () => {
    const items = dedupeFeedItems(
      [{ id: "1", sourceName: "WHO", title: "A", url: "https://x.com/1", snippet: "pregnancy", fetchedAt: "2026-01-01" }],
      [{ titleHash: "abc", urlHash: "def" }]
    );
    expect(items).toHaveLength(1);
  });

  it("matches topics", () => {
    expect(topicMatches("Breastfeeding guide", "", ["breastfeeding"])).toBe(true);
    expect(topicMatches("Stock market", "", ["pregnancy"])).toBe(false);
  });
});
