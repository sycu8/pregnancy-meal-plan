import type { Metadata } from "next";
import { BlogTopicsIndex } from "@/components/blog/BlogTopics";

export const metadata: Metadata = {
  title: "Chủ đề blog | Bầu Ăn Gì?",
  description: "Các cụm chủ đề dinh dưỡng thai kỳ, nghén, tiểu đường thai kỳ và ăn dặm."
};

export default function BlogTopicsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <BlogTopicsIndex locale="vi" />
    </main>
  );
}
