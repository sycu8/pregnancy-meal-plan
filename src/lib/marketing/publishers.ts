import type { SocialDraft } from "@/lib/marketing/drafts";

export type PublishResult = {
  platform: SocialDraft["platform"];
  ok: boolean;
  dryRun: boolean;
  id?: string;
  error?: string;
};

type PublishOptions = {
  dryRun?: boolean;
};

function env(name: string) {
  return process.env[name]?.trim() || "";
}

/** X / Twitter API v2 — needs user OAuth 2.0 access token with tweet.write. */
export async function publishToX(draft: SocialDraft, options: PublishOptions = {}): Promise<PublishResult> {
  const token = env("X_ACCESS_TOKEN") || env("TWITTER_ACCESS_TOKEN");
  if (options.dryRun || !token) {
    return {
      platform: "x",
      ok: true,
      dryRun: true,
      id: `dry-run-x-${draft.id}`,
      error: token ? undefined : "missing X_ACCESS_TOKEN"
    };
  }

  const response = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: draft.text.slice(0, 280) })
  });

  if (!response.ok) {
    return { platform: "x", ok: false, dryRun: false, error: await response.text() };
  }

  const data = (await response.json()) as { data?: { id?: string } };
  return { platform: "x", ok: true, dryRun: false, id: data.data?.id };
}

/** Facebook Page feed — needs PAGE access token + page id. */
export async function publishToFacebook(draft: SocialDraft, options: PublishOptions = {}): Promise<PublishResult> {
  const token = env("FACEBOOK_PAGE_ACCESS_TOKEN");
  const pageId = env("FACEBOOK_PAGE_ID") || "PregnancyMealPlanner";
  if (options.dryRun || !token) {
    return {
      platform: "facebook",
      ok: true,
      dryRun: true,
      id: `dry-run-fb-${draft.id}`,
      error: token ? undefined : "missing FACEBOOK_PAGE_ACCESS_TOKEN"
    };
  }

  const url = new URL(`https://graph.facebook.com/v21.0/${pageId}/feed`);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: draft.text,
      link: draft.link,
      access_token: token
    })
  });

  if (!response.ok) {
    return { platform: "facebook", ok: false, dryRun: false, error: await response.text() };
  }

  const data = (await response.json()) as { id?: string };
  return { platform: "facebook", ok: true, dryRun: false, id: data.id };
}

/**
 * TikTok Content Posting API requires app review + user access token.
 * MVP keeps drafts + dry-run until credentials are connected.
 */
export async function publishToTikTok(draft: SocialDraft, options: PublishOptions = {}): Promise<PublishResult> {
  const token = env("TIKTOK_ACCESS_TOKEN");
  if (options.dryRun || !token) {
    return {
      platform: "tiktok",
      ok: true,
      dryRun: true,
      id: `dry-run-tt-${draft.id}`,
      error: token ? undefined : "missing TIKTOK_ACCESS_TOKEN (draft-only until Content Posting API approved)"
    };
  }

  return {
    platform: "tiktok",
    ok: false,
    dryRun: false,
    error: "TikTok video upload is not enabled in MVP — export draft and post via TikTok app/creator tools."
  };
}

export async function publishDraft(draft: SocialDraft, options: PublishOptions = {}): Promise<PublishResult> {
  if (draft.platform === "x") return publishToX(draft, options);
  if (draft.platform === "facebook") return publishToFacebook(draft, options);
  return publishToTikTok(draft, options);
}
