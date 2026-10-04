import { demoReport } from "./core/browser";
import { createStyledPosterHtml } from "../plugin/poster-html.js";

async function localImage(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("本地素材加载失败。");
  const blob = await response.blob();
  if (blob.size > 8 * 1024 * 1024) throw new Error("本地素材超出大小限制。");
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("本地素材无法读取。"));
    reader.readAsDataURL(blob);
  });
}

export async function createDijiangDemoDocument() {
  const specs = [
    { id: "dijiang-desktop", file: "dijiang-demo-desktop.png", label: "终末地桌面端 / 改版后", kind: "after", viewport: { name: "desktop", width: 1000, height: 900 }, comparisonId: "dijiang-content-parity" },
    { id: "dijiang-tablet", file: "dijiang-demo-tablet.png", label: "终末地平板端 / 改版后", kind: "after", viewport: { name: "tablet", width: 834, height: 1112 } },
    { id: "dijiang-mobile", file: "dijiang-demo-mobile.png", label: "终末地手机端 / 改版后", kind: "after", viewport: { name: "mobile", width: 390, height: 844 } },
    { id: "dijiang-before", file: "dijiang-demo-before.png", label: "终末地桌面端 / 内容补齐前", kind: "before", viewport: { name: "desktop", width: 1000, height: 900 }, comparisonId: "dijiang-content-parity" },
  ] as const;
  const captures = [];
  const captureMode = new URLSearchParams(location.search).get("capture") === "1";
  if (!captureMode) {
    try {
      const manifestResponse = await fetch("/evidence/dijiang-demo-captures.json");
      if (!manifestResponse.ok) throw new Error("截图清单不可用");
      const manifest = await manifestResponse.json() as Record<string, string>;
      for (const spec of specs) {
        const capturedAt = manifest[spec.file];
        if (!capturedAt || !Number.isFinite(Date.parse(capturedAt))) continue;
        try {
          captures.push({ ...spec, theme: "frontier-signal", captureMode: "viewport", imagePath: `evidence/${spec.file}`,
            url: "http://localhost/?theme=dijiang", capturedAt, mimeType: "image/png", image: await localImage(`/evidence/${spec.file}`),
            imageWidth: spec.viewport.width, imageHeight: spec.viewport.height });
        } catch { /* Other verified demo captures can still be displayed. */ }
      }
    } catch { /* Capture mode and missing assets use the normal evidence-empty state. */ }
  }
  const warnings = ["当前展示演示数据，不代表本次项目实测结果。", "Diff 是演示节选；终末地截图为本次界面的独立采集。",
    ...(!captures.length && !captureMode ? ["演示截图未能加载，视觉证据待补。"] : [])];
  const generatedAt = captures.length ? captures.map(shot => shot.capturedAt).sort().at(-1)! : demoReport.generatedAt;
  return createStyledPosterHtml({
    theme: "frontier-signal",
    locale: "zh-CN",
    demo: true,
    projectName: "dsh-showcase",
    task: demoReport.task.goal,
    generatedAt,
    stages: ["提示", "构建", "测试", "捕获", "交付"],
    taskStatus: "partial",
    fileCount: demoReport.git.files.length,
    gitFileCount: demoReport.git.files.length,
    gitFiles: demoReport.git.files,
    gitRange: `${demoReport.git.baseRef}..${demoReport.git.headRef}`,
    gitState: "changed",
    passedTests: demoReport.tests.filter((test) => test.status === "passed").length,
    testCount: demoReport.tests.length,
    testState: "configured",
    testReceipts: demoReport.tests.map((test) => ({ ...test, duration: `${(test.durationMs / 1000).toFixed(2)}s` })),
    redactionCount: demoReport.redaction.totalReplacements,
    redactionDetails: Object.entries(demoReport.redaction.replacements).map(([name, count]) => ({ name, count })),
    durationMs: demoReport.task.durationMs,
    additions: demoReport.git.summary.additions,
    deletions: demoReport.git.summary.deletions,
    reportData: { ...demoReport, generatedAt, demo: true, project: { name: "dsh-showcase" }, task: { ...demoReport.task, status: "partial" },
      screenshots: captures.map(({ image: _image, mimeType: _mimeType, file: _file, ...shot }) => shot), warnings },
    posterScreenshots: captures,
    visualProject: true,
    freshnessWarnings: warnings,
    reportPath: ".showcase/report.json",
    summaryPath: ".showcase/layout-summary.md",
    posterPath: ".showcase/layout-poster.html",
    evidenceThemeName: "终末地帝江号",
  });
}
