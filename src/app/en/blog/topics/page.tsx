import type { Metadata } from "next";
import { BlogTopicsIndex } from "@/components/blog/BlogTopics";

export const metadata: Metadata = {
  title: "Blog topics | Bầu Ăn Gì?",
  description: "Topic hubs for pregnancy nutrition, nausea, gestational diabetes and weaning."
};

export default function EnBlogTopicsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <BlogTopicsIndex locale="en" />
    </main>
  );
}
