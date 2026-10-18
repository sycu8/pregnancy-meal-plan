/**
 * Turn Telex and VNI leftovers into one Vietnamese syllable before safety matching.
 * Display text stays original. English words such as bananas, grapes, raw, and 7up stay put.
 */

const TONE_BY_KEY: Record<string, number> = { f: 1, s: 2, r: 3, x: 4, j: 5 };
const TONE_FORMS: Record<string, string> = {
  a: "aàáảãạ",
  ă: "ăằắẳẵặ",
  â: "âầấẩẫậ",
  e: "eèéẻẽẹ",
  ê: "êềếểễệ",
  i: "iìíỉĩị",
  o: "oòóỏõọ",
  ô: "ôồốổỗộ",
  ơ: "ơờớởỡợ",
  u: "uùúủũụ",
  ư: "ưừứửữự",
  y: "yỳýỷỹỵ"
};

const ONSETS = [
  "ngh", "tr", "th", "ph", "kh", "gh", "gi", "qu", "ch", "ng", "nh",
  "b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "p", "r", "s", "t", "v", "x", ""
];
const CODAS = ["ch", "ng", "nh", "c", "m", "n", "p", "t", ""];
const NUCLEI = new Set([
  "a", "ă", "â", "e", "ê", "i", "o", "ô", "ơ", "u", "ư", "y",
  "ai", "ao", "au", "ay", "ây", "ău",
  "eo", "eu", "êu",
  "ia", "iê", "iu", "iêu",
  "oa", "oă", "oe", "oi", "ôi", "ơi", "oai", "oay",
  "ua", "uâ", "ưa", "ue", "uê", "ui", "ưi", "uo", "uô", "ươ", "uy", "uya", "uyu", "uyê",
  "uôi", "ươi", "ươu", "yêu", "ye"
]);

/** Trailing s is a tone only in a note that already has another Telex/VNI signal. These stay English. */
const ENGLISH_TRAILING_S = new Set([
  "this", "thus", "yes", "his", "has", "was", "its", "bus", "gas", "plus", "less", "miss",
  "pass", "boss", "kids", "foods", "needs", "weeks", "days", "meals", "goals", "notes",
  "eggs", "oats", "nuts", "cups", "grams", "is", "as", "us"
]);

export type PreparedNote = { text: string; teenAt: boolean[] };

function stripToneChar(ch: string): string {
  for (const [base, forms] of Object.entries(TONE_FORMS)) {
    if (forms.includes(ch)) return base;
  }
  return ch;
}

function isVowelChar(ch: string): boolean {
  return stripToneChar(ch) in TONE_FORMS;
}

function findNucleus(word: string): { start: number; end: number } | null {
  let end = -1;
  for (let index = word.length - 1; index >= 0; index -= 1) {
    if (isVowelChar(word[index])) {
      end = index + 1;
      break;
    }
  }
  if (end < 0) return null;
  let start = end - 1;
  while (start > 0 && isVowelChar(word[start - 1])) start -= 1;
  return { start, end };
}

function toneOffset(base: string, hasFinal: boolean): number {
  if (base.length <= 1) return 0;
  if (base.length >= 3) return 1;
  const pair = base.slice(0, 2);
  if (hasFinal) {
    if ("êơôăâ".includes(base[1])) return 1;
    if (["ie", "ye", "uo", "ua", "ue", "oa", "oe", "uy"].includes(pair)) return 1;
    return 0;
  }
  return ["oa", "oe", "uy"].includes(pair) ? 1 : 0;
}

function applyTone(word: string, tone: number): string {
  const loc = findNucleus(word);
  if (!loc) return word;
  const chars = [...word];
  const nucleus = chars.slice(loc.start, loc.end);
  const base = nucleus.map(stripToneChar);
  const offset = toneOffset(base.join(""), loc.end < chars.length);
  const forms = TONE_FORMS[base[offset]];
  if (!forms) return word;
  nucleus[offset] = forms[tone] ?? nucleus[offset];
  for (let index = 0; index < nucleus.length; index += 1) {
    if (index !== offset) nucleus[index] = stripToneChar(nucleus[index]);
  }
  return chars.slice(0, loc.start).join("") + nucleus.join("") + chars.slice(loc.end).join("");
}

function applyW(word: string): string | null {
  const loc = findNucleus(word);
  if (!loc) return null;
  const chars = [...word];
  const nucleus = chars.slice(loc.start, loc.end);
  const base = nucleus.map(stripToneChar).join("");
  if (base.endsWith("uo") || base.endsWith("uô")) {
    nucleus[nucleus.length - 2] = "ư";
    nucleus[nucleus.length - 1] = "ơ";
    return chars.slice(0, loc.start).join("") + nucleus.join("") + chars.slice(loc.end).join("");
  }
  const last = stripToneChar(nucleus[nucleus.length - 1]);
  const shaped: Record<string, string> = { a: "ă", ă: "a", o: "ơ", ơ: "o", u: "ư", ư: "u" };
  if (!shaped[last]) return null;
  nucleus[nucleus.length - 1] = shaped[last];
  return chars.slice(0, loc.start).join("") + nucleus.join("") + chars.slice(loc.end).join("");
}

function applyDouble(word: string, ch: string): string | null {
  const loc = findNucleus(word);
  if (!loc) return null;
  const chars = [...word];
  const lastIndex = loc.end - 1;
  if (stripToneChar(chars[lastIndex]) !== ch) return null;
  const hat: Record<string, string> = { a: "â", e: "ê", o: "ô" };
  chars[lastIndex] = hat[ch];
  return chars.join("");
}

type ImeResult = { text: string; tone: "none" | "s" | "other"; w: boolean; double: boolean };

/**
 * Sequential Telex keystrokes. Tone letters count only at the end of the token,
 * so English "soft" and "raw" stay English. w after a coda still shapes the vowel (nuocws).
 */
function telexImeSignals(input: string): ImeResult {
  const lower = input.toLowerCase();
  let word = "";
  let tone: ImeResult["tone"] = "none";
  let w = false;
  let double = false;
  for (let index = 0; index < lower.length; index += 1) {
    const ch = lower[index];
    const last = index === lower.length - 1;
    if (ch === "w") {
      const next = applyW(word);
      if (next) {
        word = next;
        w = true;
        continue;
      }
      word += ch;
      continue;
    }
    if (ch === "a" || ch === "e" || ch === "o") {
      const doubled = applyDouble(word, ch);
      if (doubled) {
        word = doubled;
        double = true;
        continue;
      }
      word += ch;
      continue;
    }
    if (ch === "d" && word.endsWith("d")) {
      word = `${word.slice(0, -1)}đ`;
      double = true;
      continue;
    }
    if (last && ch in TONE_BY_KEY && findNucleus(word)) {
      word = applyTone(word, TONE_BY_KEY[ch]);
      tone = ch === "s" ? "s" : "other";
      continue;
    }
    word += ch;
  }
  return { text: word, tone, w, double };
}

/** Sequential Telex keystrokes, including a modifier typed after the coda (nuocws). */
export function telexIme(input: string): string {
  return telexImeSignals(input).text;
}

function applyVniShape(word: string, digit: string): string | null {
  const loc = findNucleus(word);
  if (!loc) return null;
  const chars = [...word];
  const index = loc.end - 1;
  const base = stripToneChar(chars[index]);
  const shaped =
    digit === "6"
      ? ({ a: "â", e: "ê", o: "ô" } as Record<string, string>)[base]
      : digit === "7"
        ? ({ o: "ơ", u: "ư" } as Record<string, string>)[base]
        : digit === "8"
          ? ({ a: "ă" } as Record<string, string>)[base]
          : undefined;
  if (!shaped) return null;
  chars[index] = shaped;
  return chars.join("");
}

export function vniConvert(input: string): string {
  let word = "";
  for (const ch of input.toLowerCase()) {
    if (ch >= "1" && ch <= "9") {
      if (ch === "9" && word.endsWith("d")) {
        word = `${word.slice(0, -1)}đ`;
        continue;
      }
      if (ch === "6" || ch === "7" || ch === "8") {
        word = applyVniShape(word, ch) ?? word + ch;
        continue;
      }
      const tone = { "1": 2, "2": 1, "3": 3, "4": 4, "5": 5 }[ch];
      if (tone && findNucleus(word)) {
        word = applyTone(word, tone);
        continue;
      }
    }
    word += ch;
  }
  return word;
}

function stripTones(word: string): string {
  return [...word].map((ch) => stripToneChar(ch)).join("");
}

function hasCoda(word: string): boolean {
  const base = stripTones(word);
  const loc = findNucleus(base);
  return Boolean(loc && loc.end < base.length);
}

export function isVietnameseSyllable(word: string): boolean {
  const base = stripTones(word).toLowerCase();
  if (!base || base.length > 10) return false;
  const clusters = [...base.matchAll(/[aăâeêioôơuưy]+/gu)];
  if (clusters.length !== 1) return false;
  const nucleus = clusters[0][0];
  const start = clusters[0].index ?? 0;
  let onset = base.slice(0, start);
  let vowel = nucleus;
  if (onset === "q" && vowel.startsWith("u") && vowel.length > 1) {
    onset = "qu";
    vowel = vowel.slice(1);
  }
  const coda = base.slice(start + nucleus.length);
  return ONSETS.includes(onset) && CODAS.includes(coda) && NUCLEI.has(vowel);
}

type Conversion = { kind: "none" | "strong" | "trailing-s"; text: string };

function acceptStrong(core: string, ime: ImeResult): boolean {
  if (ime.tone === "other" && (hasCoda(ime.text) || ime.w || ime.double)) return true;
  if (ime.w && (ime.tone !== "none" || /w[aeiouy]/.test(core))) return true;
  if (ime.double && (ime.tone !== "none" || ime.text.includes("đ"))) return true;
  return false;
}

function convertCore(core: string, telexMode: boolean): Conversion {
  const lower = core.toLowerCase();
  if (!lower || /^\d/.test(lower)) return { kind: "none", text: core };
  if (/\d/.test(lower)) {
    if (lower.length < 4) return { kind: "none", text: core };
    const vni = vniConvert(lower);
    if (vni !== lower && isVietnameseSyllable(vni)) return { kind: "strong", text: vni };
    return { kind: "none", text: core };
  }
  const ime = telexImeSignals(lower);
  if (ime.text === lower || !isVietnameseSyllable(ime.text)) return { kind: "none", text: core };
  const stem = lower.slice(0, -1);
  const stemIme = telexImeSignals(stem);
  const onlyTrailingS =
    lower.endsWith("s") &&
    ime.tone === "s" &&
    !ime.w &&
    !ime.double &&
    stemIme.text === stem &&
    stemIme.tone === "none" &&
    !stemIme.w &&
    !stemIme.double;
  if (onlyTrailingS) {
    if (!telexMode || ENGLISH_TRAILING_S.has(lower)) return { kind: "none", text: core };
    return { kind: "trailing-s", text: ime.text };
  }
  if (!acceptStrong(lower, ime)) return { kind: "none", text: core };
  return { kind: "strong", text: ime.text };
}

function matchCase(original: string, converted: string): string {
  if (original.toUpperCase() === original && /[A-Z]/.test(original)) return converted.toLocaleUpperCase("vi");
  if (/^[A-Z]/.test(original)) return converted.charAt(0).toLocaleUpperCase("vi") + converted.slice(1);
  return converted;
}

/**
 * NFC plus Telex/VNI for tokens that are one Vietnamese syllable.
 * teenAt marks characters that were converted, so a folded hit there is not a real diacritic.
 */
export function prepareNote(note: string): PreparedNote {
  const nfc = note.normalize("NFC");
  const parts = nfc.split(/([^\p{L}\p{N}]+)/u);
  const words = parts.filter((part) => /^[\p{L}\p{N}]/u.test(part));
  const firstPass = words.map((word) => convertCore(word, false));
  const telexMode = firstPass.some((item) => item.kind === "strong");
  let wordIndex = 0;
  let text = "";
  const teenAt: boolean[] = [];
  const push = (value: string, teen: boolean) => {
    text += value;
    for (let index = 0; index < value.length; index += 1) teenAt.push(teen);
  };
  for (const part of parts) {
    if (!/^[\p{L}\p{N}]/u.test(part)) {
      push(part, false);
      continue;
    }
    const decision = telexMode ? convertCore(part, true) : firstPass[wordIndex];
    wordIndex += 1;
    if (!decision || decision.kind === "none") {
      push(part, false);
      continue;
    }
    push(matchCase(part, decision.text), true);
  }
  return { text, teenAt };
}
