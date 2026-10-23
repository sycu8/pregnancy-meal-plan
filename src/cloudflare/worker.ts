import { handleWithDocumentCache } from "../lib/edgeCache";

type OriginWorker = {
  fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> | Response;
};

type WaitCtx = { waitUntil(promise: Promise<unknown>): void };

/**
 * Thin entry in front of the OpenNext worker.
 * Public HTML is served from the Cache API. The Next server runs only on a miss.
 * `.open-next/worker.js` exists after `opennextjs-cloudflare build`.
 */
export default {
  async fetch(request: Request, env: unknown, ctx: WaitCtx) {
    return handleWithDocumentCache(request, ctx, async () => {
      const mod = (await import("../../.open-next/worker.js")) as { default: OriginWorker };
      return mod.default.fetch(request, env, ctx as ExecutionContext);
    });
  }
};
