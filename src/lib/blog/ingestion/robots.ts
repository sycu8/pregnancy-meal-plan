import { BLOG_USER_AGENT } from "./sources";

export type RobotsRule = { type: "allow" | "disallow"; path: string };

export async function fetchRobotsTxt(baseUrl: string): Promise<string | null> {
  try {
    const url = new URL("/robots.txt", baseUrl).toString();
    const res = await fetch(url, {
      headers: { "User-Agent": BLOG_USER_AGENT },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export function parseRobotsRules(robotsTxt: string): RobotsRule[] {
  const lines = robotsTxt.split("\n").map((l) => l.trim());
  const groups: { agents: string[]; rules: RobotsRule[] }[] = [];
  let current: { agents: string[]; rules: RobotsRule[] } | null = null;

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const k = key.toLowerCase();

    if (k === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [value.toLowerCase()], rules: [] };
        groups.push(current);
      } else {
        current.agents.push(value.toLowerCase());
      }
    } else if (current && (k === "allow" || k === "disallow")) {
      current.rules.push({ type: k, path: value || "/" });
    }
  }

  const botName = BLOG_USER_AGENT.split("/")[0].toLowerCase();
  const group =
    groups.find((g) => g.agents.includes(botName)) ??
    groups.find((g) => g.agents.includes("*")) ??
    groups[0];

  return group?.rules ?? [];
}

/** Returns true if fetching the URL path is allowed by robots.txt for our bot. */
export function isPathAllowedByRobots(rules: RobotsRule[], pathname: string): boolean {
  if (rules.length === 0) return true;

  const matches = rules
    .map((rule) => ({ rule, len: matchRulePrefix(rule.path, pathname) ? rule.path.length : -1 }))
    .filter((m) => m.len >= 0)
    .sort((a, b) => b.len - a.len);

  if (matches.length === 0) return true;
  return matches[0].rule.type === "allow";
}

function matchRulePrefix(rulePath: string, pathname: string): boolean {
  if (rulePath === "/") return true;
  return pathname.startsWith(rulePath);
}

export async function assertUrlAllowedByRobots(url: string): Promise<boolean> {
  const parsed = new URL(url);
  const robots = await fetchRobotsTxt(parsed.origin);
  if (!robots) return true;
  const rules = parseRobotsRules(robots);
  return isPathAllowedByRobots(rules, parsed.pathname);
}
