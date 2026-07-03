const FAVORITES_KEY = "bau-an-gi:favorites";

export function getFavoriteMealSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isFavoriteMeal(slug: string) {
  return getFavoriteMealSlugs().includes(slug);
}

export function toggleFavoriteMeal(slug: string) {
  if (typeof window === "undefined") return getFavoriteMealSlugs();
  const current = getFavoriteMealSlugs();
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current];
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next.slice(0, 100)));
  return next;
}

export function mealNameToSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
