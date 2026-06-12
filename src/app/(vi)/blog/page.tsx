import { BlogIndexContent, blogIndexMetadata } from "@/components/blog/BlogIndexContent";

export const metadata = blogIndexMetadata("vi");

type PageProps = {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
};

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <BlogIndexContent locale="vi" searchParams={sp} />;
}
