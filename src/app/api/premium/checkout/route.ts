import { NextResponse } from "next/server";

export async function GET() {
  const checkoutUrl = process.env.STRIPE_CHECKOUT_URL ?? process.env.PREMIUM_CHECKOUT_URL;

  if (!checkoutUrl) {
    return NextResponse.json(
      {
        error: "Checkout not configured",
        message: "Set STRIPE_CHECKOUT_URL or PREMIUM_CHECKOUT_URL to enable premium billing."
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ checkoutUrl });
}
