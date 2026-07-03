"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import type { Locale } from "@/lib/i18n";
import { saveAuthSession, getAuthUser, clearAuthSession, authHeaders, getAuthToken, type StoredAuthUser } from "@/lib/storage/authSession";
import { getProfile, getMealPlanHistory, clearHistory, saveProfile, saveMealPlan } from "@/lib/storage/localStorage";
import { exportLocalData } from "@/components/shared/SyncOptInBanner";
import { setPremiumTier } from "@/lib/premium/tier";
import type { MealPlan } from "@/types/mealPlan";
import type { PregnancyProfile } from "@/types/pregnancy";

const copy = {
  vi: {
    title: "Tài khoản & đồng bộ",
    email: "Email",
    register: "Đăng ký / đăng nhập",
    sync: "Đồng bộ lên cloud",
    pull: "Tải từ cloud",
    export: "Xuất JSON",
    deleteCloud: "Xóa tài khoản cloud",
    clearLocal: "Xóa dữ liệu trên thiết bị",
    signedIn: "Đã đăng nhập",
    signOut: "Đăng xuất",
    premium: "Nâng cấp Premium"
  },
  en: {
    title: "Account & sync",
    email: "Email",
    register: "Register / sign in",
    sync: "Sync to cloud",
    pull: "Pull from cloud",
    export: "Export JSON",
    deleteCloud: "Delete cloud account",
    clearLocal: "Clear on-device data",
    signedIn: "Signed in",
    signOut: "Sign out",
    premium: "Upgrade to Premium"
  }
} as const;

async function mergeCloudData(profile: PregnancyProfile | null, plans: MealPlan[]) {
  if (profile) saveProfile(profile);
  for (const plan of plans) {
    saveMealPlan(plan);
  }
}

export function AccountPanel({ locale = "vi" }: { locale?: Locale }) {
  const t = copy[locale];
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<StoredAuthUser | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setUser(getAuthUser());
    const token = getAuthToken();
    if (!token) return;

    fetch("/api/auth/me", { headers: authHeaders() })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data?.user) return;
        saveAuthSession(token, data.user);
        setPremiumTier(data.user.premium ? "premium" : "free");
        setUser(data.user);
      })
      .catch(() => undefined);
  }, []);

  async function register() {
    setMessage("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Error");
      return;
    }
    saveAuthSession(data.token, data.user);
    setPremiumTier(data.user.premium ? "premium" : "free");
    setUser(data.user);
    await syncNow();
    await pullFromCloud();
    setMessage(t.signedIn);
  }

  async function syncNow() {
    const profile = getProfile();
    const plans = getMealPlanHistory();
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ profile: profile ?? undefined, plans })
    });
    setMessage(response.ok ? (locale === "vi" ? "Đã đồng bộ." : "Synced.") : locale === "vi" ? "Cần đăng nhập." : "Sign in required.");
  }

  async function pullFromCloud() {
    const response = await fetch("/api/sync", { headers: authHeaders() });
    if (!response.ok) return;
    const data = (await response.json()) as { profile?: PregnancyProfile | null; plans?: MealPlan[] };
    await mergeCloudData(data.profile ?? null, data.plans ?? []);
    setMessage(locale === "vi" ? "Đã tải dữ liệu từ cloud." : "Pulled data from cloud.");
  }

  async function deleteCloud() {
    const response = await fetch("/api/sync", { method: "DELETE", headers: authHeaders() });
    if (response.ok) {
      clearAuthSession();
      setPremiumTier("free");
      setUser(null);
      setMessage(locale === "vi" ? "Đã xóa tài khoản cloud." : "Cloud account deleted.");
    }
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-semibold">{t.title}</h1>
      {user ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {t.signedIn}: {user.email}
          {user.premium ? " · Premium" : ""}
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="min-h-11 flex-1 rounded-md border border-border px-3 text-sm"
          />
          <Button type="button" onClick={register}>
            {t.register}
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={syncNow}>
          {t.sync}
        </Button>
        <Button type="button" variant="secondary" onClick={pullFromCloud}>
          {t.pull}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const blob = new Blob([JSON.stringify(exportLocalData(), null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "bau-an-gi-export.json";
            anchor.click();
            URL.revokeObjectURL(url);
          }}
        >
          {t.export}
        </Button>
        <Button type="button" variant="secondary" asChild>
          <a href={locale === "en" ? "/en/premium" : "/premium"}>{t.premium}</a>
        </Button>
        {user && (
          <>
            <Button type="button" variant="ghost" onClick={deleteCloud}>
              {t.deleteCloud}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                clearAuthSession();
                setPremiumTier("free");
                setUser(null);
              }}
            >
              {t.signOut}
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            clearHistory();
            setMessage(locale === "vi" ? "Đã xóa lịch sử local." : "Local history cleared.");
          }}
        >
          {t.clearLocal}
        </Button>
      </div>
      {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
    </section>
  );
}
