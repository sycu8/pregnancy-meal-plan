import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PLATFORM_PACKAGES = [
  "@capacitor/android",
  "@capacitor/ios",
  "@capacitor/core",
  "@capacitor/cli"
] as const;

/** GHSA-rvm3-566m-v7fv is fixed in Capacitor 7.6.9. Stay on the 7.x line. */
const MIN_PATCH = [7, 6, 9] as const;

function isAtLeast(version: string, minimum: readonly number[]) {
  const parts = version.split(".").map((part) => Number(part));
  for (let index = 0; index < minimum.length; index += 1) {
    const current = parts[index] ?? 0;
    const required = minimum[index] ?? 0;
    if (current > required) return true;
    if (current < required) return false;
  }
  return true;
}

function readJson(relativePath: string) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    packages?: Record<string, { version?: string }>;
  };
}

describe("mobile Capacitor patch", () => {
  it("keeps @capacitor platform packages on 7.6.9 or a newer 7.x patch", () => {
    const manifest = readJson("../mobile/package.json");
    const lockfile = readJson("../mobile/package-lock.json");
    const declared = { ...manifest.dependencies, ...manifest.devDependencies };

    for (const name of PLATFORM_PACKAGES) {
      expect(declared[name]).toBe("^7.6.9");
      const resolved = lockfile.packages?.[`node_modules/${name}`]?.version;
      expect(resolved, name).toBeTruthy();
      expect(resolved?.startsWith("7.")).toBe(true);
      expect(isAtLeast(resolved ?? "0.0.0", MIN_PATCH)).toBe(true);
    }
  });

  it("keeps official plugins on the Capacitor 7 line", () => {
    const lockfile = readJson("../mobile/package-lock.json");
    const plugins = ["@capacitor/app", "@capacitor/splash-screen", "@capacitor/status-bar"];

    for (const name of plugins) {
      const resolved = lockfile.packages?.[`node_modules/${name}`]?.version ?? "";
      expect(resolved.startsWith("7.")).toBe(true);
    }
  });
});
