import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { BlogCategorySlug, BlogLocale } from "@/types/blog";
import { localizedPath } from "@/lib/i18n";
import { Button } from "@/components/shared/Button";

const plannerHints: Partial<Record<BlogCategorySlug, { vi: string; en: string; health?: string; goal?: string }>> = {
  "thuc-don-ba-bau": {
    vi: "Tạo thực đơn 7 ngày phù hợp tuần thai của bạn",
    en: "Create a 7-day meal plan for your pregnancy week"
  },
  "dinh-duong-ba-bau": {
    vi: "Nhận gợi ý dinh dưỡng cân bằng cho mẹ bầu",
    en: "Get balanced pregnancy nutrition suggestions",
    goal: "balanced"
  },
  "truoc-sinh": {
    vi: "Lên thực đơn an toàn theo tuần thai",
    en: "Build a safe weekly meal plan by trimester"
  },
  "sau-sinh": {
    vi: "Gợi ý dinh dưỡng hậu sản (tham khảo)",
    en: "Postpartum nutrition ideas (reference only)"
  },
  "cham-con-0-24-thang": {
    vi: "Xem công cụ thực đơn mẹ bầu liên quan",
    en: "Explore related meal planning for new mothers"
  }
};

const tagHints: Record<string, { health?: string; goal?: string; vi: string; en: string }> = {
  nghen: { health: "morning_sickness", goal: "reduce_nausea", vi: "Thực đơn giảm nghén", en: "Meal plan to ease nausea" },
  "tieu-duong": {
    health: "gestational_diabetes",
    goal: "blood_sugar_control",
    vi: "Thực đơn kiểm soát đường huyết",
    en: "Blood sugar friendly meal plan"
  },
  "thieu-mau": { health: "anemia", goal: "increase_iron_calcium_protein", vi: "Thực đơn bổ sung sắt", en: "Iron-rich meal plan" },
  "tao-bon": { health: "constipation", goal: "relieve_constipation", vi: "Thực đơn hỗ trợ tiêu hóa", en: "Digestive-friendly meal plan" }
};

function buildPlannerUrl(locale: BlogLocale, category: BlogCategorySlug, tags: string[]) {
  const base = localizedPath(locale, "/planner");
  const params = new URLSearchParams();
  const categoryHint = plannerHints[category];
  if (categoryHint?.health) params.set("health", categoryHint.health);
  if (categoryHint?.goal) params.set("goal", categoryHint.goal);

  for (const tag of tags) {
    const normalized = tag.toLowerCase().replace(/\s+/g, "-");
    const hint = tagHints[normalized];
    if (hint) {
      if (hint.health) params.set("health", hint.health);
      if (hint.goal) params.set("goal", hint.goal);
      break;
    }
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function ctaCopy(locale: BlogLocale, category: BlogCategorySlug, tags: string[]) {
  for (const tag of tags) {
    const hint = tagHints[tag.toLowerCase().replace(/\s+/g, "-")];
    if (hint) return locale === "en" ? hint.en : hint.vi;
  }
  const categoryHint = plannerHints[category];
  if (categoryHint) return locale === "en" ? categoryHint.en : categoryHint.vi;
  return locale === "en" ? "Create a free 7-day meal plan" : "Tạo thực đơn 7 ngày miễn phí";
}

export function BlogPlannerCta({
  category,
  tags,
  locale = "vi"
}: {
  category: BlogCategorySlug;
  tags: string[];
  locale?: BlogLocale;
}) {
  const href = buildPlannerUrl(locale, category, tags);
  const label = ctaCopy(locale, category, tags);
  const subtitle =
    locale === "en"
      ? "Personalized Vietnamese meals with safety notes — free, no login."
      : "Món Việt cá nhân hóa kèm lưu ý an toàn — miễn phí, không cần đăng nhập.";

  return (
    <section className="mt-10 rounded-xl border border-accent/30 bg-accent/5 p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-accent">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {locale === "en" ? "Meal planner" : "Công cụ thực đơn"}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">{label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button asChild className="shrink-0">
          <Link href={href}>{locale === "en" ? "Start planner" : "Bắt đầu ngay"}</Link>
        </Button>
      </div>
    </section>
  );
}
