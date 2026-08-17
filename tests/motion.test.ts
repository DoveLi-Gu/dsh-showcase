import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const stylesUrl = new URL("../src/styles.css", import.meta.url);
const appUrl = new URL("../src/App.tsx", import.meta.url);

describe("persistent theme motion", () => {
  it("keeps both poster worlds alive with restrained infinite animations", async () => {
    const css = await readFile(stylesUrl, "utf8");

    expect(css).toMatch(/animation:\s*field-photo-drift 13s ease-in-out infinite alternate/);
    expect(css).toMatch(/animation:\s*field-scan 8\.5s linear infinite/);
    expect(css).toMatch(/animation:\s*rail-flow 7s linear infinite/);
    expect(css).toMatch(/animation:\s*fish-tide 12s cubic-bezier\(\.22, 1, \.36, 1\) infinite alternate/);
    expect(css).toMatch(/animation:\s*fish-portrait-tide 10s cubic-bezier\(\.22, 1, \.36, 1\) infinite alternate/);
    expect(css).toMatch(/animation:\s*fish-whale-drift 10s cubic-bezier\(\.22, 1, \.36, 1\) infinite alternate/);
    expect(css).toMatch(/animation:\s*fish-arc 20s linear infinite/);
    expect(css).toMatch(/animation:\s*fish-current 3\.4s ease-in-out infinite/);
    expect(css).toMatch(/animation:\s*sparkle 4\.2s ease-in-out infinite/);
    expect(css).toMatch(/animation:\s*ocean-bubble-rise 12s linear infinite/);
    expect(css).toMatch(/animation:\s*fish-bubble-rise 8s linear infinite/);
    expect(css).toMatch(/animation:\s*fish-light-sweep 9s ease-in-out infinite alternate/);
  });

  it("adds a one-shot loading curtain and page-wide fish atmosphere", async () => {
    const app = await readFile(appUrl, "utf8");

    expect(app).toContain("function LoadingCurtain");
    expect(app).toContain("function OceanAtmosphere");
    expect(app).toContain('className="ocean-atmosphere"');
    expect(app).toContain('className="fish-poster__bubbles"');
    expect(app).toContain("window.setTimeout(() => setShowIntro(false), 1500)");
  });

  it("uses genuinely separate DOM compositions and keeps switching out of the report", async () => {
    const app = await readFile(appUrl, "utf8");

    expect(app).toContain("function FieldPoster");
    expect(app).toContain("function FishPoster");
    expect(app).toContain('src="/frontier-industrial.webp"');
    expect(app).toContain('src="/whale-girl-keyvisual.webp"');
    expect(app).not.toContain('className="theme-switch"');
  });

  it("keeps the decorative portrait safely below the tablet and mobile poster edge", async () => {
    const css = await readFile(stylesUrl, "utf8");

    expect(css).toContain(".fish-poster__portrait { top: 34%; right: -7%; width: 68%; height: 76%; opacity: .16; }");
    expect(css).toContain(".fish-poster__portrait { top: 40%; right: -22%; width: 104%; height: 70%; opacity: .13; }");
  });

  it("renders report screenshot paths instead of placeholder interface blocks", async () => {
    const [app, css] = await Promise.all([readFile(appUrl, "utf8"), readFile(stylesUrl, "utf8")]);

    expect(app).toContain("evidenceUrl(shot.imagePath)");
    expect(app).toContain('/evidence/before-desktop.png');
    expect(app).toContain('className="capture-frame"');
    expect(app).not.toContain("ScreenMock");
    expect(app).not.toContain("compare-ui");
    expect(css).toContain(".capture-frame img");
    expect(css).not.toContain(".screen-mock");
    expect(css).not.toContain(".compare-ui");
  });

  it("limits persistent keyframes to compositor-friendly properties and keeps full-motion mode explicit", async () => {
    const css = await readFile(stylesUrl, "utf8");
    const persistentNames = ["field-photo-drift", "field-scan", "rail-flow", "ocean-light-sweep", "ocean-current-drift", "ocean-bubble-rise", "fish-tide", "fish-portrait-tide", "fish-whale-drift", "fish-arc", "fish-current", "sparkle", "fish-light-sweep", "fish-bubble-rise"];
    const keyframeLines = css.split(/\r?\n/).filter((line) => persistentNames.some((name) => line.includes(`@keyframes ${name}`)));

    expect(keyframeLines).toHaveLength(persistentNames.length);
    expect(keyframeLines.join("\n")).not.toMatch(/(?:top|right|bottom|left|width|height|margin|padding):/);
    expect(css).not.toContain("prefers-reduced-motion");
  });
});
