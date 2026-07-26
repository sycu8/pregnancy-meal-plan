import type { Metadata } from "next";
import { AccountPanel } from "@/components/account/AccountPanel";
import { createRouteMetadata } from "@/lib/i18n";

export const metadata: Metadata = createRouteMetadata("vi", "/account", {
  title: "Tài khoản | Pregnancy Meal Planner",
  description:
    "Đăng nhập để quản lý tài khoản Pregnancy Meal Planner, đồng bộ thực đơn đã lưu, trạng thái Premium và tùy chọn ngôn ngữ.",
  index: false
});

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <AccountPanel locale="vi" />
    </main>
  );
}
