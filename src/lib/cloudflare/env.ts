export type AppEnv = {
  OPENAI_API_KEY?: string;
  AI_PROVIDER?: "openai" | "workers-ai" | "mock";
  AI_GATEWAY_URL?: string;
};

export function getOptionalAiEnv(): AppEnv {
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER as AppEnv["AI_PROVIDER"],
    AI_GATEWAY_URL: process.env.AI_GATEWAY_URL
  };
}
