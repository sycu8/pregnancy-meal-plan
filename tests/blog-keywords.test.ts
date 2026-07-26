import { describe, expect, it } from "vitest";
import {
  BLOG_CORE_KEYWORDS_EN,
  buildBlogListKeywords,
  buildPostKeywords,
  englishKeywordLabel
} from "@/lib/blog/keywords";
import { blogListMetadata, blogPostMetadata } from "@/lib/blog/seo";
import { getPostBySlug } from "@/lib/blog/posts";

describe("blog english keywords", () => {
  it("exposes core English keywords for the blog index", () => {
    const keywords = buildBlogListKeywords("en");
    expect(keywords).toEqual(expect.arrayContaining(["pregnancy meal planner", "prenatal nutrition"]));
    expect(BLOG_CORE_KEYWORDS_EN.length).toBeGreaterThanOrEqual(10);

    const meta = blogListMetadata("en");
    expect(meta.keywords).toEqual(expect.arrayContaining(["pregnancy meal planner"]));
  });

  it("maps Vietnamese tag slugs to English keyword phrases", () => {
    expect(englishKeywordLabel("thuc-don")).toBe("pregnancy meal plan");
    expect(englishKeywordLabel("an-dam")).toBe("starting solids");
    expect(englishKeywordLabel("tieu-duong-thai-ky")).toBe("gestational diabetes");
    expect(englishKeywordLabel("cho-con-bu")).toBe("breastfeeding");
  });

  it("builds English keywords for article metadata and JSON-LD", () => {
    const post = getPostBySlug("dinh-duong-3-thang-dau-thai-ky", "en") ?? getPostBySlug("dinh-duong-3-thang-dau-thai-ky", "vi");
    expect(post).toBeTruthy();
    if (!post) return;

    const keywords = buildPostKeywords(post, "en");
    expect(keywords.some((k) => /nutrition|trimester|pregnancy|meal/i.test(k))).toBe(true);
    expect(keywords.every((k) => !/[àáạảãâăèéêìíòóôơùúưỳýđ]/i.test(k))).toBe(true);

    const meta = blogPostMetadata(post, "en");
    expect(Array.isArray(meta.keywords) ? meta.keywords.length : 0).toBeGreaterThan(0);
  });
});
