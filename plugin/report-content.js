import { redact } from "./redaction.js";

export function formatReportDuration(milliseconds, locale = "zh-CN") {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return locale === "en" ? "Not recorded" : "未记录";
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return locale === "en"
    ? `${hours ? `${hours}h ` : ""}${minutes % 60}m ${seconds % 60}s`
    : `${hours ? `${hours} 小时 ` : ""}${minutes % 60} 分 ${seconds % 60} 秒`;
}

// Pair only the same page and viewport. Never align unrelated captures by position.
export function findComparisonPair(shots) {
  for (const after of shots) {
    if (after.kind !== "after" || after.captureMode === "region") continue;
    const before = shots.find((shot) => {
      if (shot.kind !== "before" || shot.captureMode === "region") return false;
      if (after.theme && shot.theme && after.theme !== shot.theme) return false;
      const a = after.viewport, b = shot.viewport;
      if (!a || !b || a.width !== b.width || a.height !== b.height) return false;
      if ((after.captureMode ?? "viewport") !== (shot.captureMode ?? "viewport")) return false;
      if (after.imageWidth && shot.imageWidth && after.imageWidth * shot.imageHeight !== shot.imageWidth * after.imageHeight) return false;
      if (after.comparisonId || shot.comparisonId) return Boolean(after.comparisonId && after.comparisonId === shot.comparisonId);
      return Boolean(after.url && shot.url && after.url.split("#")[0] === shot.url.split("#")[0]);
    });
    if (before) return { before, after };
  }
  return undefined;
}

export function sanitizeReportExport(report) {
  const fields = ["version", "generatedAt", "project", "task", "git", "tests", "screenshots", "redaction", "warnings", "demo", "evidenceReview"];
  const sanitize = (value) => {
    if (typeof value === "string") return redact(value).text;
    if (Array.isArray(value)) return value.map(sanitize);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [redact(key).text, sanitize(item)]));
    return value;
  };
  return Object.fromEntries(fields.filter((key) => report?.[key] !== undefined).map((key) => [key, sanitize(report[key])]));
}

export function reportMarkdown(report, locale = "zh-CN") {
  const en = locale === "en";
  const md = (value) => String(value ?? "").replace(/[\\`*_[\]<>]/g, "\\$&").replace(/[\r\n]+/g, " ");
  const files = report.git?.files ?? [];
  const tests = report.tests ?? [];
  return [
    `# ${md(report.project?.name || (en ? "Delivery report" : "交付报告"))}`,
    "", ...(report.demo ? [en ? "> Demo data, not a verified project delivery." : "> 演示数据，不代表当前项目实测交付结果。", ""] : []),
    md(report.task?.goal), "",
    `- ${en ? "Status" : "状态"}: ${md(report.task?.status)}`,
    `- ${en ? "Duration" : "耗时"}: ${formatReportDuration(report.task?.durationMs, locale)}`,
    `- ${en ? "Revision" : "比较范围"}: ${md(report.git?.baseRef)}..${md(report.git?.headRef)}`,
    "", `## ${en ? "Changes" : "变更清单"}`,
    ...files.map((file) => `- ${md(file.path)}: +${Number(file.additions) || 0} / -${Number(file.deletions) || 0}`),
    "", `## ${en ? "Verification" : "验证回执"}`,
    ...tests.map((test) => `- ${md(test.command)}: ${md(test.status)} (exit ${Number(test.exitCode) || 0})`),
    "", `## ${en ? "Privacy review" : "隐私审查"}`,
    ...Object.entries(report.redaction?.replacements ?? {}).map(([name, count]) => `- ${md(name)}: ${Number(count) || 0}`),
    "", `## ${en ? "Review queue" : "复核事项"}`, ...(report.warnings ?? []).map((warning) => `- ${md(warning)}`), "",
  ].join("\n");
}

export function serializeInlineJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
