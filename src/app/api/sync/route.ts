import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveUserIdFromRequest, deleteUserSessions } from "@/lib/auth/session";
import { deleteUserAccount } from "@/lib/auth/user";
import { pregnancyProfileSchema } from "@/lib/nutrition/validation";
import type { MealPlan } from "@/types/mealPlan";
import {
  loadCloudProfile,
  listCloudMealPlans,
  saveCloudMealPlan,
  saveCloudProfile
} from "@/lib/storage/cloudStorage";

const pushSchema = z.object({
  profile: pregnancyProfileSchema.optional(),
  plans: z.array(z.custom<MealPlan>()).optional()
});

export async function GET(request: Request) {
  const userId = await resolveUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await loadCloudProfile(userId);
  const plans = await listCloudMealPlans(userId, 20);

  return NextResponse.json({ profile, plans });
}

export async function POST(request: Request) {
  const userId = await resolveUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = pushSchema.parse(await request.json());
    if (body.profile) await saveCloudProfile(userId, body.profile);
    if (body.plans) {
      for (const plan of body.plans.slice(0, 20)) {
        await saveCloudMealPlan(userId, plan);
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const userId = await resolveUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteUserSessions(userId);
  await deleteUserAccount(userId);
  return NextResponse.json({ ok: true });
}
