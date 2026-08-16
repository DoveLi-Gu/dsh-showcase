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
});
