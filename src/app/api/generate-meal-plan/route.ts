import { NextResponse } from "next/server";
import { createAIClient } from "@/lib/cloudflare/aiClient";
import { pregnancyProfileSchema, validationErrorToVietnamese } from "@/lib/nutrition/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = pregnancyProfileSchema.parse(body);
    const plan = await createAIClient().generateMealPlan(profile);
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: validationErrorToVietnamese(error) }, { status: 400 });
  }
}
