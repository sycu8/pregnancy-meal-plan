import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { footerCredit, localizedPath, siteCopy, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { MobileNav } from "@/components/shared/MobileNav";
import { WebMcpRegistration } from "@/components/shared/WebMcpRegistration";
import { CloudflareAnalytics } from "@/components/shared/CloudflareAnalytics";

export function SiteChrome({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const copy = siteCopy[locale];

  return (
    <body className="min-h-screen font-sans antialiased">
      <CloudflareAnalytics />
      <WebMcpRegistration />
      <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={localizedPath(locale, "/")} className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="truncate">{copy.brand}</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground sm:gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              <Link href={localizedPath(locale, "/planner")} className="hover:text-foreground">
                {copy.nav.planner}
              </Link>
              <Link href={localizedPath(locale, "/history")} className="hover:text-foreground">
                {copy.nav.history}
              </Link>
              <Link href={localizedPath(locale, "/profile")} className="hover:text-foreground">
                {copy.nav.profile}
              </Link>
              <Link href={localizedPath(locale, "/account")} className="hover:text-foreground">
                {copy.nav.account}
              </Link>
              <Link href={localizedPath(locale, "/premium")} className="hover:text-foreground">
                {copy.nav.premium}
              </Link>
              <Link href={localizedPath(locale, "/support")} className="hover:text-foreground">
                {copy.nav.support}
              </Link>
              <Link href={localizedPath(locale, "/blog")} className="hover:text-foreground">
                {copy.nav.blog}
              </Link>
              <LanguageSwitcher />
            </div>
            <MobileNav locale={locale} />
          </div>
        </div>
      </nav>
      {children}
      <footer className="border-t border-border bg-background/80">
        <div className="mx-auto flex max-w-6xl justify-center px-4 py-6 text-sm text-muted-foreground">
          <a
            href={footerCredit.href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground transition hover:text-accent"
          >
            {footerCredit.label}
          </a>
        </div>
      </footer>
    </body>
  );
}
