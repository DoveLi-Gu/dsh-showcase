import { describe, expect, it } from "vitest";
import { findComparisonPair, formatReportDuration, sanitizeReportExport, serializeInlineJson } from "../plugin/report-content.js";
import { createStyledPosterHtml } from "../plugin/poster-html.js";
import { reportSchema } from "../src/core/report-schema";
import { demoReport } from "../src/core/demo-fixture";
import { solidPng } from "./png-fixture";

const image = solidPng(64, 64).toString("base64");
const shot = (kind: string, overrides = {}) => ({ kind, url: "http://localhost/page", viewport: { width: 1000, height: 900 }, captureMode: "viewport", mimeType: "image/png", image, label: kind, ...overrides });

describe("report content parity", () => {
  it("pairs only matching pages, viewports, themes and image proportions", () => {
    const before = shot("before"), after = shot("after");
    expect(findComparisonPair([after, before])).toEqual({ before, after });
    expect(findComparisonPair([after, shot("before", { url: "http://localhost/unrelated" })])).toBeUndefined();
    expect(findComparisonPair([after, shot("before", { viewport: { width: 390, height: 844 } })])).toBeUndefined();
    expect(findComparisonPair([after, shot("before", { captureMode: "region" })])).toBeUndefined();
    expect(findComparisonPair([shot("after", { theme: "frontier-signal" }), shot("before", { theme: "blue-big-fish" })])).toBeUndefined();
    expect(findComparisonPair([shot("after", { imageWidth: 1000, imageHeight: 900 }), shot("before", { imageWidth: 1000, imageHeight: 1500 })])).toBeUndefined();
    expect(findComparisonPair([shot("after", { comparisonId: "release" }), shot("before", { comparisonId: "release", url: "http://localhost/old" })])).toBeDefined();
  });

  it("preserves optional diff evidence without invalidating older reports", () => {
    const report = structuredClone(demoReport);
    expect(reportSchema.parse(report).git.files[0].diff).toContain("@@");
    delete report.git.files[0].diff;
    expect(reportSchema.parse(report).git.files[0].diff).toBeUndefined();
    report.git.files[0].diff = "x".repeat(65_537);
    expect(() => reportSchema.parse(report)).toThrow();
  });

  it("exports only report fields and redacts nested diff and command output", () => {
    const secret = "sk-fake012345678901234567890";
    const clean = sanitizeReportExport({ ...demoReport, privateHostData: secret, git: { files: [{ path: "src/main.ts", diff: "+api_key=" + secret }] }, tests: [{ command: "verify", output: "token=private-test-value" }] });
    expect(clean).not.toHaveProperty("privateHostData");
    expect(JSON.stringify(clean)).not.toContain(secret);
    expect(JSON.stringify(clean)).not.toContain("private-test-value");
    const script = serializeInlineJson({ task: "</script><script>alert(1)</script>\u2028" });
    expect(script).not.toContain("</script>");
    expect(JSON.parse(script).task).toContain("</script>");
  });

  it("renders the complete Dijiang evidence modules and export payload", () => {
    const html = createStyledPosterHtml({ theme: "frontier-signal", locale: "zh-CN", demo: true, projectName: "parity", task: demoReport.task.goal,
      taskStatus: "partial", durationMs: demoReport.task.durationMs, additions: 144, deletions: 12,
      gitFiles: demoReport.git.files, fileCount: 2, testReceipts: demoReport.tests,
      redactionCount: 3, redactionDetails: [{ name: "令牌", count: 1 }, { name: "本机路径", count: 2 }],
      reportData: { ...demoReport, demo: true }, posterScreenshots: [shot("after"), shot("before")] });
    for (const label of ["交付摘要", "28 分 0 秒", "逐行差异", "前后对比", "隐私审查", "令牌", "本机路径", "下载 JSON", "下载 Markdown"]) expect(html).toContain(label);
    expect(html).toContain('data-ed-file="1"');
    expect(html).toContain('id="ed-diff-1" hidden');
    expect(html).toContain("&lt;main&gt;Ready&lt;/main&gt;");
    expect(html).toContain('class="ed-diff-line addition"');
    expect(html).toContain('class="ed-diff-line deletion"');
    expect(html).not.toContain('\\n</code>');
    expect(html).toContain('data-ed-comparison');
    expect(html.match(/data:image\/png;base64,/g)).toHaveLength(2);
    const payload = JSON.parse(html.match(/<script id="ed-export-data" type="application\/json">([\s\S]*?)<\/script>/)![1]);
    expect(payload.report.git.files).toHaveLength(2);
    expect(payload.report.demo).toBe(true);
    expect(payload.markdown).toContain("演示数据");
  });

  it("shows explicit missing evidence instead of inventing a diff or a comparison", () => {
    const html = createStyledPosterHtml({ theme: "frontier-signal", gitFiles: [{ path: "plain.txt", additions: 1, deletions: 0 }],
      posterScreenshots: [shot("after")], redactionCount: 3 });
    expect(html).toContain("报告未保留逐行 Diff");
    expect(html).toContain("尚无相同页面、相同视口");
    expect(html).toContain("未记录脱敏分类明细");
    expect(html).not.toContain('data-ed-comparison data-before');
    expect(formatReportDuration(undefined)).toBe("未记录");
    expect(formatReportDuration(3_661_000, "en")).toBe("1h 1m 1s");
  });
});
