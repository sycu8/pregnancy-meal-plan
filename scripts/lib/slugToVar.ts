/**
 * Shared helpers for blog manifest codegen (VI + EN).
 */

/** Convert a post slug into a valid JS/TS import binding. */
export function slugToVar(slug: string): string {
  let name = slug
    .split("-")
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("")
    .replace(/[^a-zA-Z0-9_$]/g, "");

  if (!name) name = "post";
  // Identifiers cannot start with a digit (e.g. slug `7-day-meal-plan` → `7DayMealPlan`).
  if (/^[0-9]/.test(name)) name = `post${name}`;
  if (!/^[A-Za-z_$]/.test(name)) name = `post${name}`;
  return name;
}

/** Ensure each slug maps to a unique binding (append numeric suffix on collision). */
export function uniqueSlugVars(slugs: string[]): { slug: string; varName: string }[] {
  const used = new Map<string, number>();
  return slugs.map((slug) => {
    const base = slugToVar(slug);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    const varName = count === 0 ? base : `${base}${count + 1}`;
    return { slug, varName };
  });
}
