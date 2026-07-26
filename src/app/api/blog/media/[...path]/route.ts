import { getBindings } from "@/lib/cloudflare/bindings";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ path: string[] }> };

function contentTypeForKey(key: string) {
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  const key = path.map(decodeURIComponent).join("/");

  if (!key.startsWith("blog/") || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const { EXPORTS } = await getBindings();
  if (!EXPORTS?.get) {
    return new Response("Media storage unavailable", { status: 503 });
  }

  const object = (await EXPORTS.get(key)) as
    | {
        body?: ReadableStream | null;
        arrayBuffer?: () => Promise<ArrayBuffer>;
        httpMetadata?: { contentType?: string };
      }
    | null
    | ArrayBuffer
    | string;

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  // R2Object body stream (Workers) or fallbacks for typed stubs.
  if (typeof object === "object" && object !== null && "body" in object && object.body) {
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || contentTypeForKey(key),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
      }
    });
  }

  if (typeof object === "object" && object !== null && "arrayBuffer" in object && typeof object.arrayBuffer === "function") {
    const bytes = await object.arrayBuffer();
    return new Response(bytes, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || contentTypeForKey(key),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
      }
    });
  }

  return new Response("Not found", { status: 404 });
}
