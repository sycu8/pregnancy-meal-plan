import { NextResponse } from "next/server";
import { getBindings } from "@/lib/cloudflare/bindings";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const json = form
    ? null
    : ((await request.json().catch(() => ({}))) as { token?: string });
  const token = form?.get("token")?.toString() ?? json?.token;

  if (!token) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const { DB } = await getBindings();
    if (DB) {
      await DB.prepare(`DELETE FROM auth_sessions WHERE token = ?`).bind(token).run();
    }
  } catch {
    // RFC 7009: revocation should succeed even if the token is unknown.
  }

  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST with token=<access_token> to revoke an agent credential (RFC 7009)."
  });
}
