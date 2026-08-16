import { describe, expect, it } from "vitest";
import { redact } from "../src/core";

describe("redact", () => {
  it("redacts authorization values, tokens, and local paths", () => {
    const result = redact(
      "Authorization: Bearer super-secret api_key=abc123 H:\\Users\\sam\\project /home/sam/project",
    );

    expect(result.text).not.toContain("super-secret");
    expect(result.text).not.toContain("abc123");
    expect(result.text).not.toContain("H:\\Users\\sam\\project");
    expect(result.text).not.toContain("/home/sam/project");
    expect(result.summary.totalReplacements).toBe(4);
  });

  it("reports no replacements for public text", () => {
    const result = redact("Build completed with 12 passing tests.");

    expect(result.text).toBe("Build completed with 12 passing tests.");
    expect(result.summary).toMatchObject({ totalReplacements: 0, replacements: {} });
  });
});
