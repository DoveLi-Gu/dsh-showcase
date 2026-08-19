import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";

var mockRealRename: typeof import("node:fs/promises").rename;

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  mockRealRename = actual.rename;
  return { ...actual, rename: vi.fn(actual.rename) };
});

import { rename } from "node:fs/promises";
import { generateLayoutSummary } from "../plugin/layout-summary.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  vi.mocked(rename).mockReset();
  vi.mocked(rename).mockImplementation((from, to) => mockRealRename(from, to));
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function createProject() {
  const projectPath = await mkdtemp(join(tmpdir(), "dsh-showcase-artifact-transaction-"));
  temporaryDirectories.push(projectPath);
  await mkdir(join(projectPath, ".showcase"), { recursive: true });
  await writeFile(join(projectPath, ".showcase", "report.json"), JSON.stringify({
    version: 1,
    generatedAt: "2026-08-18T00:00:00.000Z",
    project: { name: "artifact-transaction" },
    task: {
      id: "artifact-transaction",
      goal: "Verify artifact rollback",
      status: "completed",
      startedAt: "2026-08-18T00:00:00.000Z",
      completedAt: "2026-08-18T00:00:01.000Z",
      durationMs: 1000,
    },
    git: { files: [], summary: { changedFiles: 0, additions: 0, deletions: 0 } },
    tests: [],
    screenshots: [],
    redaction: { replacements: {}, totalReplacements: 0 },
  }), "utf8");
  return projectPath;
}

describe("artifact transaction rollback", () => {
  it("restores the poster and Markdown when the second replacement fails", async () => {
    const projectPath = await createProject();
    const posterPath = join(projectPath, ".showcase", "layout-poster.html");
    const summaryPath = join(projectPath, ".showcase", "layout-summary.md");
    await writeFile(posterPath, "previous poster", "utf8");
    await writeFile(summaryPath, "previous summary", "utf8");

    let injected = false;
    vi.mocked(rename).mockImplementation(async (from, to) => {
      if (!injected && basename(String(to)) === "layout-summary.md") {
        injected = true;
        throw new Error("injected Markdown replacement failure");
      }
      return mockRealRename(from, to);
    });

    await expect(generateLayoutSummary({ projectPath })).rejects.toThrow("injected Markdown replacement failure");
    expect(injected).toBe(true);
    expect(await readFile(posterPath, "utf8")).toBe("previous poster");
    expect(await readFile(summaryPath, "utf8")).toBe("previous summary");
    expect((await readdir(join(projectPath, ".showcase"))).filter((name) => name.includes(".tmp-") || name.includes(".backup"))).toEqual([]);
  });
});
