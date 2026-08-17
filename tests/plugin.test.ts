import { describe, expect, it } from "vitest";
import { apply, Config } from "../plugin/index.js";

describe("showcase layout summary plugin", () => {
  it("registers the rc.6 tool definition with renderable content blocks", () => {
    const definitions: unknown[] = [];
    apply({
      connection: { rpc: { handle() {} } },
      settings: {
        register(_namespace, _schema, options) {
          return { get: () => options.base, async update() {} };
        },
      },
      tools: { register(definition) { definitions.push(definition); } },
    }, { theme: "blue-big-fish" });

    expect(definitions).toHaveLength(1);
    const tool = definitions[0] as {
      name: string;
      parameters: { properties: { locale: { enum: string[]; default: string } } };
      execute: (args: { projectPath: string }) => Promise<unknown>;
      output: { render: (args: unknown, value: { locale: "zh-CN" | "en"; outputPath: string; posterPath: string; sections: string[]; theme: string; breakpoints: string[]; stages: string[]; testCount: number; redactionCount: number }) => Array<{ type: string; text: string }> };
    };
    expect(tool.name).toBe("showcase_layout_summary");
    expect(tool.parameters.properties.locale).toMatchObject({ enum: ["zh-CN", "en"], default: "zh-CN" });

    const blocks = tool.output.render({}, {
      locale: "zh-CN",
      outputPath: ".showcase/layout-summary.md",
      posterPath: ".showcase/layout-poster.html",
      sections: ["项目与任务"],
      theme: "蓝色大肥鱼",
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
      theme: "Frontier Signal",
      breakpoints: ["max-width: 640px"],
      stages: ["PROMPT"],
      testCount: 1,
      redactionCount: 2,
    });
    expect(englishBlocks).toEqual([expect.objectContaining({ type: "text", text: expect.stringContaining("Local layout artifacts generated") })]);
    expect(englishBlocks[0].text).toContain("Stages: PROMPT");
  });

  it("exposes a single theme choice in plugin settings", () => {
    expect(Config({})).toMatchObject({ theme: "frontier-signal" });
    expect(Config({ theme: "blue-big-fish" })).toMatchObject({ theme: "blue-big-fish" });
  });

  it("persists the selected theme through the loopback settings RPC", async () => {
    let current: "frontier-signal" | "blue-big-fish" = "frontier-signal";
    let handler: ((endpoint: string, payload: unknown) => Promise<{ ok: boolean; value?: { theme: string } }>) | undefined;
    apply({
      connection: {
        rpc: {
          handle(_channel, registered) {
            handler = registered as typeof handler;
          },
        },
      },
      settings: {
        register() {
          return {
            get: () => ({ theme: current }),
            async update(patch) {
              current = patch.theme;
            },
          };
        },
      },
      tools: { register() {} },
    });

    expect(handler).toBeTypeOf("function");
    expect(await handler?.("get", {})).toMatchObject({ ok: true, value: { theme: "frontier-signal" } });
    expect(await handler?.("set", { theme: "blue-big-fish" })).toMatchObject({ ok: true, value: { theme: "blue-big-fish" } });
    expect(current).toBe("blue-big-fish");
  });
});
