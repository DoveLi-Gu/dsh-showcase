import { describe, expect, it } from "vitest";
import { apply } from "../plugin/index.js";

describe("showcase layout summary plugin", () => {
  it("registers the rc.6 tool definition with renderable content blocks", () => {
    const definitions: unknown[] = [];
    apply({ tools: { register(definition) { definitions.push(definition); } } });

    expect(definitions).toHaveLength(1);
    const tool = definitions[0] as {
      name: string;
      parameters: { properties: { locale: { enum: string[]; default: string } } };
      output: { render: (args: unknown, value: { locale: "zh-CN" | "en"; outputPath: string; posterPath: string; sections: string[]; themes: string[]; breakpoints: string[]; stages: string[]; testCount: number; redactionCount: number }) => Array<{ type: string; text: string }> };
    };
    expect(tool.name).toBe("showcase_layout_summary");
    expect(tool.parameters.properties.locale).toMatchObject({ enum: ["zh-CN", "en"], default: "zh-CN" });

    const blocks = tool.output.render({}, {
      locale: "zh-CN",
      outputPath: ".showcase/layout-summary.md",
      posterPath: ".showcase/layout-poster.html",
      sections: ["项目与任务"],
      themes: ["边境信号"],
      breakpoints: ["max-width: 640px"],
      stages: ["提示"],
      testCount: 1,
      redactionCount: 2,
    });
    expect(blocks).toEqual([expect.objectContaining({ type: "text", text: expect.stringContaining("本地布局产物已生成") })]);
    expect(blocks[0].text).toContain("阶段: 提示");

    const englishBlocks = tool.output.render({}, {
      locale: "en",
      outputPath: ".showcase/layout-summary.en.md",
      posterPath: ".showcase/layout-poster.en.html",
      sections: ["Project and task"],
      themes: ["Field Signal"],
      breakpoints: ["max-width: 640px"],
      stages: ["PROMPT"],
      testCount: 1,
      redactionCount: 2,
    });
    expect(englishBlocks).toEqual([expect.objectContaining({ type: "text", text: expect.stringContaining("Local layout artifacts generated") })]);
    expect(englishBlocks[0].text).toContain("Stages: PROMPT");
  });
});
