import { describe, expect, it } from "vitest";
import { runCommand } from "../src/core";

const node = `"${process.execPath}"`;

describe("runCommand", () => {
  it("captures combined output and a passing receipt", async () => {
    const receipt = await runCommand(`${node} -e "console.log('stdout'); console.error('stderr')"`, {
      cwd: process.cwd(),
      id: "combined-output",
    });

    expect(receipt).toMatchObject({ id: "combined-output", exitCode: 0, status: "passed" });
    expect(receipt.output).toContain("stdout");
    expect(receipt.output).toContain("stderr");
    expect(receipt.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("limits captured output", async () => {
    const receipt = await runCommand(`${node} -e "process.stdout.write('x'.repeat(100))"`, {
      cwd: process.cwd(),
      maxOutputLength: 16,
    });

    expect(receipt.output).toHaveLength(16);
  });

  it("terminates the full command tree when a shell command times out", async () => {
    const startedAt = Date.now();
    const receipt = await runCommand(`${node} -e "setTimeout(() => {}, 3000)"`, {
      cwd: process.cwd(),
      timeoutMs: 100,
    });

    expect(receipt).toMatchObject({ exitCode: 1, status: "failed" });
    expect(receipt.output).toContain("Command timed out after 100ms.");
    expect(Date.now() - startedAt).toBeLessThan(2000);
  });

  it("keeps the timeout marker when preceding output reaches the capture limit", async () => {
    const receipt = await runCommand(`${node} -e "process.stdout.write('x'.repeat(100)); setTimeout(() => {}, 3000)"`, {
      cwd: process.cwd(),
      timeoutMs: 100,
      maxOutputLength: 48,
    });

    expect(receipt.output).toHaveLength(48);
    expect(receipt.output).toContain("Command timed out after 100ms.");
  });

  it("rejects timeout values that Node timers cannot represent", async () => {
    await expect(runCommand(`${node} -e "process.exit(0)"`, {
      cwd: process.cwd(),
      timeoutMs: 2_147_483_648,
    })).rejects.toThrow("timeoutMs must be a positive integer");
  });

  it("honors a zero-length output limit on timeout", async () => {
    const receipt = await runCommand(`${node} -e "setTimeout(() => {}, 3000)"`, {
      cwd: process.cwd(),
      timeoutMs: 100,
      maxOutputLength: 0,
    });

    expect(receipt.output).toBe("");
  });
});
