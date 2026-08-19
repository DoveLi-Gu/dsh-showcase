import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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

});
