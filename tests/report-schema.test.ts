import { describe, expect, it } from "vitest";
import { demoReport, reportSchema } from "../src/core";

describe("reportSchema", () => {
  it("accepts the demo fixture", () => {
    expect(reportSchema.parse(demoReport)).toEqual(demoReport);
  });

  it("rejects a test receipt with an invalid status", () => {
    const invalidReport = {
      ...demoReport,
      tests: [{ ...demoReport.tests[0], status: "unknown" }],
    };

    expect(() => reportSchema.parse(invalidReport)).toThrow();
  });
});
