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

/**
 * Free AI plans are counted per anonymous device, not per IP.
 * Vietnamese carrier NAT would otherwise share one slot across many people.
 * The per-IP key is only an abuse ceiling.
 *
 * KV get-then-put is not atomic. Parallel requests can overshoot the device
 * quota or the IP ceiling by a small amount. That overshoot is accepted.
 */
export const DEVICE_COOKIE_NAME = "bau_device";
export const AI_PLAN_IP_DAILY_CEILING = 30;
const DEVICE_ID_PATTERN = /^[a-f0-9]{32}$/;

export type UsageCheck = {
  ok: boolean;
  used: number;
  limit: number;
  deviceId?: string;
  issueDeviceCookie?: boolean;
  scope?: "device" | "ip";
};

function usageKey(request: Request, bucket: UsageBucket) {
  return `usage:${bucket}:${usageDateKey()}:${resolveClientKey(request)}`;
}

function aiPlanDeviceKey(deviceId: string) {
  return `usage:ai-plan:${usageDateKey()}:device:${deviceId}`;
}

function aiPlanIpKey(request: Request) {
  return `usage:ai-plan:${usageDateKey()}:ip:${resolveClientKey(request)}`;
}

/** Anonymous first-party id. No personal data. Invalid cookies are replaced. */
export function readDeviceId(request: Request): { id: string; issueCookie: boolean } {
  const header = request.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${DEVICE_COOKIE_NAME}=([a-f0-9]{32})(?:;|$)`));
  if (match && DEVICE_ID_PATTERN.test(match[1])) return { id: match[1], issueCookie: false };
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const id = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return { id, issueCookie: true };
}

export function deviceCookieHeader(id: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${DEVICE_COOKIE_NAME}=${id}; Path=/; Max-Age=34560000; HttpOnly; SameSite=Lax${secure}`;
}

export function resetUsageMemoryForTests() {
  memoryUsage.clear();
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

async function checkAiPlan(request: Request): Promise<UsageCheck> {
  const tier = await resolveTier(request);
  const deviceLimit = limitForBucket(tier, "ai-plan");
  const { id, issueCookie } = readDeviceId(request);
  const deviceUsed = await readCount(aiPlanDeviceKey(id));
  const ipUsed = await readCount(aiPlanIpKey(request));

  if (ipUsed >= AI_PLAN_IP_DAILY_CEILING) {
    return {
      ok: false,
      used: ipUsed,
      limit: AI_PLAN_IP_DAILY_CEILING,
      deviceId: id,
      issueDeviceCookie: issueCookie,
      scope: "ip"
    };
  }
  if (Number.isFinite(deviceLimit) && deviceUsed >= deviceLimit) {
    return {
      ok: false,
      used: deviceUsed,
      limit: deviceLimit,
      deviceId: id,
      issueDeviceCookie: issueCookie,
      scope: "device"
    };
  }
  return {
    ok: true,
    used: Number.isFinite(deviceLimit) ? deviceUsed : 0,
    limit: Number.isFinite(deviceLimit) ? deviceLimit : Number.MAX_SAFE_INTEGER,
    deviceId: id,
    issueDeviceCookie: issueCookie,
    scope: "device"
  };
}

export async function checkUsage(request: Request, bucket: UsageBucket): Promise<UsageCheck> {
  if (bucket === "ai-plan") return checkAiPlan(request);

  const tier = await resolveTier(request);
  const limit = limitForBucket(tier, bucket);
  if (!Number.isFinite(limit)) {
    return { ok: true, used: 0, limit: Number.MAX_SAFE_INTEGER };
  }

  const used = await readCount(usageKey(request, bucket));
  if (used >= limit) return { ok: false, used, limit };
  return { ok: true, used, limit };
}

async function incrementAiPlan(request: Request, deviceId: string): Promise<{ used: number; limit: number }> {
  const deviceKey = aiPlanDeviceKey(deviceId);
  const ipKey = aiPlanIpKey(request);
  const deviceUsed = (await readCount(deviceKey)) + 1;
  const ipUsed = (await readCount(ipKey)) + 1;
  await writeCount(deviceKey, deviceUsed);
  await writeCount(ipKey, ipUsed);

  const deviceLimit = limitForBucket(await resolveTier(request), "ai-plan");
  if (!Number.isFinite(deviceLimit)) {
    return { used: ipUsed, limit: AI_PLAN_IP_DAILY_CEILING };
  }
  return { used: deviceUsed, limit: deviceLimit };
}

export async function incrementUsage(
  request: Request,
  bucket: UsageBucket,
  options?: { deviceId?: string }
): Promise<{ used: number; limit: number }> {
  if (bucket === "ai-plan") {
    const deviceId =
      options?.deviceId && DEVICE_ID_PATTERN.test(options.deviceId) ? options.deviceId : readDeviceId(request).id;
    return incrementAiPlan(request, deviceId);
  }

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

export async function checkAndIncrementUsage(request: Request, bucket: UsageBucket): Promise<UsageCheck> {
  const checked = await checkUsage(request, bucket);
  if (!checked.ok) return checked;
  const next = await incrementUsage(request, bucket, { deviceId: checked.deviceId });
  return { ...checked, ok: true, used: next.used, limit: next.limit };
}

export function usageLimitMessage(bucket: UsageBucket, locale: "vi" | "en" = "vi", scope?: "device" | "ip") {
  if (bucket === "ai-plan" && scope === "ip") {
    return locale === "en"
      ? "Too many AI meal plans were created on this network today. You can still use the basic plan."
      : "Mạng này đã tạo quá nhiều thực đơn AI hôm nay. Bạn vẫn dùng được thực đơn cơ bản.";
  }
  if (bucket === "ai-plan") {
    return locale === "en"
      ? "Daily AI meal-plan limit reached. The basic plan is still available. Try again tomorrow, or unlock Premium Lifetime for unlimited plans."
      : "Đã hết lượt tạo thực đơn AI trong ngày. Bạn vẫn dùng được thực đơn cơ bản. Hãy thử lại ngày mai hoặc mở Premium Lifetime để không giới hạn.";
  }
  return locale === "en"
    ? "Daily meal-swap limit reached. Try again tomorrow or unlock Premium Lifetime."
    : "Đã hết lượt đổi món trong ngày. Hãy thử lại ngày mai hoặc mở Premium Lifetime để không giới hạn.";
}
