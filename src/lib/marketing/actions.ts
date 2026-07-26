"use server";

import { revalidatePath } from "next/cache";
import { getAllPosts } from "@/lib/blog/posts";
import { draftsFromBlogPost } from "@/lib/marketing/drafts";
import { publishDraft } from "@/lib/marketing/publishers";
import { appendMarketingActivity } from "@/lib/marketing/activity";
import type { Locale } from "@/lib/i18n";
import type { SocialPlatform } from "@/lib/social/profiles";

export type PortalPublishResult = {
  ok: boolean;
  live: boolean;
  slug?: string;
  message: string;
};

/** Portal publish — runs on the server behind Cloudflare Access; no browser API key. */
export async function publishLatestFromPortal(input: {
  locale: Locale;
  live: boolean;
  platforms?: SocialPlatform[];
}): Promise<PortalPublishResult> {
  const locale = input.locale === "vi" ? "vi" : "en";
  const live = Boolean(input.live);
  const platforms = new Set<SocialPlatform>(input.platforms?.length ? input.platforms : ["x", "facebook"]);

  const post = getAllPosts(locale)[0];
  if (!post) {
    return { ok: false, live, message: "No blog posts available to publish." };
  }

  const drafts = draftsFromBlogPost(post, [locale]).filter((draft) => platforms.has(draft.platform));
  const results = [];
  for (const draft of drafts) {
    results.push(await publishDraft(draft, { dryRun: !live }));
  }

  await appendMarketingActivity({
    action: "publish",
    source: "portal",
    live,
    slug: post.slug,
    locale,
    platforms: [...platforms],
    results
  });

  revalidatePath(locale === "vi" ? "/vi/marketing" : "/marketing");

  const summary = results
    .map((result) => {
      const state = result.ok ? "ok" : "fail";
      const mode = result.dryRun ? "dry-run" : "live";
      const detail = result.error ? result.error.slice(0, 100) : result.id || "";
      return `${result.platform}:${state}/${mode}${detail ? ` ${detail}` : ""}`;
    })
    .join(" · ");

  return {
    ok: results.every((result) => result.ok),
    live,
    slug: post.slug,
    message: `${live ? "LIVE" : "DRY-RUN"} · ${post.slug} · ${summary}`
  };
}

export async function refreshMarketingPortal(locale: Locale) {
  revalidatePath(locale === "vi" ? "/vi/marketing" : "/marketing");
  return { ok: true as const };
}
