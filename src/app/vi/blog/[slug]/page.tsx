import { getAllBlogRouteSlugs } from "@/lib/blog/posts";
import { BlogSlugContent, blogSlugMetadata } from "@/components/blog/BlogSlugContent";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
};

export async function generateStaticParams() {
  return getAllBlogRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return blogSlugMetadata(slug, "vi");
}

export default async function BlogSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  return <BlogSlugContent slug={slug} locale="vi" searchParams={sp} />;
}
