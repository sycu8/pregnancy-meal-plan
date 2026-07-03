"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { localizedPath, siteCopy, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { cn } from "@/lib/utils";

const menuCopy = {
  vi: { open: "Mở menu", close: "Đóng menu", label: "Menu điều hướng" },
  en: { open: "Open menu", close: "Close menu", label: "Main navigation" }
} as const;

type NavKey = keyof (typeof siteCopy)["vi"]["nav"];

const navItems: { key: NavKey; path: string }[] = [
  { key: "planner", path: "/planner" },
  { key: "history", path: "/history" },
  { key: "profile", path: "/profile" },
  { key: "account", path: "/account" },
  { key: "premium", path: "/premium" },
  { key: "support", path: "/support" },
  { key: "blog", path: "/blog" }
];

function MobileNavPanel({
  locale,
  open,
  onClose
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const t = siteCopy[locale];
  const m = menuCopy[locale];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
        onClick={onClose}
      />

      <div
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={m.label}
        className={cn(
          "fixed inset-y-0 right-0 z-[101] flex h-dvh w-[min(100vw,20rem)] flex-col border-l border-border bg-background shadow-xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <span className="font-semibold text-foreground">{t.brand}</span>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-muted"
            aria-label={m.close}
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={localizedPath(locale, item.path)}
              className="rounded-md px-3 py-3 text-base font-medium text-foreground transition hover:bg-muted"
              onClick={onClose}
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border p-4">
          <LanguageSwitcher />
        </div>
      </div>
    </>
  );
}

export function MobileNav({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const m = menuCopy[locale];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-white text-foreground transition hover:bg-muted"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? m.close : m.open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mounted && createPortal(<MobileNavPanel locale={locale} open={open} onClose={close} />, document.body)}
    </div>
  );
}
