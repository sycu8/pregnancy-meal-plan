import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { TrustedSources } from "@/components/shared/TrustedSources";
import { PartnerBadges } from "@/components/shared/PartnerBadges";
import { ReferralCapture } from "@/components/home/ReferralCapture";
import { ReferralShare } from "@/components/home/ReferralShare";
import { landingContent, localizedPath, type Locale } from "@/lib/i18n";

export function LandingPage({ locale }: { locale: Locale }) {
  const copy = landingContent[locale];

  return (
    <main>
      <ReferralCapture />
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="break-words text-4xl font-bold tracking-normal text-foreground sm:text-5xl md:text-6xl">
            {copy.headline}
          </h1>
          <p className="mt-5 max-w-xl text-xl font-medium leading-snug text-accent sm:text-2xl sm:leading-tight">
            {copy.subhead}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{copy.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={localizedPath(locale, "/planner")}>{copy.primaryCta}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href={localizedPath(locale, "/history")}>{copy.secondaryCta}</Link>
            </Button>
          </div>
          <ul className="mt-8 grid list-none gap-3 p-0 sm:grid-cols-2">
            {copy.highlights.map((label) => (
              <li key={label} className="flex items-start gap-3 rounded-md border border-border bg-white/80 p-3.5">
                <span
                  className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span className="text-base font-medium leading-6">{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
          <div className="rounded-md bg-muted p-5">
            <p className="text-sm font-medium text-accent">{copy.cardLabel}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.cardTitle}</h2>
            <div className="mt-5 space-y-3 text-base leading-7 text-muted-foreground">
              {copy.cardPoints.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
          </div>
          <Disclaimer locale={locale} className="mt-4" />
          <Disclaimer locale={locale} privacy className="mt-4" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-12">
        <ReferralShare locale={locale} />
        <PartnerBadges locale={locale} />
        <TrustedSources locale={locale} />
      </section>
    </main>
  );
}
