import { NextResponse } from "next/server";
import { z } from "zod";
import { getBindings } from "@/lib/cloudflare/bindings";
import type { MealPlan } from "@/types/mealPlan";

const SHARED_PLAN_TTL_SECONDS = 60 * 60 * 24 * 30;

const mealPlanSchema = z
  .object({
    id: z.string().min(1),
    createdAt: z.string().min(1),
    profileSnapshot: z.record(z.unknown()),
    days: z.array(z.unknown()).min(1),
    summary: z.object({ message: z.string(), disclaimer: z.string() }).passthrough()
  })
  .passthrough();

function sharedPlanKey(id: string) {
  return `shared-plan:${id}`;
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { FEATURE_FLAGS } = await getBindings();
  if (!FEATURE_FLAGS) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw = await FEATURE_FLAGS.get(sharedPlanKey(id));
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ plan: JSON.parse(raw) as MealPlan });
}

export async function POST(request: Request) {
  try {
    const plan = mealPlanSchema.parse(await request.json()) as MealPlan;
    const { FEATURE_FLAGS } = await getBindings();
    if (!FEATURE_FLAGS) return NextResponse.json({ ok: false, reason: "storage_unavailable" });

    await FEATURE_FLAGS.put(sharedPlanKey(plan.id), JSON.stringify(plan), {
      expirationTtl: SHARED_PLAN_TTL_SECONDS
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
}
