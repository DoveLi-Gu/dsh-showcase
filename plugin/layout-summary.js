import { mkdir, readFile, readdir, realpath, rename, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { createStyledPosterHtml } from "./poster-html.js";
import { formatReportIssues, reportSchema } from "./report-schema.js";

const DEFAULT_REPORT_PATH = ".showcase/report.json";
const DEFAULT_OUTPUT_PATH = ".showcase/layout-summary.md";
const DEFAULT_POSTER_PATH = ".showcase/layout-poster.html";
const STAGE_IDS = ["PROMPT", "BUILD", "TEST", "CAPTURE", "SHIP"];
const STAGE_LABELS = { "zh-CN": ["提示", "构建", "测试", "捕获", "交付"], en: STAGE_IDS };
const LOCALES = new Set(["zh-CN", "en"]);
const THEMES = new Set(["frontier-signal", "blue-big-fish"]);
const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown"]);
const HTML_EXTENSIONS = new Set([".html", ".htm"]);
const MAX_TEXT_LENGTH = 4096;
const MAX_PROJECT_COPY_LENGTH = 120;
const MAX_TASK_COPY_LENGTH = 320;
// Keep report parsing and the generated integrity panel bounded even when a
// caller hands the plugin a corrupted or accidentally duplicated report.
const MAX_REPORT_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 16384;
const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const MAX_SOURCE_FILES = 4000;
const MAX_SOURCE_DEPTH = 8;
const FRESHNESS_CLOCK_SKEW_MS = 2000;
const MAX_FRESHNESS_WARNINGS = 5;
const SOURCE_IGNORES = new Set([
  ".git",
  ".showcase",
  ".next",
  ".nuxt",
  ".svelte-kit",
  "coverage",
  "dist",
  "build",
  "out",
  "node_modules",
  "target",
  "vendor",
  ".venv",
  "venv",
  "__pycache__",
]);
const APP_SOURCE_PRIORITY = [
  "src/App.tsx",
  "src/App.jsx",
  "src/App.js",
  "src/App.ts",
  "src/main.tsx",
  "src/main.jsx",
  "src/main.js",
  "src/main.ts",
  "src/index.tsx",
  "src/index.jsx",
  "src/index.js",
  "src/index.ts",
  "src/main.py",
  "main.py",
  "app.py",
  "index.html",
  "index.js",
  "index.ts",
  "server.js",
  "app.js",
  "main.js",
];
const CSS_SOURCE_PRIORITY = [
  "src/styles.css",
  "src/style.css",
  "src/index.css",
  "src/App.css",
  "styles.css",
  "style.css",
  "index.css",
];
const APP_SOURCE_EXTENSIONS = new Set([
  ".cjs", ".cs", ".go", ".htm", ".html", ".java", ".js", ".jsx", ".mjs", ".py", ".rb", ".rs", ".svelte", ".ts", ".tsx", ".vue",
]);
const VISUAL_SOURCE_EXTENSIONS = new Set([".htm", ".html", ".jsx", ".svelte", ".tsx", ".vue"]);

function isInside(projectPath, candidatePath) {
  const relativePath = relative(projectPath, candidatePath);
  return relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath);
}

function insideProject(projectPath, value, label) {
  const resolved = resolve(projectPath, value);
  if (!isInside(projectPath, resolved)) {
    throw new Error(`${label} must resolve inside projectPath.`);
  }
  return resolved;
}

async function realpathWithMissing(candidatePath) {
  const suffix = [];
  let probe = candidatePath;
  while (true) {
    try {
      const resolvedProbe = await realpath(probe);
      return suffix.length ? resolve(resolvedProbe, ...suffix.reverse()) : resolvedProbe;
    } catch (error) {
      if (!error || !["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
      const parent = dirname(probe);
      if (parent === probe) throw error;
      suffix.push(basename(probe));
      probe = parent;
    }
  }
}

async function insideProjectRealpath(projectPath, value, label) {
  const lexicalProjectPath = resolve(projectPath);
  const lexicalPath = insideProject(lexicalProjectPath, value, label);
  const [projectRealPath, candidateRealPath] = await Promise.all([
    realpath(lexicalProjectPath),
    realpathWithMissing(lexicalPath),
  ]);
  if (!isInside(projectRealPath, candidateRealPath)) {
    throw new Error(`${label} must resolve inside projectPath.`);
  }
  return lexicalPath;
}

function canonicalPathKey(filePath) {
  return process.platform === "win32" ? filePath.toLowerCase() : filePath;
}

async function assertDistinctArtifactPaths(entries) {
  const seen = new Map();
  for (const [label, filePath] of entries) {
    const canonicalPath = canonicalPathKey(await realpathWithMissing(filePath));
    const previousLabel = seen.get(canonicalPath);
    if (previousLabel) {
      throw new Error(`${previousLabel} and ${label} must resolve to different files.`);
    }
    seen.set(canonicalPath, label);
  }
}

function assertArtifactOutputPath(projectPath, filePath, label, allowedExtensions) {
  const showcasePath = resolve(projectPath, ".showcase");
  if (!isInside(showcasePath, filePath)) {
    throw new Error(`${label} must resolve inside the project's .showcase directory.`);
  }
  const extension = extname(filePath).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error(`${label} must use one of these extensions: ${[...allowedExtensions].join(", ")}.`);
  }
}

let stagedWriteSequence = 0;

function stagedFilePath(filePath) {
  stagedWriteSequence += 1;
  return resolve(dirname(filePath), `.${basename(filePath)}.tmp-${process.pid}-${Date.now()}-${stagedWriteSequence}`);
}

async function removeStagedFile(filePath) {
  try {
    await unlink(filePath);
  } catch (error) {
    if (!error || error.code !== "ENOENT") return;
  }
}

async function assertArtifactTargetsReplaceable(artifacts) {
  for (const artifact of artifacts) {
    try {
      const details = await stat(artifact.path);
      if (details.isDirectory()) {
        throw new Error(`Cannot replace ${artifact.path}: the target is a directory.`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Cannot replace ")) throw error;
      if (!error || error.code !== "ENOENT") throw error;
    }
  }
}

async function writeArtifactFiles(artifacts) {
  const staged = [];
  const backups = [];
  const committed = [];
  const preservedBackups = new Set();
  try {
    // Check every target before moving any file. This prevents a directory or
    // other invalid target from producing a mixed-version delivery.
    await assertArtifactTargetsReplaceable(artifacts);
    for (const artifact of artifacts) {
      await mkdir(dirname(artifact.path), { recursive: true });
      const temporaryPath = stagedFilePath(artifact.path);
      await writeFile(temporaryPath, artifact.content, "utf8");
      staged.push({ ...artifact, temporaryPath });
    }
    for (const artifact of staged) {
      try {
        const details = await stat(artifact.path);
        if (details.isDirectory()) {
          throw new Error(`Cannot replace ${artifact.path}: the target is a directory.`);
        }
        const backupPath = stagedFilePath(`${artifact.path}.backup`);
        await rename(artifact.path, backupPath);
        backups.push({ ...artifact, backupPath });
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("Cannot replace ")) throw error;
        if (!error || error.code !== "ENOENT") throw error;
      }
      await rename(artifact.temporaryPath, artifact.path);
      committed.push(artifact);
    }
    for (const backup of backups) {
      await removeStagedFile(backup.backupPath);
    }
  } catch (error) {
    // Roll back in reverse order so a late failure cannot leave one artifact
    // newer than the others. Best-effort cleanup preserves the original error.
    for (const artifact of [...committed].reverse()) await removeStagedFile(artifact.path);
    for (const backup of [...backups].reverse()) {
      try {
        await rename(backup.backupPath, backup.path);
      } catch (restoreError) {
        // If restoration itself fails, keep the backup on disk instead of
        // deleting the last known-good copy during final cleanup.
        if (!restoreError || restoreError.code !== "ENOENT") preservedBackups.add(backup.backupPath);
      }
    }
    throw error;
  } finally {
    await Promise.all(staged.map((artifact) => removeStagedFile(artifact.temporaryPath)));
    await Promise.all(backups
      .filter((backup) => !preservedBackups.has(backup.backupPath))
      .map((backup) => removeStagedFile(backup.backupPath)));
  }
}

function isMissingSourceError(error) {
  return Boolean(error && ["ENOENT", "ENOTDIR", "EACCES", "EPERM", "EISDIR"].includes(error.code));
}

function sourcePathKey(projectPath, filePath) {
  return projectRelativePath(projectPath, filePath).replace(/\\/g, "/").toLowerCase();
}

function sourceExtension(filePath) {
  return extname(filePath).toLowerCase();
}

function sourceDepth(filePath) {
  return filePath.split(/[\\/]/).length;
}

function sourceScore(projectPath, filePath, kind) {
  const key = sourcePathKey(projectPath, filePath);
  const priority = kind === "app" ? APP_SOURCE_PRIORITY : CSS_SOURCE_PRIORITY;
  const exact = priority.findIndex((candidate) => candidate.toLowerCase() === key);
  if (exact >= 0) return exact;

  const base = basename(key, sourceExtension(key));
  const depth = sourceDepth(key);
  if (kind === "css") return 100 + depth;

  const extension = sourceExtension(key);
  const names = new Map([
    ["index", 20],
    ["main", 30],
    ["app", 40],
    ["server", 50],
  ]);
  const nameScore = names.get(base) ?? 80;
  const extensionScore = extension === ".html" || extension === ".htm" ? 0 : extension === ".py" ? 10 : 20;
  return 100 + nameScore + extensionScore + depth;
}

function isAppSource(filePath) {
  return APP_SOURCE_EXTENSIONS.has(sourceExtension(filePath));
}

async function collectProjectFiles(projectPath, currentPath = projectPath, depth = 0, files = []) {
  if (depth > MAX_SOURCE_DEPTH || files.length >= MAX_SOURCE_FILES) return files;
  let entries;
  try {
    entries = await readdir(currentPath, { withFileTypes: true });
  } catch (error) {
    if (isMissingSourceError(error)) return files;
    throw error;
  }
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    if (files.length >= MAX_SOURCE_FILES) break;
    if (entry.name === "." || entry.name === "..") continue;
    if (entry.isDirectory() && SOURCE_IGNORES.has(entry.name.toLowerCase())) continue;
    const candidate = resolve(currentPath, entry.name);
    if (entry.isDirectory()) {
      await collectProjectFiles(projectPath, candidate, depth + 1, files);
    } else if (entry.isFile() && (isAppSource(candidate) || sourceExtension(candidate) === ".css")) {
      files.push(candidate);
    }
  }
  return files;
}

async function optionalProjectFile(projectPath, value, label) {
  const lexicalPath = await insideProjectRealpath(projectPath, value, label);
  try {
    const details = await stat(lexicalPath);
    if (!details.isFile() || details.size > MAX_SOURCE_BYTES) return undefined;
    return lexicalPath;
  } catch (error) {
    if (isMissingSourceError(error)) return undefined;
    throw error;
  }
}

async function pickSource(projectPath, candidates, kind) {
  const label = kind === "app" ? "App source path" : "CSS source path";
  const sorted = [...candidates]
    .sort((left, right) => sourceScore(projectPath, left, kind) - sourceScore(projectPath, right, kind) || sourcePathKey(projectPath, left).localeCompare(sourcePathKey(projectPath, right)));
  for (const candidate of sorted) {
    const usable = await optionalProjectFile(projectPath, candidate, label);
    if (usable) return usable;
  }
  return undefined;
}

async function discoverLayoutSources(projectPath, options = {}) {
  const appOverride = typeof options.appPath === "string" ? options.appPath : undefined;
  const cssOverride = typeof options.cssPath === "string" ? options.cssPath : undefined;
  let appPath = appOverride ? await optionalProjectFile(projectPath, appOverride, "App source path") : undefined;
  let cssPath = cssOverride ? await optionalProjectFile(projectPath, cssOverride, "CSS source path") : undefined;
  const shouldScanApp = !appOverride;
  const shouldScanCss = !cssOverride;
  if (shouldScanApp || shouldScanCss) {
    const candidates = await collectProjectFiles(projectPath);
    if (shouldScanApp) {
      appPath = await pickSource(projectPath, candidates.filter((candidate) => isAppSource(candidate)), "app");
    }
    if (shouldScanCss) {
      cssPath = await pickSource(projectPath, candidates.filter((candidate) => sourceExtension(candidate) === ".css"), "css");
    }
  }
  return { appPath, cssPath };
}

async function readOptionalSource(projectPath, sourcePath, label) {
  if (!sourcePath) return "";
  try {
    const safePath = await insideProjectRealpath(projectPath, sourcePath, label);
    const details = await stat(safePath);
    if (!details.isFile() || details.size > MAX_SOURCE_BYTES) return "";
    return await readFile(safePath, "utf8");
  } catch (error) {
    if (isMissingSourceError(error)) return "";
    throw error;
  }
}

function legacySafeText(value) {
  return String(value ?? "")
    .replace(/\b(?:authorization|api[_-]?key|access[_-]?token|token)\s*[:=]\s*[^\s,;]+/gi, "[REDACTED]")
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED]")
    .replace(/\b[A-Za-z]:\\(?:[^\s<>:"|?*]+\\)*[^\s<>:"|?*]*/g, "[PATH OMITTED]")
    .replace(/(?<![\w/])\/(?:Users|home)\/[^\s/:]+(?:\/[^\s:]+)*/g, "[PATH OMITTED]")
    .replace(/[`\r\n]+/g, " ")
    .trim();
}

function legacySafeRelativePath(value) {
  const path = String(value ?? "").replace(/\\/g, "/");
  if (!path || path.startsWith("/") || /^[a-z]:\//i.test(path) || path.startsWith("../")) return "[path omitted]";
  return path.replace(/`/g, "");
}

function truncateText(value, maxLength = MAX_TEXT_LENGTH) {
  const text = String(value ?? "");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

function safeText(value, maxLength = MAX_TEXT_LENGTH) {
  const redacted = String(value ?? "")
    .replace(/\b(?:authorization|api\s*[_-]?key|access\s*[_-]?token|token)\s*[:=]\s*(?:bearer\s+)?[^\s,;]+/gi, "[REDACTED]")
    .replace(/\b(?:sk-(?:proj-|ant-|or-v1-)?[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{20,}|xai-[A-Za-z0-9_-]{16,}|pplx-[A-Za-z0-9_-]{16,}|hf_[A-Za-z0-9_-]{16,})\b/g, "[REDACTED]")
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED]")
    .replace(/(?<![\w])(?:[A-Za-z]:[\\/])[^<>\"|?*\r\n,;]+/g, "[PATH OMITTED]")
    .replace(/(?<![\w/])\/(?:Users|home|mnt|var|tmp)\/[^\s/:,;]+(?:\/[^\s:,;]+)*/g, "[PATH OMITTED]")
    .replace(/[\x60\r\n]+/g, " ")
    .trim();
  return truncateText(redacted, maxLength);
}

function safeRelativePath(value, maxLength = 240) {
  const path = String(value ?? "").replace(/\\/g, "/").replace(/[\x60\r\n]+/g, "").trim();
  if (!path || path.startsWith("/") || /^[a-z]:/i.test(path) || path === ".." || path.startsWith("../") || path.includes("/../")) return "[path omitted]";
  return truncateText(path, maxLength);
}

function collectBreakpoints(css) {
  const pattern = /@media[^{}]*\(\s*max-width\s*:\s*([0-9]+(?:\.[0-9]+)?(?:px|rem|em|ch|vw))\s*\)/gi;
  return [...new Set([...css.matchAll(pattern)].map((match) => `max-width: ${match[1]}`))];
}

function collectStages(app, locale) {
  const ids = [...app.matchAll(/\{\s*id:\s*["']([A-Z]+)["']/g)].map((match) => match[1]).filter((id) => STAGE_IDS.includes(id));
  const stages = ids.length === STAGE_IDS.length ? ids : STAGE_IDS;
  return locale === "zh-CN" ? stages.map((id) => STAGE_LABELS["zh-CN"][STAGE_IDS.indexOf(id)]) : stages;
}

function themeLabel(theme, locale) {
  const labels = locale === "zh-CN"
    ? { "frontier-signal": "终末地帝江号", "blue-big-fish": "蓝色大肥鱼" }
    : { "frontier-signal": "Dijiang", "blue-big-fish": "Blue Big Fish" };
  return labels[theme];
}

function escapeHtml(value) {
  return safeText(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function projectRelativePath(projectPath, fullPath) {
  return relative(projectPath, fullPath).split(sep).join("/");
}

function normalizeScreenshotTheme(value) {
  if (value === "frontier-signal" || value === "blue-big-fish") return value;
  if (value === "field") return "frontier-signal";
  if (value === "fish") return "blue-big-fish";
  return undefined;
}

function screenshotTheme(shot) {
  const explicitTheme = normalizeScreenshotTheme(shot?.theme);
  if (explicitTheme) return explicitTheme;
  try {
    return normalizeScreenshotTheme(new URL(String(shot?.url ?? "")).searchParams.get("theme"));
  } catch {
    return undefined;
  }
}

function screenshotLabel(shot, locale) {
  const name = viewportLabel(safeText(shot?.viewport?.name, 64), locale);
  const width = Number(shot?.viewport?.width) || 0;
  const height = Number(shot?.viewport?.height) || 0;
  return `${name}: ${width} x ${height}`;
}

function pngDimensions(image) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (image.length < 24 || !signature.every((byte, index) => image[index] === byte)) return undefined;
  let dimensions;
  let hasImageData = false;
  let hasEnd = false;
  let offset = 8;
  while (offset + 12 <= image.length) {
    const chunkLength = image.readUInt32BE(offset);
    const dataOffset = offset + 8;
    const endOffset = dataOffset + chunkLength + 4;
    if (endOffset > image.length) return undefined;
    const chunk = image.toString("ascii", offset + 4, offset + 8);
    if (chunk === "IHDR" && chunkLength === 13 && !dimensions) {
      dimensions = { width: image.readUInt32BE(dataOffset), height: image.readUInt32BE(dataOffset + 4) };
    } else if (chunk === "IDAT") {
      hasImageData = true;
    } else if (chunk === "IEND") {
      hasEnd = true;
      break;
    }
    offset = endOffset;
  }
  return dimensions && hasImageData && hasEnd ? dimensions : undefined;
}

function jpegDimensions(image) {
  if (image.length < 4 || image[0] !== 0xff || image[1] !== 0xd8 || image[2] !== 0xff) return undefined;
  if (image.lastIndexOf(Buffer.from([0xff, 0xd9])) < 0) return undefined;
  const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 4 <= image.length) {
    while (offset < image.length && image[offset] === 0xff) offset += 1;
    if (offset >= image.length) break;
    const marker = image[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > image.length) return undefined;
    const segmentLength = image.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > image.length) return undefined;
    if (startOfFrame.has(marker)) {
      if (segmentLength < 7) return undefined;
      return { width: image.readUInt16BE(offset + 5), height: image.readUInt16BE(offset + 3) };
    }
    if (marker === 0xda) break;
    offset += segmentLength;
  }
  return undefined;
}

function webpDimensions(image) {
  if (image.length < 20 || image.toString("ascii", 0, 4) !== "RIFF" || image.toString("ascii", 8, 12) !== "WEBP") return undefined;
  if (image.readUInt32LE(4) + 8 > image.length) return undefined;
  let offset = 12;
  while (offset + 8 <= image.length) {
    const chunk = image.toString("ascii", offset, offset + 4);
    const chunkLength = image.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;
    if (dataOffset + chunkLength > image.length) return undefined;
    if (chunk === "VP8X" && chunkLength >= 10) {
      return {
        width: 1 + image.readUIntLE(dataOffset + 4, 3),
        height: 1 + image.readUIntLE(dataOffset + 7, 3),
      };
    }
    if (chunk === "VP8 " && chunkLength >= 10 && image[dataOffset + 3] === 0x9d && image[dataOffset + 4] === 0x01 && image[dataOffset + 5] === 0x2a) {
      return {
        width: image.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: image.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }
    if (chunk === "VP8L" && chunkLength >= 5 && image[dataOffset] === 0x2f) {
      const bits = image.readUInt32LE(dataOffset + 1);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
    }
    offset = dataOffset + chunkLength + (chunkLength % 2);
  }
  return undefined;
}

function imageInfo(image) {
  if (!image.length || image.length > MAX_IMAGE_BYTES) return undefined;
  const candidates = [
    ["image/png", pngDimensions(image)],
    ["image/jpeg", jpegDimensions(image)],
    ["image/webp", webpDimensions(image)],
  ];
  const match = candidates.find(([, dimensions]) => dimensions);
  if (!match) return undefined;
  const [mimeType, dimensions] = match;
  if (!dimensions
    || dimensions.width <= 0
    || dimensions.height <= 0
    || dimensions.width > MAX_IMAGE_DIMENSION
    || dimensions.height > MAX_IMAGE_DIMENSION) return undefined;
  return { mimeType, width: dimensions.width, height: dimensions.height };
}

// Keep one bounded, verified set for both Markdown and poster output. The
// Markdown-only path validates bytes without retaining a base64 copy.
async function collectVerifiedScreenshots(projectPath, screenshots, locale, { embed = false, strictPaths = embed } = {}) {
  const mimeTypes = new Map([[".png", "image/png"], [".webp", "image/webp"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"]]);
  const posterScreenshots = [];
  const verifiedEvidenceViewports = [];
  const invalidEvidenceViewports = [];
  for (const shot of screenshots) {
    if (verifiedEvidenceViewports.length >= 3) break;
    const label = screenshotLabel(shot, locale);
    if (!shot?.imagePath || typeof shot.imagePath !== "string") {
      invalidEvidenceViewports.push(label);
      continue;
    }
    try {
      const fullPath = await insideProjectRealpath(projectPath, shot.imagePath, "screenshot imagePath");
      const mimeType = mimeTypes.get(extname(fullPath).toLowerCase());
      if (!mimeType) {
        invalidEvidenceViewports.push(label);
        continue;
      }
      const image = await readFile(fullPath);
      const info = imageInfo(image);
      if (!info) {
        invalidEvidenceViewports.push(label);
        continue;
      }
      const name = viewportLabel(safeText(shot.viewport?.name), locale);
      const width = Number(shot.viewport?.width) || 0;
      const height = Number(shot.viewport?.height) || 0;
      const verifiedLabel = `${name}: ${width} x ${height}`;
      verifiedEvidenceViewports.push(verifiedLabel);
      if (embed) {
        posterScreenshots.push({
          image: image.toString("base64"),
          mimeType: info.mimeType,
          label: verifiedLabel,
        });
      }
    } catch (error) {
      // Embedded poster bytes must never cross the project boundary. A
      // Markdown-only summary does not read or expose the outside file, so an
      // obsolete or cross-theme symlink is recorded as invalid and skipped.
      if (strictPaths && error instanceof Error && error.message.includes("must resolve inside projectPath.")) throw error;
      invalidEvidenceViewports.push(label);
    }
  }
  return { posterScreenshots, verifiedEvidenceViewports, invalidEvidenceViewports };
}

function formatList(items, emptyLabel) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : `- ${emptyLabel}`;
}

async function collectFreshnessWarnings(projectPath, report, sourcePaths, screenshots, locale) {
  const generatedAt = Date.parse(String(report.generatedAt ?? ""));
  if (!Number.isFinite(generatedAt)) return [];
  const warnings = [];
  const reportedFiles = Array.isArray(report.git?.files)
    ? report.git.files.map((file) => file?.path).filter((filePath) => typeof filePath === "string")
    : [];
  const sourceCandidates = [...sourcePaths.filter(Boolean)];
  for (const reportedPath of reportedFiles) {
    try {
      sourceCandidates.push(await insideProjectRealpath(projectPath, reportedPath, "Git file path"));
    } catch (error) {
      if (!(error instanceof Error && error.message.includes("must resolve inside projectPath."))) throw error;
    }
  }
  for (const sourcePath of [...new Set(sourceCandidates)]) {
    try {
      const details = await stat(sourcePath);
      if (details.mtimeMs > generatedAt + FRESHNESS_CLOCK_SKEW_MS) {
        const relativePath = safeRelativePath(projectRelativePath(projectPath, sourcePath));
        warnings.push(locale === "zh-CN"
          ? `布局源文件 ${relativePath} 在报告生成后发生过修改，请重新采集。`
          : `Layout source ${relativePath} changed after the report was generated; recapture evidence.`);
      }
      if (warnings.length >= MAX_FRESHNESS_WARNINGS) break;
    } catch (error) {
      if (!isMissingSourceError(error)) throw error;
    }
  }
  for (const screenshot of screenshots) {
    const capturedAt = Date.parse(String(screenshot?.capturedAt ?? ""));
    if (Number.isFinite(capturedAt) && capturedAt > generatedAt + FRESHNESS_CLOCK_SKEW_MS) {
      warnings.push(locale === "zh-CN"
        ? `截图 ${screenshotLabel(screenshot, locale)} 的采集时间晚于报告生成时间，请重新生成报告。`
        : `Screenshot ${screenshotLabel(screenshot, locale)} was captured after the report timestamp; regenerate the report.`);
    }
    if (Number.isFinite(capturedAt) && typeof screenshot?.imagePath === "string") {
      try {
        const imagePath = await insideProjectRealpath(projectPath, screenshot.imagePath, "screenshot imagePath");
        const details = await stat(imagePath);
        if (details.mtimeMs > capturedAt + FRESHNESS_CLOCK_SKEW_MS) {
          warnings.push(locale === "zh-CN"
            ? `截图 ${screenshotLabel(screenshot, locale)} 的文件在采集时间后发生过修改，请重新采集。`
            : `Screenshot file ${screenshotLabel(screenshot, locale)} changed after its capture time; recapture evidence.`);
        }
      } catch (error) {
        if (!(isMissingSourceError(error) || (error instanceof Error && error.message.includes("must resolve inside projectPath.")))) throw error;
      }
    }
    if (warnings.length >= MAX_FRESHNESS_WARNINGS) break;
  }
  for (const receipt of Array.isArray(report.tests) ? report.tests : []) {
    const startedAt = Date.parse(String(receipt?.startedAt ?? ""));
    if (Number.isFinite(startedAt) && startedAt > generatedAt + FRESHNESS_CLOCK_SKEW_MS) {
      warnings.push(locale === "zh-CN"
        ? `测试 ${truncateText(safeText(receipt?.command), 120) || "未命名命令"} 晚于报告生成时间，请重新生成报告。`
        : `Test ${truncateText(safeText(receipt?.command), 120) || "unnamed command"} started after the report timestamp; regenerate the report.`);
    }
    if (warnings.length >= MAX_FRESHNESS_WARNINGS) break;
  }
  return [...new Set(warnings)].slice(0, MAX_FRESHNESS_WARNINGS);
}

function localeText(locale) {
  return locale === "zh-CN" ? {
    title: "布局摘要", projectTask: "项目与任务", task: "任务", status: "状态", version: "报告版本", poster: "海报产物", posterNotGenerated: "本次未生成", freshness: "时效审查", freshnessOk: "报告、源文件和截图的时间顺序未发现明显冲突", theme: "主题系统", rail: "交付轨道", main: "主页面区段", breakpoints: "响应式断点", screenshots: "截图视口", git: "Git 改动", range: "范围", receipts: "测试回执", privacy: "隐私审查", redactions: "已脱敏值", interactions: "交互控件", notRecorded: "未记录", untitledProject: "未命名项目", unknown: "未知", notCaptured: "未捕获", exit: "退出码", conclusion: "根据报告和布局源文件在本地生成。未上传任何内容。", empty: "未记录", posterTitle: "布局证据海报", kicker: "交付证据 / 本地报告", verified: "已验证", files: "改动文件", tests: "通过测试", redaction: "已脱敏", footer: "仅在本地生成 / 不会上传",
    interaction: ["带本地持久化偏好的分段主题切换", "支持键盘操作的改版前后范围控件", "可展开的测试回执输出", "带状态反馈的本地导出操作", "已变更文件 Diff 选择"],
  } : {
    title: "Layout Summary", projectTask: "Project and task", task: "Task", status: "Status", version: "Report version", poster: "Poster artifact", posterNotGenerated: "Not generated for this call", freshness: "Freshness review", freshnessOk: "No obvious timestamp conflicts found across the report, sources, and captures", theme: "Theme system", rail: "Operations rail", main: "Main page sections", breakpoints: "Responsive breakpoints", screenshots: "Screenshot viewports", git: "Git changes", range: "Range", receipts: "Test receipts", privacy: "Privacy review", redactions: "Redacted values", interactions: "Interaction controls", notRecorded: "Not recorded", untitledProject: "Untitled project", unknown: "unknown", notCaptured: "not captured", exit: "exit", conclusion: "Generated locally from report and layout source files. No content was uploaded.", empty: "None recorded", posterTitle: "Layout evidence poster", kicker: "DELIVERY EVIDENCE / LOCAL REPORT", verified: "VERIFIED", files: "FILES CHANGED", tests: "TESTS PASSED", redaction: "REDACTIONS", footer: "LOCAL ONLY / NO UPLOAD",
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
  const labels = locale === "zh-CN"
    ? { completed: "已验证", passed: "已通过", partial: "需要复核", failed: "执行失败", skipped: "已跳过", running: "准备中" }
    : { completed: "VERIFIED", passed: "PASSED", partial: "NEEDS REVIEW", failed: "FAILED", skipped: "SKIPPED", running: "RUNNING" };
  return labels[status] ?? status;
}

function taskStatusModel(value, locale) {
  const raw = safeText(value);
  const key = raw === "completed" || raw === "partial" || raw === "failed" ? raw : "partial";
  return { key, label: statusLabel(key, locale) };
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
  const generatePoster = options.generatePoster === undefined ? true : options.generatePoster;
  if (typeof generatePoster !== "boolean") throw new Error("generatePoster must be a boolean.");
  const text = localeText(locale);
  const projectPath = resolve(options.projectPath);
  const paths = await Promise.all([
    insideProjectRealpath(projectPath, options.reportPath ?? DEFAULT_REPORT_PATH, "reportPath"),
    insideProjectRealpath(projectPath, options.outputPath ?? DEFAULT_OUTPUT_PATH, "outputPath"),
    ...(generatePoster ? [insideProjectRealpath(projectPath, options.posterPath ?? DEFAULT_POSTER_PATH, "posterPath")] : []),
  ]);
  const [reportPath, outputPath] = paths;
  const posterPath = generatePoster ? paths[2] : undefined;
  await assertDistinctArtifactPaths([
    ["reportPath", reportPath],
    ["outputPath", outputPath],
    ...(generatePoster ? [["posterPath", posterPath]] : []),
  ]);
  assertArtifactOutputPath(projectPath, outputPath, "outputPath", MARKDOWN_EXTENSIONS);
  if (generatePoster) assertArtifactOutputPath(projectPath, posterPath, "posterPath", HTML_EXTENSIONS);
  const { appPath, cssPath } = await discoverLayoutSources(projectPath, options);
  let report;

  try {
    const reportDetails = await stat(reportPath);
    if (!reportDetails.isFile()) throw new Error("reportPath must point to a file.");
    if (reportDetails.size > MAX_REPORT_BYTES) {
      throw new Error(`reportPath exceeds the ${MAX_REPORT_BYTES} byte safety limit.`);
    }
    const rawReport = JSON.parse(await readFile(reportPath, "utf8"));
    report = reportSchema.parse(rawReport);
  } catch (error) {
    if (Array.isArray(error?.issues)) {
      throw new Error(`Invalid report JSON: ${formatReportIssues(error)}`);
    }
    throw new Error(`Unable to read report JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  let app = "";
  let css = "";
  let posterImage = Buffer.alloc(0);
  try {
    [app, css] = await Promise.all([
      readOptionalSource(projectPath, appPath, "App source path"),
      readOptionalSource(projectPath, cssPath, "CSS source path"),
    ]);
    // Static HTML projects often keep responsive rules in an inline <style>
    // block. Let that source feed breakpoint detection when no .css file exists.
    if (!css && appPath && [".html", ".htm"].includes(sourceExtension(appPath))) css = app;
    if (generatePoster && theme === "blue-big-fish") {
      posterImage = await readFile(new URL("./assets/whale-girl-keyvisual.webp", import.meta.url));
    }
  } catch (error) {
    throw new Error(`Unable to read layout sources or poster asset: ${error instanceof Error ? error.message : String(error)}`);
  }

  const selectedTheme = themeLabel(theme, locale);
  const stages = collectStages(app, locale);
  const breakpoints = collectBreakpoints(css);
  const screenshots = Array.isArray(report.screenshots) ? report.screenshots : [];
  const matchingScreenshots = [];
  const isolatedScreenshots = [];
  const unclassifiedScreenshots = [];
  for (const screenshot of screenshots) {
    const captureTheme = screenshotTheme(screenshot);
    if (captureTheme === theme) matchingScreenshots.push(screenshot);
    else if (captureTheme) isolatedScreenshots.push(screenshot);
    else unclassifiedScreenshots.push(screenshot);
  }
  const collectedEvidence = await collectVerifiedScreenshots(
    projectPath,
    generatePoster ? matchingScreenshots : screenshots,
    locale,
    { embed: generatePoster },
  );
  const posterScreenshots = collectedEvidence.posterScreenshots;
  const invalidEvidenceViewports = collectedEvidence.invalidEvidenceViewports;
  const evidenceViewports = collectedEvidence.verifiedEvidenceViewports;
  const files = Array.isArray(report.git?.files) ? report.git.files : [];
  const tests = Array.isArray(report.tests) ? report.tests : [];
  const freshnessWarnings = await collectFreshnessWarnings(projectPath, report, [appPath, cssPath], screenshots, locale);
  const taskStatus = taskStatusModel(report.task?.status, locale);
  const redaction = report.redaction ?? {};
  const sections = locale === "zh-CN" ? ["项目与任务", "主题系统", "交付轨道", "证据带", "响应式采集", "变更清单", "验证回执", "时效审查", "隐私审查", "本地导出控件"] : ["Project and task", "Theme system", "Operations rail", "Evidence bands", "Responsive capture", "Change set", "Verification receipts", "Freshness review", "Privacy review", "Local export controls"];
  // A poster is scoped to one visual theme. Keep its textual viewport claims
  // aligned with the same filtered evidence set used for embedded images.
  const viewports = evidenceViewports;
  const posterViewports = [...viewports];
  const projectName = truncateText(safeText(report.project?.name), MAX_PROJECT_COPY_LENGTH) || text.untitledProject;
  const taskText = truncateText(safeText(report.task?.goal), MAX_TASK_COPY_LENGTH) || text.notRecorded;
  const passedTests = tests.filter((test) => test.status === "passed").length;
  const gitUnavailable = report.git?.baseRef === "NO_GIT" && report.git?.headRef === "NO_GIT";
  const gitState = gitUnavailable ? "unavailable" : files.length ? "changed" : "clean";
  const testState = tests.length ? (tests.some((test) => test.status === "failed") ? "failed" : "configured") : "unconfigured";
  const visualProject = Boolean(
    cssPath
      || (appPath && VISUAL_SOURCE_EXTENSIONS.has(sourceExtension(appPath)))
      || /<(?:html|body|main|section|article|div|button|form|canvas|svg)\b|React\.createElement\s*\(|document\.(?:querySelector|getElementById|createElement)\s*\(/i.test(app),
  );
  const gitRange = truncateText(`${safeText(report.git?.baseRef) || text.unknown}..${safeText(report.git?.headRef) || text.unknown}`, 180);
  const gitFiles = files.slice(0, 5).map((file) => ({
    path: safeRelativePath(file.path),
    additions: Number(file.additions) || 0,
    deletions: Number(file.deletions) || 0,
  }));
  const testReceipts = tests.slice(0, 3).map((test) => ({
    command: truncateText(safeText(test.command), 240),
    duration: durationLabel(test.durationMs),
    exitCode: Number(test.exitCode) || 0,
    status: safeText(test.status),
    statusLabel: statusLabel(test.status, locale),
  }));
  const changes = files.map((file) => `\`${safeRelativePath(file.path)}\` (${statusLabel(file.status, locale)}, +${Number(file.additions) || 0} / -${Number(file.deletions) || 0})`);
  const receipts = tests.map((test) => `\`${truncateText(safeText(test.command), 240)}\` (${statusLabel(test.status, locale)}, ${text.exit} ${Number(test.exitCode) || 0})`);
  const redactionItems = Object.entries(redaction.replacements ?? {}).map(([name, count]) => `${redactionLabel(name, locale)}: ${Number(count) || 0}`);
  const interactions = interactionList(app, locale);
  const posterReference = generatePoster ? projectRelativePath(projectPath, posterPath) : text.posterNotGenerated;
  const markdown = [
    `# ${text.title}`,
    "",
    `## ${text.projectTask}`,
    `- ${text.task}: ${taskText}`,
    `- ${text.status}: ${statusLabel(report.task?.status, locale) || text.notRecorded}`,
    `- ${text.version}: ${safeText(report.version) || text.notRecorded}`,
    `- ${text.poster}: ${posterReference}`,
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
    formatList(viewports, text.notCaptured),
    "",
    `## ${text.git}`,
    `- ${text.range}: ${safeText(report.git?.baseRef) || text.unknown}..${safeText(report.git?.headRef) || text.unknown}`,
    ...changes.map((change) => `- ${change}`),
    "",
    `## ${text.receipts}`,
    ...receipts.map((receipt) => `- ${receipt}`),
    "",
    `## ${text.freshness}`,
    formatList(freshnessWarnings, text.freshnessOk),
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
  let sanitizedPoster;
  if (generatePoster) {
    const posterHtml = createStyledPosterHtml({
      image: posterImage.toString("base64"),
      projectName,
      task: taskText,
      stages,
      fileCount: files.length,
      passedTests,
      testCount: tests.length,
      redactionCount: Number(redaction.totalReplacements) || 0,
      // Keep the filtered poster set available to the renderer as the source of
      // truth; legacy fields remain populated for callers that already consume
      // them.
      viewports: posterViewports,
      posterScreenshots,
      evidenceImages: posterScreenshots,
      evidenceViewports,
      isolatedEvidenceViewports: isolatedScreenshots.map((shot) => screenshotLabel(shot, locale)),
      unclassifiedEvidenceViewports: unclassifiedScreenshots.map((shot) => screenshotLabel(shot, locale)),
      invalidEvidenceViewports,
      evidenceThemeName: selectedTheme,
      gitRange,
      gitState,
      testState,
      visualProject,
      taskStatus: taskStatus.key,
      taskStatusLabel: taskStatus.label,
      gitFileCount: Number(report.git?.summary?.changedFiles) || files.length,
      gitFiles,
      testReceipts,
      freshnessWarnings,
      reportPath: projectRelativePath(projectPath, reportPath),
      summaryPath: projectRelativePath(projectPath, outputPath),
      posterPath: projectRelativePath(projectPath, posterPath),
      locale,
      theme,
    });
    sanitizedPoster = posterHtml.replaceAll(projectPath, "[PATH OMITTED]");
  }
  await writeArtifactFiles([
    ...(generatePoster ? [{ path: posterPath, content: sanitizedPoster }] : []),
    { path: outputPath, content: sanitizedMarkdown },
  ]);
  return {
    locale,
    outputPath: projectRelativePath(projectPath, outputPath),
    ...(generatePoster ? { posterPath: projectRelativePath(projectPath, posterPath) } : {}),
    posterGenerated: generatePoster,
    sections,
    theme: selectedTheme,
    themeKey: theme,
    freshnessWarnings,
    breakpoints,
    stages,
    testCount: tests.length,
    redactionCount: Number(redaction.totalReplacements) || 0,
  };
}

export { insideProject, safeRelativePath };
