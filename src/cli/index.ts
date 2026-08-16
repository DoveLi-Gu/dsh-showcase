import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
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

function normalizeTest(test: TestConfig, index: number, defaultTimeoutMs?: number) {
  if (typeof test === "string") return { command: test, id: `test-${index + 1}`, timeoutMs: defaultTimeoutMs };
  if (!test || typeof test.command !== "string" || !test.command.trim()) {
    throw new Error(`Invalid test entry at index ${index}: command must be a non-empty string.`);
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

export async function init(cwd = process.cwd()): Promise<string> {
  const directory = join(cwd, ".showcase");
  const config: ShowcaseConfig = {
    task: "Capture verifiable delivery evidence.",
    tests: ["npm test -- --run"],
    timeoutMs: 120000,
  };
  await mkdir(directory, { recursive: true });
  const destination = join(directory, CONFIG_FILE);
  await writeFile(destination, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return destination;
}

export async function capture(cwd = process.cwd()): Promise<string> {
  const startedAt = new Date();
  const startedMs = Date.now();
  const config = await readConfig(cwd);
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

  const status = receipts.some((receipt) => receipt.status === "failed") ? "partial" : "completed";
  const report = reportSchema.parse({
    version: 1,
    generatedAt: new Date().toISOString(),
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
    screenshots: [],
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
    console.log(`Created ${await capture()}`);
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
