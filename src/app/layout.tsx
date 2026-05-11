import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bầu Ăn Gì?",
  description: "AI meal planner miễn phí cho mẹ bầu Việt Nam"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen font-sans antialiased">
        <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <HeartPulse className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>Bầu Ăn Gì?</span>
            </Link>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/planner" className="hover:text-foreground">
                Tạo thực đơn
              </Link>
              <Link href="/history" className="hover:text-foreground">
                Lịch sử
              </Link>
              <Link href="/profile" className="hover:text-foreground">
                Hồ sơ
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
