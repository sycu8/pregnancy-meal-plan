import { NextResponse } from "next/server";

/** Receiver for provider Security Event Tokens (RFC 8417) advertised in agent_auth.events_endpoint. */
export async function POST(request: Request) {
  await request.text().catch(() => "");
  return NextResponse.json({ accepted: true });
}

export async function GET() {
  return NextResponse.json({
    message: "POST Security Event Tokens for agent identity revocation notifications.",
    see: "/auth.md"
  });
}
