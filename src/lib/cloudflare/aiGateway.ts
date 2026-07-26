/**
 * Cloudflare AI Gateway client for Workers AI (text + image).
 * Used by blog publish scripts in Node/CI and reusable from Workers.
 *
 * Auth: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
 * Gateway: AI_GATEWAY_ID (defaults to "default")
 *
 * Text uses the same AI Gateway workers-ai provider path that succeeded for images,
 * with OpenAI-compat + unified API as fallbacks.
 */

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiGatewayConfig = {
  accountId: string;
  apiToken: string;
  gatewayId: string;
  textModel: string;
  imageModel: string;
};

const DEFAULT_TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const DEFAULT_IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";

export function readAiGatewayConfig(env: NodeJS.ProcessEnv = process.env): AiGatewayConfig | null {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = env.CLOUDFLARE_API_TOKEN?.trim();
  if (!accountId || !apiToken) return null;

  return {
    accountId,
    apiToken,
    gatewayId: env.AI_GATEWAY_ID?.trim() || "default",
    textModel: env.BLOG_AI_TEXT_MODEL?.trim() || DEFAULT_TEXT_MODEL,
    imageModel: env.BLOG_AI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL
  };
}

export function isBlogAiEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.FEATURE_BLOG_AI_ENABLED === "false") return false;
  if (env.FEATURE_BLOG_AI_ENABLED === "true") return true;
  return Boolean(readAiGatewayConfig(env));
}

function workersAiModelPath(model: string) {
  return model.startsWith("@cf/") || model.startsWith("@hf/") ? model : `@cf/${model.replace(/^workers-ai\//, "")}`;
}

function extractChatText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const row = data as {
    choices?: { message?: { content?: string } }[];
    result?: { response?: string; message?: string };
    response?: string;
    output_text?: string;
  };

  const fromChoices = row.choices?.[0]?.message?.content?.trim();
  if (fromChoices) return fromChoices;

  const fromResult = row.result?.response?.trim() || row.result?.message?.trim();
  if (fromResult) return fromResult;

  const direct = row.response?.trim() || row.output_text?.trim();
  return direct || null;
}

async function postJson(url: string, headers: Record<string, string>, body: unknown): Promise<{ ok: boolean; status: number; data: unknown; raw: string }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000)
  });
  const raw = await response.text().catch(() => "");
  let data: unknown = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { response: raw };
  }
  return { ok: response.ok, status: response.status, data, raw };
}

export async function gatewayChatCompletion(
  messages: ChatMessage[],
  options: {
    config?: AiGatewayConfig | null;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string | null> {
  const config = options.config ?? readAiGatewayConfig();
  if (!config) return null;

  const model = workersAiModelPath(config.textModel);
  const auth = { Authorization: `Bearer ${config.apiToken}` };
  const attempts: { name: string; url: string; headers: Record<string, string>; body: unknown }[] = [
    // 1) Same workers-ai provider path that already works for Flux images
    {
      name: "gateway-workers-ai",
      url: `https://gateway.ai.cloudflare.com/v1/${config.accountId}/${config.gatewayId}/workers-ai/${model}`,
      headers: auth,
      body: {
        messages,
        temperature: options.temperature ?? 0.45,
        max_tokens: options.maxTokens ?? 4096
      }
    },
    // 2) OpenAI-compatible gateway endpoint
    {
      name: "gateway-compat",
      url: `https://gateway.ai.cloudflare.com/v1/${config.accountId}/${config.gatewayId}/compat/chat/completions`,
      headers: {
        ...auth,
        "cf-aig-authorization": `Bearer ${config.apiToken}`
      },
      body: {
        model: `workers-ai/${model}`,
        messages,
        temperature: options.temperature ?? 0.45,
        max_tokens: options.maxTokens ?? 4096
      }
    },
    // 3) Unified API on api.cloudflare.com
    {
      name: "unified-chat",
      url: `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/v1/chat/completions`,
      headers: {
        ...auth,
        "cf-aig-gateway-id": config.gatewayId
      },
      body: {
        model,
        messages,
        temperature: options.temperature ?? 0.45,
        max_tokens: options.maxTokens ?? 4096
      }
    }
  ];

  for (const attempt of attempts) {
    try {
      const result = await postJson(attempt.url, attempt.headers, attempt.body);
      const text = extractChatText(result.data);
      if (result.ok && text) {
        console.log(`[ai-gateway] chat ok via ${attempt.name} (${text.length} chars)`);
        return text;
      }
      console.warn(
        `[ai-gateway] chat miss via ${attempt.name} status=${result.status}: ${result.raw.slice(0, 280)}`
      );
    } catch (error) {
      console.warn(`[ai-gateway] chat error via ${attempt.name}:`, error);
    }
  }

  return null;
}

export async function gatewayGenerateImage(
  prompt: string,
  options: {
    config?: AiGatewayConfig | null;
    steps?: number;
    seed?: number;
  } = {}
): Promise<Uint8Array | null> {
  const config = options.config ?? readAiGatewayConfig();
  if (!config) return null;

  const model = workersAiModelPath(config.imageModel);
  // Classic Workers AI provider path through AI Gateway (proven in production publish).
  const url = `https://gateway.ai.cloudflare.com/v1/${config.accountId}/${config.gatewayId}/workers-ai/${model}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: prompt.slice(0, 2048),
      steps: options.steps ?? 4,
      ...(typeof options.seed === "number" ? { seed: options.seed } : {})
    }),
    signal: AbortSignal.timeout(180_000)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.warn(`[ai-gateway] image failed ${response.status}: ${detail.slice(0, 300)}`);
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("image/")) {
    return new Uint8Array(await response.arrayBuffer());
  }

  const data = (await response.json()) as {
    result?: { image?: string };
    image?: string;
  };
  const b64 = data.result?.image ?? data.image;
  if (!b64) {
    console.warn("[ai-gateway] image response missing base64 payload");
    return null;
  }

  return base64ToBytes(b64);
}

function base64ToBytes(value: string): Uint8Array {
  const cleaned = value.replace(/^data:image\/\w+;base64,/, "");
  const binary = Buffer.from(cleaned, "base64");
  return new Uint8Array(binary);
}
