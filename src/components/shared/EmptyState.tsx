import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "./Button";
import { localizedPath, type Locale } from "@/lib/i18n";

export function EmptyState({ title, description, locale = "vi" }: { title: string; description: string; locale?: Locale }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white/70 p-8 text-center">
      <ClipboardList className="mx-auto mb-3 h-10 w-10 text-accent" aria-hidden="true" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      <Button asChild className="mt-5">
        <Link href={localizedPath(locale, "/planner")}>{locale === "vi" ? "Tạo thực đơn miễn phí" : "Create a free plan"}</Link>
      </Button>
    </div>
  );
}
