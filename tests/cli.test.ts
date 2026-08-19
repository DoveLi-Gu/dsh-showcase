import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { capture, init } from "../src/cli/index";

const execFileAsync = promisify(execFile);
const temporaryDirectories: string[] = [];
const tsxCliPath = join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
const showcaseCliPath = join(process.cwd(), "src", "cli", "index.ts");

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function createCaptureProject(packageName?: string) {
  const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-capture-"));
  temporaryDirectories.push(projectPath);
  await mkdir(join(projectPath, ".showcase"), { recursive: true });
  await writeFile(join(projectPath, ".showcase", "config.json"), JSON.stringify({
    task: "Refresh current delivery evidence.",
    tests: [],
  }), "utf8");
  if (packageName) {
    await writeFile(join(projectPath, "package.json"), JSON.stringify({ name: packageName }), "utf8");
  }
  await execFileAsync("git", ["init"], { cwd: projectPath, windowsHide: true });
  return projectPath;
}

describe("capture", () => {
  it("uses the package name and preserves existing screenshot evidence", async () => {
    const projectPath = await createCaptureProject("another-project");
    const screenshot = {
      id: "desktop-after",
      label: "Desktop evidence",
      theme: "blue-big-fish",
      viewport: { name: "desktop", width: 1440, height: 900 },
      url: "http://127.0.0.1:5173/",
      imagePath: "evidence/desktop.png",
      capturedAt: "2026-08-18T00:00:00.000Z",
      kind: "after",
    };
    await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify({
      version: 1,
      generatedAt: "2026-08-18T00:00:00.000Z",
      project: { name: "stale-project-name" },
      task: {
        id: "old-task",
        goal: "Old evidence",
        status: "completed",
        startedAt: "2026-08-18T00:00:00.000Z",
        completedAt: "2026-08-18T00:00:01.000Z",
        durationMs: 1000,
      },
      git: {
        baseRef: "UNBORN",
        headRef: "UNBORN",
        files: [],
        summary: { changedFiles: 0, additions: 0, deletions: 0 },
      },
      tests: [],
      screenshots: [screenshot],
      redaction: { originalLength: 0, redactedLength: 0, replacements: {}, totalReplacements: 0 },
    }), "utf8");

    const reportPath = await capture(projectPath);
    const report = JSON.parse(await readFile(reportPath, "utf8"));

    expect(report.project).toEqual({ name: "another-project" });
    expect(report.task.goal).toBe("Refresh current delivery evidence.");
    expect(report.task.status).toBe("partial");
    expect(report.screenshots).toEqual([screenshot]);
  });

  it("falls back to the project directory when package metadata is unavailable", async () => {
    const projectPath = await createCaptureProject();

    const reportPath = await capture(projectPath);
    const report = JSON.parse(await readFile(reportPath, "utf8"));

    expect(report.project).toEqual({ name: basename(projectPath) });
    expect(report.task.status).toBe("partial");
    expect(report.screenshots).toEqual([]);
  });

  it("chooses a Python test command when initializing a non-Node project", async () => {
    const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-python-init-"));
    temporaryDirectories.push(projectPath);
    await writeFile(join(projectPath, "pyproject.toml"), "[project]\nname = 'ledger-api'\n", "utf8");

    await init(projectPath);
    const config = JSON.parse(await readFile(join(projectPath, ".showcase", "config.json"), "utf8"));

    expect(config.tests).toEqual(["pytest -q"]);
  });

  it("uses the package test script without runner-specific arguments", async () => {
    const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-node-init-"));
    temporaryDirectories.push(projectPath);
    await writeFile(join(projectPath, "package.json"), JSON.stringify({
      name: "plain-node-project",
      scripts: { test: "node -e \"console.log('ok')\"" },
    }), "utf8");

    await init(projectPath);
    const config = JSON.parse(await readFile(join(projectPath, ".showcase", "config.json"), "utf8"));

    expect(config.tests).toEqual(["npm test"]);
  });

  it("does not invent a failing command for a Node package without a test script", async () => {
    const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-node-no-test-"));
    temporaryDirectories.push(projectPath);
    await writeFile(join(projectPath, "package.json"), JSON.stringify({ name: "no-test-script" }), "utf8");

    await init(projectPath);
    const config = JSON.parse(await readFile(join(projectPath, ".showcase", "config.json"), "utf8"));

    expect(config.tests).toEqual([]);
  });

  it("does not overwrite an existing customized config", async () => {
    const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-existing-config-"));
    temporaryDirectories.push(projectPath);
    await mkdir(join(projectPath, ".showcase"), { recursive: true });
    const destination = join(projectPath, ".showcase", "config.json");
    const original = '{"task":"Keep my settings","tests":[]}\n';
    await writeFile(destination, original, "utf8");

    await expect(init(projectPath)).rejects.toThrow("already exists");
    expect(await readFile(destination, "utf8")).toBe(original);
  });

  it("writes a partial report instead of failing outside a Git repository", async () => {
    const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-no-git-capture-"));
    temporaryDirectories.push(projectPath);
    await mkdir(join(projectPath, ".showcase"), { recursive: true });
    await writeFile(join(projectPath, ".showcase", "config.json"), JSON.stringify({
      task: "Capture without Git.",
      tests: [`"${process.execPath}" -e "console.log('pass')"`],
    }), "utf8");

    const reportPath = await capture(projectPath);
    const report = JSON.parse(await readFile(reportPath, "utf8"));

    expect(report.git).toMatchObject({ baseRef: "NO_GIT", headRef: "NO_GIT" });
    expect(report.tests[0].status).toBe("passed");
    expect(report.task.status).toBe("partial");
  });

  it("marks failed verification as failed instead of partial", async () => {
    const projectPath = await createCaptureProject("failed-project");
    await writeFile(join(projectPath, ".showcase", "config.json"), JSON.stringify({
      task: "Capture a failed verification.",
      tests: [`"${process.execPath}" -e "process.exit(7)"`],
    }), "utf8");

    const reportPath = await capture(projectPath);
    const report = JSON.parse(await readFile(reportPath, "utf8"));

    expect(report.tests[0]).toMatchObject({ status: "failed", exitCode: 7 });
    expect(report.task.status).toBe("failed");
  });

  it("returns a non-zero process exit after preserving a failed report", async () => {
    const projectPath = await createCaptureProject("failed-cli-project");
    await writeFile(join(projectPath, ".showcase", "config.json"), JSON.stringify({
      task: "Verify CLI failure semantics.",
      tests: [`"${process.execPath}" -e "process.exit(6)"`],
    }), "utf8");

    let exitCode: string | number | undefined;
    try {
      await execFileAsync(process.execPath, [tsxCliPath, showcaseCliPath, "capture"], {
        cwd: projectPath,
        windowsHide: true,
      });
    } catch (error) {
      exitCode = (error as NodeJS.ErrnoException & { code?: string | number }).code;
    }

    const report = JSON.parse(await readFile(join(projectPath, ".showcase", "report.json"), "utf8"));
    expect(exitCode).toBe(1);
    expect(report.task.status).toBe("failed");
    expect(report.tests[0]).toMatchObject({ status: "failed", exitCode: 6 });
  });

  it.each([
    ["Cargo.toml", "", ["cargo test"]],
    ["go.mod", "module example.com/service\n", ["go test ./..."]],
    ["pom.xml", "<project/>\n", ["mvn test"]],
    ["gradlew.bat", "@echo off\n", ["gradlew.bat test"]],
  ])("chooses the documented default test command for %s", async (marker, contents, expected) => {
    const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-toolchain-init-"));
    temporaryDirectories.push(projectPath);
    await writeFile(join(projectPath, marker), contents, "utf8");

    await init(projectPath);
    const config = JSON.parse(await readFile(join(projectPath, ".showcase", "config.json"), "utf8"));

    expect(config.tests).toEqual(expected);
  });
});
