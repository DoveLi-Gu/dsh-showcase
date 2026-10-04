import { describe, expect, it } from "vitest";
import { createStyledPosterHtml } from "../plugin/poster-html.js";
import { solidPng } from "./png-fixture";

const render = (overrides: Record<string, unknown> = {}) => createStyledPosterHtml({
  theme: "frontier-signal", locale: "zh-CN", projectName: "evidence-project",
  task: "Review the actual delivery", taskStatus: "partial", stages: ["提示", "构建", "测试", "捕获", "交付"],
  gitState: "changed", fileCount: 1, gitFiles: [{ path: "src/main.ts", additions: 4, deletions: 1 }],
  testCount: 1, passedTests: 0, testReceipts: [{ command: "npm test", exitCode: 1, status: "failed", output: "FAIL: expected 1, received 0" }],
  reportPath: ".showcase/report.json", freshnessWarnings: ["Review the failed receipt"], ...overrides,
});

describe("shared Dijiang evidence console", () => {
  it("has one functional stage navigation and foregrounds real records instead of a topology", () => {
    const html = render();
    expect(html.match(/<nav class="ed-stages current-route"/g)).toHaveLength(1);
    for (const id of ["task", "changes", "tests", "captures", "outputs"]) {
      expect(html).toContain(`href="#ed-${id}"`);
      expect(html).toContain(`id="ed-${id}"`);
    }
    expect(html).toContain("src/main.ts");
    expect(html).toContain("FAIL: expected 1, received 0");
    expect(html).toContain("Review the failed receipt");
    expect(html).not.toContain('class="field-blueprint"');
    expect(html).not.toContain('class="bp-stage bp-stage--five"');
    expect(html).not.toContain('class="rail"');
  });

  it("embeds each capture only once and supports original-image download without a remote dependency", () => {
    const image = solidPng(64, 64).toString("base64");
    const html = render({ posterScreenshots: [{ label: "Current capture", mimeType: "image/png", image }] });
    expect(html.split(`data:image/png;base64,${image}`).length - 1).toBe(1);
    expect(html).toContain('class="ed-shot"');
    expect(html).toContain('data-ed-capture="ed-shot-0"');
    expect(html).toContain("下载原始截图");
    expect(html).toContain(".ed-captures .ed-shot{display:block");
    expect(html).not.toMatch(/<(?:script|link|img)[^>]+(?:src|href)="https?:/);
  });

  it("integrates one delivery relay with an edge rail and compact review metadata above evidence", () => {
    const html = render({ generatedAt: "2026-09-27T12:00:00Z" });
    const heading = html.slice(html.indexOf('<div class="ed-bridge">'), html.indexOf('<div class="ed-workspace"'));
    const sidebar = html.slice(html.indexOf('<aside class="ed-side">'), html.indexOf('</aside>', html.indexOf('<aside class="ed-side">')));
    expect(heading).toContain('class="ed-station field-readout"');
    expect(heading).toContain("evidence-project");
    expect(heading).not.toContain('class="ed-stages current-route"');
    expect(html.indexOf('<nav class="ed-stages current-route"')).toBeLessThan(html.indexOf('<div class="ed-bridge">'));
    expect(html.indexOf('<aside class="ed-side">')).toBeLessThan(html.indexOf('<div class="ed-main">'));
    expect(html.match(/class="ed-verdict"/g)).toHaveLength(1);
    expect(sidebar).not.toContain('class="ed-station');
    expect(sidebar).toContain("Review the failed receipt");
    expect(sidebar).toContain("2026-09-27T12:00:00Z");
    expect(html).toContain("--paper:#fff;--ink:#191919");
    expect(html).not.toContain("background:#161b19");
  });

  it("escapes text and rejects malformed embedded image payloads", () => {
    const payload = '</script><img src=x onerror="alert(1)">';
    const html = render({ projectName: payload, task: payload, reportPath: payload, image: payload,
      gitFiles: [{ path: payload, additions: 1, deletions: 0 }],
      testReceipts: [{ command: payload, status: "failed", exitCode: 1, output: payload }],
      posterScreenshots: [{ label: payload, mimeType: "image/png", image: payload }], freshnessWarnings: [payload] });
    expect(html).not.toContain(payload);
    expect(html).toContain("&lt;/script&gt;&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).not.toContain('src="data:image/png');
    expect(html).not.toContain("background-image:url('data:image/webp");
  });

  it("keeps nonvisual and missing-data states distinct without claiming success", () => {
    const html = render({ locale: "en", gitState: "unavailable", gitFiles: [], testState: "unconfigured",
      testReceipts: [], visualProject: false, reportPath: "", fileCount: 0, testCount: 0 });
    expect(html).toContain('data-empty-state="git-unavailable"');
    expect(html).toContain('data-empty-state="tests-unconfigured"');
    expect(html).toContain('data-empty-state="outputs-missing"');
    expect(html).toContain('data-capture-state="optional"');
    expect(html).toContain("UI CAPTURES NOT REQUIRED");
    expect(html).not.toContain(">READY<");
  });

  it("ships parseable standalone interactions and a clear demo label", () => {
    const html = render({ demo: true });
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
    expect(scripts).toHaveLength(2);
    for (const script of scripts) expect(() => new Function(script)).not.toThrow();
    expect(html).toContain("演示数据");
    expect(html).toContain("navigator.clipboard.writeText");
    expect(html).toContain("URL.createObjectURL");
    expect(html).toContain("dijiang-yellow-transfer");
    expect(html).toContain("transform-box:view-box;transform-origin:160px 160px");
  });

  it("keeps a full-height transfer and an explicit accessible motion mode", () => {
    const html = render();
    expect(html).toContain("height:116%;bottom:auto;border:0;background:var(--signal)");
    expect(html).toContain("ed-loader-sheet-exit");
    expect(html).toContain('html[data-dijiang-motion=accessible] .loader.loader--field *{animation:none!important}');
    expect(html).toContain("loader.dataset.dijiangMotion=root.dataset.dijiangMotion");
    expect(html).toContain("loader.removeEventListener('animationend',onExit)");
    expect(html).not.toContain('if(event.target===node)remove()},{once:true})');
  });

  it("provides self-contained palette and bounded contour controls without green terminal defaults", () => {
    const html = render();
    for (const preference of ["palette", "accent", "background", "motion", "fps", "speed"]) expect(html).toContain(`data-ed-pref="${preference}"`);
    for (const color of ["#fff", "#191919", "#f2f2f2", "#fffa00", "#14d0d0"]) expect(html).toContain(color);
    expect(html).toContain("font-variant-numeric:tabular-nums");
    expect(html).toContain("ed-lateral-reveal");
    expect(html).toContain("html:not([data-loader-ready=true]) .dijiang-console{visibility:hidden}");
    expect(html).toContain("html[data-loader-ready=true] .dijiang-console{visibility:visible}");
    expect(html).toContain("document.hidden");
    expect(html).toContain('<option value="120">120 FPS</option>');
    expect(html).toContain("Math.min(devicePixelRatio||1,1.5)");
    expect(html).toContain("IntersectionObserver");
    expect(html).not.toContain('class="field-loader-diagram"');
  });

  it("uses neutral official-site colors, a dark loader and restrained navigation accents", () => {
    const html = render();
    expect(html).toContain(".loader.loader--field{--paper:#141414;--ink:#fff");
    expect(html).toContain(".ed-stages a[aria-current]{background:var(--inset)");
    expect(html).toContain(".ed-station{--ink:#fff;--paper:#191919");
    expect(html).toContain(".dijiang-console[data-status=failed] .ed-verdict>span{background:var(--signal);color:#191919;border:1px solid var(--ink)}");
    expect(html).toContain(".ed-receipt-mark{display:grid;place-items:center;width:16px;height:16px;color:#191919;background:var(--signal)");
    expect(html).toContain("getComputedStyle(canvas).getPropertyValue('--contour')");
    for (const oldColor of ["#e8e8e2", "#ddded6", "#fff500", "#1b1d19"]) expect(html).not.toContain(oldColor);
  });
});
