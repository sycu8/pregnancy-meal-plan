import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import { handleWithDocumentCache, isPersonalizedPath, type DocumentCache } from "@/lib/edgeCache";
import { PUBLIC_CACHE_HEADER_SOURCES, PUBLIC_DOCUMENT_CACHE_CONTROL } from "@/lib/publicCache";

class MemoryCache implements DocumentCache {
  private store = new Map<string, Response>();

  async match(request: Request) {
    const found = this.store.get(request.url);
    return found ? found.clone() : undefined;
  }

  async put(request: Request, response: Response) {
    this.store.set(request.url, response.clone());
  }
}

function context() {
  const jobs: Promise<unknown>[] = [];
  return {
    waitUntil(promise: Promise<unknown>) {
      jobs.push(promise);
    },
    drain() {
      return Promise.all(jobs);
    }
  };
}

function html(cacheControl = "private, no-cache, no-store, max-age=0, must-revalidate") {
  return new Response("<html><body>plan</body></html>", {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": cacheControl }
  });
}

const PRIVATE_SHELLS = ["/account", "/history", "/profile", "/vi/account", "/vi/history", "/vi/profile"] as const;

describe("private document headers", () => {
  it("sets Cache-Control private, no-store on account, history, and profile in both locales", async () => {
    const rules = await nextConfig.headers?.();
    expect(rules).toBeDefined();

    for (const source of PRIVATE_SHELLS) {
      const rule = rules?.find((entry) => entry.source === source);
      expect(rule?.headers).toEqual([{ key: "Cache-Control", value: "private, no-store" }]);
      expect(PUBLIC_CACHE_HEADER_SOURCES).not.toContain(source);
    }
  });
});

describe("document edge cache", () => {
  it("serves the second public response from cache after a slow origin", async () => {
    let calls = 0;
    const cache = new MemoryCache();
    const ctx = context();
    const request = new Request("https://pregnancymeal.tips/blog");
    const origin = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 1900));
      return html();
    };

    const missStarted = performance.now();
    const miss = await handleWithDocumentCache(request, ctx, origin, cache);
    const missMs = performance.now() - missStarted;
    await ctx.drain();

    const hitStarted = performance.now();
    const hit = await handleWithDocumentCache(request, ctx, origin, cache);
    const hitMs = performance.now() - hitStarted;

    expect(calls).toBe(1);
    expect(miss.headers.get("X-Edge-Cache")).toBe("MISS");
    expect(hit.headers.get("X-Edge-Cache")).toBe("HIT");
    expect(miss.headers.get("Cache-Control")).toBe(PUBLIC_DOCUMENT_CACHE_CONTROL);
    expect(hit.headers.get("Cache-Control")).toBe(PUBLIC_DOCUMENT_CACHE_CONTROL);
    expect(await hit.text()).toContain("plan");
    expect(missMs).toBeGreaterThanOrEqual(1800);
    expect(hitMs).toBeLessThan(50);
    expect(hit.headers.get("X-Robots-Tag")).toBeNull();
  });

  it("never caches personalized, authenticated, RSC, or cookie-setting responses", async () => {
    const cases: Request[] = [
      new Request("https://pregnancymeal.tips/api/generate-meal-plan"),
      new Request("https://pregnancymeal.tips/result?plan=abc"),
      new Request("https://pregnancymeal.tips/vi/account"),
      new Request("https://pregnancymeal.tips/history"),
      new Request("https://pregnancymeal.tips/blog", { headers: { RSC: "1" } }),
      new Request("https://pregnancymeal.tips/blog", { headers: { Authorization: "Bearer secret" } }),
      new Request("https://pregnancymeal.tips/planner", { method: "POST" })
    ];

    for (const request of cases) {
      let calls = 0;
      const cache = new MemoryCache();
      const ctx = context();
      const origin = async () => {
        calls += 1;
        return html();
      };
      await handleWithDocumentCache(request, ctx, origin, cache);
      await ctx.drain();
      await handleWithDocumentCache(request, ctx, origin, cache);
      expect(calls, request.url).toBe(2);
    }

    let calls = 0;
    const cache = new MemoryCache();
    const ctx = context();
    const origin = async () => {
      calls += 1;
      const response = html();
      response.headers.append("Set-Cookie", "bau_device=abc; Path=/");
      return response;
    };
    const request = new Request("https://pregnancymeal.tips/");
    const response = await handleWithDocumentCache(request, ctx, origin, cache);
    await ctx.drain();
    await handleWithDocumentCache(request, ctx, origin, cache);
    expect(calls).toBe(2);
    expect(response.headers.get("Set-Cookie")).toContain("bau_device");
  });

  it("adds noindex on non-canonical hosts and leaves the apex indexable", async () => {
    const cache = new MemoryCache();
    const ctx = context();
    let calls = 0;
    const origin = async () => {
      calls += 1;
      return html();
    };
    const preview = new Request("https://bau-an-gi.sycu-lee.workers.dev/");
    const first = await handleWithDocumentCache(preview, ctx, origin, cache);
    await ctx.drain();
    const second = await handleWithDocumentCache(preview, ctx, origin, cache);

    expect(calls).toBe(1);
    expect(first.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(second.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(isPersonalizedPath("/api/sync")).toBe(true);
    expect(isPersonalizedPath("/blog/iron-rich-pregnancy-meals")).toBe(false);
  });
});
