import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateLayoutSummary } from "../plugin/layout-summary.js";

const posterModulePath = "../plugin/poster-html.js" as string;
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

function posterData(overrides: Record<string, unknown> = {}) {
  return {
    locale: "zh-CN",
    theme: "blue-big-fish",
    image: "",
    projectName: "poster-enhancement-fixture",
    task: "Verify semantic empty states and theme-scoped materials.",
    stages: ["规划", "构建", "捕获", "验证", "交付"],
    fileCount: 0,
    passedTests: 0,
    testCount: 0,
    redactionCount: 0,
    posterScreenshots: [],
    evidenceImages: [],
    evidenceViewports: [],
    isolatedEvidenceViewports: [],
    unclassifiedEvidenceViewports: [],
    invalidEvidenceViewports: [],
    evidenceThemeName: "蓝色大肥鱼",
    gitRange: "main..HEAD",
    gitState: "clean",
    testState: "unconfigured",
    visualProject: true,
    taskStatus: "partial",
    taskStatusLabel: "需要复核",
    gitFileCount: 0,
    gitFiles: [],
    testReceipts: [],
    reportPath: ".showcase/report.json",
    summaryPath: ".showcase/layout-summary.md",
    posterPath: ".showcase/layout-poster.html",
    ...overrides,
  };
}

async function renderPoster(overrides: Record<string, unknown> = {}) {
  const { createStyledPosterHtml } = await import(posterModulePath);
  return createStyledPosterHtml(posterData(overrides)) as string;
}

describe("poster material and empty-state enhancements", () => {
  it("gives the Dijiang loader a scoped industrial boot sequence", async () => {
    const dijiang = await renderPoster({ theme: "frontier-signal", evidenceThemeName: "终末地帝江号" });
    const fish = await renderPoster({ theme: "blue-big-fish" });

    expect(dijiang).toContain('class="field-loader-instrument"');
    expect(dijiang).toContain("instrument-tick--major");
    expect(dijiang).toContain("dijiang-loader-sweep-rotate");
    expect(dijiang).toContain("dijiang-loader-scan-final");
    expect(dijiang).toContain("dijiang-yellow-transfer");
    expect(dijiang).toContain("clip-path:polygon(0 0,92% 0,100% 100%,8% 100%)");
    expect(dijiang).toContain("DIJIANG INDUSTRIES");
    expect(dijiang).toContain("dijiang-reference-reduced-exit");
    expect(dijiang).toContain('data-dijiang-motion="full"');
    expect(dijiang).toContain("dijiang-progress-head");
    expect(dijiang).toContain("dijiang-instrument-core-spin");
    expect(dijiang).toContain("background:#0b0f0d");
    expect(dijiang).toContain("@media(prefers-reduced-motion:reduce)");
    expect(dijiang).not.toContain(".loader.loader--fish .field-loader-instrument");
    expect(fish).not.toContain("field-loader-instrument");
    expect(fish).not.toContain("dijiang-loader-sweep-rotate");
  });

  it("scopes liquid glass to key fish-theme evidence surfaces with fallbacks", async () => {
    const poster = await renderPoster();

    expect(poster).toContain("@supports ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px)))");
    expect(poster).toContain("@supports not ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px)))");
    expect(poster).toContain(".metric{-webkit-backdrop-filter:blur(12px) saturate(1.16);backdrop-filter:blur(12px) saturate(1.16)");
    expect(poster).toContain(".delivery-manifest{-webkit-backdrop-filter:blur(14px) saturate(1.18);backdrop-filter:blur(14px) saturate(1.18)");
    expect(poster).toContain(".evidence-page .shot{-webkit-backdrop-filter:blur(10px) saturate(1.12);backdrop-filter:blur(10px) saturate(1.12)");
    expect(poster).toContain("@media(max-width:56.249rem){.metric,.delivery-manifest,.evidence-page .shot,.evidence-page__guard{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}");
    expect(poster).toContain("@media(hover:hover) and (pointer:fine)");
    expect(poster).not.toContain(".manifest-block{-webkit-backdrop-filter");
    expect(poster).not.toContain(".manifest-output{-webkit-backdrop-filter");
    expect(poster).not.toContain(".portrait-field{-webkit-backdrop-filter");
  });

  it("keeps the Dijiang poster industrial instead of applying liquid glass", async () => {
    const poster = await renderPoster({ theme: "frontier-signal", evidenceThemeName: "终末地帝江号" });

    expect(poster).toContain('data-theme="frontier-signal"');
    expect(poster).toContain('class="field-readout"');
    expect(poster).toContain("LOCAL / VERIFIED");
    expect(poster).toContain(".manifest-block .manifest-empty{display:block");
    expect(poster).not.toContain("backdrop-filter");
    expect(poster).not.toContain("fish-glass-flow");
  });

  it("keeps both public themes equally data-complete for any project", async () => {
    const sharedData = {
      projectName: "alpha-app",
      task: "完成 alpha-app 的交付",
      stages: ["提示", "构建", "测试", "捕获", "交付"],
      fileCount: 7,
      passedTests: 3,
      testCount: 3,
      redactionCount: 2,
      gitState: "changed",
      gitFileCount: 1,
      gitFiles: [{ path: "src/App.tsx", additions: 24, deletions: 6 }],
      testState: "passed",
      testReceipts: [{ command: "npm test", exitCode: 0, status: "passed" }],
      reportPath: ".showcase/report.json",
      summaryPath: ".showcase/layout-summary.md",
      posterPath: ".showcase/layout-poster.html",
    };
    const posters = await Promise.all([
      renderPoster({ ...sharedData, theme: "frontier-signal", evidenceThemeName: "终末地帝江号" }),
      renderPoster({ ...sharedData, theme: "blue-big-fish", evidenceThemeName: "蓝色大肥鱼" }),
    ]);

    for (const poster of posters) {
      expect(poster).toContain('class="current-route"');
      expect(poster).toContain('class="route-evidence delivery-manifest"');
      expect(poster).toContain('class="evidence-page"');
      expect(poster).toContain("alpha-app");
      expect(poster).toContain("完成 alpha-app 的交付");
      expect(poster).toContain("src/App.tsx");
      expect(poster).toContain("npm test");
      expect(poster).toContain(".showcase/report.json");
      expect(poster).toContain(".showcase/layout-summary.md");
      expect(poster).toContain(".showcase/layout-poster.html");
      expect(poster).toContain("7");
      expect(poster).not.toContain("dsh-showcase");
    }
  });

  it("uses localized neutral defaults when direct poster data is incomplete", async () => {
    const { createStyledPosterHtml } = await import(posterModulePath);
    const dijiang = createStyledPosterHtml({ theme: "frontier-signal", locale: "zh-CN", projectName: "", task: "", stages: null } as never);
    const fish = createStyledPosterHtml({ theme: "blue-big-fish" } as never);
    const fallback = createStyledPosterHtml(undefined as never);

    expect(dijiang).toContain("未命名项目");
    expect(dijiang).toContain("任务未记录");
    expect(dijiang).toContain("<em>提示</em>");
    expect(dijiang).toContain('class="route-evidence delivery-manifest"');
    expect(dijiang).not.toContain("dsh-showcase");
    expect(fish).toContain("未命名项目");
    expect(fish).toContain("任务未记录");
    expect(fish).toContain("<em>提示</em>");
    expect(fish).not.toContain("undefined");
    expect(fallback).toContain("未命名项目");
    expect(fallback).toContain("任务未记录");
  });

  it("keeps Dijiang empty-state evidence explicit across desktop and narrow-screen CSS", async () => {
    const poster = await renderPoster({
      theme: "frontier-signal",
      evidenceThemeName: "终末地帝江号",
      gitRange: "NO_GIT..NO_GIT",
      gitState: "unavailable",
      testState: "unconfigured",
      visualProject: false,
      taskStatus: "partial",
      taskStatusLabel: "需要复核",
    });

    expect(poster).toContain('data-metric-state="unavailable"><b>--</b><small>本地文件模式');
    expect(poster).toContain('data-metric-state="unconfigured"><b>--</b><small>测试未配置');
    expect(poster).toContain('data-capture-state="optional"');
    expect(poster).toContain("此项目无需界面截图");
    expect(poster).toContain("@media(max-width:56.249rem){.evidence-page__guard");
    expect(poster).toContain(".evidence-page__guard-empty{grid-template-columns:1fr;grid-template-areas:'slot' 'title' 'detail'");
    expect(poster).toContain("overflow-wrap:anywhere;word-break:break-all");
    expect(poster).not.toContain("重新采集当前主题");
    expect(poster).not.toContain(">可交付<");
  });

  it("renders distinct Chinese states for no Git, no tests, no output, and optional captures", async () => {
    const poster = await renderPoster({
      gitRange: "NO_GIT..NO_GIT",
      gitState: "unavailable",
      visualProject: false,
      reportPath: "",
      summaryPath: "",
      posterPath: "",
    });

    expect(poster).toContain('data-git-state="unavailable"');
    expect(poster).toContain('data-test-state="unconfigured"');
    expect(poster).toContain('data-output-state="empty"');
    expect(poster).toContain('data-empty-state="git-unavailable"');
    expect(poster).toContain("未检测到 Git 仓库");
    expect(poster).toContain("本地文件凭据模式");
    expect(poster).toContain('data-empty-state="tests-unconfigured"');
    expect(poster).toContain("未配置验证命令");
    expect(poster).toContain('data-metric-state="unavailable"><b>--</b><small>本地文件模式</small>');
    expect(poster).toContain('data-metric-state="unconfigured"><b>--</b><small>测试未配置</small>');
    expect(poster).not.toContain("0/0</b><small>通过测试");
    expect(poster).toContain('data-empty-state="outputs-missing"');
    expect(poster).toContain("未生成本地产物");
    expect(poster).toContain('data-capture-state="optional"');
    expect(poster).toContain("此项目无需界面截图");
    expect(poster).toContain("00 / 00 截图非必需");
    expect(poster).not.toContain("重新采集当前主题");
    expect(poster).not.toContain("<button");
    expect(poster).not.toContain(" href=");
  });

  it("asks visual projects for captures while reporting a clean Git workspace in English", async () => {
    const poster = await renderPoster({
      locale: "en",
      evidenceThemeName: "Blue Big Fish",
      taskStatusLabel: "NEEDS REVIEW",
      gitState: "clean",
      visualProject: true,
    });

    expect(poster).toContain('data-empty-state="git-clean"');
    expect(poster).toContain("GIT WORKSPACE CLEAN");
    expect(poster).toContain("NO VERIFICATION COMMANDS CONFIGURED");
    expect(poster).toContain('data-capture-state="pending"');
    expect(poster).toContain("NO MATCHING THEME CAPTURES");
    expect(poster).toContain("RECAPTURE CURRENT THEME");
    expect(poster).not.toContain("UI CAPTURES NOT REQUIRED");
  });

  it("keeps missing-detail and failed states explicit instead of claiming success", async () => {
    const poster = await renderPoster({
      locale: "en",
      evidenceThemeName: "Blue Big Fish",
      taskStatus: "failed",
      taskStatusLabel: "FAILED",
      gitState: "changed",
      testState: "failed",
      reportPath: "",
      summaryPath: "",
      posterPath: "",
    });

    expect(poster).toContain('data-status="failed"');
    expect(poster).toContain('data-empty-state="git-details-missing"');
    expect(poster).toContain("CHANGES DETECTED WITHOUT FILE DETAILS");
    expect(poster).toContain('data-empty-state="test-receipts-missing"');
    expect(poster).toContain("VERIFICATION RECEIPTS UNAVAILABLE");
    expect(poster).toContain("NO LOCAL ARTIFACTS GENERATED");
    expect(poster).toContain("VERIFICATION FAILED");
    expect(poster).not.toContain("VERIFIED / ALL CHECKS PASSED");
    expect(poster).not.toContain(">READY<");
  });

  it("derives optional capture, no-Git, and no-test states through the public generator", async () => {
    const projectPath = await mkdtemp(join(tmpdir(), "dsh-poster-nonvisual-"));
    temporaryDirectories.push(projectPath);
    await mkdir(join(projectPath, ".showcase"), { recursive: true });
    await writeFile(join(projectPath, "service.py"), "def health():\n    return {'ok': True}\n", "utf8");
    await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify({
      version: 1,
      generatedAt: "2026-08-19T00:00:00.000Z",
      project: { name: "nonvisual-service" },
      task: {
        id: "nonvisual-service",
        goal: "Review a backend-only delivery checkpoint.",
        status: "partial",
        startedAt: "2026-08-19T00:00:00.000Z",
        completedAt: "2026-08-19T00:00:01.000Z",
        durationMs: 1000,
      },
      git: {
        baseRef: "NO_GIT",
        headRef: "NO_GIT",
        files: [],
        summary: { changedFiles: 0, additions: 0, deletions: 0 },
      },
      tests: [],
      screenshots: [],
      redaction: { originalLength: 0, redactedLength: 0, replacements: {}, totalReplacements: 0 },
    }), "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "blue-big-fish" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

    expect(poster).toContain('data-git-state="unavailable"');
    expect(poster).toContain('data-test-state="unconfigured"');
    expect(poster).toContain('data-capture-state="optional"');
    expect(poster).toContain("未检测到 Git 仓库");
    expect(poster).toContain("未配置验证命令");
    expect(poster).toContain("非视觉项目 / 截图非必需");
    expect(poster).toContain('data-metric-state="unavailable"><b>--</b><small>本地文件模式</small>');
    expect(poster).toContain('data-metric-state="unconfigured"><b>--</b><small>测试未配置</small>');
    expect(poster).not.toContain("重新采集当前主题");
  });
});
