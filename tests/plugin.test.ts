import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { apply, Config } from "../plugin/index.js";

const clientUrl = new URL("../plugin/client.js", import.meta.url);

describe("showcase layout summary plugin", () => {
  it("registers the rc.6 tool definition with renderable content blocks", async () => {
    const definitions: unknown[] = [];
    apply({
      connection: { rpc: { handle() {} } },
      settings: {
        register(_namespace, _schema, options) {
          return { get: () => options.base, async update() {} };
        },
      },
      tools: { register(definition) { definitions.push(definition); } },
    }, { theme: "blue-big-fish", generatePoster: true });

    expect(definitions).toHaveLength(1);
    const tool = definitions[0] as {
      name: string;
      parameters: { properties: { locale: { enum: string[]; default: string }; generatePoster: { type: string } } };
      execute: (args: { projectPath: string; generatePoster?: boolean }) => Promise<unknown>;
      output: { render: (args: unknown, value: { locale: "zh-CN" | "en"; outputPath: string; posterPath?: string; posterGenerated: boolean; sections: string[]; theme: string; themeKey: string; freshnessWarnings: string[]; breakpoints: string[]; stages: string[]; testCount: number; redactionCount: number }) => Array<{ type: string; text: string }> };
    };
    expect(tool.name).toBe("showcase_layout_summary");
    expect(tool.parameters.properties.locale).toMatchObject({ enum: ["zh-CN", "en"], default: "zh-CN" });
    expect(tool.parameters.properties.generatePoster).toMatchObject({ type: "boolean" });

    const blocks = tool.output.render({}, {
      locale: "zh-CN",
      outputPath: ".showcase/layout-summary.md",
      posterPath: ".showcase/layout-poster.html",
      posterGenerated: true,
      sections: ["项目与任务"],
      theme: "蓝色大肥鱼",
      themeKey: "blue-big-fish",
      freshnessWarnings: [],
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
      posterGenerated: true,
      sections: ["Project and task"],
      theme: "Dijiang",
      themeKey: "frontier-signal",
      freshnessWarnings: [],
      breakpoints: ["max-width: 640px"],
      stages: ["PROMPT"],
      testCount: 1,
      redactionCount: 2,
    });
    expect(englishBlocks).toEqual([expect.objectContaining({ type: "text", text: expect.stringContaining("Local layout artifacts generated") })]);
    expect(englishBlocks[0].text).toContain("Stages: PROMPT");
    await expect(tool.execute({ projectPath: ".", generatePoster: "yes" as never })).rejects.toThrow(/generatePoster.*must be a boolean/);
  });

  it("exposes a single theme choice in plugin settings", () => {
    expect(Config({})).toMatchObject({ theme: "frontier-signal", generatePoster: false });
    expect(Config({ theme: "blue-big-fish", generatePoster: true })).toMatchObject({ theme: "blue-big-fish", generatePoster: true });
  });

  it("persists the selected theme through the loopback settings RPC", async () => {
    let current: { theme: "frontier-signal" | "blue-big-fish"; generatePoster: boolean } = { theme: "frontier-signal", generatePoster: false };
    let handler: ((endpoint: string, payload: unknown) => Promise<{ ok: boolean; value?: { theme: string; generatePoster: boolean } }>) | undefined;
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
            get: () => current,
            async update(patch) {
              current = { ...current, ...patch };
            },
          };
        },
      },
      tools: { register() {} },
    });

    expect(handler).toBeTypeOf("function");
    expect(await handler?.("get", {})).toMatchObject({ ok: true, value: { theme: "frontier-signal", generatePoster: false } });
    expect(await handler?.("set", { theme: "blue-big-fish" })).toMatchObject({ ok: true, value: { theme: "blue-big-fish" } });
    expect(current).toMatchObject({ theme: "blue-big-fish", generatePoster: false });
    expect(await handler?.("set", { generatePoster: true })).toMatchObject({ ok: true, value: { theme: "blue-big-fish", generatePoster: true } });
    expect(current).toMatchObject({ theme: "blue-big-fish", generatePoster: true });
    expect(await handler?.("set", { generatePoster: "yes" })).toMatchObject({ ok: false, error: { code: "bad-request" } });
    expect(await handler?.("set", { theme: "frontier-signal", extra: true })).toMatchObject({ ok: false, error: { code: "bad-request" } });
    expect(await handler?.("set", {})).toMatchObject({ ok: false, error: { code: "bad-request" } });
  });

  it("keeps the tool available when persisted settings cannot be registered", async () => {
    const definitions: unknown[] = [];
    let handler: ((endpoint: string, payload: unknown) => Promise<{ ok: boolean; value?: { theme: string; generatePoster: boolean }; error?: { code: string } }>) | undefined;
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
          throw new Error("persisted generatePoster must be a boolean");
        },
      },
      tools: { register(definition) { definitions.push(definition); } },
    });

    expect(definitions).toHaveLength(1);
    expect(await handler?.("get", {})).toMatchObject({
      ok: true,
      value: { theme: "frontier-signal", generatePoster: false },
    });
    expect(await handler?.("set", { generatePoster: true })).toMatchObject({
      ok: false,
      error: { code: "settings-rejected" },
    });
  });

  it("renders a clear Markdown-only status when the poster is disabled", () => {
    const definitions: unknown[] = [];
    apply({
      connection: { rpc: { handle() {} } },
      settings: { register(_namespace, _schema, options) { return { get: () => options.base, async update() {} }; } },
      tools: { register(definition) { definitions.push(definition); } },
    });
    const tool = definitions[0] as { output: { render: (args: unknown, value: { locale: "zh-CN"; outputPath: string; posterGenerated: boolean; sections: string[]; theme: string; themeKey: string; freshnessWarnings: string[]; breakpoints: string[]; stages: string[]; testCount: number; redactionCount: number }) => Array<{ type: string; text: string }> } };
    const [block] = tool.output.render({}, {
      locale: "zh-CN",
      outputPath: ".showcase/layout-summary.md",
      posterGenerated: false,
      sections: [],
      theme: "终末地帝江号",
      themeKey: "frontier-signal",
      freshnessWarnings: [],
      breakpoints: [],
      stages: [],
      testCount: 0,
      redactionCount: 0,
    });
    expect(block.text).toContain("海报: 本次未生成");
  });

  it("keeps the plugin settings card bounded in narrow host layouts", async () => {
    const client = await readFile(clientUrl, "utf8");

    expect(client).toContain(".dsh-showcase-settings__toggle-row{align-items:flex-start;flex-direction:column;gap:8px}");
    expect(client).toContain("@media(max-width:480px)");
    expect(client).toContain(".dsh-showcase-settings__hint{display:none}");
    expect(client).toContain(".dsh-showcase-settings__toggle-copy{max-width:100%;overflow-wrap:anywhere}");
  });

  it("adds stateful micro-interactions without changing layout or using glass effects", async () => {
    const client = await readFile(clientUrl, "utf8");

    expect(client).toContain('choice("frontier-signal", "dijiang", "dijiangHint")');
    expect(client).not.toContain('choice("frontier-signal", "field", "fieldHint")');
    expect(client).toContain('"data-save-state": saveState');
    expect(client).toContain('"aria-busy": disabled');
    expect(client).toContain("dsh-showcase-settings__choice:not(:disabled):active");
    expect(client).toContain("dsh-showcase-settings__toggle[aria-checked=true]:not(:disabled):active::after");
    expect(client).toContain("dsh-showcase-settings__loading-choices");
    expect(client).toContain("@media(prefers-reduced-motion:reduce)");
    expect(client).not.toMatch(/backdrop-filter|blur\(/);
  });

  it("supports roving focus and arrow-key selection for the theme radio group", async () => {
    const client = await readFile(clientUrl, "utf8");

    expect(client).toContain("tabIndex: theme === value ? 0 : -1");
    expect(client).toContain('event.key === "ArrowRight" || event.key === "ArrowDown"');
    expect(client).toContain('event.key === "ArrowLeft" || event.key === "ArrowUp"');
    expect(client).toContain('event.key === "Home"');
    expect(client).toContain('event.key === "End"');
    expect(client).toContain("choiceRefs.current[nextTheme]?.focus()");
  });
});
