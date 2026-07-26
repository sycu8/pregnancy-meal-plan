import { getAllPosts } from "@/lib/blog/posts";
import { draftsFromBlogPost } from "@/lib/marketing/drafts";
import { readMarketingActivity } from "@/lib/marketing/activity";
import { socialProfiles } from "@/lib/social/profiles";
import { siteOrigin } from "@/lib/agentDiscovery";
import type { Locale } from "@/lib/i18n";

export type ConnectionState = "ready" | "blocked" | "missing";

function envPresent(name: string) {
  return Boolean(process.env[name]?.trim());
}

export function platformConnections() {
  const xToken = envPresent("X_ACCESS_TOKEN") || envPresent("TWITTER_ACCESS_TOKEN");
  const xRefresh = envPresent("X_REFRESH_TOKEN");
  const fbToken = envPresent("FACEBOOK_PAGE_ACCESS_TOKEN");
  const fbPage = envPresent("FACEBOOK_PAGE_ID");

  return [
    {
      platform: "x" as const,
      label: "X / Twitter",
      handle: "@PregMealTips",
      href: socialProfiles.find((p) => p.platform === "x")?.href,
      state: (xToken ? "ready" : "missing") as ConnectionState,
      detail: xToken
        ? xRefresh
          ? "User OAuth token present (+ refresh)."
          : "User OAuth token present. Refresh token optional."
        : "Missing X_ACCESS_TOKEN (OAuth 2.0 user token).",
      notes: ["Live posting may still fail with 402 if X API credits are depleted."]
    },
    {
      platform: "facebook" as const,
      label: "Facebook Page",
      handle: "@PregnancyMealPlanner",
      href: socialProfiles.find((p) => p.platform === "facebook")?.href,
      state: (fbToken && fbPage ? "ready" : "missing") as ConnectionState,
      detail:
        fbToken && fbPage
          ? "Page token + page id present."
          : "Missing FACEBOOK_PAGE_ACCESS_TOKEN and/or FACEBOOK_PAGE_ID.",
      notes: ["Requires pages_manage_posts + pages_read_engagement scopes to publish."]
    }
  ];
}

export type MarketingStatus = Awaited<ReturnType<typeof getMarketingStatus>>;

export async function getMarketingStatus(locale: Locale = "en") {
  const posts = getAllPosts(locale).slice(0, 5);
  const queue = posts.flatMap((post) =>
    draftsFromBlogPost(post, [locale]).map((draft) => ({
      id: draft.id,
      platform: draft.platform,
      locale: draft.locale,
      slug: draft.sourceSlug,
      title: post.title,
      excerpt: post.excerpt,
      link: draft.link,
      textPreview: draft.text.slice(0, 160),
      createdAt: draft.createdAt
    }))
  );

  const activity = await readMarketingActivity();
  const connections = platformConnections();

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    site: siteOrigin,
    hub: `${siteOrigin}/social`,
    portal: `${siteOrigin}/marketing`,
    locale,
    auth: {
      marketingKeyConfigured: Boolean(process.env.MARKETING_API_KEY?.trim() || process.env.CRON_SECRET?.trim())
    },
    connections,
    queue: {
      count: queue.length,
      items: queue
    },
    recentPosts: posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      updatedAt: post.updatedAt,
      url: `${siteOrigin}${locale === "vi" ? "/vi" : ""}/blog/${post.slug}`
    })),
    activity,
    automation: {
      endpoints: {
        status: `${siteOrigin}/api/marketing/status`,
        drafts: `${siteOrigin}/api/marketing/drafts`,
        publish: `${siteOrigin}/api/marketing/publish`,
        zapierHook: `${siteOrigin}/api/marketing/hooks/zapier`,
        cron: `${siteOrigin}/api/cron/social-publish`
      },
      auth: "Portal is Cloudflare Access (ZTNA) protected. Automation APIs still use Authorization: Bearer <MARKETING_API_KEY or CRON_SECRET>.",
      zapier: {
        trigger: "GET /api/marketing/drafts?locale=en&limit=3",
        action: "POST /api/marketing/publish with JSON { slug?, platforms, locale, live }"
      },
      n8n: {
        nodes: ["HTTP Request (GET drafts)", "Set/IF", "HTTP Request (POST publish)"]
      }
    }
  };
}
