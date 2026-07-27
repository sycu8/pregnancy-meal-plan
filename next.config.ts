import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enables app/global-not-found.tsx for multi-root-layout (en + vi) apps.
    globalNotFound: true
  },
  async redirects() {
    return [
      {
        source: "/en",
        destination: "/",
        permanent: true
      },
      {
        source: "/en/:path*",
        destination: "/:path*",
        permanent: true
      },
      // Legacy Vietnamese Vinmec-derived slugs → English URLs
      {
        source: "/blog/cach-giai-thoat-con-dau-lung-cho-ba-me-sau-sinh-vi",
        destination: "/blog/how-to-relieve-postpartum-back-pain",
        permanent: true
      },
      {
        source: "/vi/blog/cach-giai-thoat-con-dau-lung-cho-ba-me-sau-sinh-vi",
        destination: "/vi/blog/how-to-relieve-postpartum-back-pain",
        permanent: true
      },
      {
        source: "/blog/ly-do-me-thuong-dau-lung-sau-sinh-vi",
        destination: "/blog/why-postpartum-back-pain-is-common",
        permanent: true
      },
      {
        source: "/vi/blog/ly-do-me-thuong-dau-lung-sau-sinh-vi",
        destination: "/vi/blog/why-postpartum-back-pain-is-common",
        permanent: true
      }
    ];
  },
  async headers() {
    const discoveryLinks = [
      '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
      '</openapi.json>; rel="service-desc"; type="application/openapi+json"',
      '</api-docs>; rel="service-doc"; type="text/markdown"',
      '</llms.txt>; rel="alternate"; type="text/plain"',
      '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
      '</sitemap.xml>; rel="sitemap"; type="application/xml"'
    ].join(", ");

    return [
      {
        source: "/",
        headers: [{ key: "Link", value: discoveryLinks }]
      },
      {
        source: "/vi",
        headers: [{ key: "Link", value: discoveryLinks }]
      },
      {
        source: "/blog",
        headers: [{ key: "Link", value: discoveryLinks }]
      },
      {
        source: "/vi/blog",
        headers: [{ key: "Link", value: discoveryLinks }]
      }
    ];
  }
};

export default nextConfig;
