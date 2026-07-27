/**
 * Pure English-overlay quality checks (no manifest imports).
 * Safe for CLI scripts that must run even if generated manifests are temporarily invalid.
 */
import type { BlogPostTranslation } from "@/types/blog";

const VI_DIACRITICS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const ENGLISH_TITLE_HINT =
  /\b(the|and|for|during|pregnancy|postpartum|nutrition|meal|foods|how|what|when|with|from|your|baby|breastfeeding|trimester)\b/i;

export function looksVietnamese(text: string) {
  return VI_DIACRITICS.test(text);
}

/** Titles that are primarily Vietnamese (not English with a loanword like "phở"). */
export function looksVietnameseTitle(title: string) {
  if (!VI_DIACRITICS.test(title)) return false;
  if (ENGLISH_TITLE_HINT.test(title)) return false;
  const diacritics = title.match(VI_DIACRITICS)?.length ?? 0;
  return diacritics >= 2;
}

/** True when the EN overlay is real English content (not a VI leak / stub). */
export function isUsableEnglishTranslation(translation: BlogPostTranslation) {
  const title = translation.title?.trim() ?? "";
  const content = translation.content?.trim() ?? "";
  if (!title || content.length < 200) return false;
  if (looksVietnameseTitle(title)) return false;
  if (content.includes("synthesized educational overview") && content.length < 900) return false;
  return true;
}
