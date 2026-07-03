import type { Metadata } from "next";
import { AccountPanel } from "@/components/account/AccountPanel";

export const metadata: Metadata = {
  title: "Tài khoản | Bầu Ăn Gì?",
  description: "Đăng ký email, đồng bộ thực đơn và quản lý dữ liệu."
};

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <AccountPanel locale="vi" />
    </main>
  );
}
