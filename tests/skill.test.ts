import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { unzipSync } from "fflate";
import { buildSkill } from "../scripts/build-skill.mjs";

const exec = promisify(execFile);
let sandbox: string;
let cli: string;
let archive: Record<string, Uint8Array>;

async function run(args: string[]) {
  try {
    const result = await exec(process.execPath, [cli, ...args], { cwd: sandbox, windowsHide: true, timeout: 20000, maxBuffer: 4 * 1024 * 1024 });
    return { ...result, code: 0 };
  } catch (error) {
    const failure = error as Error & { stdout: string; stderr: string; code: number };
    return { stdout: failure.stdout, stderr: failure.stderr, code: failure.code };
  }
}

async function project(tests: string[] = [], git = true) {
  const path = await mkdtemp(join(sandbox, "target project 中文 "));
  await mkdir(join(path, ".showcase"));
  await writeFile(join(path, ".showcase", "config.json"), JSON.stringify({ task: "Verify the real sample backend.", tests }));
  await writeFile(join(path, "README.md"), "A backend fixture for Skill verification.\n");
  if (git) await exec("git", ["init"], { cwd: path, windowsHide: true });
  return path;
}

beforeAll(async () => {
  sandbox = await mkdtemp(join(tmpdir(), "dsh-skill-isolated-"));
  const result = await buildSkill(join(sandbox, "build"));
  archive = unzipSync(await readFile(result.zipPath));
  for (const [name, content] of Object.entries(archive)) {
    const output = join(sandbox, "installed", name);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, content);
  }
  cli = join(sandbox, "installed", "dsh-showcase", "scripts", "showcase.mjs");
}, 30000);

afterAll(async () => {
  if (sandbox) await rm(sandbox, { recursive: true, force: true });
});

describe("portable free Skill", () => {
  it("ships only portable resources, licenses and bundled Node-built-in imports", async () => {
    expect(Object.keys(archive)).toEqual(expect.arrayContaining([
      "dsh-showcase/SKILL.md", "dsh-showcase/scripts/showcase.mjs",
      "dsh-showcase/scripts/assets/dijiang-survey-surface.webp", "dsh-showcase/LICENSE",
      "dsh-showcase/THIRD_PARTY_NOTICES.md", "dsh-showcase/DEPENDENCY_LICENSES.txt",
    ]));
    expect(Object.keys(archive).every((name) => !name.includes("..") && !name.includes("node_modules/") && !name.startsWith("/"))).toBe(true);
    const source = await readFile(cli, "utf8");
    const imports = [...source.matchAll(/^import .* from ["']([^"']+)["'];/gm)].map((match) => match[1]);
    expect(imports.length).toBeGreaterThan(0);
    expect(imports.every((name) => name.startsWith("node:"))).toBe(true);
    expect(source).not.toContain(process.cwd());
    expect((await run(["--help"])).code).toBe(0);
  });

  it("requires an explicit project and execution flag; plan does not run commands", async () => {
    expect((await run(["init"])).code).toBe(1);
    const path = await project(['node -e "process.exit(9)"']);
    const plan = await run(["plan", "--project", path]);
    expect(plan.code).toBe(0);
    expect(JSON.parse(plan.stdout).executesCommands).toBe(false);
    const denied = await run(["capture", "--project", path]);
    expect(denied.code).toBe(1);
    expect(denied.stderr).toContain("--run-tests");
    await expect(readFile(join(path, ".showcase", "report.json"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("preserves existing configuration and rejects unknown options before writing", async () => {
    const path = await project();
    const config = await readFile(join(path, ".showcase", "config.json"), "utf8");
    expect((await run(["init", "--project", path])).code).toBe(1);
    expect((await run(["capture", "--project", path, "--run-tests", "--unknown"])).code).toBe(1);
    expect((await run(["render", "--project", path, "--theme", "bad"])).code).toBe(1);
    expect(await readFile(join(path, ".showcase", "config.json"), "utf8")).toBe(config);
  });

  it("generates both offline themes from a different project, with honest status and source links", async () => {
    const path = await project(['node -e "console.log(42)"']);
    expect((await run(["capture", "--project", path, "--run-tests"])).code).toBe(0);
    const report = JSON.parse(await readFile(join(path, ".showcase", "report.json"), "utf8"));
    expect(report.task.status).toBe("completed");
    expect(report.tests[0].output).toContain("42");
    for (const theme of ["dijiang", "fish"]) {
      const result = await run(["render", "--project", path, "--theme", theme, "--locale", "en"]);
      expect(result.stderr).toBe("");
      expect(result.code).toBe(0);
      const html = await readFile(join(path, ".showcase", "layout-poster.html"), "utf8");
      expect(html).toContain("Verify the real sample backend.");
      expect(html).toContain("https://github.com/DoveLi-Gu/dsh-showcase");
      if (theme === "fish") expect(html.includes("data:image/")).toBe(true);
      else expect(html.includes("ed-contour")).toBe(true);
      expect(html).not.toContain("H:\\dsh-showcase");
    }
    const summary = await readFile(join(path, ".showcase", "layout-summary.md"), "utf8");
    expect(summary).toContain("Generated locally with [DSH Showcase]");
  });

  it("keeps failing receipts and still renders a failed report", async () => {
    const path = await project(['node -e "console.error(123);process.exit(7)"']);
    const captured = await run(["capture", "--project", path, "--run-tests"]);
    expect(captured.code).toBe(1);
    expect(JSON.parse(captured.stdout).status).toBe("failed");
    expect((await run(["render", "--project", path, "--theme", "fish"])).code).toBe(0);
    const report = JSON.parse(await readFile(join(path, ".showcase", "report.json"), "utf8"));
    expect(report.tests[0].exitCode).toBe(7);
    expect(report.tests[0].output).toContain("123");
    expect(await readFile(join(path, ".showcase", "layout-summary.md"), "utf8")).toMatch(/fail/i);
  });

  it("records incomplete evidence for non-Git projects without tests", async () => {
    const path = await project([], false);
    expect((await run(["capture", "--project", path, "--run-tests"])).code).toBe(0);
    const report = JSON.parse(await readFile(join(path, ".showcase", "report.json"), "utf8"));
    expect(report.task.status).toBe("partial");
    expect(report.git.headRef).toBe("NO_GIT");
    expect((await run(["render", "--project", path, "--locale", "zh-CN"])).code).toBe(0);
  });

  it("does not replace a malformed existing report", async () => {
    const path = await project();
    const reportPath = join(path, ".showcase", "report.json");
    await writeFile(reportPath, "not json");
    expect((await run(["capture", "--project", path, "--run-tests"])).code).toBe(1);
    expect(await readFile(reportPath, "utf8")).toBe("not json");
  });
});
