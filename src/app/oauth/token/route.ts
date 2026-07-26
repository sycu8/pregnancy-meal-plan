import { NextResponse } from "next/server";
import { getClaimByToken } from "@/lib/agentAuth/claimStore";

function isAuthorized(request: Request) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return false;

  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
  const [id, secret] = decoded.split(":");
  return id === clientId && secret === clientSecret;
}

function mintAccessToken(subject: string) {
  return Buffer.from(`${subject}:${Date.now()}`).toString("base64url");
}

async function readGrant(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, string | undefined>;
  }

  const form = await request.formData().catch(() => null);
  if (!form) return {} as Record<string, string | undefined>;
  return {
    grant_type: form.get("grant_type")?.toString(),
    assertion: form.get("assertion")?.toString(),
    claim_token: form.get("claim_token")?.toString(),
    scope: form.get("scope")?.toString()
  };
}

export async function POST(request: Request) {
  const body = await readGrant(request);
  const grantType = body.grant_type;

  if (grantType === "client_credentials") {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "invalid_client" }, { status: 401 });
    }
    return NextResponse.json({
      access_token: mintAccessToken(process.env.OAUTH_CLIENT_ID ?? "client"),
      token_type: "Bearer",
      expires_in: 3600,
      scope: body.scope ?? "meal-plan:generate"
    });
  }

  if (grantType === "urn:ietf:params:oauth:grant-type:jwt-bearer") {
    if (!body.assertion) {
      return NextResponse.json({ error: "invalid_request", error_description: "assertion required" }, { status: 400 });
    }
    return NextResponse.json({
      access_token: mintAccessToken(body.assertion.slice(0, 24)),
      token_type: "Bearer",
      expires_in: 3600,
      scope: body.scope ?? "meal-plan:generate meal-plan:read agent:preclaim"
    });
  }

  if (grantType === "urn:workos:agent-auth:grant-type:claim") {
    if (!body.claim_token) {
      return NextResponse.json({ error: "invalid_request", error_description: "claim_token required" }, { status: 400 });
    }

    const claim = await getClaimByToken(body.claim_token);
    if (!claim) {
      return NextResponse.json({ error: "invalid_grant", error_description: "unknown or expired claim_token" }, { status: 400 });
    }
    if (claim.status !== "verified") {
      return NextResponse.json({ error: "authorization_pending" }, { status: 400 });
    }

    return NextResponse.json({
      access_token: mintAccessToken(claim.claimToken.slice(0, 24)),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meal-plan:generate meal-plan:read",
      identity_assertion: `ida_${claim.claimToken}`
    });
  }

  return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    message:
      "Use POST with client_credentials, urn:ietf:params:oauth:grant-type:jwt-bearer, or urn:workos:agent-auth:grant-type:claim."
  });
}
