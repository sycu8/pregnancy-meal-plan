/** Client helper to open the configured Premium checkout URL. */
export async function openPremiumCheckout(): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const response = await fetch("/api/premium/checkout");
    const data = (await response.json()) as { checkoutUrl?: string; message?: string; error?: string };
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return { ok: true };
    }
    return { ok: false, message: data.message ?? data.error ?? "Checkout unavailable" };
  } catch {
    return { ok: false, message: "Checkout unavailable" };
  }
}
