import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { localizedPath, type Locale } from "@/lib/i18n";
import { socialPageCopy, socialProfiles, withUtm } from "@/lib/social/profiles";
import { siteOrigin } from "@/lib/agentDiscovery";

const platformAccent: Record<string, string> = {
  facebook: "bg-[#1877F2]",
  x: "bg-[#111111]",
  tiktok: "bg-[#111111]"
};

export function SocialHubContent({ locale }: { locale: Locale }) {
  const t = socialPageCopy[locale];
  const plannerHref = withUtm(`${siteOrigin}${localizedPath(locale, "/planner")}`, "social", "social_hub");
  const blogHref = withUtm(`${siteOrigin}${localizedPath(locale, "/blog")}`, "social", "social_hub");

  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#f4e9df]/60 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-24 h-72 w-72 rounded-full bg-accent/10 blur-2xl"
      />

      <section className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-xl flex-col justify-center px-4 py-12">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/social/mark-1080.png"
            alt={t.headline}
            width={112}
            height={112}
            className="h-28 w-28 rounded-full border border-border bg-white shadow-soft"
            priority
          />
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{t.headline}</h1>
          <p className="mt-3 text-xl font-medium text-accent sm:text-2xl">{t.subhead}</p>
          <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">{t.intro}</p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={plannerHref}>{t.primaryCta}</a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <a href={blogHref}>{t.secondaryCta}</a>
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-center text-lg font-semibold text-foreground">{t.followHeading}</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">{t.followHint}</p>

          <ul className="mt-6 space-y-3">
            {socialProfiles.map((profile) => (
              <li key={profile.platform}>
                <a
                  href={profile.href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="flex min-h-14 items-center gap-4 rounded-md border border-border bg-white/90 px-4 py-3 transition hover:border-accent/40 hover:bg-white"
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${platformAccent[profile.platform]}`}
                    aria-hidden
                  >
                    {profile.label.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-semibold text-foreground">
                      {profile.label}{" "}
                      <span className="font-normal text-muted-foreground">{profile.handle}</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{profile.description[locale]}</span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-accent">{t.openProfile}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link href={localizedPath(locale, "/")} className="text-accent hover:underline">
            pregnancymeal.tips
          </Link>
        </p>
      </section>
    </main>
  );
}
