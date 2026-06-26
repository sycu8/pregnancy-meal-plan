import { NextResponse } from "next/server";

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

  const token = Buffer.from(`agent:${Date.now()}`).toString("base64url");
  const target = new URL(redirectUri);
  target.hash = `access_token=${token}&token_type=Bearer&expires_in=3600&scope=meal-plan:generate`;
  return NextResponse.redirect(target.toString());
}
