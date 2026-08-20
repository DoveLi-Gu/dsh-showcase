import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

const stylesUrl = new URL("../src/styles.css", import.meta.url);
const appUrl = new URL("../src/App.tsx", import.meta.url);
const mainUrl = new URL("../src/main.tsx", import.meta.url);
const dijiangThemeUrl = new URL("../src/dijiang-theme.html", import.meta.url);
const dijiangHardeningUrl = new URL("../src/dijiang-hardening.ts", import.meta.url);

describe("persistent theme motion", () => {
  it("keeps the approved Dijiang motion and the fish poster motion intact", async () => {
    const [css, dijiang] = await Promise.all([readFile(stylesUrl, "utf8"), readFile(dijiangThemeUrl, "utf8")]);

    expect(dijiang).toContain("dijiang-loader-sweep-rotate");
    expect(dijiang).toContain("dijiang-loader-scan-final");
    expect(dijiang).toContain("dijiang-loader-status-final");
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

  it("keeps the fish loading curtain and page-wide atmosphere", async () => {
    const app = await readFile(appUrl, "utf8");

    expect(app).toContain("function LoadingCurtain");
    expect(app).toContain("function OceanAtmosphere");
    expect(app).toContain('className="ocean-atmosphere"');
    expect(app).toContain('className="fish-poster__bubbles"');
    expect(app).toContain("window.setTimeout(() => setShowIntro(false), 1500)");
  });

  it("hands the document to the approved Dijiang artifact verbatim and keeps fish as the other public theme", async () => {
    const [app, main, dijiang, hardening] = await Promise.all([
      readFile(appUrl, "utf8"),
      readFile(mainUrl, "utf8"),
      readFile(dijiangThemeUrl, "utf8"),
      readFile(dijiangHardeningUrl, "utf8"),
    ]);

    expect(app).toContain("function FishPoster");
    expect(app).toContain('type Theme = "dijiang" | "fish"');
    expect(main).toContain('import dijiangThemeHtml from "./dijiang-theme.html?raw"');
    expect(main).toContain('selectedTheme !== "fish"');
    expect(main).toContain("document.open()");
    expect(main).toContain("document.write(dijiangThemeHtml)");
    expect(main).toContain("document.close()");
    expect(main).toContain('params.get("motion") === "accessible" ? "accessible" : "full"');
    expect(main).toContain("dataset.dijiangMotion = motionMode");
    expect(main).toContain("dijiangReadoutMarkup");
    expect(hardening).toContain("field-readout");
    expect(hardening).toContain("dijiang-reference-exit");
    expect(hardening).toContain("dijiang-yellow-transfer");
    expect(hardening).toContain("clip-path: polygon(0 0, 92% 0, 100% 100%, 8% 100%)");
    expect(hardening).toContain("dijiang-reference-reduced-exit");
    expect(hardening).toContain("dijiang-progress-head");
    expect(hardening).toContain("dijiang-instrument-core-spin");
    expect(hardening).toContain(".dijiang-poster { min-height: 0; }");
    expect(hardening).toContain("height: clamp(0.48rem, 0.74vw, 0.76rem)");
    expect(hardening).toContain("01   EVIDENCE / CONNECTED");
    expect(hardening).toContain("DSH DELIVERY SYSTEM");
    expect(app).toContain("return dijiangThemeHtml");
    expect(createHash("sha256").update(dijiang).digest("hex")).toBe("2756ad6f3925dfcfa991a7d5df524cff3d3079843b29e70a0ef7a091e89f7a6a");
    expect(dijiang).toContain("终末地帝江号 / 正在汇聚交付证据");
    expect(dijiang).toContain("终末地帝江号 / 任务完成 / 交付通告");
    expect(dijiang).toContain("帝江号 / 交付拓扑 / 0017");
    expect(dijiang).toContain('class="bp-stage bp-stage--five"');
    expect(dijiang).toContain('viewBox="80 90 620 400" preserveAspectRatio="xMidYMid meet"');
    expect(dijiang).toContain("M156 258L360 320");
    expect(app).not.toContain("边境信号");
    expect(app).not.toContain('theme === "field"');
    expect(app).not.toContain("function DijiangContours");
    expect(app).not.toContain("function DijiangBlueprint");
    expect(app).not.toContain("function DijiangPoster");
    expect(app).not.toContain('src="/frontier-industrial.webp"');
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
    const persistentNames = ["ocean-light-sweep", "ocean-current-drift", "ocean-bubble-rise", "fish-tide", "fish-portrait-tide", "fish-whale-drift", "fish-arc", "fish-current", "sparkle", "fish-light-sweep", "fish-bubble-rise"];
    const keyframeLines = css.split(/\r?\n/).filter((line) => persistentNames.some((name) => line.includes(`@keyframes ${name}`)));

    expect(keyframeLines).toHaveLength(persistentNames.length);
    expect(keyframeLines.join("\n")).not.toMatch(/(?:top|right|bottom|left|width|height|margin|padding):/);
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("reduced-breathe 2.8s ease-in-out infinite alternate");
    expect(css).toContain("reduced-bubble 14s ease-in-out infinite alternate");
    expect(css).toContain(".reveal-band { opacity: 1; transform: none; }");
  });
});
