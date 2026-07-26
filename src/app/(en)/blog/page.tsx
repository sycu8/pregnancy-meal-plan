import { BlogIndexContent, blogIndexMetadata } from "@/components/blog/BlogIndexContent";

export const metadata = blogIndexMetadata("en");

type PageProps = {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
};

export default async function EnglishBlogIndexPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <BlogIndexContent locale="en" searchParams={sp} />;
}
