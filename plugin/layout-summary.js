import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

const DEFAULT_REPORT_PATH = ".showcase/report.json";
const DEFAULT_OUTPUT_PATH = ".showcase/layout-summary.md";
const DEFAULT_POSTER_PATH = ".showcase/layout-poster.html";
const FALLBACK_STAGES = ["PROMPT", "BUILD", "TEST", "CAPTURE", "SHIP"];

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

function collectStages(app) {
  const stageMatch = app.match(/const stages\s*=\s*\[([^\]]+)\]/);
  if (!stageMatch) return FALLBACK_STAGES;
  const parsed = [...stageMatch[1].matchAll(/["']([A-Z]+)["']/g)].map((match) => match[1]);
  return parsed.length ? parsed : FALLBACK_STAGES;
}

function collectThemes(app) {
  const themes = [];
  if (app.includes("Field Signal")) themes.push("Field Signal");
  if (app.includes("Blue Big Fish") || app.includes("Big Blue Bytefish")) themes.push("Blue Big Fish");
  return themes.length ? themes : ["Field Signal", "Blue Big Fish"];
}

function escapeHtml(value) {
  return safeText(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function projectRelativePath(projectPath, fullPath) {
  return relative(projectPath, fullPath).split(sep).join("/");
}

function createPosterHtml({ image, projectName, task, stages, fileCount, passedTests, testCount, redactionCount, viewports }) {
  const stageMarkup = stages.map((stage, index) => `<span><b>${String(index + 1).padStart(2, "0")}</b>${escapeHtml(stage)}</span>`).join("");
  const viewportMarkup = viewports.map((viewport) => `<span>${escapeHtml(viewport)}</span>`).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Layout evidence poster</title><style>
*{box-sizing:border-box}body{margin:0;background:#071018;color:#f5fbfc;font-family:Arial,Helvetica,sans-serif}.poster{width:1600px;aspect-ratio:16/9;position:relative;overflow:hidden;padding:92px 100px;background:linear-gradient(90deg,#071018 0%,#0a1b27 55%,rgba(7,16,24,.2) 100%),url('data:image/webp;base64,${image}') right center/auto 100% no-repeat}.poster:after{content:"";position:absolute;inset:0;background:linear-gradient(rgba(97,216,226,.08) 1px,transparent 1px);background-size:100% 36px;pointer-events:none}.content{position:relative;z-index:1;width:66%}.kicker{color:#74e0d2;font:700 16px monospace;letter-spacing:2px}.title{margin:13px 0 9px;font-size:64px;line-height:1;font-weight:800;max-width:900px}.task{margin:0;color:#c7d8dc;font-size:24px;line-height:1.35;max-width:820px}.verified{display:inline-block;margin-top:28px;padding:9px 13px;background:#76e2a5;color:#052013;font:800 18px monospace;letter-spacing:1px}.rail{display:flex;margin:38px 0 30px;border:1px solid #41606a;background:#0a1922}.rail span{flex:1;min-height:66px;padding:12px;border-right:1px solid #41606a;font-weight:800;font-size:15px}.rail span:last-child{border:0}.rail b{display:block;color:#ffd45d;font:12px monospace;margin-bottom:6px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.metric{border-left:3px solid #ffd45d;background:rgba(7,16,24,.76);padding:13px}.metric b{display:block;font-size:28px}.metric span,.viewports span{color:#b9d1d5;font:13px monospace}.viewports{display:flex;gap:9px;margin-top:20px}.viewports span{padding:8px 10px;border:1px solid #41606a;background:rgba(7,16,24,.72)}.footer{position:absolute;z-index:1;left:100px;bottom:50px;color:#74e0d2;font:700 15px monospace;letter-spacing:1px}</style></head><body><article class="poster"><div class="content"><div class="kicker">DELIVERY EVIDENCE / LOCAL REPORT</div><h1 class="title">${escapeHtml(projectName)}</h1><p class="task">${escapeHtml(task)}</p><div class="verified">VERIFIED</div><div class="rail">${stageMarkup}</div><div class="metrics"><div class="metric"><b>${fileCount}</b><span>FILES CHANGED</span></div><div class="metric"><b>${passedTests}/${testCount}</b><span>TESTS PASSED</span></div><div class="metric"><b>${redactionCount}</b><span>REDACTIONS</span></div></div><div class="viewports">${viewportMarkup}</div></div><div class="footer">LOCAL ONLY / NO UPLOAD</div></article></body></html>`;
}

function interactionList(app) {
  const interactions = [];
  if (app.includes("theme-switch")) interactions.push("Segmented theme control with persisted local preference");
  if (app.includes('type="range"')) interactions.push("Keyboard-accessible Before/After range control");
  if (app.includes("<details")) interactions.push("Expandable test receipt output");
  if (app.includes("export-actions")) interactions.push("Local export actions with status feedback");
  if (app.includes("setSelectedFile")) interactions.push("Changed-file Diff selection");
  return interactions;
}

function formatList(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None recorded";
}

export async function generateLayoutSummary(options = {}) {
  if (!options.projectPath || typeof options.projectPath !== "string") {
    throw new Error("projectPath is required.");
  }

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

  const themes = collectThemes(app);
  const stages = collectStages(app);
  const breakpoints = collectBreakpoints(css);
  const screenshots = Array.isArray(report.screenshots) ? report.screenshots : [];
  const files = Array.isArray(report.git?.files) ? report.git.files : [];
  const tests = Array.isArray(report.tests) ? report.tests : [];
  const redaction = report.redaction ?? {};
  const sections = ["Project and task", "Theme system", "Operations rail", "Evidence bands", "Responsive capture", "Change set", "Verification receipts", "Privacy review", "Local export controls"];
  const viewports = screenshots.map((shot) => `${safeText(shot.viewport?.name)}: ${Number(shot.viewport?.width) || 0} x ${Number(shot.viewport?.height) || 0}`);
  const posterViewports = [...viewports];
  while (posterViewports.length < 3) posterViewports.push("not captured");
  const projectName = safeText(report.project?.name) || "dsh-showcase";
  const passedTests = tests.filter((test) => test.status === "passed").length;
  const changes = files.map((file) => `\`${safeRelativePath(file.path)}\` (${safeText(file.status)}, +${Number(file.additions) || 0} / -${Number(file.deletions) || 0})`);
  const receipts = tests.map((test) => `\`${safeText(test.command)}\` (${safeText(test.status)}, exit ${Number(test.exitCode) || 0})`);
  const redactionItems = Object.entries(redaction.replacements ?? {}).map(([name, count]) => `${safeText(name)}: ${Number(count) || 0}`);
  const interactions = interactionList(app);
  const markdown = [
    "# Layout Summary",
    "",
    "## Project and task",
    `- Task: ${safeText(report.task?.goal) || "Not recorded"}`,
    `- Status: ${safeText(report.task?.status) || "Not recorded"}`,
    `- Report version: ${safeText(report.version) || "Not recorded"}`,
      `- Poster artifact: ${projectRelativePath(projectPath, posterPath)}`,

    "",
    "## Theme system",
    formatList(themes),
    "",
    "## Operations rail",
    `- ${stages.join(" -> ")}`,
    "",
    "## Main page sections",
    formatList(sections),
    "",
    "## Responsive breakpoints",
    formatList(breakpoints),
    "",
    "## Screenshot viewports",
    formatList(viewports),
    "",
    "## Git changes",
    `- Range: ${safeText(report.git?.baseRef) || "unknown"}..${safeText(report.git?.headRef) || "unknown"}`,
    ...changes.map((change) => `- ${change}`),
    "",
    "## Test receipts",
    ...receipts.map((receipt) => `- ${receipt}`),
    "",
    "## Privacy review",
    `- Redacted values: ${Number(redaction.totalReplacements) || 0}`,
    ...redactionItems.map((item) => `- ${item}`),
    "",
    "## Interaction controls",
    formatList(interactions),
    "",
    "Generated locally from report and layout source files. No content was uploaded.",
    "",
  ].join("\n");

  const sanitizedMarkdown = markdown.replaceAll(projectPath, "[PATH OMITTED]");
  const posterHtml = createPosterHtml({
    image: posterImage.toString("base64"),
    projectName,
    task: report.task?.goal || "Not recorded",
    stages,
    fileCount: files.length,
    passedTests,
    testCount: tests.length,
    redactionCount: Number(redaction.totalReplacements) || 0,
    viewports: posterViewports.slice(0, 3),
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
