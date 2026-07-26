import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getUserByEmail } from "@/lib/auth/user";
import { setUserPremium } from "@/lib/storage/cloudStorage";

/**
 * Stripe webhook for Payment Link / Checkout completion.
 * Configure STRIPE_WEBHOOK_SECRET and point Stripe at /api/premium/webhook.
 */
function verifyStripeSignature(payload: string, header: string | null, secret: string) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((item) => {
      const [k, v] = item.split("=");
      return [k.trim(), v];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const ageMs = Math.abs(Date.now() - Number(timestamp) * 1000);
  if (!Number.isFinite(ageMs) || ageMs > 5 * 60 * 1000) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function extractEmail(event: Record<string, unknown>): string | null {
  const data = event.data as { object?: Record<string, unknown> } | undefined;
  const obj = data?.object ?? {};
  const direct =
    (typeof obj.customer_email === "string" && obj.customer_email) ||
    (typeof obj.receipt_email === "string" && obj.receipt_email) ||
    null;
  if (direct) return direct.toLowerCase();

  const details = obj.customer_details as { email?: string } | undefined;
  if (details?.email) return details.email.toLowerCase();

  const metadata = obj.metadata as { email?: string; user_email?: string } | undefined;
  if (metadata?.email) return metadata.email.toLowerCase();
  if (metadata?.user_email) return metadata.user_email.toLowerCase();
  return null;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "webhook_not_configured", error_description: "Set STRIPE_WEBHOOK_SECRET to enable Premium fulfillment." },
      { status: 503 }
    );
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!verifyStripeSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const type = String(event.type ?? "");
  if (
    type === "checkout.session.completed" ||
    type === "payment_intent.succeeded" ||
    type === "checkout.session.async_payment_succeeded"
  ) {
    const email = extractEmail(event);
    if (!email) {
      return NextResponse.json({ received: true, premium: false, reason: "missing_email" });
    }

    try {
      const user = await getUserByEmail(email);
      if (!user) {
        return NextResponse.json({ received: true, premium: false, reason: "user_not_found", email });
      }
      await setUserPremium(user.id, true);
      return NextResponse.json({ received: true, premium: true, userId: user.id });
    } catch (error) {
      return NextResponse.json(
        { error: "fulfillment_failed", detail: error instanceof Error ? error.message : "unknown" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
