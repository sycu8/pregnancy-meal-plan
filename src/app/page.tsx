import Link from "next/link";
import { CheckCircle2, ClipboardList, Soup, UserRoundX } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { TrustedSources } from "@/components/shared/TrustedSources";

const highlights = [
  ["Miễn phí giai đoạn đầu", CheckCircle2],
  ["Không cần đăng nhập", UserRoundX],
  ["Món Việt dễ nấu", Soup],
  ["Có danh sách đi chợ", ClipboardList]
];

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="text-5xl font-bold tracking-normal text-foreground sm:text-6xl">Bầu Ăn Gì?</h1>
          <p className="mt-5 max-w-xl text-2xl font-medium leading-tight text-accent">Ăn gì tuần này để mẹ khỏe, con đủ chất?</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Tạo thực đơn 7 ngày món Việt theo tuần thai, cân nặng, khẩu vị, ngân sách và tình trạng như nghén, táo bón, thiếu máu hoặc tiểu đường thai kỳ.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/planner">Tạo thực đơn miễn phí</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/history">Xem lịch sử</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map(([label, Icon]) => (
              <div key={label as string} className="flex items-center gap-3 rounded-md border border-border bg-white/80 p-3">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                <span className="text-sm font-medium">{label as string}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
          <div className="rounded-md bg-muted p-5">
            <p className="text-sm font-medium text-accent">Cá nhân hóa nhẹ nhàng</p>
            <h2 className="mt-2 text-2xl font-semibold">Từ thông tin cơ bản đến bữa ăn cụ thể</h2>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p>Tuần thai và cân nặng giúp ước lượng BMI, mức tăng cân tham khảo.</p>
              <p>Khẩu vị và món cần tránh giúp lọc món trước khi tạo thực đơn.</p>
              <p>Danh sách đi chợ được gom nhóm để mua nhanh hơn.</p>
            </div>
          </div>
          <Disclaimer className="mt-4" />
          <Disclaimer privacy className="mt-4" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <TrustedSources />
      </section>
    </main>
  );
}
