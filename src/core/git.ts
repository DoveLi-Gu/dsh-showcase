import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readlink } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import type { GitChange } from "./report-schema";

const execFileAsync = promisify(execFile);
type GitFile = GitChange["files"][number];
export type CollectGitOptions = { baseRef?: string; includeDiff?: boolean };
const scope = ["--", ".", ":(exclude).showcase"];

async function runGit(cwd: string, args: string[]): Promise<string> {
  try {
    const pending = execFileAsync("git", args, { cwd, encoding: "utf8", windowsHide: true, timeout: 30_000, maxBuffer: 32 * 1024 * 1024 });
    pending.child.stdin?.end();
    return (await pending).stdout;
  } catch (error) {
    throw new Error(`Unable to run git: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function state(code: string): GitFile["status"] {
  if (/[RC]/.test(code)) return "renamed";
  if (code.includes("?")) return "untracked";
  if (code.includes("D")) return "deleted";
  if (code.includes("A")) return "added";
  return "modified";
}

function parseStatus(output: string, prefix: string) {
  const result = new Map<string, Pick<GitFile, "status" | "previousPath">>();
  const entries = output.split("\0");
  const local = (path: string) => path.startsWith(prefix) ? path.slice(prefix.length) : path;
  for (let i = 0; i < entries.length && entries[i]; i++) {
    const code = entries[i].slice(0, 2);
    const path = local(entries[i].slice(3));
    const status = state(code);
    const previousPath = status === "renamed" ? local(entries[++i] ?? "") : undefined;
    if (!path.startsWith(".showcase/")) result.set(path, { status, ...(previousPath ? { previousPath } : {}) });
  }
  return result;
}

function parseNames(output: string) {
  const result = new Map<string, Pick<GitFile, "status" | "previousPath">>();
  const entries = output.split("\0");
  for (let i = 0; i < entries.length && entries[i]; i++) {
    const status = state(entries[i]);
    const first = entries[++i];
    if (status === "renamed") result.set(entries[++i], { status, previousPath: first });
    else result.set(first, { status });
  }
  return result;
}

function parseNumstat(output: string) {
  const result = new Map<string, Pick<GitFile, "additions" | "deletions">>();
  const entries = output.split("\0");
  for (let i = 0; i < entries.length && entries[i]; i++) {
    const match = /^(\d+|-)\t(\d+|-)\t([\s\S]*)$/.exec(entries[i]);
    if (!match) throw new Error("Invalid Git numstat record.");
    let path = match[3];
    if (!path) { i++; path = entries[++i]; }
    result.set(path, { additions: match[1] === "-" ? 0 : Number(match[1]), deletions: match[2] === "-" ? 0 : Number(match[2]) });
  }
  return result;
}

async function collectFileDiff(cwd: string, baseCommit: string, file: GitFile): Promise<Partial<GitFile>> {
  if (file.status === "untracked") return { diffUnavailable: "untracked" };
  try {
    const paths = [...new Set([file.path, file.previousPath].filter((path): path is string => {
      if (!path || isAbsolute(path)) return false;
      const local = relative(cwd, resolve(cwd, path));
      return local !== ".." && !local.startsWith(`..${sep}`) && !isAbsolute(local);
    }))];
    if (!paths.length) return { diffUnavailable: "unavailable" };
    const { stdout } = await execFileAsync("git", ["diff", "--no-ext-diff", "--no-textconv", "--no-color", "--relative", "--find-renames", "--unified=3", baseCommit, "--", ...paths.map((path) => `:(literal)${path}`)], {
      cwd, encoding: "utf8", windowsHide: true, timeout: 5_000, maxBuffer: 128 * 1024, env: { ...process.env, LC_ALL: "C" },
    });
    if (/^Binary files /m.test(stdout)) return { diffUnavailable: "binary" };
    return { diff: stdout.slice(0, 16_000), diffTruncated: stdout.length > 16_000 };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return { diffUnavailable: code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" ? "oversize" : "unavailable" };
  }
}

export async function collectGitChange(cwd: string, options: CollectGitOptions = {}): Promise<GitChange> {
  try {
    if ((await runGit(cwd, ["rev-parse", "--is-inside-work-tree"])).trim() !== "true") throw new Error("Not a worktree");
  } catch {
    return { baseRef: "NO_GIT", headRef: "NO_GIT", files: [], summary: { changedFiles: 0, additions: 0, deletions: 0 } };
  }
  const prefix = (await runGit(cwd, ["rev-parse", "--show-prefix"])).replace(/\r?\n$/, "");
  let headCommit: string | undefined;
  try { headCommit = (await runGit(cwd, ["rev-parse", "--verify", "HEAD"])).trim(); } catch { /* Unborn repository. */ }
  const branch = (await runGit(cwd, ["branch", "--show-current"])).trim();
  const baseRef = options.baseRef ?? (headCommit ? "HEAD" : "UNBORN");
  const baseCommit = headCommit || options.baseRef
    ? (await runGit(cwd, ["rev-parse", "--verify", "--end-of-options", `${baseRef}^{commit}`])).trim()
    : (await runGit(cwd, ["hash-object", "-t", "tree", "--stdin"])).trim();
  const args = ["--no-ext-diff", "--no-textconv", "--relative", "--find-renames", baseCommit, ...scope];
  const statusOutput = await runGit(cwd, ["status", "--porcelain=v1", "-z", "--untracked-files=all", ...scope]);
  const changes = parseNames(await runGit(cwd, ["diff", "--name-status", "-z", ...args]));
  const stats = parseNumstat(await runGit(cwd, ["diff", "--numstat", "-z", ...args]));
  const worktree = parseStatus(statusOutput, prefix);
  for (const [path, value] of worktree) if (value.status === "untracked") changes.set(path, value);
  const files: GitFile[] = [...changes].sort(([a], [b]) => a.localeCompare(b)).map(([path, value]) => ({ path, ...value, ...(stats.get(path) ?? { additions: 0, deletions: 0 }) }));
  const hash = createHash("sha256").update(headCommit ?? "UNBORN").update(statusOutput)
    .update(baseCommit).update(await runGit(cwd, ["diff", "--raw", "-z", ...args]));
  // Stream file contents instead of buffering a potentially enormous binary diff.
  for (const name of [...new Set([...files.map((file) => file.path), ...worktree.keys()])].sort()) {
    const path = join(cwd, name);
    hash.update(`\0${name}\0`);
    const details = await lstat(path).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return undefined;
      throw error;
    });
    if (!details) { hash.update("deleted"); continue; }
    if (details.isSymbolicLink()) hash.update(await readlink(path));
    else if (details.isFile()) for await (const chunk of createReadStream(path)) hash.update(chunk);
  }
  // Patch capture is opt-in: fingerprint-only checks remain cheap and unchanged.
  if (options.includeDiff) {
    for (const [index, file] of files.entries()) {
      Object.assign(file, index < 20 ? await collectFileDiff(cwd, baseCommit, file) : { diffUnavailable: "limit" });
    }
  }
  return {
    baseRef, headRef: branch || (headCommit ? "DETACHED" : "UNBORN"),
    baseCommit, ...(headCommit ? { headCommit } : {}), fingerprint: hash.digest("hex"), files,
    summary: { changedFiles: files.length, additions: files.reduce((sum, f) => sum + f.additions, 0), deletions: files.reduce((sum, f) => sum + f.deletions, 0) },
  };
}
