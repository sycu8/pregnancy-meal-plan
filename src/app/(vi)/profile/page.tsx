import type { Metadata } from "next";
import { PlannerForm } from "@/components/planner/PlannerForm";
import { createPageMetadata } from "@/lib/i18n";

export const metadata: Metadata = createPageMetadata("vi", "profile");

export default function ProfilePage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-3xl font-semibold">Hồ sơ thai kỳ</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Thông tin chỉ lưu trên trình duyệt để lần sau tự điền lại khi tạo thực đơn.</p>
      </div>
      <PlannerForm locale="vi" mode="profile" />
    </main>
  );
}
