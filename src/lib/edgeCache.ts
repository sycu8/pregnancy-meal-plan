import { normalizeHost, shouldNoindexHost } from "@/lib/canonicalHost";
import { NOINDEX_ROBOTS_TAG, PUBLIC_DOCUMENT_CACHE_CONTROL } from "@/lib/publicCache";

const PERSONALIZED_PATH = /^\/(?:vi\/)?(?:account|history|profile|result|marketing)(?:\/|$)/;

const CACHEABLE_TYPES = ["text/html", "text/plain", "text/xml", "application/xml", "application/xhtml+xml", "application/json"];

export type DocumentCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

export type WaitUntilContext = {
  waitUntil(promise: Promise<unknown>): void;
};

/** Account, history, result, marketing, APIs, and auth flows vary by person and must miss the edge cache. */
export function isPersonalizedPath(pathname: string) {
  if (pathname === "/api" || pathname.startsWith("/api/")) return true;
  if (pathname === "/oauth" || pathname.startsWith("/oauth/")) return true;
  if (pathname === "/mcp" || pathname.startsWith("/mcp/")) return true;
  return PERSONALIZED_PATH.test(pathname);
}

export function isCacheableDocumentRequest(request: Request) {
  if (request.method !== "GET") return false;
  if (request.headers.has("range")) return false;
  if (request.headers.has("authorization")) return false;

  const url = new URL(request.url);
  if (isPersonalizedPath(url.pathname)) return false;

  const header = (name: string) => request.headers.get(name)?.toLowerCase() ?? "";
  if (header("rsc") || header("next-router-prefetch") || header("next-router-state-tree") || header("next-url")) {
    return false;
  }

  const accept = header("accept");
  if (accept.includes("text/x-component")) return false;
  if (accept.includes("text/markdown") && !accept.includes("text/html")) return false;

  const dest = header("sec-fetch-dest");
  if (dest && dest !== "document") return false;

  return true;
}

export function isStoreableDocumentResponse(response: Response) {
  if (response.status !== 200) return false;
  if (response.headers.has("set-cookie")) return false;

  const vary = (response.headers.get("vary") ?? "")
    .split(",")
    .map((part) => part.trim().toLowerCase());
  if (vary.includes("*") || vary.includes("cookie") || vary.includes("authorization")) return false;

  const type = (response.headers.get("content-type") ?? "").toLowerCase();
  return CACHEABLE_TYPES.some((entry) => type.includes(entry));
}

export function documentCacheRequest(request: Request) {
  const url = new URL(request.url);
  url.hash = "";
  return new Request(url.toString(), { method: "GET" });
}

function hostFromRequest(request: Request) {
  return normalizeHost(new URL(request.url).host);
}

function applyPublicHeaders(request: Request, response: Response, edgeStatus: "HIT" | "MISS") {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", PUBLIC_DOCUMENT_CACHE_CONTROL);
  headers.set("X-Edge-Cache", edgeStatus);
  if (shouldNoindexHost(hostFromRequest(request))) {
    headers.set("X-Robots-Tag", NOINDEX_ROBOTS_TAG);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function applyNoindexOnly(request: Request, response: Response) {
  if (!shouldNoindexHost(hostFromRequest(request))) return response;
  const headers = new Headers(response.headers);
  if (headers.get("X-Robots-Tag") === NOINDEX_ROBOTS_TAG) return response;
  headers.set("X-Robots-Tag", NOINDEX_ROBOTS_TAG);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function defaultCache(): DocumentCache | null {
  const cachesGlobal = (globalThis as { caches?: { default?: DocumentCache } }).caches;
  return cachesGlobal?.default ?? null;
}

/**
 * Cache a public document at the edge. Personalized routes, RSC flights, and responses
 * that set cookies always fall through to the origin.
 */
export async function handleWithDocumentCache(
  request: Request,
  ctx: WaitUntilContext,
  origin: () => Promise<Response>,
  cache: DocumentCache | null = defaultCache()
) {
  if (!cache || !isCacheableDocumentRequest(request)) {
    return applyNoindexOnly(request, await origin());
  }

  const key = documentCacheRequest(request);
  try {
    const cached = await cache.match(key);
    if (cached) return applyPublicHeaders(request, cached, "HIT");
  } catch {
    // A cache read failure should still render the page.
  }

  const originResponse = await origin();
  if (!isStoreableDocumentResponse(originResponse)) {
    return applyNoindexOnly(request, originResponse);
  }

  const client = applyPublicHeaders(request, originResponse, "MISS");
  const stored = client.clone();
  ctx.waitUntil(
    cache.put(key, stored).then(
      () => undefined,
      () => undefined
    )
  );
  return client;
}
