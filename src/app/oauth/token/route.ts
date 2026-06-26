import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401 });
  }

  const body = (await request.formData().catch(async () => {
    const json = (await request.json().catch(() => ({}))) as { grant_type?: string };
    return json;
  })) as FormData | { grant_type?: string };

  const grantType =
    body instanceof FormData ? body.get("grant_type")?.toString() : (body as { grant_type?: string }).grant_type;

  if (grantType !== "client_credentials") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  const token = Buffer.from(`${process.env.OAUTH_CLIENT_ID}:${Date.now()}`).toString("base64url");

  return NextResponse.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: 3600,
    scope: "meal-plan:generate"
  });
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with client_credentials grant and Basic auth (client_id:client_secret)."
  });
}
