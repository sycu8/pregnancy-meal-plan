import type { SourceReference } from "@/types/blog";

/** Minimum words for a publishable blog body (VI and EN). */
export const MIN_BLOG_WORDS = 300;

/** Soft target range used in Workers AI prompts. */
export const TARGET_VI_WORDS = { min: 500, max: 900 } as const;
export const TARGET_EN_WORDS = { min: 700, max: 1200 } as const;

/**
 * Official / medical sources the nutritionist voice must lean on.
 * Prefer linking these over generic editorial URLs.
 */
export const AUTHORITATIVE_PREGNANCY_SOURCES: SourceReference[] = [
  {
    title: "Healthy diet during pregnancy",
    url: "https://www.who.int/tools/elena/interventions/nutrition-pregnancy",
    publisher: "WHO"
  },
  {
    title: "Daily iron and folic acid supplementation in pregnant women",
    url: "https://www.who.int/tools/elena/interventions/daily-iron-pregnancy",
    publisher: "WHO"
  },
  {
    title: "People at Risk: Pregnant Women — Food Safety",
    url: "https://www.cdc.gov/food-safety/people-at-risk/pregnant-women.html",
    publisher: "CDC"
  },
  {
    title: "Advice about Eating Fish",
    url: "https://www.fda.gov/food/consumers/advice-about-eating-fish",
    publisher: "FDA"
  },
  {
    title: "Foods to avoid in pregnancy",
    url: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/",
    publisher: "NHS"
  },
  {
    title: "Have a healthy diet in pregnancy",
    url: "https://www.nhs.uk/pregnancy/keeping-well/have-a-healthy-diet/",
    publisher: "NHS"
  },
  {
    title: "Nutrition During Pregnancy",
    url: "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy",
    publisher: "ACOG"
  },
  {
    title: "Folate — Fact Sheet for Health Professionals",
    url: "https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/",
    publisher: "NIH ODS"
  }
];

export function countWords(text: string): number {
  return text
    .trim()
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function meetsMinWordCount(text: string, min = MIN_BLOG_WORDS): boolean {
  return countWords(text) >= min;
}

/** Pick 3–5 authoritative sources for a published post (prefer unique publishers). */
export function pickAuthoritativeSources(
  topicKey: string,
  accessedAt = new Date().toISOString().slice(0, 10),
  count = 4
): SourceReference[] {
  const pool = AUTHORITATIVE_PREGNANCY_SOURCES;
  if (pool.length === 0) return [];
  let hash = 0;
  for (let i = 0; i < topicKey.length; i++) {
    hash = (hash * 31 + topicKey.charCodeAt(i)) >>> 0;
  }
  const start = hash % pool.length;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  const picked: SourceReference[] = [];
  const seenPublishers = new Set<string>();

  for (const src of rotated) {
    if (picked.length >= count) break;
    if (seenPublishers.has(src.publisher)) continue;
    seenPublishers.add(src.publisher);
    picked.push({ ...src, accessedAt });
  }
  // Fill remaining slots if unique publishers run out.
  for (const src of rotated) {
    if (picked.length >= count) break;
    if (picked.some((p) => p.url === src.url)) continue;
    picked.push({ ...src, accessedAt });
  }
  return picked;
}

export const NUTRITIONIST_VOICE_RULES = `
VOICE & ACCURACY (professional pregnancy nutrition consultant):
- Write as a credentialed maternal nutrition consultant: clear, calm, evidence-informed, never sensational.
- Prefer guidance aligned with WHO, CDC, FDA, NHS, ACOG, NIH ODS. Do not invent studies, dosages, or statistics.
- When citing a fact (food safety, mercury fish, folic acid, iron, listeria risk), name the authority in prose (e.g. "theo CDC…", "NHS recommends…").
- Do NOT diagnose, prescribe drug doses, or replace obstetric care. Include a short clinician-consult reminder.
- Avoid absolute bans unless food-safety guidance clearly supports them; distinguish "avoid", "limit", and "cook thoroughly".
- Practical Vietnamese/international meal context is welcome when accurate (phở, canh, eggs, yogurt, leafy greens, etc.).
- Each article MUST be at least ${MIN_BLOG_WORDS} words in BOTH Vietnamese and English (prefer VI ${TARGET_VI_WORDS.min}-${TARGET_VI_WORDS.max}, EN ${TARGET_EN_WORDS.min}-${TARGET_EN_WORDS.max}).
- Structure with ## headings: overview, nutrient/food analysis, what to combine or skip, practical tips, when to seek care, and a short sources note.
`.trim();
