import { NextResponse } from "next/server";
import { findOrCreateUserByEmail } from "@/lib/auth/user";
import { createSession } from "@/lib/auth/session";
import { getClaimByToken, verifyClaim } from "@/lib/agentAuth/claimStore";

type ClaimBody = {
  claim_token?: string;
  email?: string;
  claim_attempt_token?: string;
  user_code?: string;
  /** Human verification completion — requires matching issued user_code. */
  complete?: boolean;
};

function mintAgentAccessToken(subject: string) {
  return Buffer.from(`agent:${subject}:${Date.now()}`).toString("base64url");
}

function pendingResponse(origin: string, claim: { claimToken: string; userCode: string; email?: string }, attempt?: string) {
  return NextResponse.json({
    status: "authorization_pending",
    claim_attempt_token: attempt ?? `attempt_${Date.now()}`,
    claim: {
      user_code: claim.userCode,
      verification_uri: `${origin}/support`,
      verification_uri_complete: claim.email
        ? `${origin}/support?user_code=${claim.userCode}&email=${encodeURIComponent(claim.email)}`
        : `${origin}/support?user_code=${claim.userCode}`,
      expires_in: 900,
      interval: 5
    }
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ClaimBody;
  const origin = new URL(request.url).origin;
  const email = body.email?.trim().toLowerCase();

  // Human completes ownership at /support with the issued user_code.
  if (body.complete || (body.user_code && !body.claim_token)) {
    if (!body.user_code) {
      return NextResponse.json({ error: "invalid_request", error_description: "user_code required" }, { status: 400 });
    }
    const verified = await verifyClaim({
      userCode: body.user_code,
      email,
      claimToken: body.claim_token
    });
    if (!verified.ok) {
      return NextResponse.json({ error: "invalid_grant", error_description: verified.error }, { status: 400 });
    }

    let accessToken: string | undefined;
    const claimEmail = verified.claim.email;
    if (claimEmail) {
      try {
        const user = await findOrCreateUserByEmail(claimEmail, "en");
        accessToken = await createSession(user.id);
      } catch {
        // Cloud sync unavailable — still mark claim verified for agent token exchange.
      }
    }

    return NextResponse.json({
      status: "claimed",
      email: claimEmail,
      ...(accessToken
        ? {
            access_token: accessToken,
            token_type: "Bearer",
            expires_in: 3600,
            scope: "meal-plan:generate meal-plan:read"
          }
        : {}),
      claim_token: verified.claim.claimToken
    });
  }

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

  // Agent may complete with claim_token + matching user_code after human approval.
  if (body.user_code) {
    const verified = await verifyClaim({
      userCode: body.user_code,
      email: email ?? claim.email,
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
    return NextResponse.json({
      status: "claimed",
      email: claim.email,
      access_token: mintAgentAccessToken(claim.claimToken),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meal-plan:generate meal-plan:read",
      identity_assertion: mintAgentAccessToken(`ida:${claim.claimToken}`)
    });
  }

  // Never mint app sessions from email + arbitrary claim_token alone.
  return pendingResponse(origin, claim, body.claim_attempt_token);
}

export async function GET() {
  return NextResponse.json({
    message:
      "POST JSON { claim_token } to poll, or { user_code, email?, complete: true } / { claim_token, user_code } to finish the Auth.md claim ceremony.",
    see: "/auth.md"
  });
}
