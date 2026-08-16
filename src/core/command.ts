import { spawn } from "node:child_process";
import type { TestReceipt } from "./report-schema";

export type RunCommandOptions = {
  cwd: string;
  id?: string;
  timeoutMs?: number;
  maxOutputLength?: number;
};

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT_LENGTH = 20_000;

export async function runCommand(command: string, options: RunCommandOptions): Promise<TestReceipt> {
  if (!command.trim()) throw new Error("A test command is required.");

  const startedAt = new Date();
  const startedMs = Date.now();
  const maxOutputLength = options.maxOutputLength ?? DEFAULT_MAX_OUTPUT_LENGTH;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    const child = spawn(command, [], { cwd: options.cwd, shell: true, windowsHide: true });
    let output = "";
    let timedOut = false;

    const append = (chunk: Buffer | string) => {
      if (output.length >= maxOutputLength) return;
      output += chunk.toString().slice(0, maxOutputLength - output.length);
    };
    child.stdout?.on("data", append);
    child.stderr?.on("data", append);

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.once("error", (error) => {
      clearTimeout(timer);
      reject(new Error(`Unable to start command ${JSON.stringify(command)}: ${error.message}`));
    });
    child.once("close", (code) => {
      clearTimeout(timer);
      if (timedOut) output = `${output}\nCommand timed out after ${timeoutMs}ms.`.slice(0, maxOutputLength);
      const exitCode = timedOut ? 1 : (code ?? 1);
      resolve({
        id: options.id ?? `command-${startedMs}`,
        command,
        startedAt: startedAt.toISOString(),
        durationMs: Date.now() - startedMs,
        exitCode,
        status: exitCode === 0 ? "passed" : "failed",
        output,
      });
    });
  });
}
