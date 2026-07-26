import { NextResponse } from "next/server";

/** Public Stripe Payment Link for Bầu Ăn Gì? Premium. */
export const DEFAULT_STRIPE_CHECKOUT_URL = "https://buy.stripe.com/7sYbJ1eoCeDA0f462McZa00";

export async function GET() {
  const checkoutUrl =
    process.env.STRIPE_CHECKOUT_URL?.trim() ||
    process.env.PREMIUM_CHECKOUT_URL?.trim() ||
    DEFAULT_STRIPE_CHECKOUT_URL;

  return NextResponse.json({ checkoutUrl });
}
