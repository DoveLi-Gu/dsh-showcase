import { spawn, type ChildProcess } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import type { TestReceipt } from "./report-schema";

export type RunCommandOptions = {
  cwd: string;
  id?: string;
  timeoutMs?: number;
  maxOutputLength?: number;
};

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT_LENGTH = 20_000;
const MAX_TIMER_MS = 2_147_483_647;

function terminateProcessTree(child: ChildProcess) {
  if (!child.pid) {
    child.kill();
    return;
  }

  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
    killer.once("error", () => child.kill());
    return;
  }

  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill();
  }
}

export async function runCommand(command: string, options: RunCommandOptions): Promise<TestReceipt> {
  if (!command.trim()) throw new Error("A test command is required.");

  const startedAt = new Date();
  const startedMs = Date.now();
  const maxOutputLength = options.maxOutputLength ?? DEFAULT_MAX_OUTPUT_LENGTH;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > MAX_TIMER_MS) {
    throw new Error(`timeoutMs must be a positive integer no greater than ${MAX_TIMER_MS}.`);
  }
  if (!Number.isInteger(maxOutputLength) || maxOutputLength < 0) {
    throw new Error("maxOutputLength must be a non-negative integer.");
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, [], {
      cwd: options.cwd,
      detached: process.platform !== "win32",
      shell: true,
      windowsHide: true,
    });
    let output = "";
    let timedOut = false;
    let outputTruncated = false;
    child.stdin?.end();

    const append = (chunk: Buffer | string) => {
      output += chunk.toString();
      if (output.length > maxOutputLength) {
        outputTruncated = true;
        const headLength = Math.ceil(maxOutputLength / 2);
        const tailLength = maxOutputLength - headLength;
        output = output.slice(0, headLength) + (tailLength ? output.slice(-tailLength) : "");
      }
    };
    for (const stream of [child.stdout, child.stderr]) {
      const decoder = new StringDecoder("utf8");
      stream?.on("data", (chunk) => append(decoder.write(chunk)));
      stream?.on("end", () => append(decoder.end()));
    }

    const timer = setTimeout(() => {
      timedOut = true;
      terminateProcessTree(child);
    }, timeoutMs);

    child.once("error", (error) => {
      clearTimeout(timer);
      reject(new Error(`Unable to start command ${JSON.stringify(command)}: ${error.message}`));
    });
    child.once("close", (code) => {
      clearTimeout(timer);
      if (outputTruncated && maxOutputLength >= 64) {
        const marker = "\n[output truncated]\n";
        const headLength = Math.ceil((maxOutputLength - marker.length) / 2);
        output = output.slice(0, headLength) + marker + output.slice(-(maxOutputLength - marker.length - headLength));
      }
      if (timedOut) {
        const timeoutMessage = `Command timed out after ${timeoutMs}ms.`;
        const separator = output ? "\n" : "";
        const retainedLength = Math.max(0, maxOutputLength - separator.length - timeoutMessage.length);
        output = maxOutputLength === 0
          ? ""
          : `${output.slice(0, retainedLength)}${separator}${timeoutMessage}`.slice(-maxOutputLength);
      }
      const exitCode = timedOut ? 1 : (code ?? 1);
      resolve({
        id: options.id ?? `command-${startedMs}`,
        command,
        startedAt: startedAt.toISOString(),
        durationMs: Date.now() - startedMs,
        exitCode,
        status: exitCode === 0 ? "passed" : "failed",
        output,
        ...(outputTruncated ? { outputTruncated: true } : {}),
      });
    });
  });
}
