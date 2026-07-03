"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { dismissReviewPrompt } from "@/lib/storage/offlineCache";
import type { Locale } from "@/lib/i18n";

export function ReviewPrompt({ locale = "vi" }: { locale?: Locale }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const copy =
    locale === "en"
      ? {
          title: "Enjoying Bầu Ăn Gì?",
          body: "If the meal plans help, consider leaving a review when the app is on the store.",
          ok: "Got it",
          dismiss: "Not now"
        }
      : {
          title: "Bạn thấy Bầu Ăn Gì? hữu ích?",
          body: "Nếu thực đơn giúp ích, hãy đánh giá ứng dụng khi có trên store nhé.",
          ok: "Đã hiểu",
          dismiss: "Để sau"
        };

  return (
    <section className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm">
      <p className="font-medium">{copy.title}</p>
      <p className="mt-1 text-muted-foreground">{copy.body}</p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            dismissReviewPrompt();
            setVisible(false);
          }}
        >
          {copy.ok}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            dismissReviewPrompt();
            setVisible(false);
          }}
        >
          {copy.dismiss}
        </Button>
      </div>
    </section>
  );
}
