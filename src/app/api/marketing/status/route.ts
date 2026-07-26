import { NextResponse } from "next/server";
import { assertMarketingAuth } from "@/lib/marketing/auth";
import { getMarketingStatus } from "@/lib/marketing/status";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = assertMarketingAuth(request);
  if (!auth.ok) return auth.response;

  const locale = new URL(request.url).searchParams.get("locale") === "vi" ? "vi" : "en";
  const status = await getMarketingStatus(locale);
  return NextResponse.json(status);
}
