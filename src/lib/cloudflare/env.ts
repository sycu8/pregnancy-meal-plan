export type AppEnv = {
  OPENAI_API_KEY?: string;
  AI_PROVIDER?: "openai" | "workers-ai" | "mock";
  AI_GATEWAY_URL?: string;
  AI_GATEWAY_ID?: string;
  FEATURE_BLOG_AI_ENABLED?: string;
  BLOG_AI_TEXT_MODEL?: string;
  BLOG_AI_IMAGE_MODEL?: string;
};

export function getOptionalAiEnv(): AppEnv {
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER as AppEnv["AI_PROVIDER"],
    AI_GATEWAY_URL: process.env.AI_GATEWAY_URL,
    AI_GATEWAY_ID: process.env.AI_GATEWAY_ID,
    FEATURE_BLOG_AI_ENABLED: process.env.FEATURE_BLOG_AI_ENABLED,
    BLOG_AI_TEXT_MODEL: process.env.BLOG_AI_TEXT_MODEL,
    BLOG_AI_IMAGE_MODEL: process.env.BLOG_AI_IMAGE_MODEL
  };
}
