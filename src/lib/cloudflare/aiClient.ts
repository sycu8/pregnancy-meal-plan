import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";
import { ruleBasedMealPlanner } from "@/lib/nutrition/mealPlanner";
import { getOptionalAiEnv } from "./env";

export type GenerateMealPlanInput = PregnancyProfile;

export type AIClient = {
  generateMealPlan(input: GenerateMealPlanInput): Promise<MealPlan>;
};

export function createAIClient(): AIClient {
  const env = getOptionalAiEnv();

  return {
    async generateMealPlan(input) {
      if (!env.OPENAI_API_KEY && !env.AI_GATEWAY_URL && env.AI_PROVIDER !== "workers-ai") {
        return ruleBasedMealPlanner(input);
      }

      // Future phase: call OpenAI or Workers AI from Cloudflare Worker/OpenNext server code,
      // preferably through AI Gateway for logging, caching, and rate limiting.
      return ruleBasedMealPlanner(input);
    }
  };
}
