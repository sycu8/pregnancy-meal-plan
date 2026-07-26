import type { Metadata } from "next";
import { BlogTopicsIndex } from "@/components/blog/BlogTopics";
import { createRouteMetadata } from "@/lib/i18n";

export const metadata: Metadata = createRouteMetadata("en", "/blog/topics", {
  title: "Blog topics | Pregnancy Meal Planner",
  description:
    "Browse pregnancy nutrition topic hubs: meal plans, nausea, gestational diabetes, birth prep, postpartum recovery, and baby feeding from 0–24 months.",
  keywords: ["pregnancy blog topics", "prenatal nutrition topics", "postpartum blog", "baby feeding topics"]
});

export default function EnBlogTopicsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <BlogTopicsIndex locale="en" />
    </main>
  );
}
