/**
 * Review whether a queue/source item belongs on the Pregnancy Meal Planner blog
 * before we spend AI budget or mark it published.
 *
 * Editorial seeds bypass the gate. Everything else must look like consumer guidance
 * about pregnancy nutrition, meal planning, postpartum diet, breastfeeding, or
 * infant/toddler feeding — not doctor profiles, corporate evaluations, etc.
 */

export type RelevanceInput = {
  title: string;
  snippet?: string;
  url: string;
  editorial?: boolean;
};

export type RelevanceResult = { ok: true } | { ok: false; reason: string };

/** Path fragments that are almost never publishable consumer articles. */
const DENIED_PATH_SNIPPETS = [
  "/professionals/",
  "/professional/",
  "/doctors/",
  "/doctor/",
  "/bac-si/",
  "/chuyen-gia/",
  "/experts/",
  "/expert/",
  "/corporate/",
  "/results-at-a-glance",
  "/results_at_a_glance",
  "/evaluation/",
  "/evaluations/"
];

const DENIED_TITLE_PATTERNS = [
  /^evaluation of\b/i,
  /^results at a glance\b/i,
  /\bevaluation of the public health agency\b/i,
  /\bblood safety contribution program\b/i,
  /\benteric illness activities\b/i,
  /\bmonitoring and surveillance\b/i,
  /\bcontribution program\b/i
];

/**
 * Strong topical signals for this blog. Intentionally excludes short false-positive
 * tokens like "thai", "san", "food", "health", "child".
 */
const POSITIVE_TOPICS = [
  // English
  "pregnancy",
  "pregnant",
  "prenatal",
  "antenatal",
  "postpartum",
  "post partum",
  "breastfeeding",
  "breast feed",
  "lactation",
  "gestational",
  "meal plan",
  "meal planning",
  "trimester",
  "weaning",
  "complementary feeding",
  "infant feeding",
  "baby food",
  "solid foods",
  "starting solids",
  "folate",
  "folic acid",
  "gestational diabetes",
  "morning sickness",
  "maternity",
  "maternal nutrition",
  "maternal health",
  "newborn feeding",
  "infant nutrition",
  "prenatal nutrition",
  "pregnancy nutrition",
  "pregnancy diet",
  "foods to avoid in pregnancy",
  "food safety in pregnancy",
  "listeria",
  "mercury in fish",
  // Vietnamese (ASCII-folded matching applied below)
  "mang thai",
  "thai ky",
  "me bau",
  "ba bau",
  "sau sinh",
  "cho con bu",
  "bu me",
  "dinh duong",
  "thuc don",
  "an dam",
  "tam ca nguyet",
  "nghen",
  "tieu duong thai",
  "axit folic",
  "tre so sinh",
  "sua me",
  "dinh duong ba bau",
  "dinh duong me bau",
  "thuc don ba bau",
  "an uong khi mang thai"
];

function fold(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/&#39;|&apos;|'/g, "")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pathnameOf(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function hasPositiveTopic(text: string) {
  const hay = fold(text);
  return POSITIVE_TOPICS.some((topic) => hay.includes(fold(topic)));
}

/** Titles that look like a person's full name rather than an article headline. */
export function looksLikePersonNameTitle(title: string) {
  const cleaned = title
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s*[-–|].*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;
  if (hasPositiveTopic(cleaned)) return false;

  const nameLike = words.filter((word) => /^[\p{L}][\p{L}'’.-]*$/u.test(word));
  if (nameLike.length < words.length) return false;

  // Prefer detecting Western/Vietnamese personal-name casing (e.g. "Nguyen Thai Bao").
  const titled = words.filter((word) => /^\p{Lu}/u.test(word));
  return titled.length >= Math.max(2, words.length - 1);
}

export function reviewBlogSeedRelevance(input: RelevanceInput): RelevanceResult {
  if (input.editorial) return { ok: true };

  const title = (input.title ?? "").trim();
  const snippet = (input.snippet ?? "").trim();
  const url = (input.url ?? "").trim();
  if (!title || !url) {
    return { ok: false, reason: "missing title or url" };
  }

  const pathname = pathnameOf(url);
  const urlHay = fold(`${pathname} ${url}`);

  for (const snippetPath of DENIED_PATH_SNIPPETS) {
    if (fold(pathname).includes(fold(snippetPath)) || urlHay.includes(fold(snippetPath))) {
      return { ok: false, reason: `denied URL path (${snippetPath})` };
    }
  }

  for (const pattern of DENIED_TITLE_PATTERNS) {
    if (pattern.test(title)) {
      return { ok: false, reason: "denied title pattern (evaluation/report)" };
    }
  }

  // Vinmec-style doctor profile slugs: /eng/professionals/nguyen-thai-bao-51534-en
  if (/\/[a-z][a-z0-9]+(?:-[a-z0-9]+)+-\d{4,}-en\/?$/i.test(pathname)) {
    return { ok: false, reason: "looks like a professional profile slug" };
  }

  if (looksLikePersonNameTitle(title) && !hasPositiveTopic(snippet)) {
    return { ok: false, reason: "looks like a person/profile page, not an article" };
  }

  // Require topical signal in human-readable fields — do not trust URL token accidents
  // like personal names containing "thai".
  const readable = `${title} ${snippet}`;
  if (!hasPositiveTopic(readable)) {
    // Allow URL path to contribute only when it contains strong multi-word topics.
    if (!hasPositiveTopic(pathname.replace(/\//g, " "))) {
      return { ok: false, reason: "missing pregnancy nutrition / feeding topic signals" };
    }
  }

  return { ok: true };
}

/** Convenience boolean for filters. */
export function isOnTopicBlogSeed(input: RelevanceInput) {
  return reviewBlogSeedRelevance(input).ok;
}
