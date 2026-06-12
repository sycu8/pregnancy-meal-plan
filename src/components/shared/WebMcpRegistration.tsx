"use client";

import { useEffect } from "react";

declare global {
  interface Navigator {
    modelContext?: {
      registerTool?: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void;
      provideContext?: (context: { tools: WebMcpTool[] }, options?: { signal?: AbortSignal }) => void;
    };
  }
}

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

export function WebMcpRegistration() {
  useEffect(() => {
    const modelContext = navigator.modelContext;
    if (!modelContext) return;

    const controller = new AbortController();
    const tools: WebMcpTool[] = [
      {
        name: "navigate_to_meal_planner",
        description: "Navigate to the pregnancy meal planner form in Vietnamese or English.",
        inputSchema: {
          type: "object",
          properties: {
            locale: {
              type: "string",
              enum: ["vi", "en"],
              description: "Preferred interface language."
            }
          },
          required: ["locale"]
        },
        async execute(input) {
          const locale = input.locale === "en" ? "en" : "vi";
          window.location.href = locale === "en" ? "/en/planner" : "/planner";
          return { ok: true, path: locale === "en" ? "/en/planner" : "/planner" };
        }
      },
      {
        name: "get_agent_discovery_links",
        description: "Return machine-readable discovery resources for this website.",
        inputSchema: {
          type: "object",
          properties: {}
        },
        async execute() {
          return {
            ok: true,
            links: {
              robots: "/robots.txt",
              sitemap: "/sitemap.xml",
              apiCatalog: "/.well-known/api-catalog",
              openApi: "/openapi.json",
              agentSkills: "/.well-known/agent-skills/index.json",
              mcpServerCard: "/.well-known/mcp/server-card.json"
            }
          };
        }
      }
    ];

    if (modelContext.provideContext) {
      modelContext.provideContext({ tools }, { signal: controller.signal });
    } else if (modelContext.registerTool) {
      for (const tool of tools) {
        modelContext.registerTool(tool, { signal: controller.signal });
      }
    }

    return () => controller.abort();
  }, []);

  return null;
}
