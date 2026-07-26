/** Public Stripe Payment Link for Pregnancy Meal Planner Premium. */
export const DEFAULT_STRIPE_CHECKOUT_URL = "https://buy.stripe.com/7sYbJ1eoCeDA0f462McZa00";

export function resolveStripeCheckoutUrl(env: NodeJS.ProcessEnv = process.env): string {
  return env.STRIPE_CHECKOUT_URL?.trim() || env.PREMIUM_CHECKOUT_URL?.trim() || DEFAULT_STRIPE_CHECKOUT_URL;
}
