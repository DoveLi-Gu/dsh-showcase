import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { GitChange } from "./report-schema";

const execFileAsync = promisify(execFile);

type GitFile = GitChange["files"][number];

export type CollectGitOptions = {
  baseRef?: string;
};

async function runGit(cwd: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd,
      encoding: "utf8",
      windowsHide: true,
    });
    return stdout;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to run git in ${cwd}: ${message}`);
  }
}

function parseStatus(output: string): Map<string, Pick<GitFile, "status" | "previousPath">> {
  const files = new Map<string, Pick<GitFile, "status" | "previousPath">>();
  const entries = output.split("\0").filter(Boolean);

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const code = entry.slice(0, 2);
    const path = entry.slice(3);
    const state = code.includes("R") || code.includes("C") ? "renamed" : code.includes("?") ? "untracked" : code.includes("D") ? "deleted" : code.includes("A") ? "added" : "modified";

    if (state === "renamed") {
      const previousPath = path;
      const renamedPath = entries[index + 1];
      if (renamedPath) {
        files.set(renamedPath, { status: state, previousPath });
        index += 1;
      }
      continue;
    }

    files.set(path, { status: state });
  }

  return files;
}

function parseNumstat(output: string): Map<string, Pick<GitFile, "additions" | "deletions">> {
  const stats = new Map<string, Pick<GitFile, "additions" | "deletions">>();
  for (const entry of output.split("\0").filter(Boolean)) {
    const [additions, deletions, path] = entry.split("\t");
    if (!path) continue;
    stats.set(path, {
      additions: additions === "-" ? 0 : Number(additions),
      deletions: deletions === "-" ? 0 : Number(deletions),
    });
  }
  return stats;
}

async function hasHead(cwd: string): Promise<boolean> {
  try {
    await execFileAsync("git", ["rev-parse", "--verify", "--quiet", "HEAD"], { cwd, windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

function mergeNumstats(...outputs: string[]): Map<string, Pick<GitFile, "additions" | "deletions">> {
  const combined = new Map<string, Pick<GitFile, "additions" | "deletions">>();
  for (const output of outputs) {
    for (const [path, stat] of parseNumstat(output)) {
      const current = combined.get(path) ?? { additions: 0, deletions: 0 };
      combined.set(path, {
        additions: current.additions + stat.additions,
        deletions: current.deletions + stat.deletions,
      });
    }
  }
  return combined;
}

export async function collectGitChange(cwd: string, options: CollectGitOptions = {}): Promise<GitChange> {
  const [statusOutput, headRef, repositoryHasHead] = await Promise.all([
    runGit(cwd, ["status", "--porcelain=v1", "-z"]),
    runGit(cwd, ["branch", "--show-current"]),
    hasHead(cwd),
  ]);
  const baseRef = options.baseRef ?? (repositoryHasHead ? "HEAD" : "UNBORN");
  const numstat = repositoryHasHead || options.baseRef
    ? parseNumstat(await runGit(cwd, ["diff", "--numstat", "-z", baseRef]))
    : mergeNumstats(
        await runGit(cwd, ["diff", "--numstat", "-z"]),
        await runGit(cwd, ["diff", "--cached", "--numstat", "-z"]),
      );
  const status = parseStatus(statusOutput);
  const paths = new Set([...status.keys(), ...numstat.keys()]);
  const files: GitFile[] = [...paths]
    .sort()
    .map((path) => {
      const fileStatus = status.get(path) ?? { status: "modified" as const };
      const stat = numstat.get(path) ?? { additions: 0, deletions: 0 };
      return { path, ...fileStatus, ...stat };
    });

  return {
    baseRef,
    headRef: headRef.trim() || "UNBORN",
    files,
    summary: {
      changedFiles: files.length,
      additions: files.reduce((total, file) => total + file.additions, 0),
      deletions: files.reduce((total, file) => total + file.deletions, 0),
    },
  };
}
