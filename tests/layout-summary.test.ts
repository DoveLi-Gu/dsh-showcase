import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateLayoutSummary } from "../plugin/layout-summary.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function createProject() {
  const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-layout-"));
  temporaryDirectories.push(projectPath);
  await mkdir(join(projectPath, "src"), { recursive: true });
  await mkdir(join(projectPath, ".showcase"), { recursive: true });
  await mkdir(join(projectPath, "evidence"), { recursive: true });
  await writeFile(join(projectPath, "evidence", "mobile.png"), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"));
  await writeFile(join(projectPath, "src", "App.tsx"), 'const showcaseStages = [{ id: "PROMPT", label: "提示" }, { id: "BUILD", label: "构建" }, { id: "TEST", label: "测试" }, { id: "CAPTURE", label: "捕获" }, { id: "SHIP", label: "交付" }];\nconst theme = "边境信号 蓝色大肥鱼";\nconst controls = "theme-switch type=\\"range\\" export-actions setSelectedFile";\n<details />;\n', "utf8");
  await writeFile(join(projectPath, "src", "styles.css"), "@media (max-width: 980px) {}\n@media (max-width: 640px) {}\n", "utf8");
  await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify({
    version: 1,
    task: { goal: "汇总证据布局 token=secret-value", status: "completed" },
    git: { baseRef: "main", headRef: "HEAD", files: [{ path: "src/App.tsx", status: "modified", additions: 4, deletions: 1 }] },
    tests: [{ command: "npm test", status: "passed", exitCode: 0 }],
    screenshots: [{ viewport: { name: "mobile", width: 390, height: 844 }, imagePath: "evidence/mobile.png" }],
    redaction: { totalReplacements: 2, replacements: { token: 2 } },
  }, null, 2), "utf8");
  return projectPath;
}

describe("generateLayoutSummary", () => {
  it("writes a deterministic local Markdown summary and returns its metadata", async () => {
    const projectPath = await createProject();
    const result = await generateLayoutSummary({ projectPath });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    const poster = await readFile(join(projectPath, result.posterPath), "utf8");

    expect(result).toMatchObject({ locale: "zh-CN", outputPath: ".showcase/layout-summary.md", posterPath: ".showcase/layout-poster.html", theme: "边境信号", breakpoints: ["max-width: 980px", "max-width: 640px"], stages: ["提示", "构建", "测试", "捕获", "交付"], testCount: 1, redactionCount: 2 });
    expect(markdown).toContain("# 布局摘要");
    expect(markdown).toContain("海报产物: .showcase/layout-poster.html");
    expect(markdown).toContain("## 截图视口");
    expect(markdown).toContain("移动端: 390 x 844");
    expect(markdown).toContain("状态: 已验证");
    expect(markdown).toContain("令牌: 2");
    expect(markdown).not.toContain("secret-value");
    expect(markdown).not.toContain(projectPath);
    expect(poster).toContain('<html lang="zh-CN">');
    expect(poster).toContain("已验证");
    expect(poster).toContain("提示");
    expect(poster).toContain('data-theme="frontier-signal"');
    expect(poster).toContain("data:image/webp;base64,");
    expect(poster).toContain('class="loader"');
    expect(poster).toContain('querySelector(".loader")');
    expect(poster).toContain("prefers-reduced-motion");
    expect(poster).not.toContain("未捕获");
    expect(poster).not.toContain("secret-value");
    expect(poster).not.toContain(projectPath);
  });

  it("generates explicit English Markdown and poster output", async () => {
    const projectPath = await createProject();
    const result = await generateLayoutSummary({
      projectPath,
      locale: "en",
      outputPath: ".showcase/layout-summary.en.md",
      posterPath: ".showcase/layout-poster.en.html",
      theme: "blue-big-fish",
    });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    const poster = await readFile(join(projectPath, result.posterPath), "utf8");

    expect(result).toMatchObject({ locale: "en", theme: "Blue Big Fish", stages: ["PROMPT", "BUILD", "TEST", "CAPTURE", "SHIP"] });
    expect(markdown).toContain("# Layout Summary");
    expect(markdown).toContain("## Screenshot viewports");
    expect(markdown).toContain("mobile: 390 x 844");
    expect(markdown).not.toContain("secret-value");
    expect(poster).toContain('<html lang="en">');
    expect(poster).toContain("VERIFIED");
    expect(poster).toContain("PROMPT");
    expect(poster).toContain('data-theme="blue-big-fish"');
    expect(poster).toContain("data:image/webp;base64,");
    expect(poster).toContain("RESPONSIVE EVIDENCE");
    expect(poster).toContain("data:image/png;base64,");
    expect(poster).toContain("@keyframes current-drift");
    expect(poster).toContain("@keyframes evidence-scan");
    expect(poster).toContain('class="evidence-page"');
    expect(poster).toContain("overflow-y:auto");
    expect(poster).toContain("object-fit:contain");
    expect(poster).toContain('loading="lazy"');
    expect(poster).not.toContain("html,body{width:100%;height:100%;overflow:hidden}");
    expect(poster).toContain("@keyframes light-sweep");
    expect(poster).toContain("@keyframes bubble-rise");
    expect(poster).toContain("@media(max-height:48rem) and (min-width:56.25rem)");
    expect(poster).toContain("@media(min-width:90rem){html{font-size:17px}}");
    expect(poster).toContain("@media(min-width:120rem){html{font-size:18px}}");
    expect(poster).toContain("@media(min-width:160rem){html{font-size:20px}}");
    expect(poster).toContain("font:900 clamp(3.5rem,5.1vw,5.5rem)/.9");
    expect(poster).toContain("@keyframes route-swell");
    expect(poster).toContain('class="bubbles"');
    expect(poster).toContain('class="loader"');
    expect(poster).toContain('class="portrait-field"');
    expect(poster).toContain('class="whale-school"');
    expect(poster).toContain('class="poster-layout"');
    expect(poster).toContain('class="current-route"');
    expect(poster).toContain('class="route-evidence delivery-manifest"');
    expect(poster).toContain('class="manifest-grid"');
    expect(poster).toContain('class="manifest-block"');
    expect(poster).toContain('class="manifest-output"');
    expect(poster).toContain('class="manifest-output__path"');
    expect(poster).toContain('class="manifest-output__label"');
    expect(poster).toContain('class="manifest-output__meta"');
    expect(poster).toContain("@keyframes manifest-node-pulse");
    expect(poster).toContain(".showcase/report.json");
    expect(poster).toContain(".showcase/layout-summary.en.md");
    expect(poster).toContain(".showcase/layout-poster.en.html");
    expect(poster).toContain("grid-template-areas:'copy portrait' 'route portrait' 'metrics portrait' 'evidence evidence' 'footer footer'");
    expect(poster).toContain(".copy{grid-area:copy");
    expect(poster).toContain(".current-route{position:relative;grid-area:route");
    expect(poster).toContain(".metrics{grid-area:metrics");
    expect(poster).toContain(".route-evidence{position:relative;grid-area:evidence");
    expect(poster).toContain(".footer{grid-area:footer");
    expect(poster).not.toContain(".copy{position:absolute");
    expect(poster).not.toContain('class="rail"');
    expect(poster).not.toContain('class="route-proof"');
    expect(poster).not.toContain(".evidence-board{position:absolute");
    expect(poster).not.toContain('class="manifest"');
    expect(poster).not.toContain('class="portrait-wash"');
    expect(poster).toContain("@keyframes whale-drift");
    expect(poster).not.toContain('class="art-panel"');
    expect(poster).not.toContain("not captured");
    expect(poster).not.toContain("secret-value");
  });

  it("rejects unsupported locales", async () => {
    const projectPath = await createProject();
    await expect(generateLayoutSummary({ projectPath, locale: "fr" as never })).rejects.toThrow("locale must be either zh-CN or en");
  });

  it("rejects unsupported themes", async () => {
    const projectPath = await createProject();
    await expect(generateLayoutSummary({ projectPath, theme: "all" as never })).rejects.toThrow("theme must be either frontier-signal or blue-big-fish");
  });

  it("rejects report and output paths that escape the project", async () => {
    const projectPath = await createProject();

    await expect(generateLayoutSummary({ projectPath, reportPath: "../outside.json" })).rejects.toThrow("reportPath must resolve inside projectPath");
    await expect(generateLayoutSummary({ projectPath, outputPath: "../outside.md" })).rejects.toThrow("outputPath must resolve inside projectPath");
    await expect(generateLayoutSummary({ projectPath, posterPath: "../outside.html" })).rejects.toThrow("posterPath must resolve inside projectPath");
  });
});
