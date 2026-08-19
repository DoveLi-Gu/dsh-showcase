import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
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
  await writeFile(join(projectPath, "src", "App.tsx"), 'const showcaseStages = [{ id: "PROMPT", label: "提示" }, { id: "BUILD", label: "构建" }, { id: "TEST", label: "测试" }, { id: "CAPTURE", label: "捕获" }, { id: "SHIP", label: "交付" }];\nconst theme = "终末地帝江号 蓝色大肥鱼";\nconst controls = "theme-switch type=\\"range\\" export-actions setSelectedFile";\n<details />;\n', "utf8");
  await writeFile(join(projectPath, "src", "styles.css"), "@media (max-width: 980px) {}\n@media (max-width: 640px) {}\n", "utf8");
  await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify({
    version: 1,
    generatedAt: "2026-08-18T10:00:00.000Z",
    project: { name: "layout-fixture" },
    task: { id: "task-layout-fixture", goal: "汇总证据布局 token=secret-value", status: "completed", startedAt: "2026-08-18T09:00:00.000Z", completedAt: "2026-08-18T10:00:00.000Z", durationMs: 3600000 },
    git: { baseRef: "main", headRef: "HEAD", files: [{ path: "src/App.tsx", status: "modified", additions: 4, deletions: 1 }], summary: { changedFiles: 1, additions: 4, deletions: 1 } },
    tests: [{ id: "test-layout", command: "npm test", startedAt: "2026-08-18T09:50:00.000Z", durationMs: 1200, status: "passed", exitCode: 0, output: "ok" }],
    screenshots: [{ id: "mobile-after", label: "移动端界面证据", theme: "frontier-signal", viewport: { name: "mobile", width: 390, height: 844 }, url: "http://localhost:5173/?theme=frontier-signal", imagePath: "evidence/mobile.png", capturedAt: "2026-08-18T09:55:00.000Z", kind: "after" }],
    redaction: { originalLength: 120, redactedLength: 100, totalReplacements: 2, replacements: { token: 2 } },
  }, null, 2), "utf8");
  return projectPath;
}

function posterArticle(poster: string) {
  const start = poster.indexOf('<article class="poster');
  const end = poster.indexOf("</article><section class=\"evidence-page\"", start);
  return start >= 0 && end >= 0 ? poster.slice(start, end + "</article>".length) : poster;
}

describe("generateLayoutSummary", () => {
  it("writes a deterministic local Markdown summary and returns its metadata", async () => {
    const projectPath = await createProject();
    const result = await generateLayoutSummary({ projectPath });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

    expect(result).toMatchObject({ locale: "zh-CN", outputPath: ".showcase/layout-summary.md", posterPath: ".showcase/layout-poster.html", posterGenerated: true, theme: "终末地帝江号", themeKey: "frontier-signal", breakpoints: ["max-width: 980px", "max-width: 640px"], stages: ["提示", "构建", "测试", "捕获", "交付"], testCount: 1, redactionCount: 2 });
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
    expect(poster).toContain("data:image/png;base64,");
    expect(poster).toMatch(/class="loader loader--(?:fish|field)"/);
    expect(poster).toContain('class="field-loader-diagram"');
    expect(poster).toContain('class="field-loader-statusbar"');
    expect(poster).toContain('<strong title="layout-fixture">layout-fixture</strong>');
    expect(poster).toContain("data-loader-percent");
    expect(poster).toContain("data-loader-stage");
    expect(poster).toContain("requestAnimationFrame(tick)");
    expect(poster).toContain("@keyframes field-loader-exit");
    expect(poster).toContain("@keyframes field-loader-anchor");
    expect(poster).toContain("field-loader-exit-v3 3.8s");
    expect(poster).toContain("field-loader-diagram-scan-mobile-v3");
    expect(poster).toContain('querySelector(".loader")');
    expect(poster).toContain("prefers-reduced-motion");
    expect(poster).not.toContain("未捕获");
    expect(poster).not.toContain("secret-value");
    expect(poster).not.toContain(projectPath);
  });

  it("can stay Markdown-only without reading or creating poster assets", async () => {
    const projectPath = await createProject();
    const result = await generateLayoutSummary({ projectPath, generatePoster: false });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");

    expect(result).toMatchObject({ posterGenerated: false, themeKey: "frontier-signal" });
    expect(result.posterPath).toBeUndefined();
    expect(markdown).toContain("海报产物: 本次未生成");
    expect(markdown).toContain("移动端: 390 x 844");
    expect(markdown).not.toContain("data:image/png;base64,");
    await expect(readFile(join(projectPath, ".showcase", "layout-poster.html"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("validates Markdown-only screenshots instead of trusting missing files", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.screenshots[0].imagePath = "evidence/missing.png";
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, generatePoster: false });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");

    expect(markdown).toContain("## 截图视口\n- 未捕获");
    expect(markdown).not.toContain("移动端: 390 x 844");
  });

  it("keeps verified report screenshots in Markdown-only mode regardless of poster theme", async () => {
    const projectPath = await createProject();
    const result = await generateLayoutSummary({ projectPath, theme: "blue-big-fish", generatePoster: false });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");

    expect(result.themeKey).toBe("blue-big-fish");
    expect(markdown).toContain("移动端: 390 x 844");
  });

  it("warns when the report timestamp is older than sources or captures", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.generatedAt = "1970-01-01T00:00:00.000Z";
    report.screenshots[0].capturedAt = "2026-08-18T00:00:00.000Z";
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, generatePoster: false });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");

    expect(result.freshnessWarnings.length).toBeGreaterThan(0);
    expect(markdown).toContain("## 时效审查");
    expect(markdown).toContain("请重新");
  });

  it("warns when a screenshot file changed after its recorded capture time", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.generatedAt = "2099-01-01T00:00:00.000Z";
    report.screenshots[0].capturedAt = "2000-01-01T00:00:00.000Z";
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, generatePoster: false });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");

    expect(result.freshnessWarnings).toContain("截图 移动端: 390 x 844 的文件在采集时间后发生过修改，请重新采集。");
    expect(markdown).toContain("文件在采集时间后发生过修改");
  });

  it("caps freshness warnings for large changed-file reports", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.generatedAt = "1970-01-01T00:00:00.000Z";
    report.git.files = [];
    for (let index = 0; index < 12; index += 1) {
      const path = `src/fresh-${index}.ts`;
      await writeFile(join(projectPath, path), `export const value${index} = ${index};\n`, "utf8");
      report.git.files.push({ path, status: "modified", additions: 1, deletions: 0 });
    }
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, generatePoster: false });

    expect(result.freshnessWarnings).toHaveLength(5);
  });

  it("generates explicit English Markdown and poster output", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.screenshots[0].theme = "blue-big-fish";
    await writeFile(reportPath, JSON.stringify(report), "utf8");
    const result = await generateLayoutSummary({
      projectPath,
      locale: "en",
      outputPath: ".showcase/layout-summary.en.md",
      posterPath: ".showcase/layout-poster.en.html",
      theme: "blue-big-fish",
    });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

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
    expect(poster).toContain("font:900 clamp(3.5rem,5.1vw,5.5rem)/1");
    expect(poster).toContain("@keyframes route-swell");
    expect(poster).toContain("padding:clamp(.6rem,1vh,.9rem) 0 clamp(.4rem,.8vh,.6rem)");
    expect(poster).toContain("display:block;margin:0;padding:0;overflow:visible;background:transparent;box-shadow:none");
    expect(poster).not.toContain("background:#e8f5ff;box-shadow:.2rem 0 0 #e8f5ff");
    expect(poster).toContain('class="bubbles"');
    expect(poster).toMatch(/class="loader loader--(?:fish|field)"/);
    expect(poster).toContain('class="load-progress"');
    expect(poster).toContain('class="load-orbits"');
    expect(poster).toContain('class="load-whale"');
    expect(poster).toContain('class="load-bubbles"');
    expect(poster).toContain("animationend");
    expect(poster).toContain("function fallbackDelay()");
    expect(poster).toContain("setTimeout(remove,fallbackDelay())");
    expect(poster).toContain('aria-busy');
    expect(poster).toContain("load-current-soft");
    expect(poster).toContain("load-orbit-soft");
    expect(poster).toContain("load-bubble-soft");
    expect(poster).toContain("load-stage-soft");
    expect(poster).not.toContain(".loader *{animation:none!important}");
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

  it("propagates completed, partial, and failed status semantics across locales and themes", async () => {
    const cases = [
      { status: "completed", receiptStatus: "passed", exitCode: 0, zhBadge: "已验证", enBadge: "VERIFIED", zhSummary: "全部验证完成", enSummary: "VERIFIED / ALL CHECKS PASSED", zhDeliverable: "可交付", enDeliverable: "READY", zhOutput: "可交付", enOutput: "READY", symbol: "✓" },
      { status: "partial", receiptStatus: "skipped", exitCode: 0, zhBadge: "需要复核", enBadge: "NEEDS REVIEW", zhSummary: "部分完成 / 需要复核", enSummary: "PARTIAL / REVIEW REQUIRED", zhDeliverable: "待复核", enDeliverable: "REVIEW", zhOutput: "待复核", enOutput: "REVIEW", symbol: "!" },
      { status: "failed", receiptStatus: "failed", exitCode: 1, zhBadge: "执行失败", enBadge: "FAILED", zhSummary: "验证失败 / 不可交付", enSummary: "VERIFICATION FAILED", zhDeliverable: "未通过", enDeliverable: "BLOCKED", zhOutput: "不可交付", enOutput: "BLOCKED", symbol: "×" },
    ] as const;

    for (const locale of ["zh-CN", "en"] as const) {
      for (const theme of ["frontier-signal", "blue-big-fish"] as const) {
        for (const item of cases) {
          const projectPath = await createProject();
          const reportPath = join(projectPath, ".showcase", "report.json");
          const report = JSON.parse(await readFile(reportPath, "utf8"));
          report.task.status = item.status;
          report.screenshots[0].theme = theme;
          report.tests = [
            { ...report.tests[0], status: item.receiptStatus, exitCode: item.exitCode, output: item.status },
            { ...report.tests[0], id: "test-skipped", command: "npm run optional", status: "skipped", exitCode: 0, output: "skipped" },
          ];
          await writeFile(reportPath, JSON.stringify(report), "utf8");

          const result = await generateLayoutSummary({
            projectPath,
            locale,
            theme,
            outputPath: ".showcase/status-" + locale + "-" + theme + "-" + item.status + ".md",
            posterPath: ".showcase/status-" + locale + "-" + theme + "-" + item.status + ".html",
          });
          const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
          const poster = await readFile(join(projectPath, result.posterPath!), "utf8");
          const article = posterArticle(poster);
          const badge = locale === "zh-CN" ? item.zhBadge : item.enBadge;
          const summary = locale === "zh-CN" ? item.zhSummary : item.enSummary;
          const deliverable = locale === "zh-CN" ? item.zhDeliverable : item.enDeliverable;
          const outcomeLabel = theme === "blue-big-fish"
            ? (locale === "zh-CN" ? item.zhOutput : item.enOutput)
            : deliverable;
          const ariaPrefix = locale === "zh-CN" ? "状态：" : "Status: ";
          const taskStatusLabel = locale === "zh-CN" ? item.zhBadge : item.enBadge;

          expect(markdown).toContain((locale === "zh-CN" ? "状态: " : "Status: ") + taskStatusLabel);
          expect(article).toContain('data-status="' + item.status + '"');
          expect(article).toContain('aria-label="' + ariaPrefix + badge + '"');
          expect(article).toContain(theme === "blue-big-fish" ? summary : badge);
          expect(article).toContain(deliverable);
          expect(article).toContain('aria-label="' + ariaPrefix + outcomeLabel + '"');
          expect(article).toContain('aria-hidden="true">' + item.symbol + "</span>");
          if (theme === "blue-big-fish") {
            expect(article).toContain('<li data-status="skipped"');
            expect(article).toContain(locale === "zh-CN" ? "已跳过" : "SKIPPED");
            if (item.status === "completed") {
              expect(article).toContain('<li data-status="passed"');
              expect(article).toContain(locale === "zh-CN" ? "✓</span> 已通过" : "✓</span> PASSED");
              expect(article).not.toContain('data-status="failed"');
            } else if (item.status === "failed") {
              expect(article).toContain('<li data-status="failed"');
              expect(article).toContain(locale === "zh-CN" ? "×</span> 执行失败" : "×</span> FAILED");
              expect(article).not.toContain('data-status="failed"><span>pytest</span><b>✓');
            }
          }

          const successClaim = locale === "zh-CN" ? ">可交付<" : ">READY<";
          if (item.status === "completed") {
            expect(article).toContain(successClaim);
          } else {
            expect(article).not.toContain(successClaim);
          }
        }
      }
    }
  });

  it("isolates screenshot evidence from a different poster theme", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    delete report.screenshots[0].theme;
    report.screenshots[0].url = "http://127.0.0.1:4175/?theme=fish";
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "frontier-signal" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

    expect(poster).toContain("跨主题截图已隔离");
    expect(poster).toContain("00 / 01 主题匹配");
    expect(poster).toContain("当前主题暂无匹配截图");
    expect(poster).toContain('data-state="isolated"');
    expect(poster).toContain("已隔离 / 图像未嵌入");
    expect(poster).toContain('class="evidence-page__guard-action"');
    expect(poster).toContain("重新采集当前主题");
    expect(poster).toContain("01<small>待补视口</small>");
    expect(poster).not.toContain("data:image/png;base64,");

    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    const screenshotSection = markdown.slice(markdown.indexOf("## 截图视口"), markdown.indexOf("## Git 改动"));
    expect(screenshotSection).toContain("## 截图视口\n- 未捕获");
    expect(screenshotSection).not.toContain("移动端: 390 x 844");
  });

  it("keeps cross-theme isolation visible beside matching evidence", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.screenshots.push({
      theme: "blue-big-fish",
      viewport: { name: "desktop", width: 1440, height: 900 },
      imagePath: "evidence/mobile.png",
    });
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "frontier-signal" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

    expect(poster).toContain("data:image/png;base64,");
    expect(poster).toContain("跨主题截图已隔离");
    expect(poster).toContain("evidence-page__guard--compact");
    expect(poster).toContain("01 / 02 主题匹配");
  });

  it("distinguishes unclassified screenshots from known cross-theme captures", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    delete report.screenshots[0].theme;
    delete report.screenshots[0].url;
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "frontier-signal" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

    expect(poster).toContain("未标注主题的截图未嵌入");
    expect(poster).toContain('data-state="unclassified"');
    expect(poster).toContain("待标注 / 图像未嵌入");
    expect(poster).not.toContain("跨主题截图已隔离");
    expect(poster).not.toContain("data:image/png;base64,");
  });

  it("uses at most three successfully loaded theme captures across every output", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.screenshots = [
      { theme: "frontier-signal", viewport: { name: "desktop", width: 1440, height: 900 }, imagePath: "evidence/mobile.png" },
      { theme: "frontier-signal", viewport: { name: "tablet", width: 834, height: 1112 }, imagePath: "evidence/mobile.png" },
      { theme: "frontier-signal", viewport: { name: "mobile", width: 390, height: 844 }, imagePath: "evidence/mobile.png" },
      { theme: "frontier-signal", viewport: { name: "desktop", width: 1280, height: 720 }, imagePath: "evidence/mobile.png" },
    ];
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "frontier-signal" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");

    expect((poster.match(/data:image\/png;base64,/g) ?? [])).toHaveLength(3);
    expect(poster).toContain("03 / 03 主题匹配");
    expect(poster).not.toContain("桌面端: 1280 x 720");
    expect(markdown).not.toContain("桌面端: 1280 x 720");
  });

  it("keeps the capped poster set aligned with mixed-theme records and footer text", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.screenshots = [
      { theme: "frontier-signal", viewport: { name: "desktop", width: 1440, height: 900 }, imagePath: "evidence/mobile.png" },
      { theme: "frontier-signal", viewport: { name: "tablet", width: 834, height: 1112 }, imagePath: "evidence/mobile.png" },
      { theme: "frontier-signal", viewport: { name: "mobile", width: 390, height: 844 }, imagePath: "evidence/mobile.png" },
      { theme: "frontier-signal", viewport: { name: "desktop", width: 1280, height: 720 }, imagePath: "evidence/mobile.png" },
      { theme: "blue-big-fish", viewport: { name: "desktop", width: 1440, height: 900 }, imagePath: "evidence/mobile.png" },
      { viewport: { name: "tablet", width: 800, height: 1000 }, imagePath: "evidence/mobile.png" },
    ];
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "frontier-signal" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    const primaryPoster = poster.slice(0, poster.indexOf('<section class="evidence-page"'));

    expect((poster.match(/data:image\/png;base64,/g) ?? [])).toHaveLength(3);
    expect(poster).toContain("03 / 05 主题匹配");
    expect(poster).toContain("非匹配截图未嵌入");
    expect(poster).toContain("跨主题截图已隔离");
    expect(poster).toContain("桌面端: 1440 x 900");
    expect(poster).toContain("平板端: 834 x 1112");
    expect(poster).toContain("移动端: 390 x 844");
    expect(poster).not.toContain("桌面端: 1280 x 720");
    expect(poster).toContain("平板端: 800 x 1000");
    expect(primaryPoster).not.toContain("桌面端: 1280 x 720");
    expect(primaryPoster).not.toContain("平板端: 800 x 1000");
    expect(markdown).toContain("桌面端: 1440 x 900");
    expect(markdown).toContain("平板端: 834 x 1112");
    expect(markdown).toContain("移动端: 390 x 844");
    expect(markdown).not.toContain("桌面端: 1280 x 720");
  });

  it("does not claim a capture when the matching image cannot be loaded", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.screenshots[0].imagePath = "evidence/missing.png";
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "frontier-signal" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");

    expect(poster).toContain("当前主题有不可读证据未嵌入");
    expect(poster).toContain("00 / 01 主题匹配");
    expect(poster).toContain('data-state="invalid"');
    expect(poster).toContain("不可读 / 图像未嵌入");
    expect(poster).toContain("01<small>待补视口</small>");
    expect(poster).not.toContain("data:image/png;base64,");
    expect(markdown).toContain("## 截图视口\n- 未捕获");
  });

  it("rejects malformed reports with field-level diagnostics", async () => {
    const projectPath = await createProject();
    await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify({}), "utf8");

    await expect(generateLayoutSummary({ projectPath })).rejects.toThrow(/Invalid report JSON: version:/);
  });

  it("does not embed a matching record whose bytes are not a real image", async () => {
    const projectPath = await createProject();
    await writeFile(join(projectPath, "evidence", "broken.png"), Buffer.from("not an image"), "utf8");
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.screenshots[0].imagePath = "evidence/broken.png";
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "frontier-signal" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

    expect(poster).toContain("当前主题有不可读证据未嵌入");
    expect(poster).toContain('data-state="invalid"');
    expect(poster).toContain("00 / 01 主题匹配");
    expect(poster).not.toContain("data:image/png;base64,bm90IGFuIGltYWdl");
  });

  it("rejects a screenshot symlink that resolves outside the project", async () => {
    const projectPath = await createProject();
    const outsidePath = await mkdtemp(join(tmpdir(), "dsh-showcase-outside-image-"));
    temporaryDirectories.push(outsidePath);
    await writeFile(join(outsidePath, "capture.png"), Buffer.from("not an image"));
    try {
      await symlink(join(outsidePath, "capture.png"), join(projectPath, "evidence", "linked.png"));
    } catch {
      return;
    }
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.screenshots[0].imagePath = "evidence/linked.png";
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    await expect(generateLayoutSummary({ projectPath })).rejects.toThrow("screenshot imagePath must resolve inside projectPath");
  });

  it("skips an outside screenshot symlink in Markdown-only mode", async () => {
    const projectPath = await createProject();
    const outsidePath = await mkdtemp(join(tmpdir(), "dsh-showcase-outside-markdown-image-"));
    temporaryDirectories.push(outsidePath);
    await writeFile(join(outsidePath, "capture.png"), Buffer.from("not an image"));
    try {
      await symlink(join(outsidePath, "capture.png"), join(projectPath, "evidence", "linked-markdown.png"));
    } catch {
      return;
    }
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.screenshots[0].theme = "blue-big-fish";
    report.screenshots[0].imagePath = "evidence/linked-markdown.png";
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "frontier-signal", generatePoster: false });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");

    expect(markdown).toContain("## 截图视口\n- 未捕获");
    expect(markdown).not.toContain("移动端: 390 x 844");
  });

  it("rejects an output symlink that resolves outside the project", async () => {
    const projectPath = await createProject();
    const outsidePath = await mkdtemp(join(tmpdir(), "dsh-showcase-outside-output-"));
    temporaryDirectories.push(outsidePath);
    const outsideFile = join(outsidePath, "summary.md");
    await writeFile(outsideFile, "original", "utf8");
    try {
      await symlink(outsideFile, join(projectPath, ".showcase", "linked-summary.md"));
    } catch {
      return;
    }

    await expect(generateLayoutSummary({ projectPath, outputPath: ".showcase/linked-summary.md" })).rejects.toThrow("outputPath must resolve inside projectPath");
    expect(await readFile(outsideFile, "utf8")).toBe("original");
  });

  it("redacts provider keys and bounds oversized poster copy", async () => {
    const projectPath = await createProject();
    const secret = "sk-test-000000000000000000000000000000000000";
    const longText = "X".repeat(10_000);
    const reportPath = join(projectPath, ".showcase", "report.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    report.project = { name: longText };
    report.task.goal = `${secret} C:\\Users\\victim\\My Secret\\token.txt ${longText}`;
    await writeFile(reportPath, JSON.stringify(report), "utf8");

    const result = await generateLayoutSummary({ projectPath });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");

    expect(poster).not.toContain(secret);
    expect(markdown).not.toContain(secret);
    expect(poster).not.toContain("victim");
    expect(markdown).not.toContain("victim");
    expect(poster).toContain("...");
    // The complete two-theme report includes route and manifest evidence in
    // addition to the bounded project copy.
    expect(poster.length).toBeLessThan(105_000);
  });

  it("rejects unsupported locales", async () => {
    const projectPath = await createProject();
    await expect(generateLayoutSummary({ projectPath, locale: "fr" as never })).rejects.toThrow("locale must be either zh-CN or en");
  });

  it("rejects unsupported themes", async () => {
    const projectPath = await createProject();
    await expect(generateLayoutSummary({ projectPath, theme: "all" as never })).rejects.toThrow("theme must be either frontier-signal or blue-big-fish");
  });

  it("rejects a non-boolean poster switch", async () => {
    const projectPath = await createProject();
    await expect(generateLayoutSummary({ projectPath, generatePoster: "yes" as never })).rejects.toThrow("generatePoster must be a boolean");
  });

  it("rejects report, Markdown, and poster paths that resolve to the same file", async () => {
    const projectPath = await createProject();
    const reportPath = join(projectPath, ".showcase", "report.json");
    const originalReport = await readFile(reportPath, "utf8");

    await expect(generateLayoutSummary({ projectPath, outputPath: ".showcase/report.json" }))
      .rejects.toThrow("reportPath and outputPath must resolve to different files");
    await expect(generateLayoutSummary({
      projectPath,
      outputPath: ".showcase/collision.html",
      posterPath: ".showcase/collision.html",
    })).rejects.toThrow("outputPath and posterPath must resolve to different files");
    await expect(generateLayoutSummary({ projectPath, posterPath: ".showcase/report.json" }))
      .rejects.toThrow("reportPath and posterPath must resolve to different files");

    expect(await readFile(reportPath, "utf8")).toBe(originalReport);
  });

  it("keeps generated artifacts inside .showcase with safe file extensions", async () => {
    const projectPath = await createProject();
    const packagePath = join(projectPath, "package.json");
    await writeFile(packagePath, '{"name":"sentinel"}', "utf8");

    await expect(generateLayoutSummary({ projectPath, generatePoster: false, outputPath: "package.json" }))
      .rejects.toThrow("outputPath must resolve inside the project's .showcase directory");
    await expect(generateLayoutSummary({ projectPath, generatePoster: false, outputPath: ".showcase/summary.txt" }))
      .rejects.toThrow("outputPath must use one of these extensions: .md, .markdown");
    await expect(generateLayoutSummary({ projectPath, posterPath: ".showcase/poster.md" }))
      .rejects.toThrow("posterPath must use one of these extensions: .html, .htm");

    expect(await readFile(packagePath, "utf8")).toBe('{"name":"sentinel"}');
  });

  it("does not replace the Markdown summary when poster output cannot be committed", async () => {
    const projectPath = await createProject();
    const outputPath = join(projectPath, ".showcase", "layout-summary.md");
    await writeFile(outputPath, "previous summary", "utf8");
    // Keep a valid HTML suffix so the failure occurs during the staged rename,
    // after poster generation, rather than during option validation.
    await mkdir(join(projectPath, ".showcase", "poster-target.html"));

    await expect(generateLayoutSummary({
      projectPath,
      posterPath: ".showcase/poster-target.html",
    })).rejects.toThrow();

    expect(await readFile(outputPath, "utf8")).toBe("previous summary");
  });

  it("does not replace the poster when Markdown output cannot be committed", async () => {
    const projectPath = await createProject();
    const posterPath = join(projectPath, ".showcase", "layout-poster.html");
    await writeFile(posterPath, "previous poster", "utf8");
    await mkdir(join(projectPath, ".showcase", "layout-summary.md"));

    await expect(generateLayoutSummary({ projectPath })).rejects.toThrow();

    expect(await readFile(posterPath, "utf8")).toBe("previous poster");
  });

  it("rejects report and output paths that escape the project", async () => {
    const projectPath = await createProject();

    await expect(generateLayoutSummary({ projectPath, reportPath: "../outside.json" })).rejects.toThrow("reportPath must resolve inside projectPath");
    await expect(generateLayoutSummary({ projectPath, outputPath: "../outside.md" })).rejects.toThrow("outputPath must resolve inside projectPath");
    await expect(generateLayoutSummary({ projectPath, posterPath: "../outside.html" })).rejects.toThrow("posterPath must resolve inside projectPath");
  });
});
