import { describe, expect, it } from "vitest";
import { apply } from "../plugin/index.js";

describe("showcase layout summary plugin", () => {
  it("registers the rc.6 tool definition with renderable content blocks", () => {
    const definitions: unknown[] = [];
    apply({ tools: { register(definition) { definitions.push(definition); } } });

    expect(definitions).toHaveLength(1);
    const tool = definitions[0] as {
      name: string;
      output: { render: (args: unknown, value: { outputPath: string; posterPath: string; sections: string[]; themes: string[]; breakpoints: string[]; testCount: number; redactionCount: number }) => Array<{ type: string; text: string }> };
    };
    expect(tool.name).toBe("showcase_layout_summary");

    const blocks = tool.output.render({}, {
      outputPath: ".showcase/layout-summary.md",
      posterPath: ".showcase/layout-poster.html",
      sections: ["Project and task"],
      themes: ["Field Signal"],
      breakpoints: ["max-width: 640px"],
      testCount: 1,
      redactionCount: 2,
    });
    expect(blocks).toEqual([expect.objectContaining({ type: "text", text: expect.stringContaining("layout-poster.html") })]);
  });
});
