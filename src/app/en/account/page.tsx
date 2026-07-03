import type { Metadata } from "next";
import { AccountPanel } from "@/components/account/AccountPanel";

export const metadata: Metadata = {
  title: "Account | Bầu Ăn Gì?",
  description: "Register email, sync meal plans and manage your data."
};

export default function EnAccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <AccountPanel locale="en" />
    </main>
  );
}
