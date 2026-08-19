import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { generateLayoutSummary } from "../plugin/layout-summary.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

function validReport(goal = "Generate local evidence.") {
  return {
    version: 1,
    generatedAt: "2026-08-18T10:00:00.000Z",
    project: { name: "extreme-input-fixture" },
    task: {
      id: "extreme-input-fixture",
      goal,
      status: "completed",
      startedAt: "2026-08-18T09:00:00.000Z",
      completedAt: "2026-08-18T10:00:01.000Z",
      durationMs: 1000,
    },
    git: { baseRef: "main", headRef: "HEAD", files: [], summary: { changedFiles: 0, additions: 0, deletions: 0 } },
    tests: [],
    screenshots: [],
    redaction: { originalLength: 0, redactedLength: 0, replacements: {}, totalReplacements: 0 },
  };
}

async function createProject() {
  const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-extreme-"));
  temporaryDirectories.push(projectPath);
  await mkdir(join(projectPath, ".showcase"), { recursive: true });
  return projectPath;
}

describe("extreme report inputs", () => {
  it("rejects an oversized report before parsing or writing output", async () => {
    const projectPath = await createProject();
    await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify(validReport("X".repeat(2 * 1024 * 1024))), "utf8");

    await expect(generateLayoutSummary({ projectPath })).rejects.toThrow(/reportPath exceeds the 2097152 byte safety limit/);
    await expect(stat(join(projectPath, ".showcase", "layout-summary.md"))).rejects.toThrow();
    await expect(stat(join(projectPath, ".showcase", "layout-poster.html"))).rejects.toThrow();
  });

  it("keeps an empty non-package project usable with no discovered source files", async () => {
    const projectPath = await createProject();
    await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify(validReport()), "utf8");

    const result = await generateLayoutSummary({ projectPath, appPath: "missing/app.py", cssPath: "missing/style.css" });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    expect(result.breakpoints).toEqual([]);
    expect(result.stages).toEqual(["提示", "构建", "测试", "捕获", "交付"]);
    expect(markdown).toContain("## 截图视口\n- 未捕获");
  });
});

