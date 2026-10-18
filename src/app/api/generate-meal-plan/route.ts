import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/cloudflare/rateLimit";
import { validateB2BApiKey } from "@/lib/b2b/apiKey";
import { AiProviderError, createAIClient, mealPlanServedAi } from "@/lib/cloudflare/aiClient";
import { verifyTurnstileToken } from "@/lib/cloudflare/turnstile";
import { checkUsage, deviceCookieHeader, incrementUsage, usageLimitMessage, type UsageCheck } from "@/lib/premium/serverUsage";
import type { Locale } from "@/lib/i18n";
import { regenerateMealInPlan } from "@/lib/nutrition/mealPlanner";
import { localizeMealPlanForLocale } from "@/lib/nutrition/localizeMealPlan";
import { AI_UNAVAILABLE_CODE, aiUnavailableMessage } from "@/lib/nutrition/aiUnavailable";
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

function withDeviceCookie(response: NextResponse, check?: UsageCheck) {
  if (check?.issueDeviceCookie && check.deviceId) {
    response.headers.append("Set-Cookie", deviceCookieHeader(check.deviceId));
  }
  return response;
}

export async function POST(request: Request) {
  let locale: Locale = "vi";
  let deviceCheck: UsageCheck | undefined;

  try {
    const isB2B = validateB2BApiKey(request);

    if (!isB2B) {
      const limited = await checkRateLimit(request, "generate-meal-plan", 20, 60);
      if (!limited.ok) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
    }

    const body = await request.json();
    const parsed = requestSchema.parse(body);
    locale = parsed.locale ?? resolveLocale(request);

    const turnstile = await verifyTurnstileToken(parsed.turnstileToken, request);
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.error }, { status: 403 });
    }

    if (parsed.regenerate) {
      if (!isB2B) {
        const usage = await checkUsage(request, "meal-swap");
        if (!usage.ok) {
          return NextResponse.json(
            { error: usageLimitMessage("meal-swap", locale), usage: { mealSwapsUsed: usage.used, mealSwapsLimit: usage.limit } },
            { status: 429 }
          );
        }
      }

      const plan = regenerateMealInPlan(
        parsed.regenerate.existingPlan,
        parsed.profile,
        parsed.regenerate.day,
        parsed.regenerate.mealSlot,
        locale
      );

      let swapUsage: { used: number; limit: number } | null = null;
      if (!isB2B) {
        swapUsage = await incrementUsage(request, "meal-swap");
      }

      return NextResponse.json({
        plan: localizeMealPlanForLocale(plan, locale),
        usage: swapUsage ? { mealSwapsUsed: swapUsage.used, mealSwapsLimit: swapUsage.limit } : undefined
      });
    }

    if (!isB2B) {
      const aiCheck = await checkUsage(request, "ai-plan");
      deviceCheck = aiCheck;
      if (!aiCheck.ok) {
        return withDeviceCookie(
          NextResponse.json(
            {
              error: usageLimitMessage("ai-plan", locale, aiCheck.scope),
              usage: { aiPlansUsed: aiCheck.used, aiPlansLimit: aiCheck.limit }
            },
            { status: 429 }
          ),
          aiCheck
        );
      }

      const plan = await createAIClient().generateMealPlan(parsed.profile, locale);
      let used = aiCheck.used;
      let limit = aiCheck.limit;
      if (mealPlanServedAi(plan)) {
        const aiUsage = await incrementUsage(request, "ai-plan", { deviceId: aiCheck.deviceId });
        used = aiUsage.used;
        limit = aiUsage.limit;
      }
      return withDeviceCookie(
        NextResponse.json({
          plan,
          usage: { aiPlansUsed: used, aiPlansLimit: limit }
        }),
        aiCheck
      );
    }

    const plan = await createAIClient().generateMealPlan(parsed.profile, locale);
    return NextResponse.json({ plan });
  } catch (error) {
    if (error instanceof AiProviderError) {
      console.error(
        JSON.stringify({
          event: "meal-plan-ai-fallback",
          reason: "provider_error",
          provider: error.provider,
          errorName: error.name
        })
      );
      return withDeviceCookie(
        NextResponse.json(
          { error: aiUnavailableMessage(locale), code: AI_UNAVAILABLE_CODE },
          { status: 502 }
        ),
        deviceCheck
      );
    }
    const message = locale === "en" ? validationErrorToLocale(error, "en") : validationErrorToVietnamese(error);
    return withDeviceCookie(NextResponse.json({ error: message }, { status: 400 }), deviceCheck);
  }
}
