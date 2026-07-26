import { describe, expect, it } from "vitest";
import { draftsFromBlogPost } from "@/lib/marketing/drafts";
import { publishDraft } from "@/lib/marketing/publishers";
import { socialLinks, socialSameAs } from "@/lib/social/links";
import type { BlogPost } from "@/types/blog";

const samplePost: BlogPost = {
  title: "Iron-rich snack ideas",
  slug: "iron-rich-snack-ideas",
  excerpt: "Pair vitamin C with plant iron at snack time.",
  content: "## Tip\n\nTry orange + lentils.",
  category: "dinh-duong-ba-bau",
  tags: ["iron"],
  author: "Pregnancy Meal Planner Team",
  sourceReferences: [],
  publishedAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
  readingTimeMinutes: 3,
  metaTitle: "Iron-rich snacks",
  metaDescription: "Pair vitamin C with plant iron at snack time for pregnancy energy.",
  status: "published"
};

describe("social hub + marketing MVP", () => {
  it("exposes live social profile URLs", () => {
    expect(socialLinks.facebook).toContain("PregnancyMealPlanner");
    expect(socialLinks.x).toContain("PregMealTips");
    expect(socialLinks.tiktok).toContain("pregnancymeal.tips");
    expect(socialSameAs).toHaveLength(3);
  });

  it("builds facebook/x drafts from a blog post (no TikTok)", () => {
    const drafts = draftsFromBlogPost(samplePost, ["en"]);
    expect(drafts).toHaveLength(2);
    expect(drafts.map((d) => d.platform).sort()).toEqual(["facebook", "x"]);
    expect(drafts.every((d) => d.link.includes("utm_source="))).toBe(true);
    expect(drafts.some((d) => d.platform === ("tiktok" as never))).toBe(false);

    const x = drafts.find((d) => d.platform === "x");
    expect(x?.text.length).toBeLessThanOrEqual(280);
    expect(x?.text).toContain(x!.link);
    expect(x?.text.trimEnd().endsWith(x!.link)).toBe(true);

    const facebook = drafts.find((d) => d.platform === "facebook");
    expect(facebook?.text).toContain(facebook!.link);
  });

  it("keeps the full X link even when the caption is long", () => {
    const longPost: BlogPost = {
      ...samplePost,
      title: "A very long pregnancy nutrition title about iron folate calcium hydration and balanced plates",
      excerpt:
        "This excerpt is intentionally long so the draft caption would previously overflow the 280 character tweet limit and truncate away the blog URL before publishing to X."
    };
    const x = draftsFromBlogPost(longPost, ["en"]).find((d) => d.platform === "x");
    expect(x?.text).toContain(x!.link);
    expect(x?.text.trimEnd().endsWith(x!.link)).toBe(true);
    expect(x?.text.length).toBeLessThanOrEqual(280);
  });

  it("dry-runs publishers when tokens are missing", async () => {
    const [facebook] = draftsFromBlogPost(samplePost, ["en"]).filter((d) => d.platform === "facebook");
    const result = await publishDraft(facebook!, { dryRun: true });
    expect(result.ok).toBe(true);
    expect(result.dryRun).toBe(true);
  });
});
