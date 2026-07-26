import { describe, expect, it } from "vitest";
import {
  agentAuthMetadata,
  agentIndex,
  aiCrawlerUserAgents,
  apiCatalog,
  authMd,
  contentSignal,
  markdownForPath,
  mcpServerCard,
  oauthAuthorizationServerMetadata,
  oauthProtectedResourceMetadata,
  publicSiteUrls,
  robotsTxt,
  siteOrigin,
  sitemapXml
} from "@/lib/agentDiscovery";

describe("agent discovery assets", () => {
  it("publishes robots.txt with crawl rules, AI crawler rules, content signals and sitemap", () => {
    const robots = robotsTxt();

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toContain("Disallow: /marketing");
    expect(robots).toContain("Allow: /auth.md");
    expect(robots).toContain("Allow: /agent/");
    expect(robots).toContain(`Content-Signal: ${contentSignal}`);
    expect(robots).toContain(`Sitemap: ${siteOrigin}/sitemap.xml`);
    for (const userAgent of aiCrawlerUserAgents) {
      expect(robots).toContain(`User-agent: ${userAgent}`);
    }
  });

  it("generates a sitemap with English-first and Vietnamese URLs", () => {
    const sitemap = sitemapXml();

    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    for (const url of publicSiteUrls) {
      expect(sitemap).toContain(`<loc>${url}</loc>`);
    }
    expect(sitemap).toContain(`${siteOrigin}/support</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/premium</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/privacy</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/terms</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/vi/terms</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/blog/topics</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/blog</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/vi/blog</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/blog/dinh-duong-ba-bau</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/social</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/vi/social</loc>`);
    expect(sitemap).not.toContain(`${siteOrigin}/history</loc>`);
    expect(sitemap).not.toContain(`${siteOrigin}/profile</loc>`);
    expect(sitemap).not.toContain(`${siteOrigin}/result</loc>`);
    expect(sitemap).not.toContain(`${siteOrigin}/account</loc>`);
  });

  it("describes the meal-plan API through an API catalog and MCP server card", () => {
    expect(apiCatalog.linkset[0].anchor).toBe(`${siteOrigin}/api/generate-meal-plan`);
    expect(apiCatalog.linkset[0]["service-desc"][0].href).toBe(`${siteOrigin}/openapi.json`);
    expect(apiCatalog.linkset[0]["service-doc"][0].href).toBe(`${siteOrigin}/api-docs`);
    expect(apiCatalog.linkset[0].status[0].href).toBe(`${siteOrigin}/api/health`);
    expect(mcpServerCard.serverInfo.name).toBe("pregnancy-meal-planner");
    expect(mcpServerCard.transport.endpoint).toBe(`${siteOrigin}/mcp`);
  });

  it("builds OAuth PRM + AS metadata with Auth.md agent_auth discovery", () => {
    const metadata = oauthProtectedResourceMetadata("https://example.test");
    const authServer = oauthAuthorizationServerMetadata("https://example.test");
    const agentAuth = agentAuthMetadata("https://example.test");

    expect(metadata.resource).toBe("https://example.test/");
    expect(metadata.authorization_servers).toEqual(["https://example.test"]);
    expect(metadata.scopes_supported).toContain("meal-plan:generate");
    expect(metadata.bearer_methods_supported).toContain("header");

    expect(authServer.issuer).toBe("https://example.test");
    expect(authServer.token_endpoint).toBe("https://example.test/oauth/token");
    expect(authServer.revocation_endpoint).toBe("https://example.test/oauth/revoke");
    expect(authServer).not.toHaveProperty("resource");
    expect(authServer).not.toHaveProperty("authorization_servers");
    expect(authServer).not.toHaveProperty("bearer_methods_supported");
    expect(authServer.agent_auth.skill).toBe("https://example.test/auth.md");
    expect(authServer.agent_auth.register_uri).toBe("https://example.test/agent/identity");
    expect(authServer.agent_auth.claim_uri).toBe("https://example.test/agent/identity/claim");
    expect(authServer.agent_auth.identity_types_supported).toEqual(
      expect.arrayContaining(["anonymous", "identity_assertion", "service_auth"])
    );
    expect(agentAuth.identity_assertion.assertion_types_supported).toContain(
      "urn:ietf:params:oauth:token-type:id-jag"
    );
  });

  it("publishes auth.md with the required H1 and registration steps", () => {
    const markdown = authMd("https://example.test");
    expect(markdown.startsWith("# auth.md")).toBe(true);
    expect(markdown).toContain("register_uri");
    expect(markdown).toContain("https://example.test/agent/identity");
    expect(markdown).toContain("anonymous");
  });

  it("publishes a DNS-AID agent index for the organization entrypoint", () => {
    const index = agentIndex("https://example.test");
    expect(index.agents[0].name).toBe("pregnancy-meal-planner");
    expect(index.agents[0].protocols).toContain("mcp");
    expect(index.agents[0].endpoint).toBe("https://example.test/mcp");
  });

  it("returns markdown copy for agents that request markdown", () => {
    const markdown = markdownForPath("/");

    expect(markdown).toContain("# Pregnancy Meal Planner");
    expect(markdown).toContain(`[Create a free plan](${siteOrigin}/planner)`);
    expect(markdown).toContain(`[Read pregnancy nutrition tips](${siteOrigin}/blog)`);
    expect(markdown).toContain(`${siteOrigin}/auth.md`);
  });
});
