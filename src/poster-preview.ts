import { z } from "zod";
import { demoReport, screenshotEvidenceSchema } from "./core/browser";
import { createStyledPosterHtml } from "../plugin/poster-html.js";
import { version } from "../package.json";

export type PreviewTheme = "frontier-signal" | "blue-big-fish";
export const previewCapturesSchema = z.object({
  version: z.literal(1),
  packageVersion: z.literal(version),
  screenshots: z.array(screenshotEvidenceSchema.extend({
    theme: z.enum(["frontier-signal", "blue-big-fish"]),
    imagePath: z.string().regex(/^evidence\/current-preview\/(?:fish|dijiang)-\d+x\d+\.jpg$/),
    capturedAt: z.string().datetime(),
    kind: z.literal("after"),
    captureMode: z.literal("viewport"),
  })).max(8),
});

export type PreviewCapture = z.infer<typeof previewCapturesSchema>["screenshots"][number] & {
  image: string;
  mimeType: "image/jpeg";
  imageWidth: number;
  imageHeight: number;
};

export function resolvePreviewTheme(value: string | null): PreviewTheme {
  return value === "fish" || value === "blue-big-fish" ? "blue-big-fish" : "frontier-signal";
}

async function localImage(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok || response.headers.get("content-type")?.split(";")[0].trim() !== "image/jpeg") {
    throw new Error("源码截图不可用。");
  }
  const blob = await response.blob();
  if (blob.size > 8 * 1024 * 1024 || blob.size === 0) throw new Error("源码截图大小不合法。");
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("源码截图读取失败。"));
    reader.readAsDataURL(blob);
  });
}

export async function createDemoDocument(theme: PreviewTheme) {
  const captures: PreviewCapture[] = [];
  const captureMode = new URLSearchParams(location.search).get("capture") === "1";
  if (!captureMode) {
    try {
      const response = await fetch("/evidence/current-preview/manifest.json", { cache: "no-store" });
      if (!response.ok) throw new Error("截图清单不可用。");
      const manifest = previewCapturesSchema.parse(await response.json());
      const seen = new Set<string>();
      for (const shot of manifest.screenshots) {
        if (shot.theme !== theme || seen.has(shot.imagePath)) continue;
        seen.add(shot.imagePath);
        try {
          captures.push({ ...shot, mimeType: "image/jpeg", image: await localImage(`/${shot.imagePath}`),
            imageWidth: shot.viewport.width, imageHeight: shot.viewport.height });
        } catch { /* Keep readable captures; never substitute an old screenshot. */ }
      }
    } catch { /* Missing or incompatible manifests use the report's empty state. */ }
  }
  return renderPreviewDocument(theme, captures, captureMode);
}

export function renderPreviewDocument(theme: PreviewTheme, captures: PreviewCapture[], captureMode = false) {
  const matching = captures.filter(shot => shot.theme === theme);
  const warnings = ["Git 改动、测试回执和 Diff 为演示数据，不代表当前项目的实测结果。",
    ...(!matching.length && !captureMode ? ["本轮源码截图尚未就绪；不会回退显示历史截图。"] : [])];
  const generatedAt = new Date().toISOString();
  const html = createStyledPosterHtml({
    theme,
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
      screenshots: matching.map(({ image: _image, mimeType: _mimeType, ...shot }) => shot), warnings },
    posterScreenshots: matching,
    visualProject: true,
    freshnessWarnings: warnings,
    reportPath: ".showcase/report.json",
    summaryPath: ".showcase/layout-summary.md",
    posterPath: ".showcase/layout-poster.html",
    evidenceThemeName: theme === "blue-big-fish" ? "蓝色大肥鱼" : "终末地帝江号",
  });
  return html.replace("<html ", `<html data-preview-renderer="plugin" data-preview-version="${version}" data-preview-generated-at="${generatedAt}" data-preview-captures="${captureMode ? "capture" : "current"}" `);
}
