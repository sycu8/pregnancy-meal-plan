import type { Metadata } from "next";
import { BlogTopicsIndex } from "@/components/blog/BlogTopics";
import { createRouteMetadata } from "@/lib/i18n";

export const metadata: Metadata = createRouteMetadata("vi", "/blog/topics", {
  title: "Chủ đề blog | Pregnancy Meal Planner",
  description:
    "Duyệt các cụm chủ đề dinh dưỡng thai kỳ: thực đơn mẹ bầu, nghén, tiểu đường thai kỳ, chuẩn bị sinh, sau sinh và chăm con 0–24 tháng.",
  keywords: ["chủ đề blog mẹ bầu", "dinh dưỡng thai kỳ", "thực đơn bà bầu", "ăn dặm"]
});

export default function BlogTopicsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <BlogTopicsIndex locale="vi" />
    </main>
  );
}
