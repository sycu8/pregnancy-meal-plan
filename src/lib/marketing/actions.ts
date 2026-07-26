"use server";

import { revalidatePath } from "next/cache";
import { getAllPosts } from "@/lib/blog/posts";
import { draftsFromBlogPost, type MarketingPlatform } from "@/lib/marketing/drafts";
import { clearAllQueuedDrafts, listClearedDraftIds } from "@/lib/marketing/queue";
import { publishMarketingDrafts } from "@/lib/marketing/publishFlow";
import { appendMarketingActivity } from "@/lib/marketing/activity";
import type { Locale } from "@/lib/i18n";

export type PortalPublishResult = {
  ok: boolean;
  live: boolean;
  slug?: string;
  message: string;
};

function revalidateMarketing(locale: Locale) {
  revalidatePath(locale === "vi" ? "/vi/marketing" : "/marketing");
}

/** Portal publish — runs on the server behind Cloudflare Access; no browser API key. */
export async function publishLatestFromPortal(input: {
  locale: Locale;
  live: boolean;
  platforms?: MarketingPlatform[];
}): Promise<PortalPublishResult> {
  const locale = input.locale === "vi" ? "vi" : "en";
  const platforms = new Set<MarketingPlatform>(input.platforms?.length ? input.platforms : ["x", "facebook"]);

  const result = await publishMarketingDrafts({
    locale,
    live: Boolean(input.live),
    platforms,
    source: "portal"
  });

  revalidateMarketing(locale);

  if (!result.drafts.length) {
    return { ok: false, live: result.live, message: "No blog posts available to publish." };
  }

  const summary = result.results
    .map((item) => {
      const state = item.ok ? "ok" : "fail";
      const mode = item.dryRun ? "dry-run" : "live";
      const detail = item.error ? item.error.slice(0, 100) : item.id || "";
      return `${item.platform}:${state}/${mode}${detail ? ` ${detail}` : ""}`;
    })
    .join(" · ");

  return {
    ok: result.ok,
    live: result.live,
    slug: result.slug,
    message: `${result.live ? "LIVE" : "DRY-RUN"} · ${result.slug} · ${summary}`
  };
}

/** Clear currently pending draft-queue items for this locale (portal UI). */
export async function clearMarketingDraftQueue(locale: Locale): Promise<{ ok: true; cleared: number }> {
  const resolved = locale === "vi" ? "vi" : "en";
  const already = new Set(await listClearedDraftIds());
  const pendingIds = getAllPosts(resolved)
    .slice(0, 8)
    .flatMap((post) => draftsFromBlogPost(post, [resolved]))
    .map((draft) => draft.id)
    .filter((id) => !already.has(id));

  const cleared = await clearAllQueuedDrafts(pendingIds);
  await appendMarketingActivity({
    action: "drafts",
    source: "portal",
    live: false,
    locale: resolved,
    note: `Cleared ${cleared} draft(s) from queue`
  });
  revalidateMarketing(resolved);
  return { ok: true, cleared };
}

export async function refreshMarketingPortal(locale: Locale) {
  revalidateMarketing(locale);
  return { ok: true as const };
}
