import { ExternalLink } from "lucide-react";
import { referenceSources } from "@/lib/nutrition/nutrientGuidance";

export function TrustedSources() {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-accent">Nguồn tham khảo chính thống</p>
      <h2 className="mt-2 text-xl font-semibold">Dựa trên hướng dẫn dinh dưỡng và an toàn thực phẩm thai kỳ</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {referenceSources.map((source) => (
          <a
            key={source.name}
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border p-4 transition hover:border-accent hover:bg-muted"
          >
            <span className="flex items-center gap-2 font-semibold">
              {source.name}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">{source.description}</span>
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Các nguồn này dùng để định hướng an toàn và nhóm chất. Ứng dụng vẫn chỉ tạo gợi ý tham khảo, không thay thế tư vấn cá nhân từ bác sĩ.
      </p>
    </section>
  );
}
