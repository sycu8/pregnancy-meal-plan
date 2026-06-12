import { describe, expect, it } from "vitest";
import {
  aiCrawlerUserAgents,
  apiCatalog,
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
    expect(robots).toContain(`Content-Signal: ${contentSignal}`);
    expect(robots).toContain(`Sitemap: ${siteOrigin}/sitemap.xml`);
    for (const userAgent of aiCrawlerUserAgents) {
      expect(robots).toContain(`User-agent: ${userAgent}`);
    }
  });

  it("generates a sitemap with canonical Vietnamese and English URLs", () => {
    const sitemap = sitemapXml();

    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    for (const url of publicSiteUrls) {
      expect(sitemap).toContain(`<loc>${url}</loc>`);
    }
    expect(sitemap).toContain(`${siteOrigin}/blog</loc>`);
    expect(sitemap).toContain(`${siteOrigin}/blog/dinh-duong-ba-bau</loc>`);
  });

  it("describes the meal-plan API through an API catalog and MCP server card", () => {
    expect(apiCatalog.linkset[0].anchor).toBe(`${siteOrigin}/api/generate-meal-plan`);
    expect(apiCatalog.linkset[0]["service-desc"][0].href).toBe(`${siteOrigin}/openapi.json`);
    expect(apiCatalog.linkset[0]["service-doc"][0].href).toBe(`${siteOrigin}/api-docs`);
    expect(apiCatalog.linkset[0].status[0].href).toBe(`${siteOrigin}/api/health`);
    expect(mcpServerCard.serverInfo.name).toBe("bau-an-gi");
    expect(mcpServerCard.transport.endpoint).toBe(`${siteOrigin}/mcp`);
  });

  it("builds OAuth protected resource metadata from the request origin", () => {
    const metadata = oauthProtectedResourceMetadata("https://example.test");
    const authServer = oauthAuthorizationServerMetadata("https://example.test");

    expect(metadata.resource).toBe("https://example.test/");
    expect(metadata.authorization_servers).toEqual(["https://example.test/.well-known/oauth-authorization-server"]);
    expect(metadata.scopes_supported).toContain("meal-plan:generate");
    expect(metadata.bearer_methods_supported).toContain("header");
    expect(authServer.issuer).toBe("https://example.test");
    expect(authServer.token_endpoint).toBe("https://example.test/oauth/token");
  });

  it("returns markdown copy for agents that request markdown", () => {
    const markdown = markdownForPath("/en");

    expect(markdown).toContain("# Pregnancy Meal Planner");
    expect(markdown).toContain(`[Create a free plan](${siteOrigin}/en/planner)`);
  });
});
