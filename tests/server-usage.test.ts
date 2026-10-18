import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AI_PLAN_IP_DAILY_CEILING,
  DEVICE_COOKIE_NAME,
  checkUsage,
  deviceCookieHeader,
  incrementUsage,
  readDeviceId,
  resetUsageMemoryForTests
} from "@/lib/premium/serverUsage";
import * as resolveTier from "@/lib/premium/resolveTier";

const DEVICE_A = "a".repeat(32);
const DEVICE_B = "b".repeat(32);

function request(ip: string, deviceId?: string) {
  const headers = new Headers({ "cf-connecting-ip": ip });
  if (deviceId) headers.set("cookie", `${DEVICE_COOKIE_NAME}=${deviceId}`);
  return new Request("http://localhost/api/generate-meal-plan", { headers });
}

describe("anonymous device AI quota", () => {
  beforeEach(() => {
    resetUsageMemoryForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("issues an httpOnly anonymous id and replaces an invalid cookie", () => {
    const fresh = readDeviceId(new Request("http://localhost/api/generate-meal-plan"));
    expect(fresh.issueCookie).toBe(true);
    expect(fresh.id).toMatch(/^[a-f0-9]{32}$/);

    const kept = readDeviceId(request("203.0.113.1", DEVICE_A));
    expect(kept).toEqual({ id: DEVICE_A, issueCookie: false });

    const replaced = readDeviceId(
      new Request("http://localhost/api/generate-meal-plan", {
        headers: { cookie: `${DEVICE_COOKIE_NAME}=not-a-device` }
      })
    );
    expect(replaced.issueCookie).toBe(true);
    expect(replaced.id).not.toBe("not-a-device");

    const header = deviceCookieHeader(fresh.id);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain(`${DEVICE_COOKIE_NAME}=${fresh.id}`);
    expect(header).not.toMatch(/pregnancy|allerg|email|weight|@/i);

    const env = process.env as { NODE_ENV?: string };
    const previous = env.NODE_ENV;
    env.NODE_ENV = "production";
    try {
      expect(deviceCookieHeader(fresh.id)).toContain("Secure");
    } finally {
      env.NODE_ENV = previous;
    }
  });

  it("allows 3 AI plans per device and a separate device on the same IP", async () => {
    const ip = "203.0.113.60";
    for (let i = 0; i < 3; i += 1) {
      const check = await checkUsage(request(ip, DEVICE_A), "ai-plan");
      expect(check.ok).toBe(true);
      await incrementUsage(request(ip, DEVICE_A), "ai-plan", { deviceId: DEVICE_A });
    }

    const blocked = await checkUsage(request(ip, DEVICE_A), "ai-plan");
    expect(blocked.ok).toBe(false);
    expect(blocked.scope).toBe("device");
    expect(blocked.used).toBe(3);
    expect(blocked.limit).toBe(3);

    const other = await checkUsage(request(ip, DEVICE_B), "ai-plan");
    expect(other.ok).toBe(true);
    expect(other.scope).toBe("device");
    expect(other.used).toBe(0);
  });

  it("stops at the per-IP abuse ceiling even for a new device", async () => {
    const ip = "203.0.113.61";
    for (let i = 0; i < AI_PLAN_IP_DAILY_CEILING; i += 1) {
      const id = i.toString(16).padStart(32, "d");
      await incrementUsage(request(ip, id), "ai-plan", { deviceId: id });
    }

    const blocked = await checkUsage(request(ip, DEVICE_B), "ai-plan");
    expect(blocked.ok).toBe(false);
    expect(blocked.scope).toBe("ip");
    expect(blocked.limit).toBe(AI_PLAN_IP_DAILY_CEILING);
    expect(blocked.used).toBe(AI_PLAN_IP_DAILY_CEILING);
  });

  it("still applies the IP ceiling when the device limit is unlimited", async () => {
    vi.spyOn(resolveTier, "resolvePremiumTier").mockResolvedValue("premium");
    const ip = "203.0.113.62";
    for (let i = 0; i < AI_PLAN_IP_DAILY_CEILING; i += 1) {
      await incrementUsage(request(ip, DEVICE_A), "ai-plan", { deviceId: DEVICE_A });
    }
    const blocked = await checkUsage(request(ip, DEVICE_A), "ai-plan");
    expect(blocked.ok).toBe(false);
    expect(blocked.scope).toBe("ip");
    expect(blocked.limit).toBe(30);
  });

  it("keeps meal swaps on the per-IP limit", async () => {
    const ip = "203.0.113.63";
    await incrementUsage(request(ip, DEVICE_A), "meal-swap");
    await incrementUsage(request(ip, DEVICE_A), "meal-swap");
    const blocked = await checkUsage(request(ip, DEVICE_B), "meal-swap");
    expect(blocked.ok).toBe(false);
    expect(blocked.used).toBe(2);
    expect(blocked.limit).toBe(2);
  });

  it("documents a small overshoot when parallel increments race the non-atomic counter", async () => {
    const ip = "203.0.113.64";
    await incrementUsage(request(ip, DEVICE_A), "ai-plan", { deviceId: DEVICE_A });
    await incrementUsage(request(ip, DEVICE_A), "ai-plan", { deviceId: DEVICE_A });

    const checks = await Promise.all([checkUsage(request(ip, DEVICE_A), "ai-plan"), checkUsage(request(ip, DEVICE_A), "ai-plan")]);
    expect(checks.every((check) => check.ok)).toBe(true);

    await Promise.all(checks.map((check) => incrementUsage(request(ip, DEVICE_A), "ai-plan", { deviceId: check.deviceId })));
    const after = await checkUsage(request(ip, DEVICE_A), "ai-plan");
    // Two callers both passed the last free slot. KV get-then-put can store fewer than the number of plans served.
    expect(after.used).toBeLessThan(4);
    expect(after.used).toBeGreaterThanOrEqual(3);
  });
});
