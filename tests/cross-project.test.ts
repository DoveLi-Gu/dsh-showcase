import { access, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { apply } from "../plugin/index.js";

type Theme = "frontier-signal" | "blue-big-fish";

type ToolValue = {
  locale: "zh-CN" | "en";
  outputPath: string;
  posterPath?: string;
  posterGenerated: boolean;
  sections: string[];
  theme: string;
  themeKey: Theme;
  freshnessWarnings: string[];
  breakpoints: string[];
  stages: string[];
  testCount: number;
  redactionCount: number;
};

type RegisteredTool = {
  execute(args: {
    projectPath: string;
    locale?: "zh-CN" | "en";
    theme?: Theme;
    outputPath?: string;
    posterPath?: string;
    generatePoster?: boolean;
  }): Promise<ToolValue>;
};

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

function getRegisteredTool(theme: Theme, generatePoster = true): RegisteredTool {
  const definitions: unknown[] = [];
  apply({
    connection: { rpc: { handle() {} } },
    settings: {
      register(_namespace: unknown, _schema: unknown, options: { base: { theme: Theme; generatePoster: boolean } }) {
        return { get: () => options.base, async update() {} };
      },
    },
    tools: { register(definition: unknown) { definitions.push(definition); } },
  }, { theme, generatePoster });

  const tool = definitions[0] as RegisteredTool | undefined;
  if (!tool?.execute) throw new Error("showcase_layout_summary was not registered");
  return tool;
}

function createReport(projectName: string, overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    generatedAt: "2026-08-18T10:00:00.000Z",
    project: { name: projectName },
    task: {
      id: "cross-project-fixture",
      goal: "Generate local evidence for a non-showcase project.",
      status: "completed",
      startedAt: "2026-08-18T09:00:00.000Z",
      completedAt: "2026-08-18T09:00:01.000Z",
      durationMs: 1000,
    },
    git: {
      baseRef: "main",
      headRef: "HEAD",
      files: [{ path: "src/main.py", status: "modified", additions: 4, deletions: 1 }],
      summary: { changedFiles: 1, additions: 4, deletions: 1 },
    },
    tests: [{
      id: "fixture-test",
      command: "pytest -q",
      startedAt: "2026-08-18T09:30:00.000Z",
      durationMs: 420,
      exitCode: 0,
      status: "passed",
      output: "1 passed",
    }],
    screenshots: [],
    redaction: { originalLength: 10, redactedLength: 10, replacements: {}, totalReplacements: 0 },
    ...overrides,
  };
}

async function createProject(prefix: string) {
  const projectPath = await mkdtemp(join(tmpdir(), prefix));
  temporaryDirectories.push(projectPath);
  await mkdir(join(projectPath, ".showcase"), { recursive: true });
  return projectPath;
}

async function writeReport(projectPath: string, report: unknown) {
  await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify(report, null, 2), "utf8");
}

describe("showcase_layout_summary cross-project compatibility", () => {
  it("uses the saved poster switch by default and honors a one-call override", async () => {
    const projectPath = await createProject("dsh-poster-policy-project-");
    await writeReport(projectPath, createReport("poster-policy"));
    const disabledTool = getRegisteredTool("frontier-signal", false);

    const markdownOnly = await disabledTool.execute({ projectPath });
    expect(markdownOnly.posterGenerated).toBe(false);
    expect(markdownOnly.posterPath).toBeUndefined();
    await expect(access(join(projectPath, ".showcase", "layout-poster.html"))).rejects.toThrow();

    const forcedPoster = await disabledTool.execute({
      projectPath,
      generatePoster: true,
      posterPath: ".showcase/forced-poster.html",
    });
    expect(forcedPoster.posterGenerated).toBe(true);
    expect(forcedPoster.posterPath).toBe(".showcase/forced-poster.html");
    await expect(access(join(projectPath, forcedPoster.posterPath!))).resolves.toBeUndefined();

    const afterOverride = await disabledTool.execute({
      projectPath,
      outputPath: ".showcase/after-override.md",
    });
    expect(afterOverride.posterGenerated).toBe(false);
    expect(afterOverride.posterPath).toBeUndefined();

    const oneCallOff = await getRegisteredTool("frontier-signal", true).execute({
      projectPath,
      generatePoster: false,
      outputPath: ".showcase/summary-only.md",
    });
    expect(oneCallOff.posterGenerated).toBe(false);
    expect(oneCallOff.posterPath).toBeUndefined();

    const enabledTool = getRegisteredTool("frontier-signal", true);
    const sameInstanceOff = await enabledTool.execute({
      projectPath,
      generatePoster: false,
      outputPath: ".showcase/same-instance-off.md",
    });
    expect(sameInstanceOff.posterGenerated).toBe(false);
    expect(sameInstanceOff.posterPath).toBeUndefined();
    expect(await readFile(join(projectPath, sameInstanceOff.outputPath), "utf8")).toContain("海报产物: 本次未生成");
    const afterOneCallOff = await enabledTool.execute({
      projectPath,
      outputPath: ".showcase/after-one-call-off.md",
      posterPath: ".showcase/after-one-call-off.html",
    });
    expect(afterOneCallOff.posterGenerated).toBe(true);
    expect(afterOneCallOff.posterPath).toBe(".showcase/after-one-call-off.html");
  });

  it("generates from a Python project without package.json or React source files", async () => {
    const projectPath = await createProject("dsh-python-project-");
    await mkdir(join(projectPath, "service"), { recursive: true });
    await writeFile(join(projectPath, "pyproject.toml"), "[project]\nname = 'ledger-api'\n", "utf8");
    await writeFile(join(projectPath, "service", "main.py"), "print('ok')\n", "utf8");
    await writeReport(projectPath, createReport("ledger-api / Python 服务"));

    const result = await getRegisteredTool("frontier-signal").execute({ projectPath });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

    expect(result.theme).toBe("终末地帝江号");
    expect(result.breakpoints).toEqual([]);
    expect(result.stages).toEqual(["提示", "构建", "测试", "捕获", "交付"]);
    expect(markdown).toContain("`pytest -q`");
    expect(markdown).toContain("## 截图视口\n- 未捕获");
    expect(poster).toContain("ledger-api / Python 服务");
    expect(poster).toContain('class="current-route"');
    expect(poster).toContain('class="route-evidence delivery-manifest"');
    expect(poster).toContain("src/main.py");
    expect(poster).toContain("pytest -q");
    expect(poster).toContain(".showcase/report.json");
    expect(poster).not.toContain(projectPath);
    await expect(access(join(projectPath, "package.json"))).rejects.toThrow();
  });

  it("does not fall back to the plugin repository name when project metadata is absent", async () => {
    const projectPath = await createProject("dsh-unnamed-project-");
    const report = createReport("placeholder");
    delete (report as { project?: unknown }).project;
    await writeReport(projectPath, report);

    for (const theme of ["frontier-signal", "blue-big-fish"] as const) {
      const result = await getRegisteredTool(theme).execute({ projectPath });
      const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

      expect(poster).toContain("未命名项目");
      expect(poster).not.toContain("dsh-showcase");
    }
  });

  it("keeps long multilingual Node project names readable and escaped", async () => {
    const projectPath = await createProject("dsh-node-project-");
    await mkdir(join(projectPath, "web"), { recursive: true });
    const projectName = "Atlas 中文界面 🚀 مرحبا بالعالم <release-candidate> ".repeat(8);
    await writeFile(join(projectPath, "package.json"), JSON.stringify({ name: projectName }), "utf8");
    await writeFile(join(projectPath, "web", "server.js"), "export default {};\n", "utf8");
    await writeFile(join(projectPath, "web", "site.css"), "@media (max-width: 720px) {}\n", "utf8");
    await writeReport(projectPath, createReport(projectName, {
      git: {
        baseRef: "main",
        headRef: "feature/i18n",
        files: [{ path: "web/server.js", status: "modified", additions: 18, deletions: 2 }],
        summary: { changedFiles: 1, additions: 18, deletions: 2 },
      },
    }));

    const result = await getRegisteredTool("blue-big-fish").execute({ projectPath, locale: "en" });
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

    expect(result.theme).toBe("Blue Big Fish");
    expect(result.breakpoints).toContain("max-width: 720px");
    expect(poster).toContain("Atlas 中文界面 🚀 مرحبا بالعالم");
    expect(poster).toContain("&lt;release-candidate&gt;");
    expect(poster).toContain("...");
    expect(poster).not.toContain(projectPath);
    expect(poster).not.toContain("<release-candidate>");
  });

  it("renders an explicit empty evidence state for a project with no screenshots", async () => {
    const projectPath = await createProject("dsh-no-capture-project-");
    await mkdir(join(projectPath, "src"), { recursive: true });
    await writeFile(join(projectPath, "src", "App.tsx"), "const stages = [{ id: 'PROMPT' }, { id: 'BUILD' }];\n", "utf8");
    await writeFile(join(projectPath, "src", "styles.css"), "@media (max-width: 640px) {}\n", "utf8");
    await writeReport(projectPath, createReport(`No-capture ${basename(projectPath)}`));

    const result = await getRegisteredTool("blue-big-fish").execute({ projectPath });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    const poster = await readFile(join(projectPath, result.posterPath!), "utf8");

    expect(result.testCount).toBe(1);
    expect(markdown).toContain("## 截图视口\n- 未捕获");
    expect(poster).toContain("报告中没有可显示的截图记录");
    expect(poster).toContain("CAPTURE SLOT / 00");
    expect(poster).not.toContain("data:image/png;base64,");
  });
});
