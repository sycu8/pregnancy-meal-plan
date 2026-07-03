import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveUserIdFromRequest } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/user";
import { buildPlanExportHtml, buildPlanExportText } from "@/lib/export/planExport";
import { getBindings } from "@/lib/cloudflare/bindings";
import { listCloudMealPlans } from "@/lib/storage/cloudStorage";
import type { MealPlan } from "@/types/mealPlan";

const bodySchema = z.object({
  planId: z.string().optional(),
  locale: z.enum(["vi", "en"]).optional(),
  plan: z.custom<MealPlan>().optional()
});

export async function POST(request: Request) {
  const userId = await resolveUserIdFromRequest(request);
  const user = userId ? await getUserById(userId) : null;

  try {
    const body = bodySchema.parse(await request.json());
    const locale = body.locale ?? "vi";
    let plan: MealPlan | null = body.plan ?? null;

    if (!plan && body.planId && userId) {
      const plans = await listCloudMealPlans(userId, 50);
      plan = plans.find((item) => item.id === body.planId) ?? null;
    }

    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const text = buildPlanExportText(plan, locale);
    const html = buildPlanExportHtml(plan, locale);

    const { EXPORTS } = await getBindings();
    if (EXPORTS && user?.premium) {
      const key = `exports/${userId ?? "anon"}/${plan.id}.html`;
      await EXPORTS.put(key, html, {
        httpMetadata: { contentType: "text/html; charset=utf-8" }
      });
      return NextResponse.json({
        format: "html",
        content: html,
        downloadPath: key,
        textPreview: text.slice(0, 500)
      });
    }

    return NextResponse.json({ format: "text", content: text });
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 400 });
  }
}
