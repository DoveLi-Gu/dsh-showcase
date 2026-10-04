import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile, symlink, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { collectGitChange, redact, runCommand, reportSchema } from "../src/core";
import { capture, init } from "../src/cli/index";
import { generateLayoutSummary } from "../plugin/layout-summary.js";
import { apply } from "../plugin/index.js";
import { withProjectLock, readBoundedFile } from "../plugin/project-io.js";
import { solidPng } from "./png-fixture";

const exec = promisify(execFile);
const directories: string[] = [];
async function project() {
  const cwd = await mkdtemp(join(tmpdir(), "showcase-regression-"));
  directories.push(cwd);
  await mkdir(join(cwd, ".showcase"));
  return cwd;
}
async function git(cwd: string, ...args: string[]) { return (await exec("git", args, { cwd, windowsHide: true })).stdout; }
async function repository() {
  const cwd = await project();
  await git(cwd, "init", "-q");
  await git(cwd, "config", "user.name", "Test");
  await git(cwd, "config", "user.email", "test@example.invalid");
  await writeFile(join(cwd, "old.txt"), "before\n".repeat(20));
  await git(cwd, "add", "old.txt");
  await git(cwd, "commit", "-qm", "initial");
  return cwd;
}
function report(goal = "Current evidence") {
  const now = new Date().toISOString();
  return reportSchema.parse({ version: 1, generatedAt: now, project: { name: goal }, task: { id: "test", goal, status: "completed", startedAt: now, durationMs: 0 }, git: { baseRef: "HEAD", headRef: "main", files: [], summary: { changedFiles: 0, additions: 0, deletions: 0 } }, tests: [{ command: "verify", status: "passed", exitCode: 0 }], screenshots: [], redaction: {} });
}
async function save(cwd: string, value: unknown, filename = "report.json") { await writeFile(join(cwd, ".showcase", filename), JSON.stringify(value)); }
afterEach(async () => {
  for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true });
});

describe("security and evidence regressions", () => {
  it.each([
    ['Authorization: Basic fake-credential', 'fake-credential'],
    ['{"token":"fake-json-secret"}', 'fake-json-secret'],
    ['Cookie: session=fake-cookie; other=value', 'fake-cookie'],
    ['sk-fake012345678901234567890', 'sk-fake012345678901234567890'],
    ['github_pat_fake012345678901234567890', 'github_pat_fake012345678901234567890'],
  ])("redacts credential formats: %s", (input, secret) => {
    expect(redact(input).text).not.toContain(secret);
    expect(redact(input).summary.totalReplacements).toBeGreaterThan(0);
  });

  it("redacts commands and task text before persisting a capture", async () => {
    const cwd = await repository();
    await save(cwd, { task: "token=task-secret", tests: [`\"${process.execPath}\" -e \"console.log('ok')\" -- --token=command-secret`] }, "config.json");
    const text = await readFile(await capture(cwd), "utf8");
    expect(text).not.toContain("command-secret");
    expect(text).not.toContain("task-secret");
    expect(JSON.parse(text).redaction.totalReplacements).toBeGreaterThanOrEqual(2);
  });

  it("redacts captured patches before report persistence and counts the removed values", async () => {
    const cwd = await repository();
    await writeFile(join(cwd, "old.txt"), "api_key=private-diff-value\n");
    await save(cwd, { task: "Capture patch", tests: [] }, "config.json");
    const raw = await readFile(await capture(cwd), "utf8");
    expect(raw).not.toContain("private-diff-value");
    const result = JSON.parse(raw);
    expect(result.git.files[0].diff).toContain("[REDACTED");
    expect(result.redaction.totalReplacements).toBeGreaterThan(0);
  });

  it("rejects a .showcase junction outside the project", async () => {
    const cwd = await project(); const outside = await project();
    await rm(join(cwd, ".showcase"), { recursive: true });
    await save(outside, { tests: [] }, "config.json");
    await symlink(join(outside, ".showcase"), join(cwd, ".showcase"), process.platform === "win32" ? "junction" : "dir");
    await expect(capture(cwd)).rejects.toThrow(/inside projectPath/);
    await expect(init(cwd)).rejects.toThrow(/inside projectPath/);
  });

  it("never mixes parallel Markdown and HTML transactions", async () => {
    const cwd = await project();
    await save(cwd, report("transaction-marker-AAA"), "a.json"); await save(cwd, report("transaction-marker-BBB"), "b.json");
    await Promise.all(["a", "b", "a", "b"].map((name) => generateLayoutSummary({ projectPath: cwd, reportPath: `.showcase/${name}.json`, theme: "blue-big-fish" })));
    const md = await readFile(join(cwd, ".showcase/layout-summary.md"), "utf8");
    const html = await readFile(join(cwd, ".showcase/layout-poster.html"), "utf8");
    expect(html.includes("transaction-marker-AAA")).toBe(md.includes("transaction-marker-AAA"));
    expect(html.includes("transaction-marker-BBB")).toBe(md.includes("transaction-marker-BBB"));
  });

  it("allows cancellation while queued for the project lock", async () => {
    const cwd = await project(); const controller = new AbortController();
    await withProjectLock(cwd, async () => {
      const pending = withProjectLock(cwd, async () => "never", controller.signal);
      controller.abort();
      await expect(pending).rejects.toThrow();
    });
    await expect(readFile(join(cwd, ".showcase/.write.lock"))).rejects.toThrow();
  });

  it("serializes generators in separate Node processes", async () => {
    const cwd = await project();
    await save(cwd, report("process-marker-first"), "first.json");
    await save(cwd, report("process-marker-last"), "last.json");
    const moduleUrl = new URL("../plugin/layout-summary.js", import.meta.url).href;
    const code = `import {generateLayoutSummary} from ${JSON.stringify(moduleUrl)}; await generateLayoutSummary({projectPath:process.argv[1],reportPath:process.argv[2],theme:'blue-big-fish'});`;
    await Promise.all(["first", "last"].map((name) => exec(process.execPath, ["--input-type=module", "-e", code, cwd, `.showcase/${name}.json`], { windowsHide: true })));
    const md = await readFile(join(cwd, ".showcase/layout-summary.md"), "utf8");
    const html = await readFile(join(cwd, ".showcase/layout-poster.html"), "utf8");
    expect(md.includes("process-marker-first")).toBe(html.includes("process-marker-first"));
    expect(md.includes("process-marker-last")).toBe(html.includes("process-marker-last"));
  });

  it("resolves relative paths from the DSH session, not the host cwd", async () => {
    const cwd = await project(); await save(cwd, report());
    let tool: any;
    apply({ connection: { rpc: { handle() {} } }, settings: { register(_n, _s, options) { return { get: () => options.base, async update() {} }; } }, tools: { register(value) { tool = value; } } });
    await tool.execute({ projectPath: ".", generatePoster: false }, { agent: { session: { meta: { cwd } } } });
    expect(await readFile(join(cwd, ".showcase/layout-summary.md"), "utf8")).toContain("Current evidence");
    await expect(tool.execute({ projectPath: "." })).rejects.toThrow(/absolute projectPath/);
  });

  it("reports renames and historical changes with immutable references", async () => {
    const cwd = await repository();
    await git(cwd, "mv", "old.txt", "new.txt");
    await writeFile(join(cwd, "new.txt"), "before\n".repeat(20) + "added\n");
    const staged = await collectGitChange(cwd);
    expect(staged.files).toEqual([expect.objectContaining({ path: "new.txt", previousPath: "old.txt", status: "renamed", additions: 1 })]);
    await git(cwd, "add", "new.txt"); await git(cwd, "commit", "-qm", "rename");
    expect((await collectGitChange(cwd, { baseRef: "HEAD~1" })).files[0].path).toBe("new.txt");
    await git(cwd, "checkout", "--detach", "-q");
    expect(await collectGitChange(cwd)).toMatchObject({ headRef: "DETACHED", headCommit: expect.stringMatching(/^[a-f0-9]{40,64}$/) });
  });

  it("scopes monorepo file names to the selected project", async () => {
    const cwd = await repository(); await mkdir(join(cwd, "app")); await mkdir(join(cwd, "other"));
    await writeFile(join(cwd, "app/a.txt"), "a"); await writeFile(join(cwd, "other/b.txt"), "b");
    const result = await collectGitChange(join(cwd, "app"));
    expect(result.files.map((f) => f.path)).toEqual(["a.txt"]);
  });

  it("records and flags source changes made during tests", async () => {
    const cwd = await repository();
    await save(cwd, { tests: [`\"${process.execPath}\" -e \"require('fs').writeFileSync('generated.txt','new')\"`] }, "config.json");
    const value = JSON.parse(await readFile(await capture(cwd), "utf8"));
    expect(value.task.status).toBe("partial");
    expect(value.git.files.some((file: { path: string }) => file.path === "generated.txt")).toBe(true);
    expect(value.warnings).toHaveLength(1);
  });

  it("keeps a malformed existing report untouched", async () => {
    const cwd = await project(); await save(cwd, { tests: [] }, "config.json");
    await writeFile(join(cwd, ".showcase/report.json"), "broken sentinel");
    await expect(capture(cwd)).rejects.toThrow(/not overwritten/);
    expect(await readFile(join(cwd, ".showcase/report.json"), "utf8")).toBe("broken sentinel");
  });

  it("uses the same schema for legacy screenshots in CLI and plugin", async () => {
    const cwd = await project(); const value = report();
    const legacy = { ...value, screenshots: [{ theme: "blue-big-fish", viewport: { name: "desktop", width: 1, height: 1 }, imagePath: "pixel.png" }] };
    await save(cwd, legacy); await save(cwd, { tests: [] }, "config.json");
    expect(JSON.parse(await readFile(await capture(cwd), "utf8")).screenshots).toHaveLength(1);
  });

  it("does not trust passed status paired with a failing exit code", async () => {
    const cwd = await project(); const value = report(); value.tests[0].exitCode = 7;
    await save(cwd, value);
    const result = await generateLayoutSummary({ projectPath: cwd, theme: "blue-big-fish" });
    const html = await readFile(join(cwd, result.posterPath!), "utf8");
    expect(html.includes('data-theme="blue-big-fish" data-status="failed"')).toBe(true);
    expect(html.includes("全部验证完成")).toBe(false);
  });

  it("rejects misleading screenshot dimensions and shows the warning in HTML", async () => {
    const cwd = await project(); const value = report();
    await writeFile(join(cwd, "pixel.png"), solidPng(1, 1));
    value.screenshots = [reportSchema.shape.screenshots.element.parse({ viewport: { name: "desktop", width: 1920, height: 1080 }, imagePath: "pixel.png", capturedAt: new Date().toISOString() })];
    await save(cwd, value);
    const result = await generateLayoutSummary({ projectPath: cwd, theme: "blue-big-fish" });
    const html = await readFile(join(cwd, result.posterPath!), "utf8");
    expect(html.includes("data:image/png;base64,")).toBe(false);
    expect(html.includes("图片尺寸不匹配")).toBe(true);
    expect(html.includes("证据需要复核")).toBe(true);
  });

  it("isolates an after screenshot captured before the source change", async () => {
    const cwd = await project(); const value = report();
    await writeFile(join(cwd, "pixel.png"), solidPng(1, 1));
    await utimes(join(cwd, "pixel.png"), new Date("2020-01-01"), new Date("2020-01-01"));
    await writeFile(join(cwd, "index.html"), "<main>new UI</main>");
    value.screenshots = [reportSchema.shape.screenshots.element.parse({ viewport: { name: "desktop", width: 1, height: 1 }, imagePath: "pixel.png", capturedAt: "2020-01-01T00:00:00.000Z" })];
    await save(cwd, value);
    const result = await generateLayoutSummary({ projectPath: cwd });
    expect(result.freshnessWarnings.some((warning) => warning.includes("过期"))).toBe(true);
    expect((await readFile(join(cwd, result.posterPath!), "utf8")).includes("data:image/png;base64,")).toBe(false);
  });

  it("detects tests for mixed stacks and accepts UTF-8 BOM configs", async () => {
    const cwd = await project();
    await writeFile(join(cwd, "package.json"), '{"scripts":{"build":"vite"}}');
    await writeFile(join(cwd, "pyproject.toml"), '[project]\nname="app"');
    await init(cwd);
    expect(JSON.parse(await readFile(join(cwd, ".showcase/config.json"), "utf8")).tests).toEqual(["pytest -q"]);
    await writeFile(join(cwd, ".showcase/config.json"), '\uFEFF{"tests":[]}');
    await expect(capture(cwd)).resolves.toBe(resolve(cwd, ".showcase/report.json"));
  });

  it("retains failing output tails and signals truncation", async () => {
    const value = await runCommand(`\"${process.execPath}\" -e \"console.log('x'.repeat(500));console.log('FAILURE_AT_END');process.exit(1)\"`, { cwd: process.cwd(), maxOutputLength: 100 });
    expect(value.output).toContain("FAILURE_AT_END");
    expect(value.output).toContain("[output truncated]");
    expect(value.outputTruncated).toBe(true);
    expect(value.output.length).toBeLessThanOrEqual(100);
  });

  it("does not mark a skipped check as fully verified", async () => {
    const cwd = await project(); const value = report();
    value.tests.push({ ...value.tests[0], status: "skipped" });
    await save(cwd, value);
    const result = await generateLayoutSummary({ projectPath: cwd });
    expect((await readFile(join(cwd, result.posterPath!), "utf8")).includes('data-status="partial"')).toBe(true);
  });

  it("validates all commands before running the first one", async () => {
    const cwd = await project();
    await save(cwd, { tests: [`\"${process.execPath}\" -e \"require('fs').writeFileSync('sentinel','changed')\"`, { command: "" }] }, "config.json");
    await expect(capture(cwd)).rejects.toThrow(/index 1/);
    await expect(readFile(join(cwd, "sentinel"))).rejects.toThrow();
  });

  it("rejects oversized input before allocating its full contents", async () => {
    const cwd = await project(); await writeFile(join(cwd, "large.bin"), Buffer.alloc(1024));
    await expect(readBoundedFile(join(cwd, "large.bin"), 16)).rejects.toThrow(/safety limit/);
  });

  it("labels before/after evidence and accepts DPR full-page screenshots", async () => {
    const cwd = await project(); const value = report();
    await writeFile(join(cwd, "capture.png"), solidPng(800, 2000));
    const capturedAt = new Date().toISOString(); value.generatedAt = capturedAt;
    value.screenshots = ["before", "after"].map((kind) => reportSchema.shape.screenshots.element.parse({
      kind, viewport: { name: "mobile", width: 400, height: 800 }, imagePath: "capture.png", capturedAt, deviceScaleFactor: 2, captureMode: "full-page",
    }));
    await save(cwd, value);
    const result = await generateLayoutSummary({ projectPath: cwd });
    const text = await readFile(join(cwd, result.outputPath), "utf8");
    expect(text).toContain("改版前"); expect(text).toContain("改版后");
    expect(result.freshnessWarnings).toHaveLength(0);
  });
});
