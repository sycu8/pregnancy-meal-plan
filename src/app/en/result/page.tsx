import type { Metadata } from "next";
import { MealPlanResult } from "@/components/result/MealPlanResult";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata("en", "result");

type PageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function EnglishResultPage({ searchParams }: PageProps) {
  const { plan } = await searchParams;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <MealPlanResult locale="en" planId={plan} />
    </main>
  );
}
