import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { generateLayoutSummary } from "../plugin/layout-summary.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

function report(projectName: string) {
  return {
    version: 1,
    generatedAt: "2026-08-18T10:00:00.000Z",
    project: { name: projectName },
    task: {
      id: "source-discovery-fixture",
      goal: "Generate a local layout summary from a generic project.",
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

async function createProject(name: string) {
  const projectPath = await mkdtemp(join(tmpdir(), name));
  temporaryDirectories.push(projectPath);
  await mkdir(join(projectPath, ".showcase"), { recursive: true });
  await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify(report(name)), "utf8");
  return projectPath;
}

describe("layout source discovery", () => {
  it("uses nested ordinary Node sources instead of requiring src/App.tsx", async () => {
    const projectPath = await createProject("dsh-source-node-");
    await mkdir(join(projectPath, "web"), { recursive: true });
    await writeFile(join(projectPath, "web", "server.js"), 'const stages = [{ id: "PROMPT" }, { id: "BUILD" }, { id: "TEST" }, { id: "CAPTURE" }, { id: "SHIP" }];\n', "utf8");
    await writeFile(join(projectPath, "web", "theme.css"), "@media (max-width: 720px) {}\n@media screen and (max-width: 45rem) {}\n", "utf8");

    const result = await generateLayoutSummary({ projectPath });
    expect(result.breakpoints).toEqual(["max-width: 720px", "max-width: 45rem"]);
    expect(result.stages).toEqual(["提示", "构建", "测试", "捕获", "交付"]);
  });

  it("reads inline responsive rules from a static HTML project", async () => {
    const projectPath = await createProject("dsh-source-html-");
    await writeFile(join(projectPath, "index.html"), '<style>@media (max-width: 888px) { body { color: red; } }</style><script>const stages = [{ id: "PROMPT" }, { id: "BUILD" }, { id: "TEST" }, { id: "CAPTURE" }, { id: "SHIP" }];</script>', "utf8");

    const result = await generateLayoutSummary({ projectPath, theme: "blue-big-fish" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");
    expect(result.breakpoints).toEqual(["max-width: 888px"]);
    expect(result.stages).toEqual(["提示", "构建", "测试", "捕获", "交付"]);
    expect(poster).toContain("dsh-source-html-");
  });

  it("keeps missing or explicitly unavailable sources optional", async () => {
    const projectPath = await createProject("dsh-source-empty-");

    const result = await generateLayoutSummary({
      projectPath,
      appPath: "missing/App.tsx",
      cssPath: "missing/styles.css",
    });
    expect(result.breakpoints).toEqual([]);
    expect(result.stages).toEqual(["提示", "构建", "测试", "捕获", "交付"]);
  });
});
