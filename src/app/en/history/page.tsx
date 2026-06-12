import type { Metadata } from "next";
import { HistoryList } from "@/components/history/HistoryList";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata("en", "history");

export default function EnglishHistoryPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Meal plan history</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          No account needed. History stays only in your browser.
        </p>
      </div>
      <HistoryList locale="en" />
    </main>
  );
}
