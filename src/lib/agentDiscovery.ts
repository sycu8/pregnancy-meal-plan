import { landingContent, localizedPath, pagePaths, type Locale, type PageKey } from "@/lib/i18n";
import { blogCategories } from "@/lib/blog/categories";
import { getAllPosts } from "@/lib/blog/posts";

export const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mebauangi.info";

export const aiCrawlerUserAgents = [
  "GPTBot",
  "OAI-SearchBot",
  "Claude-Web",
  "Google-Extended",
  "Amazonbot",
  "anthropic-ai",
  "Bytespider",
  "CCBot",
  "Applebot-Extended"
] as const;

export const contentSignal = "ai-train=no, search=yes, ai-input=yes";

const publicPages: { page: PageKey; locale: Locale; priority: string; changefreq: string }[] = [
  { page: "home", locale: "vi", priority: "1.0", changefreq: "weekly" },
  { page: "planner", locale: "vi", priority: "0.9", changefreq: "weekly" },
  { page: "history", locale: "vi", priority: "0.4", changefreq: "monthly" },
  { page: "profile", locale: "vi", priority: "0.4", changefreq: "monthly" },
  { page: "result", locale: "vi", priority: "0.5", changefreq: "monthly" },
  { page: "home", locale: "en", priority: "0.8", changefreq: "weekly" },
  { page: "planner", locale: "en", priority: "0.7", changefreq: "weekly" },
  { page: "history", locale: "en", priority: "0.3", changefreq: "monthly" },
  { page: "profile", locale: "en", priority: "0.3", changefreq: "monthly" },
  { page: "result", locale: "en", priority: "0.4", changefreq: "monthly" }
];

export const publicSiteUrls = publicPages.map((entry) => absoluteUrl(localizedPath(entry.locale, pagePaths[entry.page])));

export const apiCatalog = {
  linkset: [
    {
      anchor: absoluteUrl("/api/generate-meal-plan"),
      "service-desc": [{ href: absoluteUrl("/openapi.json"), type: "application/openapi+json" }],
      "service-doc": [{ href: absoluteUrl("/api-docs"), type: "text/markdown" }],
      status: [{ href: absoluteUrl("/api/health"), type: "application/json" }]
    }
  ]
} as const;

export const mcpServerCard = {
  serverInfo: {
    name: "bau-an-gi",
    version: "0.1.0",
    description: "Pregnancy meal-planning discovery surface for Vietnamese and English users."
  },
  transport: {
    type: "streamable-http",
    endpoint: absoluteUrl("/mcp")
  },
  capabilities: {
    tools: [
      {
        name: "create_meal_plan",
        description: "Create a reference 7-day pregnancy meal plan from profile inputs."
      },
      {
        name: "get_nutrient_guidance",
        description: "Return nutrient guidance panels for pregnancy."
      },
      {
        name: "search_blog",
        description: "Search public blog posts by keyword."
      }
    ],
    resources: [
      {
        name: "public_pages",
        description: "Canonical Vietnamese and English public page URLs."
      }
    ],
    prompts: []
  }
} as const;

export function oauthProtectedResourceMetadata(origin = siteOrigin) {
  return {
    resource: withOrigin("/", origin),
    authorization_servers: [withOrigin("/.well-known/oauth-authorization-server", origin)],
    scopes_supported: ["meal-plan:generate"],
    bearer_methods_supported: ["header"],
    resource_documentation: withOrigin("/api-docs", origin)
  };
}

export function oauthAuthorizationServerMetadata(origin = siteOrigin) {
  return {
    issuer: origin,
    authorization_endpoint: withOrigin("/oauth/authorize", origin),
    token_endpoint: withOrigin("/oauth/token", origin),
    jwks_uri: withOrigin("/oauth/jwks.json", origin),
    grant_types_supported: ["client_credentials"],
    response_types_supported: ["token"],
    scopes_supported: ["meal-plan:generate"],
    service_documentation: withOrigin("/api-docs", origin)
  };
}

export function openIdConfiguration(origin = siteOrigin) {
  return {
    issuer: origin,
    authorization_endpoint: withOrigin("/oauth/authorize", origin),
    token_endpoint: withOrigin("/oauth/token", origin),
    jwks_uri: withOrigin("/oauth/jwks.json", origin),
    grant_types_supported: ["client_credentials"],
    response_types_supported: ["token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "meal-plan:generate"],
    service_documentation: withOrigin("/api-docs", origin)
  };
}

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Bầu Ăn Gì? API",
    version: "0.1.0",
    description: "Reference API for creating a 7-day pregnancy meal plan."
  },
  servers: [{ url: siteOrigin }],
  paths: {
    "/api/generate-meal-plan": {
      post: {
        summary: "Generate a pregnancy meal plan",
        operationId: "generateMealPlan",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PregnancyProfile" }
            }
          }
        },
        responses: {
          "200": {
            description: "Generated meal plan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plan: { type: "object" }
                  },
                  required: ["plan"]
                }
              }
            }
          },
          "400": {
            description: "Invalid pregnancy profile"
          }
        }
      }
    },
    "/api/health": {
      get: {
        summary: "Health check",
        operationId: "healthCheck",
        responses: {
          "200": { description: "Service is reachable" }
        }
      }
    }
  },
  components: {
    schemas: {
      PregnancyProfile: {
        type: "object",
        required: [
          "pregnancyWeek",
          "pregnancyType",
          "heightCm",
          "prePregnancyWeightKg",
          "currentWeightKg",
          "activityLevel",
          "healthConditions",
          "cuisinePreferences",
          "budget",
          "cookingTime",
          "goals"
        ],
        properties: {
          pregnancyWeek: { type: "integer", minimum: 1, maximum: 40 },
          pregnancyType: { type: "string", enum: ["singleton", "twins"] },
          heightCm: { type: "number", minimum: 120, maximum: 220 },
          prePregnancyWeightKg: { type: "number", minimum: 30, maximum: 200 },
          currentWeightKg: { type: "number", minimum: 30, maximum: 220 },
          activityLevel: { type: "string", enum: ["low", "light", "medium"] },
          healthConditions: { type: "array", items: { type: "string" } },
          cuisinePreferences: { type: "array", items: { type: "string" } },
          budget: { type: "string", enum: ["low", "medium", "high"] },
          cookingTime: { type: "string", enum: ["under_15", "around_30", "meal_prep"] },
          goals: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
} as const;

export const mealPlannerSkill = `---
name: pregnancy-meal-planner
description: Create a reference pregnancy meal plan with Vietnamese dishes, shopping batches, safety notes, and bilingual page navigation.
---

# Pregnancy Meal Planner

Use this skill when an agent needs to understand or operate the Bầu Ăn Gì? meal-planning website.

## Capabilities

- Read the Vietnamese and English public pages.
- Discover the meal-plan generation API from the API catalog and OpenAPI document.
- Help users prepare a pregnancy profile for a reference 7-day meal plan.

## Safety

Meal plans are educational references only and do not replace advice from an obstetrician or registered dietitian.
`;

export function absoluteUrl(path: string) {
  return new URL(path, siteOrigin).toString();
}

export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  return url.origin;
}

function withOrigin(path: string, origin: string) {
  return new URL(path, origin).toString();
}

export function robotsTxt() {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Allow: /api/health",
    "Allow: /.well-known/",
    "Allow: /openapi.json",
    `Content-Signal: ${contentSignal}`,
    "",
    ...aiCrawlerUserAgents.flatMap((agent) => [
      `User-agent: ${agent}`,
      "Allow: /",
      "Disallow: /api/",
      "Allow: /.well-known/",
      `Content-Signal: ${contentSignal}`,
      ""
    ]),
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`
  ];

  return `${lines.join("\n")}\n`;
}

export function sitemapXml() {
  const updated = new Date().toISOString().slice(0, 10);
  const pageEntries = publicPages
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(absoluteUrl(localizedPath(entry.locale, pagePaths[entry.page])))}</loc>
    <lastmod>${updated}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n");

  const blogIndex = ["vi", "en"]
    .map(
      (locale) => `  <url>
    <loc>${escapeXml(absoluteUrl(localizedPath(locale as "vi" | "en", "/blog")))}</loc>
    <lastmod>${updated}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`
    )
    .join("\n");

  const categoryEntries = blogCategories
    .flatMap((cat) =>
      (["vi", "en"] as const).map(
        (locale) => `  <url>
    <loc>${escapeXml(absoluteUrl(localizedPath(locale, `/blog/${cat.slug}`)))}</loc>
    <lastmod>${updated}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`
      )
    )
    .join("\n");

  let postEntries = "";
  try {
    postEntries = getAllPosts()
      .flatMap((post) =>
        (["vi", "en"] as const).map(
          (locale) => `  <url>
    <loc>${escapeXml(absoluteUrl(localizedPath(locale, `/blog/${post.slug}`)))}</loc>
    <lastmod>${escapeXml(post.updatedAt.slice(0, 10))}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
        )
      )
      .join("\n");
  } catch {
    postEntries = "";
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageEntries}
${blogIndex}
${categoryEntries}
${postEntries}
</urlset>
`;
}

export function markdownForPath(pathname: string) {
  const locale: Locale = pathname.startsWith("/en") ? "en" : "vi";
  const copy = landingContent[locale];
  const planner = absoluteUrl(localizedPath(locale, "/planner"));
  const history = absoluteUrl(localizedPath(locale, "/history"));
  const apiCatalogUrl = absoluteUrl("/.well-known/api-catalog");

  return `# ${copy.headline}

${copy.subhead}

${copy.intro}

## Actions

- [${copy.primaryCta}](${planner})
- [${copy.secondaryCta}](${history})

## Highlights

${copy.highlights.map((item) => `- ${item}`).join("\n")}

## Agent Discovery

- [API catalog](${apiCatalogUrl})
- [Sitemap](${absoluteUrl("/sitemap.xml")})
- [Robots policy](${absoluteUrl("/robots.txt")})

## Medical Safety

This website provides reference meal-planning support only and does not replace medical advice.
`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
