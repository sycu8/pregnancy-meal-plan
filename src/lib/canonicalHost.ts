import { DEFAULT_SITE_URL, SITE_HOST } from "@/lib/site";

/** Apex host that should appear in the address bar and search results. */
export const CANONICAL_HOST = SITE_HOST;

/** Hostnames that must 301 to the canonical apex (path + query preserved). */
export const LEGACY_HOSTS = new Set([
  "mebauangi.info",
  "www.mebauangi.info",
  "www.pregnancymeal.tips"
]);

export function normalizeHost(hostHeader: string | null | undefined) {
  return (hostHeader ?? "").split(":")[0]?.toLowerCase() ?? "";
}

/** True when this Host should permanently redirect to pregnancymeal.tips. */
export function shouldRedirectHost(hostHeader: string | null | undefined) {
  const host = normalizeHost(hostHeader);
  if (!host || host === CANONICAL_HOST) return false;
  if (LEGACY_HOSTS.has(host)) return true;
  // Catch stray legacy subdomains still pointing at the worker.
  return host.endsWith(".mebauangi.info");
}

/** Build the absolute canonical URL for a request that arrived on a legacy host. */
export function buildCanonicalRedirectUrl(pathname: string, search: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const query = search && !search.startsWith("?") ? `?${search}` : search;
  return `${DEFAULT_SITE_URL}${path}${query}`;
}
