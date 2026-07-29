import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { localizedPath, siteCopy, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { MobileNav } from "@/components/shared/MobileNav";
import { WebMcpRegistration } from "@/components/shared/WebMcpRegistration";
import { CloudflareAnalytics } from "@/components/shared/CloudflareAnalytics";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";

export function SiteChrome({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const copy = siteCopy[locale];

  return (
    <body className="min-h-screen font-sans antialiased">
      <GoogleAnalytics />
      <CloudflareAnalytics />
      <WebMcpRegistration />
      <nav className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={localizedPath(locale, "/")} className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="truncate text-base tracking-tight sm:text-lg">{copy.brand}</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground sm:gap-3">
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href={localizedPath(locale, "/planner")}
                className="inline-flex min-h-11 items-center px-2.5 hover:text-foreground"
              >
                {copy.nav.planner}
              </Link>
              <Link
                href={localizedPath(locale, "/history")}
                className="inline-flex min-h-11 items-center px-2.5 hover:text-foreground"
              >
                {copy.nav.history}
              </Link>
              <Link
                href={localizedPath(locale, "/profile")}
                className="inline-flex min-h-11 items-center px-2.5 hover:text-foreground"
              >
                {copy.nav.profile}
              </Link>
              <Link
                href={localizedPath(locale, "/account")}
                className="inline-flex min-h-11 items-center px-2.5 hover:text-foreground"
              >
                {copy.nav.account}
              </Link>
              <Link
                href={localizedPath(locale, "/premium")}
                className="inline-flex min-h-11 items-center px-2.5 hover:text-foreground"
              >
                {copy.nav.premium}
              </Link>
              <Link
                href={localizedPath(locale, "/support")}
                className="inline-flex min-h-11 items-center px-2.5 hover:text-foreground"
              >
                {copy.nav.support}
              </Link>
              <Link
                href={localizedPath(locale, "/blog")}
                className="inline-flex min-h-11 items-center px-2.5 hover:text-foreground"
              >
                {copy.nav.blog}
              </Link>
              <Link
                href={localizedPath(locale, "/social")}
                className="inline-flex min-h-11 items-center px-2.5 hover:text-foreground"
              >
                {copy.nav.social}
              </Link>
              <LanguageSwitcher locale={locale} />
            </div>
            <MobileNav locale={locale} />
          </div>
        </div>
      </nav>
      {children}
    </body>
  );
}
