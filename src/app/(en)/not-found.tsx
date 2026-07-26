import type { Metadata } from "next";
import { NotFoundContent } from "@/components/shared/NotFoundContent";
import { createNotFoundMetadata } from "@/lib/i18n";

export const metadata: Metadata = createNotFoundMetadata("en");

export default function EnglishNotFound() {
  return <NotFoundContent locale="en" />;
}
