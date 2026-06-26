import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy | Bầu Ăn Gì?",
  description: "How Bầu Ăn Gì? stores data in your browser and optional cloud sync."
};

export default function EnPrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Privacy policy</h1>
      <p className="mt-4 text-muted-foreground leading-7">
        The free tier stores your profile and meal plans in browser localStorage. We do not sell personal data.
        If you opt into sync, only fields needed for meal planning are stored in Cloudflare D1 linked to your account.
      </p>
      <p className="mt-4 text-muted-foreground leading-7">
        The meal-plan API receives only the information you submit to generate a reference plan. You can clear browser data at any time.
      </p>
    </main>
  );
}
