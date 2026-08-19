import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { collectGitChange, redact, reportSchema, runCommand, type RedactionSummary } from "../core";

type TestConfig = string | { command: string; timeoutMs?: number };
type ShowcaseConfig = {
  task?: string;
  baseRef?: string;
  timeoutMs?: number;
  tests?: TestConfig[];
};

const CONFIG_FILE = "config.json";
const REPORT_FILE = "report.json";
const MAX_TIMER_MS = 2_147_483_647;

function isValidTimeout(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0 && Number(value) <= MAX_TIMER_MS;
}

function configPath(cwd: string) {
  return join(cwd, ".showcase", CONFIG_FILE);
}

function assertConfig(value: unknown): asserts value is ShowcaseConfig {
  if (!value || typeof value !== "object") throw new Error("Invalid .showcase/config.json: expected an object.");
  const config = value as ShowcaseConfig;
  if (config.task !== undefined && (typeof config.task !== "string" || !config.task.trim())) {
    throw new Error("Invalid .showcase/config.json: task must be a non-empty string.");
  }
  if (config.tests !== undefined && !Array.isArray(config.tests)) {
    throw new Error("Invalid .showcase/config.json: tests must be an array.");
  }
  if (config.baseRef !== undefined && (typeof config.baseRef !== "string" || !config.baseRef.trim())) {
    throw new Error("Invalid .showcase/config.json: baseRef must be a non-empty string.");
  }
  if (config.timeoutMs !== undefined && !isValidTimeout(config.timeoutMs)) {
    throw new Error(`Invalid .showcase/config.json: timeoutMs must be a positive integer no greater than ${MAX_TIMER_MS}.`);
  }
}

async function readConfig(cwd: string): Promise<ShowcaseConfig> {
  let source: string;
  try {
    source = await readFile(configPath(cwd), "utf8");
  } catch (error) {
    throw new Error(`Unable to read ${configPath(cwd)}. Run \"dsh-showcase init\" first. ${error instanceof Error ? error.message : String(error)}`);
  }
  try {
    const config: unknown = JSON.parse(source);
    assertConfig(config);
    return config;
  } catch (error) {
    throw new Error(`Unable to parse ${configPath(cwd)}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function readExistingReport(cwd: string) {
  try {
    const source = await readFile(join(cwd, ".showcase", REPORT_FILE), "utf8");
    return reportSchema.parse(JSON.parse(source));
  } catch {
    return undefined;
  }
}

async function resolveProjectName(cwd: string, existingName?: string) {
  try {
    const source = await readFile(join(cwd, "package.json"), "utf8");
    const packageJson: unknown = JSON.parse(source);
    if (packageJson && typeof packageJson === "object" && "name" in packageJson) {
      const name = (packageJson as { name?: unknown }).name;
      if (typeof name === "string" && name.trim()) return name.trim();
    }
  } catch {
    // Non-package projects fall back to the previous report name or directory.
  }
  return existingName?.trim() || basename(cwd);
}

function normalizeTest(test: TestConfig, index: number, defaultTimeoutMs?: number) {
  if (typeof test === "string") {
    if (!test.trim()) throw new Error(`Invalid test entry at index ${index}: command must be a non-empty string.`);
    return { command: test, id: `test-${index + 1}`, timeoutMs: defaultTimeoutMs };
  }
  if (!test || typeof test.command !== "string" || !test.command.trim()) {
    throw new Error(`Invalid test entry at index ${index}: command must be a non-empty string.`);
  }
  if (test.timeoutMs !== undefined && !isValidTimeout(test.timeoutMs)) {
    throw new Error(`Invalid test entry at index ${index}: timeoutMs must be a positive integer no greater than ${MAX_TIMER_MS}.`);
  }
  return { command: test.command, id: `test-${index + 1}`, timeoutMs: test.timeoutMs ?? defaultTimeoutMs };
}

function combineRedaction(summaries: RedactionSummary[]): RedactionSummary {
  const replacements: Record<string, number> = {};
  for (const summary of summaries) {
    for (const [name, count] of Object.entries(summary.replacements)) {
      replacements[name] = (replacements[name] ?? 0) + count;
    }
  }
  return {
    originalLength: summaries.reduce((total, summary) => total + summary.originalLength, 0),
    redactedLength: summaries.reduce((total, summary) => total + summary.redactedLength, 0),
    replacements,
    totalReplacements: summaries.reduce((total, summary) => total + summary.totalReplacements, 0),
  };
}

async function hasProjectFile(cwd: string, name: string) {
  try {
    await access(join(cwd, name));
    return true;
  } catch {
    return false;
  }
}

async function defaultTestCommands(cwd: string): Promise<TestConfig[]> {
  if (await hasProjectFile(cwd, "package.json")) {
    try {
      const source = await readFile(join(cwd, "package.json"), "utf8");
      const packageJson: unknown = JSON.parse(source);
      if (packageJson && typeof packageJson === "object" && "scripts" in packageJson) {
        const scripts = (packageJson as { scripts?: unknown }).scripts;
        if (scripts && typeof scripts === "object" && "test" in scripts) {
          const test = (scripts as { test?: unknown }).test;
          if (typeof test === "string" && test.trim()) return ["npm test"];
        }
      }
    } catch {
      // Invalid or incomplete package metadata should not create a guaranteed failing default.
    }
    return [];
  }
  const pythonMarkers = await Promise.all(
    ["pyproject.toml", "pytest.ini", "setup.cfg", "requirements.txt"].map((name) => hasProjectFile(cwd, name)),
  );
  if (pythonMarkers.some(Boolean)) {
    return ["pytest -q"];
  }
  if (await hasProjectFile(cwd, "Cargo.toml")) return ["cargo test"];
  if (await hasProjectFile(cwd, "go.mod")) return ["go test ./..."];
  if (await hasProjectFile(cwd, "pom.xml")) return ["mvn test"];
  if (await hasProjectFile(cwd, "gradlew.bat")) return ["gradlew.bat test"];
  return [];
}

export async function init(cwd = process.cwd()): Promise<string> {
  const directory = join(cwd, ".showcase");
  const config: ShowcaseConfig = {
    task: "Capture verifiable delivery evidence.",
    tests: await defaultTestCommands(cwd),
    timeoutMs: 120000,
  };
  await mkdir(directory, { recursive: true });
  const destination = join(directory, CONFIG_FILE);
  try {
    await writeFile(destination, `${JSON.stringify(config, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error(`${destination} already exists. Edit it directly or remove it before re-running init.`);
    }
    throw error;
  }
  return destination;
}

export async function capture(cwd = process.cwd()): Promise<string> {
  const startedAt = new Date();
  const startedMs = Date.now();
  const [config, existingReport] = await Promise.all([
    readConfig(cwd),
    readExistingReport(cwd),
  ]);
  const projectName = await resolveProjectName(cwd, existingReport?.project?.name);
  const git = await collectGitChange(cwd, { baseRef: config.baseRef });
  const receipts = [];
  const redactions: RedactionSummary[] = [];

  for (const [index, test] of (config.tests ?? []).entries()) {
    const normalized = normalizeTest(test, index, config.timeoutMs);
    const receipt = await runCommand(normalized.command, { cwd, id: normalized.id, timeoutMs: normalized.timeoutMs });
    const result = redact(receipt.output);
    receipts.push({ ...receipt, output: result.text });
    redactions.push(result.summary);
  }

  const hasFailedTest = receipts.some((receipt) => receipt.status === "failed");
  const gitUnavailable = git.baseRef === "NO_GIT" && git.headRef === "NO_GIT";
  const status = hasFailedTest ? "failed" : receipts.length === 0 || gitUnavailable ? "partial" : "completed";
  const report = reportSchema.parse({
    version: 1,
    generatedAt: new Date().toISOString(),
    project: { name: projectName },
    task: {
      id: `capture-${startedMs}`,
      goal: config.task ?? "Capture verifiable delivery evidence.",
      status,
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startedMs,
    },
    git,
    tests: receipts,
    screenshots: existingReport?.screenshots ?? [],
    redaction: combineRedaction(redactions),
  });
  const destination = join(cwd, ".showcase", REPORT_FILE);
  await mkdir(join(cwd, ".showcase"), { recursive: true });
  await writeFile(destination, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return destination;
}

async function main() {
  const [command] = process.argv.slice(2);
  if (command === "init") {
    console.log(`Created ${await init()}`);
    return;
  }
  if (command === "capture") {
    const destination = await capture();
    console.log(`Created ${destination}`);
    const report = reportSchema.parse(JSON.parse(await readFile(destination, "utf8")));
    if (report.task.status === "failed") process.exitCode = 1;
    return;
  }
  throw new Error("Usage: dsh-showcase <init|capture>");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
