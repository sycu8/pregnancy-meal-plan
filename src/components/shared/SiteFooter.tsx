import type { Locale } from "@/lib/i18n";
import { ORANGE_CLOUD_HUB, siblingProjects } from "@/lib/orangeCloud";

const copy = {
  vi: {
    aria: "Dự án cùng Orange Cloud",
    lead: "Pregnancy Meal Planner là dự án cá nhân của Cường Lê Sỹ trên Orange Cloud.",
    hub: "Orange Cloud",
    hubNote: "Trang hub các dự án",
    siblings: "Dự án cùng tác giả"
  },
  en: {
    aria: "Orange Cloud projects",
    lead: "Pregnancy Meal Planner is a personal project by Cường Lê Sỹ on Orange Cloud.",
    hub: "Orange Cloud",
    hubNote: "Project hub",
    siblings: "Sibling projects"
  }
} as const;

export function SiteFooter({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{text.lead}</p>
        <nav className="mt-4" aria-label={text.aria}>
          <p className="text-sm font-medium text-foreground">{text.siblings}</p>
          <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li>
              <a className="inline-flex min-h-11 items-center gap-2 text-sm text-accent hover:underline" href={ORANGE_CLOUD_HUB}>
                <span className="font-medium">{text.hub}</span>
                <span className="text-muted-foreground">{text.hubNote}</span>
              </a>
            </li>
            {siblingProjects.map((project) => (
              <li key={project.href}>
                <a className="inline-flex min-h-11 items-center gap-2 text-sm text-accent hover:underline" href={project.href}>
                  <span className="font-medium">{project.label[locale]}</span>
                  <span className="text-muted-foreground">{project.note[locale]}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
