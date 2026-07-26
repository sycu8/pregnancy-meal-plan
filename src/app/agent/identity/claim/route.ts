import { NextResponse } from "next/server";
import { findOrCreateUserByEmail } from "@/lib/auth/user";
import { createSession } from "@/lib/auth/session";

type ClaimBody = {
  claim_token?: string;
  email?: string;
  claim_attempt_token?: string;
  user_code?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ClaimBody;
  if (!body.claim_token) {
    return NextResponse.json({ error: "invalid_request", error_description: "claim_token required" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const origin = new URL(request.url).origin;
  const userCode = body.user_code ?? String(Math.floor(100000 + Math.random() * 900000));

  if (email) {
    try {
      const user = await findOrCreateUserByEmail(email, "en");
      const accessToken = await createSession(user.id);
      return NextResponse.json({
        status: "claimed",
        email: user.email,
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600,
        scope: "meal-plan:generate meal-plan:read"
      });
    } catch {
      // Fall through to pending claim ceremony when cloud sync is unavailable.
    }
  }

  return NextResponse.json({
    status: "authorization_pending",
    claim_attempt_token: body.claim_attempt_token ?? `attempt_${Date.now()}`,
    claim: {
      user_code: userCode,
      verification_uri: `${origin}/support`,
      verification_uri_complete: email
        ? `${origin}/support?user_code=${userCode}&email=${encodeURIComponent(email)}`
        : `${origin}/support?user_code=${userCode}`,
      expires_in: 900,
      interval: 5
    }
  });
}

export async function GET() {
  return NextResponse.json({
    message: "POST JSON { claim_token, email? } to start or complete an Auth.md claim ceremony.",
    see: "/auth.md"
  });
}
