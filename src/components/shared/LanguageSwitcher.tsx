"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { localizedPath, siteCopy, stripLocaleFromPath, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale: Locale = pathname.startsWith("/en") ? "en" : "vi";
  const nextLocale: Locale = currentLocale === "vi" ? "en" : "vi";
  const routePath = stripLocaleFromPath(pathname);

  return (
    <Link
      href={localizedPath(nextLocale, routePath)}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
      aria-label={currentLocale === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {siteCopy[currentLocale].languageLabel}
    </Link>
  );
}
