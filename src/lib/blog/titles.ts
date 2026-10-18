const BRAND = "Pregnancy Meal Planner";
const BRAND_SUFFIX = ` | ${BRAND}`;
/** Stored titles are rendered again with the layout template `%s | Pregnancy Meal Planner`. */
const DOCUMENT_TITLE_MAX = 70;

/**
 * Title passed to the Next.js title template.
 * Drops a brand suffix already baked into the stored meta title (including a
 * mid-word cut such as "| P" or "| Pregnancy M") and stops at a word boundary
 * so the template does not produce "… | P | Pregnancy Meal Planner".
 */
export function titleForDocument(raw: string): string {
  let text = String(raw || "")
    .trim()
    .replace(/\s+/g, " ");
  text = text
    .replace(
      /\s*\|\s*(Pregnancy Meal Planner|Pregnancy M\w*|Blog Bầu Ăn Gì\?|Bầu Ăn Gì\?(?:\s+Blog)?|P)\s*$/i,
      ""
    )
    .replace(/\s*\|\s*$/, "")
    .trim();

  const budget = DOCUMENT_TITLE_MAX - BRAND_SUFFIX.length;
  if (text.length <= budget) return text;

  const cut = text.slice(0, budget);
  const atWord = cut.replace(/\s+\S*$/, "").trim();
  return atWord.length >= 12 ? atWord : cut.trim();
}
