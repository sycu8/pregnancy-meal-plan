import { describe, expect, it } from "vitest";
import { createClaim, getClaimByToken, verifyClaim } from "@/lib/agentAuth/claimStore";

describe("agent claim store", () => {
  it("rejects unknown claim tokens and requires user_code to verify", async () => {
    const claim = await createClaim({ email: "parent@example.com" });
    expect(await getClaimByToken("claim_not_real")).toBeNull();
    expect(claim.status).toBe("pending");

    const mismatch = await verifyClaim({ userCode: "000000", claimToken: claim.claimToken });
    expect(mismatch.ok).toBe(false);

    const verified = await verifyClaim({
      userCode: claim.userCode,
      claimToken: claim.claimToken,
      email: "parent@example.com"
    });
    expect(verified.ok).toBe(true);
    if (verified.ok) {
      expect(verified.claim.status).toBe("verified");
    }
  });
});
