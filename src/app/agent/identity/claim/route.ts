import { NextResponse } from "next/server";
import { findOrCreateUserByEmail } from "@/lib/auth/user";
import { createSession } from "@/lib/auth/session";
import { getClaimByToken, verifyClaim } from "@/lib/agentAuth/claimStore";

type ClaimBody = {
  claim_token?: string;
  email?: string;
  claim_attempt_token?: string;
  user_code?: string;
};

function mintAgentAccessToken(subject: string) {
  return Buffer.from(`agent:${subject}:${Date.now()}`).toString("base64url");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ClaimBody;

  if (!body.claim_token) {
    return NextResponse.json({ error: "invalid_request", error_description: "claim_token required" }, { status: 400 });
  }

  const claim = await getClaimByToken(body.claim_token);
  if (!claim) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "unknown or expired claim_token" },
      { status: 400 }
    );
  }

  // Optional: agent may still complete with claim_token + matching user_code.
  if (body.user_code) {
    const verified = await verifyClaim({
      userCode: body.user_code,
      email: body.email?.trim().toLowerCase() ?? claim.email,
      claimToken: body.claim_token
    });
    if (!verified.ok) {
      return NextResponse.json({ error: "invalid_grant", error_description: verified.error }, { status: 400 });
    }
    return NextResponse.json({
      status: "claimed",
      email: verified.claim.email,
      access_token: mintAgentAccessToken(verified.claim.claimToken),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meal-plan:generate meal-plan:read",
      identity_assertion: mintAgentAccessToken(`ida:${verified.claim.claimToken}`)
    });
  }

  if (claim.status === "verified") {
    let accessToken = mintAgentAccessToken(claim.claimToken);
    if (claim.email) {
      try {
        const user = await findOrCreateUserByEmail(claim.email, "en");
        const sessionToken = await createSession(user.id);
        if (sessionToken) accessToken = sessionToken;
      } catch {
        // Fall back to opaque agent token when D1/session is unavailable.
      }
    }

    return NextResponse.json({
      status: "claimed",
      email: claim.email,
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meal-plan:generate meal-plan:read",
      identity_assertion: mintAgentAccessToken(`ida:${claim.claimToken}`)
    });
  }

  return NextResponse.json(
    {
      status: "authorization_pending",
      claim_attempt_token: body.claim_attempt_token ?? `attempt_${Date.now()}`,
      error_description: "Claim is not verified. Re-register with service_auth or identity_assertion."
    },
    { status: 400 }
  );
}

export async function GET() {
  return NextResponse.json({
    message: "POST JSON { claim_token } to exchange a verified claim for credentials. See /auth.md.",
    see: "/auth.md"
  });
}
