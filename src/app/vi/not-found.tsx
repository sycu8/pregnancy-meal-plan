import type { Metadata } from "next";
import { NotFoundContent } from "@/components/shared/NotFoundContent";
import { createNotFoundMetadata } from "@/lib/i18n";

export const metadata: Metadata = createNotFoundMetadata("vi");

export default function VietnameseNotFound() {
  return <NotFoundContent locale="vi" />;
}
