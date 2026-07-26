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

/** Refresh OAuth 2.0 user access token when X_REFRESH_TOKEN + X_CLIENT_ID/SECRET are set. */
async function refreshXAccessToken(): Promise<string | null> {
  const refreshToken = env("X_REFRESH_TOKEN");
  const clientId = env("X_CLIENT_ID") || env("TWITTER_CLIENT_ID");
  const clientSecret = env("X_CLIENT_SECRET") || env("TWITTER_CLIENT_SECRET");
  if (!refreshToken || !clientId) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded"
  };
  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  const response = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers,
    body
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

/** X / Twitter API v2 — OAuth 2.0 *user* access token with tweet.write (not app-only bearer). */
export async function publishToX(draft: SocialDraft, options: PublishOptions = {}): Promise<PublishResult> {
  let token = env("X_ACCESS_TOKEN") || env("TWITTER_ACCESS_TOKEN");
  if (options.dryRun || !token) {
    return {
      platform: "x",
      ok: true,
      dryRun: true,
      id: `dry-run-x-${draft.id}`,
      error: token ? undefined : "missing X_ACCESS_TOKEN"
    };
  }

  async function post(accessToken: string) {
    return fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: draft.text.slice(0, 280) })
    });
  }

  let response = await post(token);
  if (response.status === 401) {
    const refreshed = await refreshXAccessToken();
    if (refreshed) {
      token = refreshed;
      response = await post(token);
    }
  }

  if (!response.ok) {
    const error = await response.text();
    return { platform: "x", ok: false, dryRun: false, error };
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

export async function publishDraft(draft: SocialDraft, options: PublishOptions = {}): Promise<PublishResult> {
  if (draft.platform === "x") return publishToX(draft, options);
  return publishToFacebook(draft, options);
}
