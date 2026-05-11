import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white/70 p-8 text-center">
      <ClipboardList className="mx-auto mb-3 h-10 w-10 text-accent" aria-hidden="true" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      <Button asChild className="mt-5">
        <Link href="/planner">Tạo thực đơn miễn phí</Link>
      </Button>
    </div>
  );
}
