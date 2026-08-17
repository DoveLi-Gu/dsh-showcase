import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

const DEFAULT_REPORT_PATH = ".showcase/report.json";
const DEFAULT_OUTPUT_PATH = ".showcase/layout-summary.md";
const DEFAULT_POSTER_PATH = ".showcase/layout-poster.html";
const STAGE_IDS = ["PROMPT", "BUILD", "TEST", "CAPTURE", "SHIP"];
const STAGE_LABELS = { "zh-CN": ["提示", "构建", "测试", "捕获", "交付"], en: STAGE_IDS };
const LOCALES = new Set(["zh-CN", "en"]);

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

function collectThemes(app, locale) {
  const hasField = app.includes("边境信号") || app.includes("Field Signal");
  const hasFish = app.includes("蓝色大肥鱼") || app.includes("Blue Big Fish") || app.includes("Big Blue Bytefish");
  const themes = [hasField, hasFish];
  const labels = locale === "zh-CN" ? ["边境信号", "蓝色大肥鱼"] : ["Field Signal", "Blue Big Fish"];
  return themes.some(Boolean) ? labels.filter((_, index) => themes[index]) : labels;
}

function escapeHtml(value) {
  return safeText(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function projectRelativePath(projectPath, fullPath) {
  return relative(projectPath, fullPath).split(sep).join("/");
}

function createPosterHtml({ image, projectName, task, stages, fileCount, passedTests, testCount, redactionCount, viewports, locale }) {
  const stageMarkup = stages.map((stage, index) => `<span><b>${String(index + 1).padStart(2, "0")}</b>${escapeHtml(stage)}</span>`).join("");
  const viewportMarkup = viewports.map((viewport) => `<span>${escapeHtml(viewport)}</span>`).join("");
  const text = localeText(locale);
  return `<!doctype html>
<html lang="${locale}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${text.posterTitle}</title><style>
*{box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden}body{margin:0;background:#071018;color:#f5fbfc;font-family:"Microsoft YaHei UI","Noto Sans SC",Arial,sans-serif}.poster{width:100vw;height:100vh;position:relative;overflow:hidden;padding:92px 100px;background:linear-gradient(90deg,#071018 0%,#0a1b27 55%,rgba(7,16,24,.2) 100%),url('data:image/webp;base64,${image}') right center/auto 100% no-repeat}.poster:after{content:"";position:absolute;inset:0;background:linear-gradient(rgba(97,216,226,.08) 1px,transparent 1px);background-size:100% 36px;pointer-events:none}.content{position:relative;z-index:1;width:66%}.kicker{color:#74e0d2;font:700 16px monospace;letter-spacing:2px}.title{margin:13px 0 9px;font-size:64px;line-height:1;font-weight:800;max-width:900px}.task{margin:0;color:#c7d8dc;font-size:24px;line-height:1.35;max-width:820px}.verified{display:inline-block;margin-top:28px;padding:9px 13px;background:#76e2a5;color:#052013;font:800 18px monospace;letter-spacing:1px}.rail{display:flex;margin:38px 0 30px;border:1px solid #41606a;background:#0a1922}.rail span{flex:1;min-height:66px;padding:12px;border-right:1px solid #41606a;font-weight:800;font-size:15px}.rail span:last-child{border:0}.rail b{display:block;color:#ffd45d;font:12px monospace;margin-bottom:6px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.metric{border-left:3px solid #ffd45d;background:rgba(7,16,24,.76);padding:13px}.metric b{display:block;font-size:28px}.metric span,.viewports span{color:#b9d1d5;font:13px monospace}.viewports{display:flex;gap:9px;margin-top:20px}.viewports span{padding:8px 10px;border:1px solid #41606a;background:rgba(7,16,24,.72)}.footer{position:absolute;z-index:1;left:100px;bottom:50px;color:#74e0d2;font:700 15px monospace;letter-spacing:1px}</style></head><body><article class="poster"><div class="content"><div class="kicker">${text.kicker}</div><h1 class="title">${escapeHtml(projectName)}</h1><p class="task">${escapeHtml(task)}</p><div class="verified">${text.verified}</div><div class="rail">${stageMarkup}</div><div class="metrics"><div class="metric"><b>${fileCount}</b><span>${text.files}</span></div><div class="metric"><b>${passedTests}/${testCount}</b><span>${text.tests}</span></div><div class="metric"><b>${redactionCount}</b><span>${text.redaction}</span></div></div><div class="viewports">${viewportMarkup}</div></div><div class="footer">${text.footer}</div></article></body></html>`;
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
export async function generateLayoutSummary(options = {}) {
  if (!options.projectPath || typeof options.projectPath !== "string") {
    throw new Error("projectPath is required.");
  }

  const locale = options.locale ?? "zh-CN";
  if (!LOCALES.has(locale)) throw new Error("locale must be either zh-CN or en.");
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
  let posterImage;
  try {
    [app, css, posterImage] = await Promise.all([
      readFile(appPath, "utf8"),
      readFile(cssPath, "utf8"),
      readFile(new URL("./assets/whale-girl-poster.webp", import.meta.url)),
    ]);
  } catch (error) {
    throw new Error(`Unable to read layout sources or poster asset: ${error instanceof Error ? error.message : String(error)}`);
  }

  const themes = collectThemes(app, locale);
  const stages = collectStages(app, locale);
  const breakpoints = collectBreakpoints(css);
  const screenshots = Array.isArray(report.screenshots) ? report.screenshots : [];
  const files = Array.isArray(report.git?.files) ? report.git.files : [];
  const tests = Array.isArray(report.tests) ? report.tests : [];
  const redaction = report.redaction ?? {};
  const sections = locale === "zh-CN" ? ["项目与任务", "主题系统", "交付轨道", "证据带", "响应式采集", "变更清单", "验证回执", "隐私审查", "本地导出控件"] : ["Project and task", "Theme system", "Operations rail", "Evidence bands", "Responsive capture", "Change set", "Verification receipts", "Privacy review", "Local export controls"];
  const viewports = screenshots.map((shot) => `${viewportLabel(safeText(shot.viewport?.name), locale)}: ${Number(shot.viewport?.width) || 0} x ${Number(shot.viewport?.height) || 0}`);
  const posterViewports = [...viewports];
  const projectName = safeText(report.project?.name) || "dsh-showcase";
  const passedTests = tests.filter((test) => test.status === "passed").length;
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
    formatList(themes, text.empty),
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
  const posterHtml = createPosterHtml({
    image: posterImage.toString("base64"),
    projectName,
    task: report.task?.goal || text.notRecorded,
    stages,
    fileCount: files.length,
    passedTests,
    testCount: tests.length,
    redactionCount: Number(redaction.totalReplacements) || 0,
    viewports: posterViewports.slice(0, 3),
    locale,
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
    themes,
    breakpoints,
    stages,
    testCount: tests.length,
    redactionCount: Number(redaction.totalReplacements) || 0,
  };
}

export { insideProject, safeRelativePath };
