/**
 * Regenerate small-meal lines from the shared copy rules.
 * Hydration and a blood-sugar reason are restored only where the pre-rewrite
 * sentence had them. Run from the repo root:
 *   pnpm exec tsx scripts/restore-small-meal-copy.ts
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { RULING_EN, RULING_VI, countRestores, restoreRewrittenCopy } from "../src/lib/blog/synthesis/smallMealCopy.ts";

const BASE = "7a6649df^";
const ROOT = process.cwd();
const RULING = new RegExp(`${RULING_VI}|${RULING_EN}`);

function gitShow(file: string): string | null {
  try {
    return execFileSync("git", ["show", `${BASE}:${file}`], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch {
    return null;
  }
}

function walk(dir: string, out: string[]) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else out.push(full);
  }
}

function mapValue(oldValue: unknown, newValue: unknown): unknown {
  if (typeof newValue === "string") {
    return restoreRewrittenCopy(typeof oldValue === "string" ? oldValue : "", newValue);
  }
  if (Array.isArray(newValue)) {
    const oldList = Array.isArray(oldValue) ? oldValue : [];
    return newValue.map((item, index) => mapValue(oldList[index], item));
  }
  if (newValue && typeof newValue === "object") {
    const oldRecord =
      oldValue && typeof oldValue === "object" && !Array.isArray(oldValue)
        ? (oldValue as Record<string, unknown>)
        : {};
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(newValue)) {
      next[key] = mapValue(oldRecord[key], value);
    }
    return next;
  }
  return newValue;
}

function collectStrings(value: unknown, out: string[]) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === "object") {
    for (const child of Object.values(value)) collectStrings(child, out);
  }
}

const files: string[] = [];
walk(path.join(ROOT, "content"), files);
walk(path.join(ROOT, "scripts"), files);
walk(path.join(ROOT, "src"), files);

let hydrationPosts = 0;
let bloodSugarPosts = 0;
let punctuation = 0;
let written = 0;
const hydrationFiles: string[] = [];
const bloodSugarFiles: string[] = [];

for (const file of files) {
  if (file.endsWith("smallMealCopy.ts") || file.endsWith("restore-small-meal-copy.ts")) continue;
  const current = fs.readFileSync(file, "utf8");
  if (!RULING.test(current)) continue;
  const previous = gitShow(path.relative(ROOT, file)) ?? "";

  if (file.endsWith(".json")) {
    const currentJson = JSON.parse(current) as unknown;
    let previousJson: unknown = {};
    if (previous) {
      try {
        previousJson = JSON.parse(previous) as unknown;
      } catch {
        previousJson = {};
      }
    }
    const strings: string[] = [];
    const oldStrings: string[] = [];
    collectStrings(currentJson, strings);
    collectStrings(previousJson, oldStrings);
    let hydration = 0;
    let bloodSugar = 0;
    const limit = Math.max(strings.length, oldStrings.length);
    for (let index = 0; index < limit; index += 1) {
      const counts = countRestores(oldStrings[index] ?? "", strings[index] ?? "");
      hydration += counts.hydration;
      bloodSugar += counts.bloodSugar;
      punctuation += counts.punctuation;
    }
    const nextJson = mapValue(previousJson, currentJson);
    const next = JSON.stringify(nextJson, null, 2) + "\n";
    if (next !== current) {
      fs.writeFileSync(file, next);
      written += 1;
    }
    if (hydration > 0) {
      hydrationPosts += 1;
      hydrationFiles.push(path.relative(ROOT, file));
    }
    if (bloodSugar > 0) {
      bloodSugarPosts += 1;
      bloodSugarFiles.push(path.relative(ROOT, file));
    }
    continue;
  }

  if (!/\.(mjs|ts|tsx)$/.test(file)) continue;
  const counts = countRestores(previous, current);
  punctuation += counts.punctuation;
  const next = restoreRewrittenCopy(previous, current);
  if (next !== current) {
    fs.writeFileSync(file, next);
    written += 1;
  }
  if (counts.hydration > 0) {
    hydrationFiles.push(path.relative(ROOT, file));
  }
  if (counts.bloodSugar > 0) bloodSugarFiles.push(path.relative(ROOT, file));
}

console.log(
  JSON.stringify(
    {
      written,
      hydrationPosts,
      bloodSugarPosts,
      punctuation,
      hydrationFiles,
      bloodSugarFiles
    },
    null,
    2
  )
);
