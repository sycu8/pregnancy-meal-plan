/**
 * Cloudflare AI Gateway client for Workers AI (text + image).
 * Used by blog publish scripts in Node/CI and reusable from Workers.
 *
 * Auth: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
 * Gateway: AI_GATEWAY_ID (defaults to "default")
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

  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/v1/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
      "cf-aig-gateway-id": config.gatewayId
    },
    body: JSON.stringify({
      model: config.textModel,
      messages,
      temperature: options.temperature ?? 0.45,
      max_tokens: options.maxTokens ?? 4096
    }),
    signal: AbortSignal.timeout(120_000)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.warn(`[ai-gateway] chat failed ${response.status}: ${detail.slice(0, 300)}`);
    return null;
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    result?: { response?: string };
    response?: string;
  };

  return (
    data.choices?.[0]?.message?.content?.trim() ||
    data.result?.response?.trim() ||
    data.response?.trim() ||
    null
  );
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

  // Classic Workers AI provider path through AI Gateway (best for Flux image models).
  const url = `https://gateway.ai.cloudflare.com/v1/${config.accountId}/${config.gatewayId}/workers-ai/${config.imageModel}`;
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
  if (!b64) return null;

  return base64ToBytes(b64);
}

function base64ToBytes(value: string): Uint8Array {
  const cleaned = value.replace(/^data:image\/\w+;base64,/, "");
  const binary = Buffer.from(cleaned, "base64");
  return new Uint8Array(binary);
}
