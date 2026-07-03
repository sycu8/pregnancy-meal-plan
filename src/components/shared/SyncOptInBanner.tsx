"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { Locale } from "@/lib/i18n";
import { getProfile, getMealPlanHistory, saveProfile } from "@/lib/storage/localStorage";
import { saveAuthSession, authHeaders } from "@/lib/storage/authSession";
import { setPremiumTier } from "@/lib/premium/tier";

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
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const copy =
    locale === "en"
      ? {
          title: "Sync across devices (optional)",
          body: "Register with email to back up your profile and meal plans to the cloud.",
          enable: "Enable cloud sync",
          dismiss: "Not now",
          emailPlaceholder: "email@example.com",
          success: "Sync enabled. Your data was uploaded.",
          error: "Could not enable sync. Try again from Account."
        }
      : {
          title: "Đồng bộ đa thiết bị (tùy chọn)",
          body: "Đăng ký email để sao lưu hồ sơ và thực đơn lên cloud.",
          enable: "Bật đồng bộ cloud",
          dismiss: "Để sau",
          emailPlaceholder: "email@example.com",
          success: "Đã bật đồng bộ và tải dữ liệu lên cloud.",
          error: "Không thể bật đồng bộ. Hãy thử lại tại trang Tài khoản."
        };

  async function enableSync() {
    setLoading(true);
    setMessage("");
    localStorage.setItem(SYNC_KEY, "true");

    const profile = getProfile();
    if (profile) saveProfile(profile);

    if (!email.trim()) {
      setMessage(locale === "en" ? "Enter email to sync." : "Nhập email để đồng bộ.");
      setLoading(false);
      return;
    }

    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), locale })
      });
      const registerData = await registerResponse.json();
      if (!registerResponse.ok) {
        setMessage(registerData.error ?? copy.error);
        setLoading(false);
        return;
      }

      saveAuthSession(registerData.token, registerData.user);
      setPremiumTier(registerData.user.premium ? "premium" : "free");

      const syncResponse = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ profile: profile ?? undefined, plans: getMealPlanHistory() })
      });

      setMessage(syncResponse.ok ? copy.success : copy.error);
    } catch {
      setMessage(copy.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-4 rounded-lg border border-border bg-muted/50 p-4 text-sm">
      <p className="font-medium text-foreground">{copy.title}</p>
      <p className="mt-1 text-muted-foreground">{copy.body}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.emailPlaceholder}
          className="min-h-10 flex-1 rounded-md border border-border bg-white px-3 text-sm"
        />
        <Button size="sm" variant="secondary" disabled={loading} onClick={enableSync}>
          {copy.enable}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setVisible(false)}>
          {copy.dismiss}
        </Button>
      </div>
      {message && <p className="mt-2 text-xs text-accent">{message}</p>}
    </section>
  );
}
