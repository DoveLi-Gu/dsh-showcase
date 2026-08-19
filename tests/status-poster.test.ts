import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { generateLayoutSummary } from "../plugin/layout-summary.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

function createReport(status: "completed" | "partial" | "failed") {
  const failed = status !== "completed";
  return {
    version: 1,
    generatedAt: "2026-08-18T10:00:00.000Z",
    project: { name: `status-${status}-fixture` },
    task: {
      id: `status-${status}`,
      goal: "Check status semantics across poster themes.",
      status,
      startedAt: "2026-08-18T09:00:00.000Z",
      completedAt: "2026-08-18T10:00:01.000Z",
      durationMs: 1000,
    },
    git: { baseRef: "main", headRef: "HEAD", files: [], summary: { changedFiles: 0, additions: 0, deletions: 0 } },
    tests: [
      { id: "pass", command: "npm test", startedAt: "2026-08-18T09:30:00.000Z", durationMs: 120, exitCode: 0, status: "passed", output: "ok" },
      ...(failed ? [{ id: "failure", command: "npm run verify", startedAt: "2026-08-18T09:31:00.000Z", durationMs: 240, exitCode: 1, status: "failed", output: "failure" }] : []),
    ],
    screenshots: [],
    redaction: { originalLength: 0, redactedLength: 0, replacements: {}, totalReplacements: 0 },
  };
}

async function createProject(status: "completed" | "partial" | "failed") {
  const projectPath = await mkdtemp(join(tmpdir(), "dsh-status-poster-"));
  temporaryDirectories.push(projectPath);
  await mkdir(join(projectPath, ".showcase"), { recursive: true });
  await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify(createReport(status)), "utf8");
  return projectPath;
}

describe("poster status semantics", () => {
  it("keeps a completed report visibly successful", async () => {
    const projectPath = await createProject("completed");
    const fieldResult = await generateLayoutSummary({ projectPath, theme: "frontier-signal" });
    const fieldPoster = await readFile(join(projectPath, fieldResult.posterPath!), "utf8");
    const fishResult = await generateLayoutSummary({ projectPath, theme: "blue-big-fish", posterPath: ".showcase/completed-fish.html" });
    const fishPoster = await readFile(join(projectPath, fishResult.posterPath!), "utf8");

    expect(fieldPoster).toContain('data-theme="frontier-signal" data-status="completed"');
    expect(fieldPoster).toContain("已验证");
    expect(fishPoster).toContain('data-theme="blue-big-fish" data-status="completed"');
    expect(fishPoster).toContain('data-status="passed"');
  });

  it("renders partial and failed reports without claiming success", async () => {
    for (const status of ["partial", "failed"] as const) {
      const projectPath = await createProject(status);
      const result = await generateLayoutSummary({ projectPath, theme: "blue-big-fish" });
      const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

      expect(poster).toContain(`data-theme="blue-big-fish" data-status="${status}"`);
      expect(poster).toContain('data-status="failed"');
      expect(poster).not.toContain("全部验证完成");
      expect(poster).not.toContain("VERIFIED / ALL CHECKS PASSED");
      expect(poster).toContain(status === "partial" ? "部分完成 / 需要复核" : "验证失败 / 不可交付");
      expect(poster).toContain(status === "partial" ? "待复核" : "未通过");
    }
  });
});
