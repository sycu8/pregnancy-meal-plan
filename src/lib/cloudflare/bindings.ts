export type CloudflareBindings = {
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
  FEATURE_FLAGS?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  };
  DB?: {
    prepare: (query: string) => {
      bind: (...args: unknown[]) => {
        run: () => Promise<unknown>;
        first: <T>() => Promise<T | null>;
        all: <T>() => Promise<{ results?: T[] }>;
      };
    };
  };
  EXPORTS?: {
    put: (key: string, value: ArrayBuffer | ReadableStream | string | Uint8Array, options?: unknown) => Promise<void>;
    get: (key: string) => Promise<unknown>;
  };
};

export async function getBindings(): Promise<CloudflareBindings> {
  try {
    const mod = (await import("@opennextjs/cloudflare")) as {
      getCloudflareContext?: (opts: { async: boolean }) => Promise<{ env: CloudflareBindings }>;
    };
    if (mod.getCloudflareContext) {
      const ctx = await mod.getCloudflareContext({ async: true });
      return ctx.env ?? {};
    }
  } catch {
    // Local Next.js dev — bindings unavailable.
  }
  return {};
}

export async function readFeatureFlag(key: string, fallback = false): Promise<boolean> {
  if (process.env[`FEATURE_${key.toUpperCase()}`] === "true") return true;
  if (process.env[`FEATURE_${key.toUpperCase()}`] === "false") return false;

  const env = await getBindings();
  const kv = env.FEATURE_FLAGS;
  if (!kv) return fallback;

  const value = await kv.get(key);
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}
