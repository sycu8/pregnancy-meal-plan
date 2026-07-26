import { describe, expect, it } from "vitest";
import {
  buildCanonicalRedirectUrl,
  CANONICAL_HOST,
  normalizeHost,
  shouldRedirectHost
} from "@/lib/canonicalHost";
import { DEFAULT_SITE_URL } from "@/lib/site";

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
});
