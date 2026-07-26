import { getBindings } from "@/lib/cloudflare/bindings";

const QUEUE_CLEARED_KEY = "marketing:queue:cleared:v1";
const MAX_CLEARED = 400;

const memoryCleared = new Set<string>();

async function readCleared(): Promise<Set<string>> {
  const { FEATURE_FLAGS } = await getBindings();
  if (!FEATURE_FLAGS) return new Set(memoryCleared);
  try {
    const raw = await FEATURE_FLAGS.get(QUEUE_CLEARED_KEY);
    if (!raw) return new Set(memoryCleared);
    const parsed = JSON.parse(raw) as string[];
    const set = new Set(Array.isArray(parsed) ? parsed : []);
    for (const id of memoryCleared) set.add(id);
    return set;
  } catch {
    return new Set(memoryCleared);
  }
}

async function writeCleared(ids: Set<string>) {
  const next = [...ids].slice(-MAX_CLEARED);
  memoryCleared.clear();
  for (const id of next) memoryCleared.add(id);

  const { FEATURE_FLAGS } = await getBindings();
  if (FEATURE_FLAGS) {
    await FEATURE_FLAGS.put(QUEUE_CLEARED_KEY, JSON.stringify(next), {
      expirationTtl: 60 * 60 * 24 * 180
    });
  }
}

/** Draft IDs removed from the marketing portal queue (cleared or live-published). */
export async function listClearedDraftIds(): Promise<string[]> {
  return [...(await readCleared())];
}

export async function isDraftCleared(draftId: string): Promise<boolean> {
  return (await readCleared()).has(draftId);
}

export async function markDraftsCleared(draftIds: string[]): Promise<number> {
  if (!draftIds.length) return 0;
  const existing = await readCleared();
  let added = 0;
  for (const id of draftIds) {
    if (!id || existing.has(id)) continue;
    existing.add(id);
    added += 1;
  }
  if (added) await writeCleared(existing);
  return added;
}

export async function clearAllQueuedDrafts(draftIds: string[]): Promise<number> {
  return markDraftsCleared(draftIds);
}

/** Test helper — reset in-memory cleared set. */
export function resetClearedDraftsForTests() {
  memoryCleared.clear();
}
