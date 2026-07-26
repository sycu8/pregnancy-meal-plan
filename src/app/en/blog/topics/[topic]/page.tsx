import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogPlannerCta } from "@/components/blog/BlogPlannerCta";
import { BlogCard } from "@/components/blog/BlogCard";
import { getTopicCluster } from "@/components/blog/BlogTopics";
import { getAllPosts } from "@/lib/blog/posts";
import { blogBasePath } from "@/lib/blog/ui";

export function generateStaticParams() {
  return [
    { topic: "tam-ca-nguyet-1" },
    { topic: "tieu-duong-thai-ky" },
    { topic: "nghen" },
    { topic: "an-dam" }
  ];
}

export default async function EnTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const cluster = getTopicCluster(topic);
  if (!cluster) notFound();

  const posts = getAllPosts("en").filter(
    (post) => post.tags.some((tag) => tag.includes(cluster.tag)) || post.title.toLowerCase().includes(cluster.tag)
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link href={`${blogBasePath("en")}/topics`} className="text-sm text-accent underline underline-offset-2">
        ← Topics
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{cluster.en}</h1>
      <BlogPlannerCta category="thuc-don-ba-bau" tags={[cluster.tag]} locale="en" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {posts.slice(0, 12).map((post) => (
          <BlogCard key={post.slug} post={post} locale="en" />
        ))}
      </div>
    </main>
  );
}
