import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";
import { draftsFromBlogPost, type MarketingPlatform, type SocialDraft } from "@/lib/marketing/drafts";
import { publishDraft, type PublishResult } from "@/lib/marketing/publishers";
import { appendMarketingActivity, type MarketingActivityEvent } from "@/lib/marketing/activity";
import { markDraftsCleared } from "@/lib/marketing/queue";
import type { Locale } from "@/lib/i18n";

export async function publishMarketingDrafts(input: {
  locale: Locale;
  live: boolean;
  platforms: Set<MarketingPlatform>;
  source: MarketingActivityEvent["source"];
  slug?: string;
  customDrafts?: SocialDraft[];
}): Promise<{
  ok: boolean;
  live: boolean;
  slug?: string;
  locale: Locale;
  results: PublishResult[];
  drafts: SocialDraft[];
}> {
  const locale = input.locale === "vi" ? "vi" : "en";
  const live = Boolean(input.live);

  let drafts: SocialDraft[];
  let slug: string | undefined;

  if (input.customDrafts?.length) {
    drafts = input.customDrafts.filter((draft) => input.platforms.has(draft.platform));
    slug = drafts[0]?.sourceSlug;
  } else {
    const post = input.slug ? getPostBySlug(input.slug, locale) : getAllPosts(locale)[0];
    if (!post) {
      return { ok: false, live, locale, results: [], drafts: [] };
    }
    slug = post.slug;
    drafts = draftsFromBlogPost(post, [locale]).filter((draft) => input.platforms.has(draft.platform));
  }

  const results: PublishResult[] = [];
  for (const draft of drafts) {
    results.push(await publishDraft(draft, { dryRun: !live }));
  }

  // Remove successfully live-published drafts from the portal queue.
  if (live) {
    const doneIds = drafts
      .filter((_, index) => results[index]?.ok && !results[index]?.dryRun)
      .map((draft) => draft.id);
    if (doneIds.length) await markDraftsCleared(doneIds);
  }

  await appendMarketingActivity({
    action: "publish",
    source: input.source,
    live,
    slug,
    locale,
    platforms: [...input.platforms],
    results
  });

  return {
    ok: results.length > 0 && results.every((result) => result.ok),
    live,
    slug,
    locale,
    results,
    drafts
  };
}
