import Link from "next/link";
import type { BlogLocale } from "@/types/blog";
import { blogCategoriesByLocale } from "@/lib/blog/categories";
import { blogBasePath } from "@/lib/blog/ui";

const topicClusters = [
  { slug: "tam-ca-nguyet-1", vi: "Tam cá nguyệt 1", en: "First trimester", tag: "tam-ca-nguyet-1" },
  { slug: "tieu-duong-thai-ky", vi: "Tiểu đường thai kỳ", en: "Gestational diabetes", tag: "tieu-duong" },
  { slug: "nghen", vi: "Nghén & ăn uống", en: "Nausea & eating", tag: "nghen" },
  { slug: "an-dam", vi: "Ăn dặm 6–12 tháng", en: "Baby-led weaning", tag: "an-dam" }
] as const;

export function BlogTopicsIndex({ locale = "vi" }: { locale?: BlogLocale }) {
  const base = blogBasePath(locale);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">{locale === "en" ? "Topic hubs" : "Chủ đề nổi bật"}</h1>
      <p className="mt-2 text-muted-foreground">
        {locale === "en"
          ? "Browse curated clusters linking articles and the meal planner."
          : "Các cụm chủ đề liên kết bài viết và công cụ thực đơn."}
      </p>
      <ul className="mt-8 space-y-3">
        {topicClusters.map((topic) => (
          <li key={topic.slug}>
            <Link href={`${base}/topics/${topic.slug}`} className="text-lg font-medium text-accent underline underline-offset-2">
              {locale === "en" ? topic.en : topic.vi}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <h2 className="text-xl font-semibold">{locale === "en" ? "Categories" : "Danh mục"}</h2>
        <ul className="mt-4 space-y-2">
          {blogCategoriesByLocale[locale].map((category) => (
            <li key={category.slug}>
              <Link href={`${base}/${category.slug}`} className="text-accent underline underline-offset-2">
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function getTopicCluster(slug: string) {
  return topicClusters.find((topic) => topic.slug === slug);
}

export { topicClusters };
