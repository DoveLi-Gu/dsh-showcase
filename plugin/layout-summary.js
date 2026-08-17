import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { createStyledPosterHtml } from "./poster-html.js";

const DEFAULT_REPORT_PATH = ".showcase/report.json";
const DEFAULT_OUTPUT_PATH = ".showcase/layout-summary.md";
const DEFAULT_POSTER_PATH = ".showcase/layout-poster.html";
const STAGE_IDS = ["PROMPT", "BUILD", "TEST", "CAPTURE", "SHIP"];
const STAGE_LABELS = { "zh-CN": ["提示", "构建", "测试", "捕获", "交付"], en: STAGE_IDS };
const LOCALES = new Set(["zh-CN", "en"]);
const THEMES = new Set(["frontier-signal", "blue-big-fish"]);

function insideProject(projectPath, value, label) {
  const resolved = resolve(projectPath, value);
  const relativePath = relative(projectPath, resolved);
  if (relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    throw new Error(`${label} must resolve inside projectPath.`);
  }
  return resolved;
}

function safeText(value) {
  return String(value ?? "")
    .replace(/\b(?:authorization|api[_-]?key|access[_-]?token|token)\s*[:=]\s*[^\s,;]+/gi, "[REDACTED]")
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED]")
    .replace(/\b[A-Za-z]:\\(?:[^\s<>:"|?*]+\\)*[^\s<>:"|?*]*/g, "[PATH OMITTED]")
    .replace(/(?<![\w/])\/(?:Users|home)\/[^\s/:]+(?:\/[^\s:]+)*/g, "[PATH OMITTED]")
    .replace(/[`\r\n]+/g, " ")
    .trim();
}

function safeRelativePath(value) {
  const path = String(value ?? "").replace(/\\/g, "/");
  if (!path || path.startsWith("/") || /^[a-z]:\//i.test(path) || path.startsWith("../")) return "[path omitted]";
  return path.replace(/`/g, "");
}

function collectBreakpoints(css) {
  return [...new Set([...css.matchAll(/@media\s*\(\s*max-width:\s*([0-9]+px)\s*\)/g)].map((match) => `max-width: ${match[1]}`))];
}

function collectStages(app, locale) {
  const ids = [...app.matchAll(/\{\s*id:\s*["']([A-Z]+)["']/g)].map((match) => match[1]).filter((id) => STAGE_IDS.includes(id));
  const stages = ids.length === STAGE_IDS.length ? ids : STAGE_IDS;
  return locale === "zh-CN" ? stages.map((id) => STAGE_LABELS["zh-CN"][STAGE_IDS.indexOf(id)]) : stages;
}

function themeLabel(theme, locale) {
  const labels = locale === "zh-CN"
    ? { "frontier-signal": "边境信号", "blue-big-fish": "蓝色大肥鱼" }
    : { "frontier-signal": "Frontier Signal", "blue-big-fish": "Blue Big Fish" };
  return labels[theme];
}

function escapeHtml(value) {
  return safeText(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function projectRelativePath(projectPath, fullPath) {
  return relative(projectPath, fullPath).split(sep).join("/");
}

async function collectPosterEvidence(projectPath, screenshots, locale) {
  const mimeTypes = new Map([[".png", "image/png"], [".webp", "image/webp"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"]]);
  const evidence = [];
  for (const shot of screenshots.slice(0, 3)) {
    if (!shot?.imagePath || typeof shot.imagePath !== "string") continue;
    try {
      const fullPath = insideProject(projectPath, shot.imagePath, "screenshot imagePath");
      const mimeType = mimeTypes.get(extname(fullPath).toLowerCase());
      if (!mimeType) continue;
      const image = await readFile(fullPath);
      if (image.length > 8 * 1024 * 1024) continue;
      const name = viewportLabel(safeText(shot.viewport?.name), locale);
      const width = Number(shot.viewport?.width) || 0;
      const height = Number(shot.viewport?.height) || 0;
      evidence.push({
        image: image.toString("base64"),
        mimeType,
        label: `${name}: ${width} x ${height}`,
      });
    } catch {
      // A missing screenshot should not block the textual report or poster fallback.
    }
  }
  return evidence;
}

function formatList(items, emptyLabel) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : `- ${emptyLabel}`;
}

function localeText(locale) {
  return locale === "zh-CN" ? {
    title: "布局摘要", projectTask: "项目与任务", task: "任务", status: "状态", version: "报告版本", poster: "海报产物", theme: "主题系统", rail: "交付轨道", main: "主页面区段", breakpoints: "响应式断点", screenshots: "截图视口", git: "Git 改动", range: "范围", receipts: "测试回执", privacy: "隐私审查", redactions: "已脱敏值", interactions: "交互控件", notRecorded: "未记录", unknown: "未知", notCaptured: "未捕获", exit: "退出码", conclusion: "根据报告和布局源文件在本地生成。未上传任何内容。", empty: "未记录", posterTitle: "布局证据海报", kicker: "交付证据 / 本地报告", verified: "已验证", files: "改动文件", tests: "通过测试", redaction: "已脱敏", footer: "仅在本地生成 / 不会上传",
    interaction: ["带本地持久化偏好的分段主题切换", "支持键盘操作的改版前后范围控件", "可展开的测试回执输出", "带状态反馈的本地导出操作", "已变更文件 Diff 选择"],
  } : {
    title: "Layout Summary", projectTask: "Project and task", task: "Task", status: "Status", version: "Report version", poster: "Poster artifact", theme: "Theme system", rail: "Operations rail", main: "Main page sections", breakpoints: "Responsive breakpoints", screenshots: "Screenshot viewports", git: "Git changes", range: "Range", receipts: "Test receipts", privacy: "Privacy review", redactions: "Redacted values", interactions: "Interaction controls", notRecorded: "Not recorded", unknown: "unknown", notCaptured: "not captured", exit: "exit", conclusion: "Generated locally from report and layout source files. No content was uploaded.", empty: "None recorded", posterTitle: "Layout evidence poster", kicker: "DELIVERY EVIDENCE / LOCAL REPORT", verified: "VERIFIED", files: "FILES CHANGED", tests: "TESTS PASSED", redaction: "REDACTIONS", footer: "LOCAL ONLY / NO UPLOAD",
    interaction: ["Segmented theme control with persisted local preference", "Keyboard-accessible Before/After range control", "Expandable test receipt output", "Local export actions with status feedback", "Changed-file Diff selection"],
  };
}

function viewportLabel(value, locale) {
  const labels = locale === "zh-CN" ? { desktop: "桌面端", tablet: "平板端", mobile: "移动端" } : {};
  return labels[value] ?? value;
}

function interactionList(app, locale) {
  const labels = localeText(locale).interaction;
  const interactions = [];
  if (app.includes("theme-switch")) interactions.push(labels[0]);
  if (app.includes('type="range"')) interactions.push(labels[1]);
  if (app.includes("<details")) interactions.push(labels[2]);
  if (app.includes("export-actions")) interactions.push(labels[3]);
  if (app.includes("setSelectedFile")) interactions.push(labels[4]);
  return interactions;
}

function statusLabel(value, locale) {
  const status = safeText(value);
  if (locale !== "zh-CN") return status;
  return ({ completed: "已验证", passed: "已通过", partial: "需要复核", failed: "执行失败", running: "准备中" })[status] ?? status;
}

function redactionLabel(value, locale) {
  const label = safeText(value);
  if (locale !== "zh-CN") return label;
  return ({ token: "令牌", "windows-path": "本机路径", path: "路径", authorization: "授权信息" })[label] ?? label;
}

function durationLabel(value) {
  const milliseconds = Math.max(0, Math.round(Number(value) || 0));
  if (milliseconds >= 1000) return `${(milliseconds / 1000).toFixed(1)}s`;
  return `${milliseconds}ms`;
}

export async function generateLayoutSummary(options = {}) {
  if (!options.projectPath || typeof options.projectPath !== "string") {
    throw new Error("projectPath is required.");
  }

  const locale = options.locale ?? "zh-CN";
  if (!LOCALES.has(locale)) throw new Error("locale must be either zh-CN or en.");
  const theme = options.theme ?? "frontier-signal";
  if (!THEMES.has(theme)) throw new Error("theme must be either frontier-signal or blue-big-fish.");
  const text = localeText(locale);
  const projectPath = resolve(options.projectPath);
  const reportPath = insideProject(projectPath, options.reportPath ?? DEFAULT_REPORT_PATH, "reportPath");
  const outputPath = insideProject(projectPath, options.outputPath ?? DEFAULT_OUTPUT_PATH, "outputPath");
  const posterPath = insideProject(projectPath, options.posterPath ?? DEFAULT_POSTER_PATH, "posterPath");
  const appPath = insideProject(projectPath, "src/App.tsx", "App source path");
  const cssPath = insideProject(projectPath, "src/styles.css", "CSS source path");
  let report;

  try {
    report = JSON.parse(await readFile(reportPath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read report JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  let app;
  let css;
  let posterImage = Buffer.alloc(0);
  try {
    [app, css] = await Promise.all([
      readFile(appPath, "utf8"),
      readFile(cssPath, "utf8"),
    ]);
    const assetName = theme === "blue-big-fish" ? "whale-girl-keyvisual.webp" : "frontier-industrial.webp";
    posterImage = await readFile(new URL("./assets/" + assetName, import.meta.url));
  } catch (error) {
    throw new Error(`Unable to read layout sources or poster asset: ${error instanceof Error ? error.message : String(error)}`);
  }

  const selectedTheme = themeLabel(theme, locale);
  const stages = collectStages(app, locale);
  const breakpoints = collectBreakpoints(css);
  const screenshots = Array.isArray(report.screenshots) ? report.screenshots : [];
  const evidenceImages = await collectPosterEvidence(projectPath, screenshots, locale);
  const files = Array.isArray(report.git?.files) ? report.git.files : [];
  const tests = Array.isArray(report.tests) ? report.tests : [];
  const redaction = report.redaction ?? {};
  const sections = locale === "zh-CN" ? ["项目与任务", "主题系统", "交付轨道", "证据带", "响应式采集", "变更清单", "验证回执", "隐私审查", "本地导出控件"] : ["Project and task", "Theme system", "Operations rail", "Evidence bands", "Responsive capture", "Change set", "Verification receipts", "Privacy review", "Local export controls"];
  const viewports = screenshots.map((shot) => `${viewportLabel(safeText(shot.viewport?.name), locale)}: ${Number(shot.viewport?.width) || 0} x ${Number(shot.viewport?.height) || 0}`);
  const posterViewports = [...viewports];
  const projectName = safeText(report.project?.name) || "dsh-showcase";
  const passedTests = tests.filter((test) => test.status === "passed").length;
  const gitRange = `${safeText(report.git?.baseRef) || text.unknown}..${safeText(report.git?.headRef) || text.unknown}`;
  const gitFiles = files.slice(0, 5).map((file) => ({
    path: safeRelativePath(file.path),
    additions: Number(file.additions) || 0,
    deletions: Number(file.deletions) || 0,
  }));
  const testReceipts = tests.slice(0, 3).map((test) => ({
    command: safeText(test.command),
    duration: durationLabel(test.durationMs),
    exitCode: Number(test.exitCode) || 0,
  }));
  const changes = files.map((file) => `\`${safeRelativePath(file.path)}\` (${statusLabel(file.status, locale)}, +${Number(file.additions) || 0} / -${Number(file.deletions) || 0})`);
  const receipts = tests.map((test) => `\`${safeText(test.command)}\` (${statusLabel(test.status, locale)}, ${text.exit} ${Number(test.exitCode) || 0})`);
  const redactionItems = Object.entries(redaction.replacements ?? {}).map(([name, count]) => `${redactionLabel(name, locale)}: ${Number(count) || 0}`);
  const interactions = interactionList(app, locale);
  const markdown = [
    `# ${text.title}`,
    "",
    `## ${text.projectTask}`,
    `- ${text.task}: ${safeText(report.task?.goal) || text.notRecorded}`,
    `- ${text.status}: ${statusLabel(report.task?.status, locale) || text.notRecorded}`,
    `- ${text.version}: ${safeText(report.version) || text.notRecorded}`,
    `- ${text.poster}: ${projectRelativePath(projectPath, posterPath)}`,
    "",
    `## ${text.theme}`,
    `- ${selectedTheme}`,
    "",
    `## ${text.rail}`,
    `- ${stages.join(" -> ")}`,
    "",
    `## ${text.main}`,
    formatList(sections, text.empty),
    "",
    `## ${text.breakpoints}`,
    formatList(breakpoints, text.empty),
    "",
    `## ${text.screenshots}`,
    formatList(viewports, text.empty),
    "",
    `## ${text.git}`,
    `- ${text.range}: ${safeText(report.git?.baseRef) || text.unknown}..${safeText(report.git?.headRef) || text.unknown}`,
    ...changes.map((change) => `- ${change}`),
    "",
    `## ${text.receipts}`,
    ...receipts.map((receipt) => `- ${receipt}`),
    "",
    `## ${text.privacy}`,
    `- ${text.redactions}: ${Number(redaction.totalReplacements) || 0}`,
    ...redactionItems.map((item) => `- ${item}`),
    "",
    `## ${text.interactions}`,
    formatList(interactions, text.empty),
    "",
    text.conclusion,
    "",
  ].join("\n");

  const sanitizedMarkdown = markdown.replaceAll(projectPath, "[PATH OMITTED]");
  const posterHtml = createStyledPosterHtml({
    image: posterImage.toString("base64"),
    projectName,
    task: safeText(report.task?.goal) || text.notRecorded,
    stages,
    fileCount: files.length,
    passedTests,
    testCount: tests.length,
    redactionCount: Number(redaction.totalReplacements) || 0,
    viewports: posterViewports.slice(0, 3),
    evidenceImages,
    gitRange,
    gitFileCount: Number(report.git?.summary?.changedFiles) || files.length,
    gitFiles,
    testReceipts,
    reportPath: projectRelativePath(projectPath, reportPath),
    summaryPath: projectRelativePath(projectPath, outputPath),
    posterPath: projectRelativePath(projectPath, posterPath),
    locale,
    theme,
  });
  await Promise.all([
    mkdir(dirname(outputPath), { recursive: true }),
    mkdir(dirname(posterPath), { recursive: true }),
  ]);
  const sanitizedPoster = posterHtml.replaceAll(projectPath, "[PATH OMITTED]");
  await Promise.all([
    writeFile(outputPath, sanitizedMarkdown, "utf8"),
    writeFile(posterPath, sanitizedPoster, "utf8"),
  ]);
  return {
    locale,
    outputPath: projectRelativePath(projectPath, outputPath),
    posterPath: projectRelativePath(projectPath, posterPath),
    sections,
    theme: selectedTheme,
    breakpoints,
    stages,
    testCount: tests.length,
    redactionCount: Number(redaction.totalReplacements) || 0,
  };
}

export { insideProject, safeRelativePath };
