import { describe, expect, it } from "vitest";
import { getPrivacyPolicy, getTermsOfService, LEGAL_LAST_UPDATED, LEGAL_OPERATOR } from "@/lib/legal/content";
import { SUPPORT_EMAIL } from "@/lib/site";

describe("legal documents", () => {
  it("ships privacy and terms in EN and VI with operator contact", () => {
    for (const locale of ["en", "vi"] as const) {
      const privacy = getPrivacyPolicy(locale);
      const terms = getTermsOfService(locale);

      expect(privacy.lastUpdated).toBe(LEGAL_LAST_UPDATED);
      expect(terms.lastUpdated).toBe(LEGAL_LAST_UPDATED);
      expect(privacy.sections.length).toBeGreaterThanOrEqual(8);
      expect(terms.sections.length).toBeGreaterThanOrEqual(8);
      expect(privacy.contactNote).toContain(SUPPORT_EMAIL);
      expect(terms.contactNote).toContain(LEGAL_OPERATOR);
    }
  });

  it("includes medical disclaimer and localStorage defaults", () => {
    const privacyEn = getPrivacyPolicy("en");
    const termsEn = getTermsOfService("en");
    const privacyText = privacyEn.sections.flatMap((s) => [...s.paragraphs, ...(s.bullets ?? [])]).join(" ");
    const termsText = termsEn.sections.flatMap((s) => [...s.paragraphs, ...(s.bullets ?? [])]).join(" ");

    expect(privacyText.toLowerCase()).toContain("localstorage");
    expect(privacyText.toLowerCase()).toContain("stripe");
    expect(termsText.toLowerCase()).toContain("not medical advice");
    expect(termsText.toLowerCase()).toContain("vietnam");
  });
});
