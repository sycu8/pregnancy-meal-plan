/**
 * Shared small-meal wording. Ruling (a) stays one clause with no portion-size
 * or amount wording. Hydration and a blood-sugar reason, when they were part
 * of the sentence the rewrite replaced, come back as their own sentences.
 */

export const RULING_VI = "Chia nhỏ bữa, ăn đều trong ngày";
export const RULING_EN = "Split meals into smaller ones, eaten evenly through the day";
export const HYDRATION_VI = "Uống đủ nước trong ngày.";
export const HYDRATION_EN = "Drink enough water through the day.";
export const BLOOD_SUGAR_VI = "Cách này giúp đường huyết ổn định hơn.";
export const BLOOD_SUGAR_EN = "This helps keep blood sugar steadier.";

const RULINGS = [RULING_VI, RULING_EN] as const;

const HYDRATION_REASON =
  /uống đủ nước|stay hydrated|staying hydrated|drink enough water|drink plenty of water/i;
const BLOOD_SUGAR_REASON = /đường huyết|blood sugar|glucose/i;

export type RewriteProblem = {
  kind: "missing-punctuation" | "mid-sentence-capital";
  snippet: string;
};

function logicalLines(text: string): string[] {
  const lines: string[] = [];
  for (const line of text.split("\n")) {
    if (line.includes("\\n")) lines.push(...line.split("\\n"));
    else lines.push(line);
  }
  return lines;
}

/** Sentence text, ignoring a trailing quote, bracket, or comma around source code. */
function sentenceCore(line: string): string {
  return line
    .trim()
    .replace(/[,;]\s*$/u, "")
    .replace(/["'`)\]]+$/u, "")
    .trim();
}

function lineEndsWithPunctuation(line: string): boolean {
  return /[.!?…]$/u.test(sentenceCore(line));
}

/** Fail when a rewritten sentence has no ending punctuation, or a capital follows a comma. */
export function findRewriteProblems(text: string): RewriteProblem[] {
  const problems: RewriteProblem[] = [];
  for (const line of logicalLines(text)) {
    if (!RULINGS.some((phrase) => line.includes(phrase))) continue;
    if (!lineEndsWithPunctuation(line)) {
      problems.push({
        kind: "missing-punctuation",
        snippet: line.trim().replace(/\s+/g, " ").slice(0, 180)
      });
    }
  }

  const capitalAfterComma =
    /,\s+(?:Chia nhỏ bữa, ăn đều trong ngày|Split meals into smaller ones, eaten evenly through the day)/g;
  for (const match of text.matchAll(capitalAfterComma)) {
    const at = match.index ?? 0;
    problems.push({
      kind: "mid-sentence-capital",
      snippet: text.slice(Math.max(0, at - 40), at + match[0].length + 16).replace(/\s+/g, " ")
    });
  }
  return problems;
}

function punctuateRulingLines(text: string): string {
  const lines = text.split("\n").map((line) => {
    if (!RULINGS.some((phrase) => line.includes(phrase))) return line;
    const escaped = line.includes("\\n")
      ? line.replace(
          /(Chia nhỏ bữa, ăn đều trong ngày|Split meals into smaller ones, eaten evenly through the day)(?=\\n)/g,
          (phrase) => (phrase.endsWith(".") ? phrase : `${phrase}.`)
        )
      : line;
    if (lineEndsWithPunctuation(escaped)) return escaped;
    const trimmedEnd = escaped.trimEnd();
    return `${trimmedEnd}.${escaped.slice(trimmedEnd.length)}`;
  });
  return lines.join("\n");
}

type Edit = {
  index: number;
  ruling: string;
  addHydration: boolean;
  addBloodSugar: boolean;
  lower: boolean;
  punctuate: boolean;
  collapse: boolean;
};

function indexesOf(haystack: string, needle: string): number[] {
  if (!needle) return [];
  const found: number[] = [];
  let from = 0;
  while (from <= haystack.length) {
    const at = haystack.indexOf(needle, from);
    if (at < 0) return found;
    found.push(at);
    if (found.length > 4) return found;
    from = at + 1;
  }
  return found;
}

function sentenceHasHydration(value: string): boolean {
  return HYDRATION_REASON.test(value);
}

function shouldLower(text: string, index: number): boolean {
  const before = text.slice(0, index).replace(/[ \t]+$/u, "");
  if (!before) return false;
  const last = before.slice(-1);
  if (/[.!?…\n:]/u.test(last)) return false;
  if (last === "-" || last === "*" || last === "(" || last === '"' || last === "'" || last === "`") return false;
  if (/\d$/u.test(last) && /(?:^|\n)\s*\d+$/u.test(before)) return false;
  return true;
}

function shouldPunctuate(text: string, index: number, ruling: string): boolean {
  const after = text.slice(index + ruling.length);
  if (/^[.!?…]/u.test(after)) return false;
  if (/^\s*[,:;]/u.test(after)) return false;
  return after.length === 0 || /^\s*(?:\n|$|`|"|'|\))/u.test(after);
}

function shouldCollapse(text: string, index: number, ruling: string): boolean {
  return text.slice(index + ruling.length).startsWith(`: ${ruling}`);
}

function replacedSpan(
  oldText: string,
  newText: string,
  index: number,
  ruling: string
): { oldSpan: string; newSpan: string } | null {
  let length = 48;
  let positions: number[] = [];
  let prefix = "";
  while (length <= 200) {
    prefix = newText.slice(Math.max(0, index - length), index);
    positions = indexesOf(oldText, prefix);
    if (positions.length === 1) break;
    if (index - length <= 0 && positions.length !== 1) return null;
    length += 24;
  }
  if (positions.length !== 1 || prefix.length === 0) return null;

  const after = newText.slice(index + ruling.length);
  const newline = after.indexOf("\n");
  const suffix = newline >= 0 ? after.slice(newline, newline + 48) : "";
  if (suffix.trim().length < 2) return null;
  const oldAt = positions[0]! + prefix.length;
  const suffixAt = oldText.indexOf(suffix, oldAt);
  if (suffixAt < 0 || suffixAt - oldAt > 500) return null;
  return {
    oldSpan: oldText.slice(oldAt, suffixAt),
    newSpan: newText.slice(index, index + ruling.length + (newline >= 0 ? newline : 0))
  };
}

function editsFor(oldText: string, newText: string): Edit[] {
  const edits: Edit[] = [];
  for (const ruling of RULINGS) {
    let from = 0;
    while (from < newText.length) {
      const index = newText.indexOf(ruling, from);
      if (index < 0) break;
      from = index + ruling.length;
      const span = replacedSpan(oldText, newText, index, ruling);
      const nearby = newText.slice(index + ruling.length, index + ruling.length + 220);
      const addHydration = Boolean(
        span &&
          sentenceHasHydration(span.oldSpan) &&
          !sentenceHasHydration(span.newSpan) &&
          !sentenceHasHydration(nearby)
      );
      const addBloodSugar = Boolean(
        span && BLOOD_SUGAR_REASON.test(span.oldSpan) && !BLOOD_SUGAR_REASON.test(span.newSpan)
      );
      edits.push({
        index,
        ruling,
        addHydration,
        addBloodSugar,
        lower: shouldLower(newText, index),
        punctuate: shouldPunctuate(newText, index, ruling),
        collapse: shouldCollapse(newText, index, ruling)
      });
    }
  }
  return edits;
}

function applyEdit(text: string, edit: Edit): string {
  let { index, ruling } = edit;
  if (edit.lower) {
    text = text.slice(0, index) + text[index]!.toLowerCase() + text.slice(index + 1);
  }
  let end = index + ruling.length;
  if (edit.collapse && text.slice(end, end + `: ${ruling}`.length) === `: ${ruling}`) {
    text = text.slice(0, end) + text.slice(end + `: ${ruling}`.length);
  }
  if (edit.punctuate && !/^[.!?…]/u.test(text.slice(end))) {
    text = text.slice(0, end) + "." + text.slice(end);
  }
  if (/^[.!?…]/u.test(text.slice(end))) end += 1;

  const extras: string[] = [];
  if (edit.addBloodSugar) extras.push(ruling === RULING_VI ? BLOOD_SUGAR_VI : BLOOD_SUGAR_EN);
  if (edit.addHydration) extras.push(ruling === RULING_VI ? HYDRATION_VI : HYDRATION_EN);
  if (!extras.length) return text;
  const after = text.slice(end);
  if (after.length > 0 && !/^\s*(?:\n|$|`|"|'|\))/u.test(after)) return text;
  const insertion = ` ${extras.join(" ")}`;
  if (text.slice(end, end + 180).includes(extras[0]!)) return text;
  return text.slice(0, end) + insertion + text.slice(end);
}

/**
 * Put punctuation, hydration, and a removed blood-sugar reason back on ruling
 * lines. `oldText` is the copy from before the small-meal rewrite.
 */
export function restoreRewrittenCopy(oldText: string, newText: string): string {
  if (!RULINGS.some((ruling) => newText.includes(ruling))) return newText;
  const edits = editsFor(oldText, newText).sort((a, b) => b.index - a.index);
  return punctuateRulingLines(edits.reduce((text, edit) => applyEdit(text, edit), newText));
}

export function countRestores(oldText: string, newText: string): { hydration: number; bloodSugar: number; punctuation: number } {
  const edits = editsFor(oldText, newText);
  return {
    hydration: edits.filter((edit) => edit.addHydration).length,
    bloodSugar: edits.filter((edit) => edit.addBloodSugar).length,
    punctuation: edits.filter((edit) => edit.punctuate || edit.collapse).length
  };
}
