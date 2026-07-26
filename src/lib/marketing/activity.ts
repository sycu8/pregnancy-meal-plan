import { getBindings } from "@/lib/cloudflare/bindings";
import type { MarketingPlatform } from "@/lib/marketing/drafts";

const ACTIVITY_KEY = "marketing:activity:v1";
const MAX_EVENTS = 40;

export type MarketingActivityEvent = {
  id: string;
  at: string;
  action: "publish" | "drafts" | "status";
  source: "portal" | "api" | "cron" | "zapier" | "n8n";
  live: boolean;
  slug?: string;
  locale?: string;
  platforms?: MarketingPlatform[];
  results?: Array<{
    platform: MarketingPlatform;
    ok: boolean;
    dryRun: boolean;
    id?: string;
    error?: string;
  }>;
  note?: string;
};

export async function readMarketingActivity(): Promise<MarketingActivityEvent[]> {
  const { FEATURE_FLAGS } = await getBindings();
  if (!FEATURE_FLAGS) return memoryActivity.slice();
  try {
    const raw = await FEATURE_FLAGS.get(ACTIVITY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MarketingActivityEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const memoryActivity: MarketingActivityEvent[] = [];

export async function appendMarketingActivity(
  event: Omit<MarketingActivityEvent, "id" | "at"> & { id?: string; at?: string }
): Promise<MarketingActivityEvent> {
  const full: MarketingActivityEvent = {
    id: event.id ?? `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    at: event.at ?? new Date().toISOString(),
    action: event.action,
    source: event.source,
    live: event.live,
    slug: event.slug,
    locale: event.locale,
    platforms: event.platforms,
    results: event.results,
    note: event.note
  };

  const existing = await readMarketingActivity();
  const next = [full, ...existing].slice(0, MAX_EVENTS);

  memoryActivity.length = 0;
  memoryActivity.push(...next);

  const { FEATURE_FLAGS } = await getBindings();
  if (FEATURE_FLAGS) {
    await FEATURE_FLAGS.put(ACTIVITY_KEY, JSON.stringify(next), { expirationTtl: 60 * 60 * 24 * 60 });
  }

  return full;
}
