import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    const discoveryLinks = [
      '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
      '</openapi.json>; rel="service-desc"; type="application/openapi+json"',
      '</api-docs>; rel="service-doc"; type="text/markdown"',
      '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
      '</sitemap.xml>; rel="sitemap"; type="application/xml"'
    ].join(", ");

    return [
      {
        source: "/",
        headers: [{ key: "Link", value: discoveryLinks }]
      },
      {
        source: "/en",
        headers: [{ key: "Link", value: discoveryLinks }]
      }
    ];
  }
};

export default nextConfig;
