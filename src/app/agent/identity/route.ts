import { NextResponse } from "next/server";
import { findOrCreateUserByEmail } from "@/lib/auth/user";

type IdentityBody = {
  type?: string;
  assertion_type?: string;
  assertion?: string;
  login_hint?: string;
};

function mintOpaque(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${Buffer.from(`${prefix}:${rand}`).toString("base64url")}`;
}

/**
 * Auth.md registration entrypoint.
 * Passive scans only read discovery docs; this endpoint implements the advertised methods.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as IdentityBody;
  const type = body.type;

  if (type === "anonymous") {
    return NextResponse.json({
      type: "anonymous",
      identity_assertion: mintOpaque("ida"),
      claim_token: mintOpaque("claim"),
      credential_types_supported: ["access_token"],
      expires_in: 3600
    });
  }

  if (type === "identity_assertion") {
    if (!body.assertion) {
      return NextResponse.json({ error: "invalid_request", error_description: "assertion required" }, { status: 400 });
    }
    return NextResponse.json({
      type: "identity_assertion",
      assertion_type: body.assertion_type ?? "urn:ietf:params:oauth:token-type:id-jag",
      identity_assertion: mintOpaque("ida"),
      credential_types_supported: ["access_token"],
      expires_in: 3600
    });
  }

  if (type === "service_auth") {
    const email = body.login_hint?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "invalid_request", error_description: "login_hint email required" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const userCode = String(Math.floor(100000 + Math.random() * 900000));

    try {
      await findOrCreateUserByEmail(email, "en");
    } catch {
      // Claim completion can retry provisioning if D1 is unavailable here.
    }

    return NextResponse.json({
      type: "service_auth",
      claim_token: mintOpaque("claim"),
      claim: {
        user_code: userCode,
        verification_uri: `${origin}/support`,
        verification_uri_complete: `${origin}/support?user_code=${userCode}&email=${encodeURIComponent(email)}`,
        expires_in: 900,
        interval: 5
      },
      credential_types_supported: ["access_token"]
    });
  }

  return NextResponse.json(
    {
      error: "unsupported_identity_type",
      error_description: "Supported types: anonymous, identity_assertion, service_auth"
    },
    { status: 400 }
  );
}

export async function GET() {
  return NextResponse.json({
    message: "POST JSON { type: anonymous | identity_assertion | service_auth } to register an agent identity.",
    see: "/auth.md"
  });
}
