import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveUserIdFromRequest } from "@/lib/auth/session";
import { addCloudFavorite, listCloudFavorites, removeCloudFavorite } from "@/lib/storage/cloudStorage";

const bodySchema = z.object({
  mealSlug: z.string().min(1).max(120),
  action: z.enum(["add", "remove"])
});

export async function GET(request: Request) {
  const userId = await resolveUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ favorites: [] });

  const favorites = await listCloudFavorites(userId);
  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const userId = await resolveUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = bodySchema.parse(await request.json());
    if (body.action === "add") await addCloudFavorite(userId, body.mealSlug);
    else await removeCloudFavorite(userId, body.mealSlug);

    const favorites = await listCloudFavorites(userId);
    return NextResponse.json({ favorites });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
