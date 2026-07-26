import { NextResponse } from "next/server";
import { resolveStripeCheckoutUrl } from "@/lib/premium/stripeCheckout";

export async function GET() {
  return NextResponse.json({ checkoutUrl: resolveStripeCheckoutUrl() });
}
