"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { localizedPath, type Locale } from "@/lib/i18n";

type StatusPayload = {
  generatedAt: string;
  connections: Array<{
    platform: string;
    label: string;
    handle: string;
    href?: string;
    state: string;
    detail: string;
    notes?: string[];
  }>;
  queue: {
    count: number;
    items: Array<{
      id: string;
      platform: string;
      locale: string;
      slug: string;
      title: string;
      textPreview: string;
      link: string;
    }>;
  };
  recentPosts: Array<{ slug: string; title: string; updatedAt: string; url: string }>;
  activity: Array<{
    id: string;
    at: string;
    action: string;
    source: string;
    live: boolean;
    slug?: string;
    results?: Array<{ platform: string; ok: boolean; dryRun: boolean; error?: string; id?: string }>;
    note?: string;
  }>;
  automation: {
    endpoints: Record<string, string>;
    auth: string;
    zapier: { trigger: string; action: string };
    n8n: { nodes: string[] };
  };
};

const copy = {
  en: {
    title: "Marketing portal",
    subhead: "See what the social pipeline is doing — and connect Zapier or n8n.",
    keyLabel: "Marketing API key",
    keyHint: "Use MARKETING_API_KEY or CRON_SECRET (Bearer). Stored only in this browser.",
    unlock: "Unlock portal",
    refresh: "Refresh",
    connections: "Channel connections",
    queue: "Draft queue",
    activity: "Recent activity",
    automation: "Zapier / n8n",
    dryRun: "Dry-run publish latest",
    liveRun: "Live publish latest",
    publishing: "Publishing…",
    locked: "Enter the API key to load live status, drafts, and activity.",
    socialHub: "Open social hub",
    docs: "Automation recipes",
    stateReady: "ready",
    stateMissing: "missing",
    stateDraft: "draft only",
    stateBlocked: "blocked"
  },
  vi: {
    title: "Portal marketing",
    subhead: "Xem pipeline social đang chạy gì — và kết nối Zapier hoặc n8n.",
    keyLabel: "Marketing API key",
    keyHint: "Dùng MARKETING_API_KEY hoặc CRON_SECRET. Chỉ lưu trên trình duyệt này.",
    unlock: "Mở portal",
    refresh: "Làm mới",
    connections: "Kết nối kênh",
    queue: "Hàng đợi draft",
    activity: "Hoạt động gần đây",
    automation: "Zapier / n8n",
    dryRun: "Dry-run bài mới nhất",
    liveRun: "Đăng thật bài mới nhất",
    publishing: "Đang đăng…",
    locked: "Nhập API key để xem trạng thái, draft và activity.",
    socialHub: "Mở social hub",
    docs: "Công thức tự động hóa",
    stateReady: "sẵn sàng",
    stateMissing: "thiếu token",
    stateDraft: "chỉ draft",
    stateBlocked: "bị chặn"
  }
} as const;

const KEY_STORAGE = "pmp:marketing-api-key";

function stateLabel(state: string, t: (typeof copy)[Locale]) {
  if (state === "ready") return t.stateReady;
  if (state === "missing") return t.stateMissing;
  if (state === "draft_only") return t.stateDraft;
  return t.stateBlocked;
}

function stateClass(state: string) {
  if (state === "ready") return "bg-accent/15 text-accent";
  if (state === "draft_only") return "bg-muted text-muted-foreground";
  return "bg-red-50 text-red-700";
}

export function MarketingPortal({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishNote, setPublishNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(KEY_STORAGE);
      if (stored) setApiKey(stored);
    } catch {
      // ignore
    }
  }, []);

  async function loadStatus(key = apiKey) {
    if (!key.trim()) {
      setError(t.locked);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      window.sessionStorage.setItem(KEY_STORAGE, key.trim());
      const response = await fetch(`/api/marketing/status?locale=${locale}`, {
        headers: { Authorization: `Bearer ${key.trim()}` }
      });
      if (!response.ok) {
        setStatus(null);
        setError(response.status === 401 ? "Unauthorized — check API key." : `Error ${response.status}`);
        return;
      }
      setStatus((await response.json()) as StatusPayload);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function publish(live: boolean) {
    if (!apiKey.trim()) return;
    setPublishNote(t.publishing);
    try {
      const response = await fetch("/api/marketing/publish", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          locale,
          platforms: ["x", "facebook"],
          live,
          source: "portal"
        })
      });
      const data = await response.json();
      setPublishNote(
        response.ok
          ? `${live ? "LIVE" : "DRY-RUN"} · ${data.slug} · ${JSON.stringify(data.results)}`
          : `Failed: ${data.error || response.status}`
      );
      await loadStatus();
    } catch {
      setPublishNote("Publish request failed");
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium text-accent">Ops</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t.title}</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">{t.subhead}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href={localizedPath(locale, "/social")}>{t.socialHub}</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://github.com/sycu8/pregnancy-meal-plan/blob/main/brand/social/CONNECT.md" target="_blank" rel="noreferrer">
              {t.docs}
            </a>
          </Button>
        </div>
      </header>

      <section className="mt-8 rounded-md border border-border bg-white p-5">
        <label className="block text-sm font-medium">
          {t.keyLabel}
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
            autoComplete="off"
          />
        </label>
        <p className="mt-2 text-sm text-muted-foreground">{t.keyHint}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={() => loadStatus()} disabled={loading}>
            {loading ? "…" : t.unlock}
          </Button>
          {status ? (
            <>
              <Button type="button" variant="secondary" onClick={() => loadStatus()} disabled={loading}>
                {t.refresh}
              </Button>
              <Button type="button" variant="secondary" onClick={() => publish(false)}>
                {t.dryRun}
              </Button>
              <Button type="button" onClick={() => publish(true)}>
                {t.liveRun}
              </Button>
            </>
          ) : null}
        </div>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        {publishNote ? <p className="mt-3 break-all text-sm text-muted-foreground">{publishNote}</p> : null}
      </section>

      {!status ? (
        <p className="mt-8 text-sm text-muted-foreground">{t.locked}</p>
      ) : (
        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-xl font-semibold">{t.connections}</h2>
            <ul className="mt-4 space-y-3">
              {status.connections.map((connection) => (
                <li key={connection.platform} className="rounded-md border border-border bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {connection.label}{" "}
                        <span className="font-normal text-muted-foreground">{connection.handle}</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{connection.detail}</p>
                    </div>
                    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase ${stateClass(connection.state)}`}>
                      {stateLabel(connection.state, t)}
                    </span>
                  </div>
                  {connection.notes?.length ? (
                    <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                      {connection.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              {t.queue} <span className="text-muted-foreground">({status.queue.count})</span>
            </h2>
            <ul className="mt-4 space-y-3">
              {status.queue.items.slice(0, 9).map((item) => (
                <li key={item.id} className="rounded-md border border-border bg-white px-4 py-3">
                  <p className="text-sm font-semibold">
                    {item.platform.toUpperCase()} · {item.slug}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{item.title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.textPreview}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">{t.activity}</h2>
            {status.activity.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {status.activity.slice(0, 12).map((event) => (
                  <li key={event.id} className="rounded-md border border-border bg-white px-4 py-3 text-sm">
                    <p className="font-medium">
                      {event.at} · {event.source}/{event.action} · {event.live ? "LIVE" : "dry-run"}
                      {event.slug ? ` · ${event.slug}` : ""}
                    </p>
                    {event.note ? <p className="mt-1 text-muted-foreground">{event.note}</p> : null}
                    {event.results?.length ? (
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        {event.results.map((result, index) => (
                          <li key={`${event.id}-${index}`}>
                            {result.platform}: {result.ok ? "ok" : "fail"}
                            {result.dryRun ? " (dry-run)" : ""}
                            {result.error ? ` — ${result.error.slice(0, 120)}` : ""}
                            {result.id ? ` — ${result.id}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-md border border-border bg-muted/40 p-5">
            <h2 className="text-xl font-semibold">{t.automation}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{status.automation.auth}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-semibold">Zapier trigger:</span> {status.automation.zapier.trigger}
              </p>
              <p>
                <span className="font-semibold">Zapier action:</span> {status.automation.zapier.action}
              </p>
              <p>
                <span className="font-semibold">n8n:</span> {status.automation.n8n.nodes.join(" → ")}
              </p>
            </div>
            <ul className="mt-4 space-y-1 break-all text-xs text-muted-foreground">
              {Object.entries(status.automation.endpoints).map(([name, endpoint]) => (
                <li key={name}>
                  <span className="font-semibold text-foreground">{name}:</span> {endpoint}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
