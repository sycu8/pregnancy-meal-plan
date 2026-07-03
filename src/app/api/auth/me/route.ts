import { NextResponse } from "next/server";
import { resolveUserIdFromRequest } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/user";

export async function GET(request: Request) {
  const userId = await resolveUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserById(userId);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user });
}
