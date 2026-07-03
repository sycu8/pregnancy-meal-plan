import { getPremiumLimits, type PremiumTier } from "@/lib/premium/limits";
import { getUsageDateKey, isValidUsageDateKey } from "@/lib/premium/dateKey";
import { getBindings } from "@/lib/cloudflare/bindings";

export type UsageBucket = "ai-plan" | "meal-swap";

const memoryUsage = new Map<string, number>();

function usageDateKey(request: Request) {
  const header = request.headers.get("x-usage-date");
  return isValidUsageDateKey(header) ? header! : getUsageDateKey();
}

function resolveClientKey(request: Request) {
  const raw = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  return raw.split(",")[0]?.trim() || "anonymous";
}

function resolveTier(request: Request): PremiumTier {
  const header = request.headers.get("x-premium-tier");
  return header === "premium" ? "premium" : "free";
}

function limitForBucket(tier: PremiumTier, bucket: UsageBucket) {
  const limits = getPremiumLimits(tier);
  return bucket === "ai-plan" ? limits.aiPlansPerDay : limits.mealSwapsPerDay;
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

export async function checkAndIncrementUsage(
  request: Request,
  bucket: UsageBucket
): Promise<{ ok: true; used: number; limit: number } | { ok: false; used: number; limit: number }> {
  const tier = resolveTier(request);
  const limit = limitForBucket(tier, bucket);
  if (!Number.isFinite(limit)) {
    return { ok: true, used: 0, limit: Number.MAX_SAFE_INTEGER };
  }

  const key = `usage:${bucket}:${usageDateKey(request)}:${resolveClientKey(request)}`;
  const used = await readCount(key);
  if (used >= limit) {
    return { ok: false, used, limit };
  }

  await writeCount(key, used + 1);
  return { ok: true, used: used + 1, limit };
}

export function usageLimitMessage(bucket: UsageBucket, locale: "vi" | "en" = "vi") {
  if (bucket === "ai-plan") {
    return locale === "en"
      ? "Daily AI meal-plan limit reached. Try again tomorrow or use the rule-based plan."
      : "Đã hết lượt tạo thực đơn AI trong ngày. Hãy thử lại ngày mai hoặc dùng thực đơn rule-based.";
  }
  return locale === "en"
    ? "Daily meal-swap limit reached. Try again tomorrow."
    : "Đã hết lượt đổi món trong ngày. Hãy thử lại ngày mai.";
}
