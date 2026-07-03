import Link from "next/link";
import { CheckCircle2, ClipboardList, Soup, UserRoundX } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { TrustedSources } from "@/components/shared/TrustedSources";
import { PartnerBadges } from "@/components/shared/PartnerBadges";
import { ReferralCapture } from "@/components/home/ReferralCapture";
import { ReferralShare } from "@/components/home/ReferralShare";
import { landingContent, localizedPath, type Locale } from "@/lib/i18n";

const icons = [CheckCircle2, UserRoundX, Soup, ClipboardList] as const;

export function LandingPage({ locale }: { locale: Locale }) {
  const copy = landingContent[locale];

  return (
    <main>
      <ReferralCapture />
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="text-5xl font-bold tracking-normal text-foreground sm:text-6xl">{copy.headline}</h1>
          <p className="mt-5 max-w-xl text-2xl font-medium leading-tight text-accent">{copy.subhead}</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{copy.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={localizedPath(locale, "/planner")}>{copy.primaryCta}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={localizedPath(locale, "/history")}>{copy.secondaryCta}</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {copy.highlights.map((label, index) => {
              const Icon = icons[index];
              return (
                <div key={label} className="flex items-center gap-3 rounded-md border border-border bg-white/80 p-3">
                  <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
          <div className="rounded-md bg-muted p-5">
            <p className="text-sm font-medium text-accent">{copy.cardLabel}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.cardTitle}</h2>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
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
