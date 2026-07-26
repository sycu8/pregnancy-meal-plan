import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { siteViewport } from "@/lib/viewport";

describe("page speed / mobile friendliness foundations", () => {
  it("exports an explicit device-width viewport without disabling zoom", () => {
    expect(siteViewport.width).toBe("device-width");
    expect(siteViewport.initialScale).toBe(1);
    expect((siteViewport as { maximumScale?: number }).maximumScale).toBeUndefined();
    expect((siteViewport as { userScalable?: boolean }).userScalable).toBeUndefined();
  });

  it("keeps partner badge chips at readable text size and 44px+ tap targets", () => {
    const source = readFileSync(join(process.cwd(), "src/components/shared/PartnerBadges.tsx"), "utf8");
    expect(source).toContain("min-h-11");
    expect(source).toContain("text-sm");
    expect(source).not.toContain("text-xs");
    expect(source).not.toContain("py-1");
  });

  it("avoids mounting the closed mobile nav drawer in the document", () => {
    const source = readFileSync(join(process.cwd(), "src/components/shared/MobileNav.tsx"), "utf8");
    expect(source).toContain("mounted && open");
    expect(source).toContain("min-h-12");
  });

  it("sets a 16px body base size and prevents horizontal overflow", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain("font-size: 16px");
    expect(css).toContain("overflow-x: clip");
    expect(css).toContain("text-size-adjust: 100%");
  });
});
