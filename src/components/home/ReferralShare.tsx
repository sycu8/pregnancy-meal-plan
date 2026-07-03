"use client";

import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { buildReferralShareUrl, getReferralCode } from "@/lib/referral";
import type { Locale } from "@/lib/i18n";

function defaultReferralCode() {
  if (typeof window === "undefined") return "friend";
  const stored = getReferralCode();
  if (stored) return stored;
  return `u${Math.random().toString(36).slice(2, 8)}`;
}

export function ReferralShare({ locale }: { locale: Locale }) {
  const [code] = useState(defaultReferralCode);
  const shareUrl = useMemo(() => buildReferralShareUrl(locale, code), [code, locale]);
  const [state, setState] = useState<"idle" | "shared" | "copied">("idle");

  const copy =
    locale === "en"
      ? {
          title: "Share with your partner or family",
          body: "Send a link so they can open Bầu Ăn Gì? and plan meals together.",
          cta: "Share link",
          shared: "Shared",
          copied: "Link copied"
        }
      : {
          title: "Gửi thực đơn cho chồng / mẹ",
          body: "Chia sẻ link để người thân mở Bầu Ăn Gì? và cùng xem thực đơn.",
          cta: "Chia sẻ link",
          shared: "Đã chia sẻ",
          copied: "Đã sao chép link"
        };

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: locale === "en" ? "Bầu Ăn Gì?" : "Bầu Ăn Gì?",
          text: copy.body,
          url: shareUrl
        });
        setState("shared");
        return;
      } catch {
        // fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setState("copied");
    } catch {
      setState("idle");
    }
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <h2 className="text-lg font-semibold">{copy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          {state === "shared" ? copy.shared : state === "copied" ? copy.copied : copy.cta}
        </Button>
        <code className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{shareUrl}</code>
      </div>
    </section>
  );
}
