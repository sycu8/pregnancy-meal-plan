import { prepareNote } from "@/lib/nutrition/teenNote";

function foldNote(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/gi, "d").toLowerCase();
}

export type WeightLossReason = "weight_loss" | "classifier_error";

export type WeightLossReview = { drop: false } | { drop: true; reason: WeightLossReason };

/**
 * Phrases that name the opposite of a diet goal. They are blanked before the ban
 * scan so "không giảm cân" stays, while "không tăng cân" is still a limit.
 */
const KEEP_SPANS: readonly RegExp[] = [
  /(?<![a-z])(?:khong|dung|ko)\s+(?:nen\s+|duoc\s+)?(?:giam can|giam beo|nhin an|bo bua)(?![a-z])/giu,
  /(?<![a-z])(?:don't|do not|should not|shouldn't|shouldnt|must not|mustn't|mustnt|ought not)\s+(?:lose|losing|drop|shed)\s+weight/giu,
  /(?<![a-z])(?:not|no|never)\s+weight loss(?![a-z])/giu,
  /(?<![a-z])(?:don't|do not|should not|shouldn't|shouldnt|must not|mustn't|mustnt|ought not)\s+fast(?![a-z])/giu,
  /(?<![a-z])(?:don't|do not)\s+skip\s+(?:meals?|breakfast|lunch|dinner)/giu,
  /(?<![a-z])eat(?:ing)?\s+less\s+(?:sugar|sweet|sweets|candy|candies|junk|soda|fried)(?![a-z])/giu,
  /(?<![a-z])an it\s+(?:duong|do ngot|ngot|muoi)(?![a-z])/giu,
  /(?<![a-z])(?:giam|han che|bot)\s+do ngot(?![a-z])/giu,
  /(?<![a-z])uu tien tinh bot cham(?![a-z])/giu
];

/** Appetite, eating less, limiting weight, and any loss goal. English "can" is not cân. */
const BAN_SPANS: readonly RegExp[] = [
  /(?:reduce|suppress|curb|control|limit|watch|manage|cut|lower|decrease|lessen|tame)\s+(?!sugar\b|sweet\b|sweets\b|candy\b|junk\b|soda\b|fried\b|salt\b)(?:(?:your|the|an|a|her|his)\s+)?(?:[a-z]+\s+){0,2}(?:appetite|hunger|cravings?|intake)(?![a-z])/iu,
  /(?:giam|bot|cat|kiem soat|han che|giam bot)\s+(?:[a-z]+\s+){0,3}(?:them an|cam giac doi|con doi|khau vi|ngon mieng)(?![a-z])/iu,
  /(?<![a-z])eat(?:ing)?\s+less(?![a-z])/iu,
  /(?<![a-z])eat(?:ing)?\s+lighter(?![a-z])/iu,
  /(?<![a-z])an it(?:\s+(?:lai|hon|di))(?![a-z])/iu,
  /(?<![a-z])an it(?=\s+(?:vao|buoi|de|cho|luc|thoi)|[.!?]|$)/iu,
  /(?<![a-z])bot an(?![a-z])/iu,
  /(?<![a-z])(?:an kieng|kieng an)(?![a-z])/iu,
  /cut back on\s+(?!sugar\b|sweet\b|sweets\b|candy\b|junk\b|soda\b|fried\b|salt\b)(?:[a-z]+\s+){0,2}(?:food|portions?|intake|eating|meals?|calories)(?![a-z])/iu,
  /(?<![a-z])(?:lose|losing|drop|dropping|shed|shedding)\s+(?:some\s+|a\s+little\s+|the\s+)?(?:[a-z]+\s+){0,2}weight(?![a-z])/iu,
  /(?<![a-z])weight loss(?![a-z])/iu,
  /(?<![a-z])(?:slim(?:ming)? down|slimming|dieting)(?![a-z])/iu,
  /(?<![a-z])(?:fasting|keto|ketogenic|low-carb|low carb)(?![a-z])/iu,
  /(?<![a-z])(?:calorie (?:cap|limit|deficit)|cut(?:ting)? calories|count(?:ing)? calories)(?![a-z])/iu,
  /(?<![a-z])\d{3,4}\s*(?:kcal|calories|calo)(?![a-z])/iu,
  /(?<![a-z])(?:keep|holding|hold)\s+(?:your\s+|the\s+)?weight\s+down(?![a-z])/iu,
  /pre-?pregnancy weight/iu,
  /(?:watch|control|manage|limit|restrict|avoid|stop|prevent|cap)\s+(?:(?:your|the|my|any|extra)\s+)?(?:weight gain|gaining weight|extra weight|weight)(?![a-z])/iu,
  /(?<![a-z])(?:giam can|giam beo|xuong can|dot mo|giu dang|eo thon|thanh loc|giai doc)(?![a-z])/iu,
  /(?<![a-z])(?:cat|giam)\s+tinh bot(?![a-z])/iu,
  /(?<![a-z])(?:nhin an|bo bua)(?![a-z])/iu,
  /(?:kiem soat|han che|gioi han|kieng|ep|giu)\s+(?:muc\s+)?(?:tang can|can nang)(?![a-z])/iu,
  /(?<![a-z])(?:khong|dung|ko)\s+(?:nen\s+|cho\s+)?(?:tang can|len can)(?![a-z])/iu,
  /(?:giam|kiem soat|han che|gioi han|kieng|ep)\s+(?:muc\s+)?can(?![a-z])/iu
];

function maskKeeps(folded: string): string {
  let text = folded;
  for (const pattern of KEEP_SPANS) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    text = text.replace(new RegExp(pattern.source, flags), (match) => " ".repeat(match.length));
  }
  return text;
}

/** True when the note advises eating less, a smaller appetite, or any weight goal. */
export function advisesWeightLoss(note: string): boolean {
  const folded = maskKeeps(foldNote(prepareNote(note).text));
  return BAN_SPANS.some((pattern) => pattern.test(folded));
}

/**
 * Closed check for one model note. A throw drops the note; the caller logs the
 * reason code and never the note text.
 */
export function reviewWeightLossNote(
  note: string,
  check: (note: string) => boolean = advisesWeightLoss
): WeightLossReview {
  try {
    if (typeof note !== "string" || typeof check !== "function") throw new Error("weight-check");
    return check(note) ? { drop: true, reason: "weight_loss" } : { drop: false };
  } catch {
    return { drop: true, reason: "classifier_error" };
  }
}

export function partitionWeightNotes(
  notes: readonly string[],
  check?: (note: string) => boolean
): { kept: string[]; droppedReason: WeightLossReason | null } {
  let droppedReason: WeightLossReason | null = null;
  const kept: string[] = [];
  for (const note of notes) {
    const review = reviewWeightLossNote(note, check);
    if (!review.drop) {
      kept.push(note);
      continue;
    }
    droppedReason = review.reason === "classifier_error" || droppedReason === "classifier_error" ? "classifier_error" : "weight_loss";
  }
  return { kept, droppedReason };
}
