import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { collectGitChange } from "../src/core";

const execFileAsync = promisify(execFile);
const temporaryDirectories: string[] = [];

async function git(cwd: string, args: string[]) {
  await execFileAsync("git", args, { cwd, windowsHide: true });
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("collectGitChange", () => {
  it("returns explicit empty evidence outside a Git repository", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "dsh-showcase-no-git-"));
    temporaryDirectories.push(cwd);

    const change = await collectGitChange(cwd);

    expect(change).toEqual({
      baseRef: "NO_GIT",
      headRef: "NO_GIT",
      files: [],
      summary: { changedFiles: 0, additions: 0, deletions: 0 },
    });
  });

  it("collects modified and newly added files from a repository", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "dsh-showcase-git-"));
    temporaryDirectories.push(cwd);
    await git(cwd, ["init"]);
    await git(cwd, ["config", "user.email", "test@example.invalid"]);
    await git(cwd, ["config", "user.name", "Test User"]);
    await writeFile(join(cwd, "existing.txt"), "before\n", "utf8");
    await git(cwd, ["add", "existing.txt"]);
    await git(cwd, ["commit", "-m", "initial"]);

    await writeFile(join(cwd, "existing.txt"), "after\n", "utf8");
    await writeFile(join(cwd, "new.txt"), "new\n", "utf8");
    await git(cwd, ["add", "new.txt"]);

    const change = await collectGitChange(cwd);

    expect(change.summary.changedFiles).toBe(2);
    expect(change.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "existing.txt", status: "modified", additions: 1, deletions: 1 }),
        expect.objectContaining({ path: "new.txt", status: "added", additions: 1, deletions: 0 }),
      ]),
    );
  });

  it("collects staged, unstaged, and untracked files before the first commit", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "dsh-showcase-unborn-"));
    temporaryDirectories.push(cwd);
    await git(cwd, ["init"]);
    await writeFile(join(cwd, "staged.txt"), "staged\n", "utf8");
    await git(cwd, ["add", "staged.txt"]);
    await writeFile(join(cwd, "staged.txt"), "staged\nunstaged\n", "utf8");
    await writeFile(join(cwd, "untracked.txt"), "untracked\n", "utf8");

    const change = await collectGitChange(cwd);

    expect(change.baseRef).toBe("UNBORN");
    expect(change.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "staged.txt", status: "added", additions: 2, deletions: 0 }),
        expect.objectContaining({ path: "untracked.txt", status: "untracked", additions: 0, deletions: 0 }),
      ]),
    );
  });

  it("captures bounded real diffs with literal filenames, renames, binaries and untracked states", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "showcase-diff-"));
    temporaryDirectories.push(cwd);
    await git(cwd, ["init"]); await git(cwd, ["config", "user.email", "test@example.invalid"]); await git(cwd, ["config", "user.name", "Test"]);
    await writeFile(join(cwd, "literal [a].txt"), "old\n");
    await writeFile(join(cwd, "rename.txt"), "unchanged\n".repeat(20));
    await writeFile(join(cwd, "binary.bin"), Buffer.from([0, 1, 2]));
    await git(cwd, ["add", "."]); await git(cwd, ["commit", "-m", "base"]);
    await writeFile(join(cwd, "literal [a].txt"), "new\n");
    await writeFile(join(cwd, "binary.bin"), Buffer.from([0, 4, 5]));
    await writeFile(join(cwd, "untracked.txt"), "not staged\n");
    await git(cwd, ["mv", "rename.txt", "renamed.txt"]);
    const change = await collectGitChange(cwd, { includeDiff: true });
    expect(change.files.find(f => f.path === "literal [a].txt")?.diff).toContain("-old\n+new");
    expect(change.files.find(f => f.path === "renamed.txt")?.diff).toContain("rename from rename.txt");
    expect(change.files.find(f => f.path === "binary.bin")?.diffUnavailable).toBe("binary");
    expect(change.files.find(f => f.path === "untracked.txt")?.diffUnavailable).toBe("untracked");
    expect((await collectGitChange(cwd)).files.every(f => f.diff === undefined)).toBe(true);
  });

  it("retains subdirectory paths and marks long patches as truncated", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "showcase-diff-subdir-"));
    temporaryDirectories.push(cwd);
    await git(cwd, ["init"]); await mkdir(join(cwd, "app"));
    await writeFile(join(cwd, "app", "code.txt"), "line\n".repeat(4000));
    await git(cwd, ["add", "."]);
    const change = await collectGitChange(join(cwd, "app"), { includeDiff: true });
    expect(change.files[0].path).toBe("code.txt");
    expect(change.files[0].diff).toHaveLength(16_000);
    expect(change.files[0].diffTruncated).toBe(true);
  });

});
