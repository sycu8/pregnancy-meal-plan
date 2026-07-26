/**
 * Shared bearer auth for marketing APIs (portal, n8n, Zapier, cron).
 * Accepts MARKETING_API_KEY or falls back to CRON_SECRET.
 */
export function marketingSecrets(): string[] {
  return [process.env.MARKETING_API_KEY?.trim(), process.env.CRON_SECRET?.trim()].filter(
    (value): value is string => Boolean(value)
  );
}

export function assertMarketingAuth(request: Request): { ok: true } | { ok: false; response: Response } {
  const secrets = marketingSecrets();
  if (!secrets.length) {
    return {
      ok: false,
      response: Response.json(
        { error: "unauthorized", error_description: "MARKETING_API_KEY or CRON_SECRET is not configured" },
        { status: 401 }
      )
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const url = new URL(request.url);
  const queryKey = url.searchParams.get("api_key")?.trim() ?? "";
  // Zapier sometimes sends X-API-KEY
  const xApiKey = request.headers.get("x-api-key")?.trim() ?? "";
  const presented = bearer || xApiKey || queryKey;

  if (!presented || !secrets.includes(presented)) {
    return {
      ok: false,
      response: Response.json({ error: "unauthorized" }, { status: 401 })
    };
  }

  return { ok: true };
}
