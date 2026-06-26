import { createAIClient } from "@/lib/cloudflare/aiClient";
import { checkRateLimit } from "@/lib/cloudflare/rateLimit";
import { getNutrientGuidance } from "@/lib/nutrition/nutrientGuidance";
import { searchBlogPosts } from "@/lib/blog/query";
import { pregnancyProfileSchema } from "@/lib/nutrition/validation";
import type { BlogLocale } from "@/types/blog";

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
};

function jsonRpcResult(id: string | number | undefined, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id, result });
}

function jsonRpcError(id: string | number | undefined, code: number, message: string) {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handleToolCall(name: string, args: Record<string, unknown>) {
  if (name === "create_meal_plan") {
    const profile = pregnancyProfileSchema.parse(args.profile);
    const locale = (args.locale === "en" ? "en" : "vi") as "vi" | "en";
    const plan = await createAIClient().generateMealPlan(profile, locale);
    return { plan };
  }

  if (name === "get_nutrient_guidance") {
    const locale = (args.locale === "en" ? "en" : "vi") as "vi" | "en";
    return getNutrientGuidance(locale);
  }

  if (name === "search_blog") {
    const locale = (args.locale === "en" ? "en" : "vi") as BlogLocale;
    const q = String(args.q ?? "");
    const limit = Number(args.limit ?? 5);
    const { posts } = searchBlogPosts(locale, { q, page: 1, pageSize: limit });
    return {
      posts: posts.map((post) => ({ slug: post.slug, title: post.title, excerpt: post.excerpt, url: `/${locale === "en" ? "en/" : ""}blog/${post.slug}` }))
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

export async function POST(request: Request) {
  const limited = await checkRateLimit(request, "mcp", 30, 60);
  if (!limited.ok) {
    return Response.json({ error: "rate_limit_exceeded" }, { status: 429 });
  }

  const payload = (await request.json()) as JsonRpcRequest;
  if (payload.method === "tools/list") {
    return jsonRpcResult(payload.id, {
      tools: [
        { name: "create_meal_plan", description: "Create a reference 7-day pregnancy meal plan." },
        { name: "get_nutrient_guidance", description: "Return nutrient guidance panels for pregnancy." },
        { name: "search_blog", description: "Search public blog posts by keyword." }
      ]
    });
  }

  if (payload.method === "tools/call") {
    try {
      const params = payload.params ?? {};
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const result = await handleToolCall(name, args);
      return jsonRpcResult(payload.id, { content: [{ type: "text", text: JSON.stringify(result) }] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tool call failed";
      return jsonRpcError(payload.id, -32000, message);
    }
  }

  return jsonRpcError(payload.id, -32601, "Method not found");
}

export async function GET() {
  return Response.json({
    transport: "streamable-http",
    status: "ready",
    methods: ["tools/list", "tools/call"]
  });
}
