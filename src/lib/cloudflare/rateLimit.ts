import { getBindings } from "@/lib/cloudflare/bindings";

const memoryCounters = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  request: Request,
  bucket: string,
  max: number,
  windowSeconds: number
): Promise<{ ok: true } | { ok: false }> {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  const key = `${bucket}:${ip}`;
  const now = Date.now();

  const env = await getBindings();
  if (env.FEATURE_FLAGS) {
    const kvKey = `rate:${key}`;
    const current = Number((await env.FEATURE_FLAGS.get(kvKey)) ?? "0");
    if (current >= max) return { ok: false };
    await env.FEATURE_FLAGS.put(kvKey, String(current + 1), { expirationTtl: windowSeconds });
    return { ok: true };
  }

  const entry = memoryCounters.get(key);
  if (!entry || entry.resetAt < now) {
    memoryCounters.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true };
  }

  if (entry.count >= max) return { ok: false };
  entry.count += 1;
  return { ok: true };
}
