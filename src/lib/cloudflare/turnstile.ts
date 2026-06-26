export type TurnstileResult = { ok: true } | { ok: false; error: string };

export async function verifyTurnstileToken(token: string | undefined, request: Request): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };
  if (process.env.NODE_ENV === "development") return { ok: true };

  if (!token?.trim()) {
    return { ok: false, error: "Missing Turnstile verification." };
  }

  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "0.0.0.0";
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip
  });

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const result = (await response.json()) as { success?: boolean };
  if (!result.success) {
    return { ok: false, error: "Turnstile verification failed." };
  }

  return { ok: true };
}
