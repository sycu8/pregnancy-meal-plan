import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCanonicalRedirectUrl,
  CANONICAL_HOST,
  normalizeHost,
  shouldRedirectHost
} from "@/lib/canonicalHost";
import { DEFAULT_SITE_URL } from "@/lib/site";
import { getPostBySlug } from "@/lib/blog/posts";

describe("URL canonicalization", () => {
  it("treats pregnancymeal.tips as the only non-redirecting public host", () => {
    expect(CANONICAL_HOST).toBe("pregnancymeal.tips");
    expect(shouldRedirectHost("pregnancymeal.tips")).toBe(false);
    expect(shouldRedirectHost("PregnancyMeal.tips:443")).toBe(false);
  });

  it("redirects legacy and www hosts to the apex domain", () => {
    expect(normalizeHost("mebauangi.info:443")).toBe("mebauangi.info");
    expect(shouldRedirectHost("mebauangi.info")).toBe(true);
    expect(shouldRedirectHost("www.mebauangi.info")).toBe(true);
    expect(shouldRedirectHost("www.pregnancymeal.tips")).toBe(true);
    expect(shouldRedirectHost("old.mebauangi.info")).toBe(true);
  });

  it("preserves path and query when building the canonical redirect URL", () => {
    expect(buildCanonicalRedirectUrl("/vi/planner", "?ref=friend")).toBe(
      `${DEFAULT_SITE_URL}/vi/planner?ref=friend`
    );
    expect(buildCanonicalRedirectUrl("/blog/hello", "")).toBe(`${DEFAULT_SITE_URL}/blog/hello`);
  });

  it("redirects legacy Vietnamese postpartum back-pain slugs to English URLs", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(config).toContain('source: "/blog/cach-giai-thoat-con-dau-lung-cho-ba-me-sau-sinh-vi"');
    expect(config).toContain('destination: "/blog/how-to-relieve-postpartum-back-pain"');
    expect(config).toContain('source: "/blog/ly-do-me-thuong-dau-lung-sau-sinh-vi"');
    expect(config).toContain('destination: "/blog/why-postpartum-back-pain-is-common"');

    const relief = getPostBySlug("how-to-relieve-postpartum-back-pain", "en");
    const causes = getPostBySlug("why-postpartum-back-pain-is-common", "en");
    expect(relief?.title).toMatch(/relieve postpartum back pain/i);
    expect(causes?.title).toMatch(/postpartum back pain is so common/i);
    expect(getPostBySlug("cach-giai-thoat-con-dau-lung-cho-ba-me-sau-sinh-vi", "en")).toBeUndefined();
    expect(getPostBySlug("ly-do-me-thuong-dau-lung-sau-sinh-vi", "en")).toBeUndefined();
  });
});
