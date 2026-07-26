import { describe, expect, it } from "vitest";
import { buildImagePrompt, synthesizePost } from "@/lib/blog/synthesis/synthesizePost";
import { pickEditorialTopics, EDITORIAL_TOPICS } from "@/lib/blog/synthesis/editorialTopics";
import { blogFaqJsonLd, blogPostJsonLd } from "@/lib/blog/seo";
import { llmsTxt, llmsFullTxt, markdownForPath, robotsTxt } from "@/lib/agentDiscovery";
import { renderBlogMarkdown } from "@/lib/blog/markdown";
import type { BlogPost } from "@/types/blog";

describe("blog AI synthesis helpers", () => {
  it("builds template synthesis with category, tags, faqs and image prompt", () => {
    const result = synthesizePost({
      title: "Thực đơn mẹ bầu 7 ngày giàu sắt",
      snippet: "Gợi ý món Việt giúp bổ sung sắt khi mang thai.",
      sourceName: "Editorial",
      url: "https://mebauangi.info/blog/topics#demo"
    });

    expect(result.usedAi).toBe(false);
    expect(result.category).toBe("thuc-don-ba-bau");
    expect(result.content).toContain("## Tóm tắt");
    expect(result.faqs?.length).toBeGreaterThan(0);
    expect(result.imagePrompt).toMatch(/photorealistic/i);
  });

  it("builds category-aware image prompts", () => {
    expect(buildImagePrompt("Omega-3", "dinh-duong-ba-bau")).toContain("pregnancy meal");
    expect(buildImagePrompt("Ăn dặm", "cham-con-0-24-thang")).toContain("weaning");
  });

  it("rotates editorial SEO topics", () => {
    expect(EDITORIAL_TOPICS.length).toBeGreaterThanOrEqual(8);
    const picked = pickEditorialTopics(3, "2026-07-26");
    expect(picked).toHaveLength(3);
    expect(picked[0]?.category).toMatch(/dinh-duong|thuc-don|sau-sinh|cham-con|truoc-sinh/);
  });
});

describe("blog SEO/GEO surfaces", () => {
  const samplePost: BlogPost = {
    title: "Dinh dưỡng mẹ bầu",
    slug: "demo-dinh-duong",
    excerpt: "Tóm tắt dinh dưỡng",
    content: "## Hello\n\nNội dung",
    category: "dinh-duong-ba-bau",
    tags: ["me-bau"],
    author: "Đội ngũ Bầu Ăn Gì?",
    sourceReferences: [{ title: "WHO", url: "https://www.who.int", publisher: "WHO" }],
    publishedAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    readingTimeMinutes: 4,
    metaTitle: "Dinh dưỡng mẹ bầu | Blog",
    metaDescription: "Mô tả",
    ogImage: "https://mebauangi.info/api/blog/media/blog/images/demo-dinh-duong.jpg",
    faqs: [{ question: "Cần bổ sung gì?", answer: "Folate và sắt theo hướng dẫn bác sĩ." }],
    status: "published"
  };

  it("emits Article image + FAQ JSON-LD", () => {
    const article = blogPostJsonLd(samplePost);
    expect(article.image).toEqual([samplePost.ogImage]);
    const faq = blogFaqJsonLd(samplePost);
    expect(faq?.["@type"]).toBe("FAQPage");
    expect(faq?.mainEntity?.[0]?.name).toContain("bổ sung");
  });

  it("publishes llms.txt and full digest for answer engines", () => {
    const compact = llmsTxt();
    expect(compact).toContain("Bầu Ăn Gì?");
    expect(compact).toContain("/llms-full.txt");
    expect(compact).toContain("thực đơn");

    const full = llmsFullTxt();
    expect(full).toContain("Full blog digest");
    expect(full.length).toBeGreaterThan(1000);
  });

  it("allows AI crawlers to fetch blog media and llms files", () => {
    const robots = robotsTxt();
    expect(robots).toContain("Allow: /api/blog/media/");
    expect(robots).toContain("Allow: /llms.txt");
    expect(robots).toContain("Allow: /llms-full.txt");
  });

  it("returns markdown for blog agent negotiation", () => {
    const markdown = markdownForPath("/blog");
    expect(markdown).toContain("Blog Bầu Ăn Gì?");
    expect(markdown).toContain("Topics");
  });

  it("renders relative and absolute blog images", () => {
    const html = renderBlogMarkdown(
      "![Hero](/api/blog/media/blog/images/demo.jpg)\n\n![Remote](https://example.com/a.jpg)"
    );
    expect(html).toContain('src="/api/blog/media/blog/images/demo.jpg"');
    expect(html).toContain('src="https://example.com/a.jpg"');
  });
});
