import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("auto blog crawl resilience", () => {
  it("swallows fetch timeouts in the auto ingest script instead of failing the job", () => {
    const source = readFileSync(join(process.cwd(), "scripts/ingest-blog-auto.ts"), "utf8");
    expect(source).toContain("fetch skipped");
    expect(source).toContain("source skipped");
    expect(source).toMatch(/catch\s*\(/);
    expect(source).toContain("AbortSignal.timeout");
  });

  it("also guards shared sitemap discovery fetches", () => {
    const source = readFileSync(join(process.cwd(), "src/lib/blog/ingestion/sitemap.ts"), "utf8");
    expect(source).toContain("AbortSignal.timeout");
    expect(source).toMatch(/catch\s*\{/);
  });
});
