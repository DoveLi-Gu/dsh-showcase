import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateLayoutSummary } from "../plugin/layout-summary.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function createProject() {
  const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-layout-"));
  temporaryDirectories.push(projectPath);
  await mkdir(join(projectPath, "src"), { recursive: true });
  await mkdir(join(projectPath, ".showcase"), { recursive: true });
  await writeFile(join(projectPath, "src", "App.tsx"), 'const stages = ["PROMPT", "BUILD", "TEST", "CAPTURE", "SHIP"];\nconst theme = "Field Signal Big Blue Bytefish";\nconst controls = "theme-switch type=\\"range\\" export-actions setSelectedFile";\n<details />;\n', "utf8");
  await writeFile(join(projectPath, "src", "styles.css"), "@media (max-width: 980px) {}\n@media (max-width: 640px) {}\n", "utf8");
  await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify({
    version: 1,
    task: { goal: "Summarize the evidence layout", status: "completed" },
    git: { baseRef: "main", headRef: "HEAD", files: [{ path: "src/App.tsx", status: "modified", additions: 4, deletions: 1 }] },
    tests: [{ command: "npm test", status: "passed", exitCode: 0 }],
    screenshots: [{ viewport: { name: "mobile", width: 390, height: 844 } }],
    redaction: { totalReplacements: 2, replacements: { token: 2 } },
  }, null, 2), "utf8");
  return projectPath;
}

describe("generateLayoutSummary", () => {
  it("writes a deterministic local Markdown summary and returns its metadata", async () => {
    const projectPath = await createProject();
    const result = await generateLayoutSummary({ projectPath });
    const markdown = await readFile(join(projectPath, result.outputPath), "utf8");
    const poster = await readFile(join(projectPath, result.posterPath), "utf8");

    expect(result).toMatchObject({ outputPath: ".showcase/layout-summary.md", posterPath: ".showcase/layout-poster.html", themes: ["Field Signal", "Blue Big Fish"], breakpoints: ["max-width: 980px", "max-width: 640px"], stages: ["PROMPT", "BUILD", "TEST", "CAPTURE", "SHIP"], testCount: 1, redactionCount: 2 });
    expect(markdown).toContain("# Layout Summary");
    expect(markdown).toContain("Poster artifact: .showcase/layout-poster.html");
    expect(markdown).toContain("## Screenshot viewports");
    expect(markdown).toContain("mobile: 390 x 844");
    expect(markdown).not.toContain(projectPath);
    expect(poster).toContain("data:image/webp;base64,");
    expect(poster).toContain("VERIFIED");
    expect(poster).toContain("PROMPT");
    expect(poster).not.toContain(projectPath);
  });

  it("rejects report and output paths that escape the project", async () => {
    const projectPath = await createProject();

    await expect(generateLayoutSummary({ projectPath, reportPath: "../outside.json" })).rejects.toThrow("reportPath must resolve inside projectPath");
    await expect(generateLayoutSummary({ projectPath, outputPath: "../outside.md" })).rejects.toThrow("outputPath must resolve inside projectPath");
    await expect(generateLayoutSummary({ projectPath, posterPath: "../outside.html" })).rejects.toThrow("posterPath must resolve inside projectPath");
  });
});
