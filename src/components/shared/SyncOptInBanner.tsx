"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { Locale } from "@/lib/i18n";
import { getProfile, getMealPlanHistory, saveProfile } from "@/lib/storage/localStorage";

const SYNC_KEY = "bau-an-gi-sync-opt-in";

export function isSyncOptedIn() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SYNC_KEY) === "true";
}

export function exportLocalData() {
  return {
    profile: getProfile(),
    history: getMealPlanHistory(),
    exportedAt: new Date().toISOString()
  };
}

export function SyncOptInBanner({ locale = "vi" }: { locale?: Locale }) {
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && !localStorage.getItem(SYNC_KEY));
  const [enabled, setEnabled] = useState(false);

  if (!visible) return null;

  const copy =
    locale === "en"
      ? {
          title: "Sync across devices (optional)",
          body: "Keep using local storage by default. Opt in later when cloud sync is enabled for your account.",
          enable: "Enable sync when available",
          dismiss: "Not now"
        }
      : {
          title: "Đồng bộ đa thiết bị (tùy chọn)",
          body: "Mặc định dữ liệu vẫn lưu trên trình duyệt. Bạn có thể bật đồng bộ sau khi tính năng sẵn sàng.",
          enable: "Bật đồng bộ khi có",
          dismiss: "Để sau"
        };

  return (
    <section className="mb-4 rounded-lg border border-border bg-muted/50 p-4 text-sm">
      <p className="font-medium text-foreground">{copy.title}</p>
      <p className="mt-1 text-muted-foreground">{copy.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            localStorage.setItem(SYNC_KEY, "true");
            setEnabled(true);
            const profile = getProfile();
            if (profile) saveProfile(profile);
          }}
        >
          {copy.enable}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setVisible(false)}>
          {copy.dismiss}
        </Button>
      </div>
      {enabled && <p className="mt-2 text-xs text-accent">{locale === "en" ? "Preference saved locally." : "Đã lưu tùy chọn trên trình duyệt."}</p>}
    </section>
  );
}
