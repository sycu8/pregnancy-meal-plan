"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { localizedPath, type Locale } from "@/lib/i18n";
import { publishLatestFromPortal, refreshMarketingPortal } from "@/lib/marketing/actions";
import type { MarketingStatus } from "@/lib/marketing/status";

const copy = {
  en: {
    title: "Marketing portal",
    subhead: "Protected by Cloudflare Access. See the social pipeline and run dry/live publishes.",
    accessNote: "Page access is enforced by Cloudflare ZTNA — no in-app API key required.",
    refresh: "Refresh",
    connections: "Channel connections",
    queue: "Draft queue",
    activity: "Recent activity",
    automation: "Zapier / n8n",
    dryRun: "Dry-run publish latest",
    liveRun: "Live publish latest",
    publishing: "Working…",
    socialHub: "Open social hub",
    docs: "Automation recipes",
    stateReady: "ready",
    stateMissing: "missing",
    stateBlocked: "blocked",
    noActivity: "No activity yet."
  },
  vi: {
    title: "Portal marketing",
    subhead: "Được bảo vệ bởi Cloudflare Access. Xem pipeline social và chạy dry-run / live.",
    accessNote: "Truy cập trang do Cloudflare ZTNA kiểm soát — không cần API key trong app.",
    refresh: "Làm mới",
    connections: "Kết nối kênh",
    queue: "Hàng đợi draft",
    activity: "Hoạt động gần đây",
    automation: "Zapier / n8n",
    dryRun: "Dry-run bài mới nhất",
    liveRun: "Đăng thật bài mới nhất",
    publishing: "Đang xử lý…",
    socialHub: "Mở social hub",
    docs: "Công thức tự động hóa",
    stateReady: "sẵn sàng",
    stateMissing: "thiếu token",
    stateBlocked: "bị chặn",
    noActivity: "Chưa có activity."
  }
} as const;

function stateLabel(state: string, t: (typeof copy)[Locale]) {
  if (state === "ready") return t.stateReady;
  if (state === "missing") return t.stateMissing;
  return t.stateBlocked;
}

function stateClass(state: string) {
  if (state === "ready") return "bg-accent/15 text-accent";
  return "bg-red-50 text-red-700";
}

export function MarketingPortal({ locale, status }: { locale: Locale; status: MarketingStatus }) {
  const t = copy[locale];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [publishNote, setPublishNote] = useState<string | null>(null);

  function onRefresh() {
    startTransition(async () => {
      await refreshMarketingPortal(locale);
      router.refresh();
    });
  }

  function onPublish(live: boolean) {
    startTransition(async () => {
      setPublishNote(t.publishing);
      const result = await publishLatestFromPortal({ locale, live });
      setPublishNote(result.message);
      router.refresh();
    });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium text-accent">Ops</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t.title}</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">{t.subhead}</p>
        <p className="text-sm text-muted-foreground">{t.accessNote}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href={localizedPath(locale, "/social")}>{t.socialHub}</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://github.com/sycu8/pregnancy-meal-plan/blob/main/brand/social/CONNECT.md" target="_blank" rel="noreferrer">
              {t.docs}
            </a>
          </Button>
          <Button type="button" variant="secondary" onClick={onRefresh} disabled={pending}>
            {t.refresh}
          </Button>
          <Button type="button" variant="secondary" onClick={() => onPublish(false)} disabled={pending}>
            {t.dryRun}
          </Button>
          <Button type="button" onClick={() => onPublish(true)} disabled={pending}>
            {t.liveRun}
          </Button>
        </div>
        {publishNote ? <p className="break-all text-sm text-muted-foreground">{publishNote}</p> : null}
        <p className="text-xs text-muted-foreground">Updated {status.generatedAt}</p>
      </header>

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
            <p className="mt-3 text-sm text-muted-foreground">{t.noActivity}</p>
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
    </main>
  );
}
