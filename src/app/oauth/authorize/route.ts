import { NextResponse } from "next/server";

function allowedRedirectUris(): string[] {
  const configured = process.env.OAUTH_REDIRECT_URIS?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];
  const single = process.env.OAUTH_REDIRECT_URI?.trim();
  if (single) configured.push(single);
  return configured;
}

function isAllowedRedirect(redirectUri: string, requestOrigin: string) {
  let target: URL;
  try {
    target = new URL(redirectUri);
  } catch {
    return false;
  }

  if (target.origin === requestOrigin) return true;

  const allowlist = allowedRedirectUris();
  if (allowlist.length === 0) return false;
  return allowlist.some((allowed) => {
    try {
      return new URL(allowed).href === target.href || allowed === redirectUri;
    } catch {
      return allowed === redirectUri;
    }
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "authorization_not_configured", error_description: "Set OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET to enable agent OAuth." },
      { status: 503 }
    );
  }

  const responseType = url.searchParams.get("response_type");
  const redirectUri = url.searchParams.get("redirect_uri");
  if (responseType !== "token" || !redirectUri) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (!isAllowedRedirect(redirectUri, url.origin)) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "redirect_uri is not registered" },
      { status: 400 }
    );
  }

  const token = Buffer.from(`agent:${Date.now()}`).toString("base64url");
  const target = new URL(redirectUri);
  target.hash = `access_token=${token}&token_type=Bearer&expires_in=3600&scope=meal-plan:generate`;
  return NextResponse.redirect(target.toString());
}
