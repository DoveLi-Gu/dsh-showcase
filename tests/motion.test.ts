import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const stylesUrl = new URL("../src/styles.css", import.meta.url);
const appUrl = new URL("../src/App.tsx", import.meta.url);

describe("persistent theme motion", () => {
  it("keeps both themes alive with restrained infinite animations", async () => {
    const css = await readFile(stylesUrl, "utf8");

    expect(css).toContain("animation:field-scan 8s linear infinite");
    expect(css).toContain("animation:edge-ticks 9s linear infinite");
    expect(css).toContain("animation:stage-pulse 3.4s ease-in-out infinite");
    expect(css).toContain("animation:rail-flow 7s linear infinite");
    expect(css).toContain("animation:fish-float 8.5s ease-in-out infinite");
    expect(css).toContain("animation:water-drift 9s linear infinite");
    expect(css).toContain("animation:bubble-rise 11s linear infinite");
    expect(css).toContain("animation:sonar-ring 10s ease-out infinite");
  });

  it("uses six bubbles and removes character art from the field theme", async () => {
    const app = await readFile(appUrl, "utf8");
    const atmosphere = app.match(/<div className="poster-atmosphere"[^>]*>(.*?)<\/div>/s)?.[1] ?? "";

    expect(atmosphere.match(/<i \/>/g) ?? []).toHaveLength(6);
    expect(app).toContain('{theme === "fish" && <img className="fish-character"');
  });

  it("limits keyframes to compositor-friendly properties and honors reduced motion", async () => {
    const css = await readFile(stylesUrl, "utf8");
    const persistentNames = ["field-scan", "edge-ticks", "stage-pulse", "verify-pulse", "rail-flow", "fish-float", "water-drift", "bubble-rise", "sonar-ring"];
    const keyframeLines = css.split(/\r?\n/).filter((line) => persistentNames.some((name) => line.includes(`@keyframes ${name}`)));

    expect(keyframeLines).toHaveLength(persistentNames.length);
    expect(keyframeLines.join("\n")).not.toMatch(/(?:top|right|bottom|left|width|height|margin|padding):/);
    expect(css).toMatch(/@media \(prefers-reduced-motion:reduce\)[^{]*\{[\s\S]*?animation:none!important;transition:none!important/);
  });
});
