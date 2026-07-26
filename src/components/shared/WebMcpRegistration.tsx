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

function registerWebMcp(signal: AbortSignal) {
  const modelContext = navigator.modelContext;
  if (!modelContext) return;

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
        window.location.href = locale === "vi" ? "/vi/planner" : "/planner";
        return { ok: true, path: locale === "vi" ? "/vi/planner" : "/planner" };
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
    modelContext.provideContext({ tools }, { signal });
  } else if (modelContext.registerTool) {
    for (const tool of tools) {
      modelContext.registerTool(tool, { signal });
    }
  }
}

export function WebMcpRegistration() {
  useEffect(() => {
    const controller = new AbortController();

    const run = () => {
      try {
        registerWebMcp(controller.signal);
      } catch {
        // Optional WebMCP APIs must never break the page for normal browsers.
      }
    };

    // Keep registration off the critical interaction path (helps INP).
    const ric =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) =>
        window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1) as unknown as number);
    const cancelRic = window.cancelIdleCallback ?? ((id: number) => window.clearTimeout(id));
    const idleId = ric(run, { timeout: 2000 });

    return () => {
      controller.abort();
      cancelRic(idleId);
    };
  }, []);

  return null;
}
