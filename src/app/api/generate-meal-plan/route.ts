import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/cloudflare/rateLimit";
import { createAIClient } from "@/lib/cloudflare/aiClient";
import { verifyTurnstileToken } from "@/lib/cloudflare/turnstile";
import { checkAndIncrementUsage, usageLimitMessage } from "@/lib/premium/serverUsage";
import type { Locale } from "@/lib/i18n";
import { regenerateMealInPlan } from "@/lib/nutrition/mealPlanner";
import { pregnancyProfileSchema, validationErrorToLocale, validationErrorToVietnamese } from "@/lib/nutrition/validation";
import type { MealPlan } from "@/types/mealPlan";

const mealSlotSchema = z.enum(["breakfast", "morningSnack", "lunch", "afternoonSnack", "dinner"]);

const requestSchema = z.object({
  profile: pregnancyProfileSchema,
  locale: z.enum(["vi", "en"]).optional(),
  regenerate: z
    .object({
      day: z.number().int().min(1).max(7),
      mealSlot: mealSlotSchema,
      existingPlan: z.custom<MealPlan>()
    })
    .optional(),
  turnstileToken: z.string().optional()
});

function resolveLocale(request: Request, bodyLocale?: Locale): Locale {
  if (bodyLocale) return bodyLocale;
  const header = request.headers.get("accept-language")?.toLowerCase() ?? "";
  return header.startsWith("en") ? "en" : "vi";
}

export async function POST(request: Request) {
  let locale: Locale = "vi";

  try {
    const limited = await checkRateLimit(request, "generate-meal-plan", 20, 60);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = requestSchema.parse(body);
    locale = parsed.locale ?? resolveLocale(request);

    const turnstile = await verifyTurnstileToken(parsed.turnstileToken, request);
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.error }, { status: 403 });
    }

    if (parsed.regenerate) {
      const swapUsage = await checkAndIncrementUsage(request, "meal-swap");
      if (!swapUsage.ok) {
        return NextResponse.json(
          { error: usageLimitMessage("meal-swap", locale), usage: { mealSwapsUsed: swapUsage.used, mealSwapsLimit: swapUsage.limit } },
          { status: 429 }
        );
      }

      const plan = regenerateMealInPlan(
        parsed.regenerate.existingPlan,
        parsed.profile,
        parsed.regenerate.day,
        parsed.regenerate.mealSlot,
        locale
      );
      return NextResponse.json({
        plan,
        usage: { mealSwapsUsed: swapUsage.used, mealSwapsLimit: swapUsage.limit }
      });
    }

    const aiUsage = await checkAndIncrementUsage(request, "ai-plan");
    if (!aiUsage.ok) {
      return NextResponse.json(
        { error: usageLimitMessage("ai-plan", locale), usage: { aiPlansUsed: aiUsage.used, aiPlansLimit: aiUsage.limit } },
        { status: 429 }
      );
    }

    const plan = await createAIClient().generateMealPlan(parsed.profile, locale);
    return NextResponse.json({
      plan,
      usage: { aiPlansUsed: aiUsage.used, aiPlansLimit: aiUsage.limit }
    });
  } catch (error) {
    const message = locale === "en" ? validationErrorToLocale(error, "en") : validationErrorToVietnamese(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
