import { getPremiumLimits, type PremiumTier } from "@/lib/premium/limits";
import { getUsageDateKey } from "@/lib/premium/dateKey";
import { resolvePremiumTier } from "@/lib/premium/resolveTier";
import { getBindings } from "@/lib/cloudflare/bindings";

export type UsageBucket = "ai-plan" | "meal-swap";

const memoryUsage = new Map<string, number>();

/** Server calendar day only — never trust client `x-usage-date` (bypass vector). */
function usageDateKey() {
  return getUsageDateKey();
}

function resolveClientKey(request: Request) {
  const raw = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  return raw.split(",")[0]?.trim() || "anonymous";
}

async function resolveTier(request: Request): Promise<PremiumTier> {
  return resolvePremiumTier(request);
}

function limitForBucket(tier: PremiumTier, bucket: UsageBucket) {
  const limits = getPremiumLimits(tier);
  return bucket === "ai-plan" ? limits.aiPlansPerDay : limits.mealSwapsPerDay;
}

function usageKey(request: Request, bucket: UsageBucket) {
  return `usage:${bucket}:${usageDateKey()}:${resolveClientKey(request)}`;
}

async function readCount(key: string): Promise<number> {
  const env = await getBindings();
  if (env.FEATURE_FLAGS) {
    return Number((await env.FEATURE_FLAGS.get(key)) ?? "0");
  }
  return memoryUsage.get(key) ?? 0;
}

async function writeCount(key: string, count: number) {
  const env = await getBindings();
  if (env.FEATURE_FLAGS) {
    await env.FEATURE_FLAGS.put(key, String(count), { expirationTtl: 86_400 });
    return;
  }
  memoryUsage.set(key, count);
}

export async function checkUsage(
  request: Request,
  bucket: UsageBucket
): Promise<{ ok: true; used: number; limit: number } | { ok: false; used: number; limit: number }> {
  const tier = await resolveTier(request);
  const limit = limitForBucket(tier, bucket);
  if (!Number.isFinite(limit)) {
    return { ok: true, used: 0, limit: Number.MAX_SAFE_INTEGER };
  }

  const used = await readCount(usageKey(request, bucket));
  if (used >= limit) {
    return { ok: false, used, limit };
  }
  return { ok: true, used, limit };
}

export async function incrementUsage(
  request: Request,
  bucket: UsageBucket
): Promise<{ used: number; limit: number }> {
  const tier = await resolveTier(request);
  const limit = limitForBucket(tier, bucket);
  if (!Number.isFinite(limit)) {
    return { used: 0, limit: Number.MAX_SAFE_INTEGER };
  }

  const key = usageKey(request, bucket);
  const used = (await readCount(key)) + 1;
  await writeCount(key, used);
  return { used, limit };
}

export async function checkAndIncrementUsage(
  request: Request,
  bucket: UsageBucket
): Promise<{ ok: true; used: number; limit: number } | { ok: false; used: number; limit: number }> {
  const checked = await checkUsage(request, bucket);
  if (!checked.ok) return checked;
  const next = await incrementUsage(request, bucket);
  return { ok: true, used: next.used, limit: next.limit };
}

export function usageLimitMessage(bucket: UsageBucket, locale: "vi" | "en" = "vi") {
  if (bucket === "ai-plan") {
    return locale === "en"
      ? "Daily AI meal-plan limit reached. Try again tomorrow or unlock Premium Lifetime for unlimited plans."
      : "Đã hết lượt tạo thực đơn AI trong ngày. Hãy thử lại ngày mai hoặc mở Premium Lifetime để không giới hạn.";
  }
  return locale === "en"
    ? "Daily meal-swap limit reached. Try again tomorrow or unlock Premium Lifetime."
    : "Đã hết lượt đổi món trong ngày. Hãy thử lại ngày mai hoặc mở Premium Lifetime để không giới hạn.";
}
