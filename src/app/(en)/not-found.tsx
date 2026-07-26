import type { Metadata } from "next";
import { NotFoundContent } from "@/components/shared/NotFoundContent";
import { BRAND_NAME } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `Page not found | ${BRAND_NAME}`,
  description: "This page does not exist. Head home or open the pregnancy meal planner."
};

export default function EnglishNotFound() {
  return <NotFoundContent locale="en" />;
}
