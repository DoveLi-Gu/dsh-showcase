import z from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { generateLayoutSummary } from "./layout-summary.js";

export const name = "showcase-layout-summary";
export const inject = ["tools", "settings", "connection"];
export const SETTINGS_NAMESPACE = settingsNamespace("showcase-layout-summary");
export const SETTINGS_RPC_CHANNEL = "/showcase-layout-summary";
export const Config = z.object({
  theme: z.union(["frontier-signal", "blue-big-fish"])
    .default("frontier-signal")
    .description("生成 HTML 海报时使用的视觉风格：终末地帝江号或蓝色大肥鱼。主题只从插件设置读取。"),
  generatePoster: z.boolean()
    .default(false)
    .description("是否生成自包含 HTML 海报。关闭时只生成 Markdown 摘要。"),
});

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    locale: { type: "string", required: true, enum: ["zh-CN", "en"] },
    outputPath: { type: "string", required: true, description: "Project-relative path to the generated Markdown file." },
    posterPath: { type: "string", description: "Project-relative path to the self-contained evidence poster when generated." },
    posterGenerated: { type: "boolean", required: true, description: "Whether this call wrote a self-contained HTML poster." },
    sections: { type: "array", required: true, items: { type: "string" } },
    theme: { type: "string", required: true },
    themeKey: { type: "string", required: true, enum: ["frontier-signal", "blue-big-fish"] },
    breakpoints: { type: "array", required: true, items: { type: "string" } },
    stages: { type: "array", required: true, items: { type: "string" } },
    freshnessWarnings: { type: "array", required: true, items: { type: "string" } },
    testCount: { type: "integer", required: true },
    redactionCount: { type: "integer", required: true },
  },
};

export function apply(ctx, config = {}) {
  const entry = Config(config);
  let settings;
  let settingsRegistrationError;
  try {
    settings = ctx.settings.register(SETTINGS_NAMESPACE, Config, { base: entry });
  } catch (error) {
    // A malformed value left by an older plugin version should not prevent the
    // tool itself from registering. Keep defaults readable and make writes
    // fail explicitly until the host-side setting is repaired or cleared.
    settingsRegistrationError = error instanceof Error ? error.message : String(error);
    settings = {
      get: () => entry,
      async update() {
        throw new Error(`Stored plugin settings could not be loaded: ${settingsRegistrationError}`);
      },
    };
  }
  const readSettings = () => {
    const value = settings.get?.() ?? entry;
    return {
      theme: value.theme === "blue-big-fish" || value.theme === "frontier-signal" ? value.theme : entry.theme,
      generatePoster: typeof value.generatePoster === "boolean" ? value.generatePoster : entry.generatePoster,
    };
  };
  ctx.connection.rpc.handle(SETTINGS_RPC_CHANNEL, async (endpoint, payload) => {
    if (endpoint === "get") {
      return { ok: true, value: readSettings() };
    }
    if (endpoint !== "set" || typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      return { ok: false, error: { code: "bad-request", message: "Expected get or set with theme or generatePoster.", details: { issues: [] } } };
    }
    const unknownKeys = Object.keys(payload).filter((key) => key !== "theme" && key !== "generatePoster");
    if (unknownKeys.length) {
      return { ok: false, error: { code: "bad-request", message: `Unsupported settings fields: ${unknownKeys.join(", ")}.`, details: { issues: [] } } };
    }
    const patch = {};
    if ("theme" in payload) {
      const theme = payload.theme;
      if (theme !== "frontier-signal" && theme !== "blue-big-fish") {
        return { ok: false, error: { code: "bad-request", message: "Unsupported showcase theme.", details: { issues: [] } } };
      }
      patch.theme = theme;
    }
    if ("generatePoster" in payload) {
      if (typeof payload.generatePoster !== "boolean") {
        return { ok: false, error: { code: "bad-request", message: "generatePoster must be a boolean.", details: { issues: [] } } };
      }
      patch.generatePoster = payload.generatePoster;
    }
    if (!Object.keys(patch).length) {
      return { ok: false, error: { code: "bad-request", message: "Provide theme or generatePoster to update.", details: { issues: [] } } };
    }
    try {
      await settings.update(patch);
    } catch (error) {
      return { ok: false, error: { code: "settings-rejected", message: error instanceof Error ? error.message : String(error), details: { ns: SETTINGS_NAMESPACE } } };
    }
    return { ok: true, value: readSettings() };
  }, { authority: "loopback" });
  ctx.tools.register(defineTool({
    name: "showcase_layout_summary",
    description: "Generate a local Markdown layout summary from the current .showcase/report.json checkpoint. For visual UI projects, call it once after responsive captures are ready; for non-visual projects, call it after the report and tests are ready. Partial or failed reports are valid review checkpoints, but do not call after every code edit, status check, or intermediate tweak. Markdown is the lightweight default; generate an HTML poster only when the plugin setting allows it or the user explicitly requests a poster for this call. Reads only project files, writes only inside the project, and never uploads content.",
    parameters: {
      projectPath: { type: "string", description: "Absolute or relative path to the project root.", required: true },
      reportPath: { type: "string", description: "Optional project-relative report path. Defaults to .showcase/report.json." },
      outputPath: { type: "string", description: "Optional Markdown path under .showcase. Must end in .md or .markdown. Defaults to .showcase/layout-summary.md." },
      locale: { type: "string", description: "Output language: zh-CN (default) or en.", enum: ["zh-CN", "en"], default: "zh-CN" },
      posterPath: { type: "string", description: "Optional HTML poster path under .showcase. Must end in .html or .htm. Defaults to .showcase/layout-poster.html." },
      generatePoster: { type: "boolean", description: "Optional one-call override. Pass true only when the user explicitly wants the HTML poster; pass false to keep this call Markdown-only. Omit to use the persistent plugin setting. This does not change the setting." },
      appPath: { type: "string", description: "Optional project-relative layout source override. If omitted, the plugin discovers a suitable source file." },
      cssPath: { type: "string", description: "Optional project-relative stylesheet override. If omitted, the plugin discovers a suitable CSS file." },
    },
    output: {
      schema: outputSchema,
      render(_args, value) {
        const english = value.locale === "en";
        const labels = english ? { heading: "Local layout artifacts generated", markdown: "Markdown", poster: "Poster", posterDisabled: "Not generated for this call", freshness: "Freshness warnings", sections: "Sections", theme: "Theme", stages: "Stages", breakpoints: "Breakpoints", tests: "Tests", redactions: "redactions" } : { heading: "本地布局产物已生成", markdown: "Markdown", poster: "海报", posterDisabled: "本次未生成", freshness: "时效警告", sections: "区段", theme: "风格", stages: "阶段", breakpoints: "断点", tests: "测试", redactions: "已脱敏" };
        const punctuation = english ? "." : "。";
        const poster = value.posterGenerated ? value.posterPath : labels.posterDisabled;
        return [{ type: "text", text: `${labels.heading}${punctuation}\n${labels.markdown}: ${value.outputPath}\n${labels.poster}: ${poster}\n${labels.freshness}: ${value.freshnessWarnings.length}${punctuation}\n${labels.sections}: ${value.sections.join(", ")}\n${labels.theme}: ${value.theme}\n${labels.stages}: ${value.stages.join(", ")}\n${labels.breakpoints}: ${value.breakpoints.join(", ")}\n${labels.tests}: ${value.testCount}; ${labels.redactions}: ${value.redactionCount}${punctuation}` }];
      },
    },
    async execute({ projectPath, reportPath, outputPath, posterPath, appPath, cssPath, locale, generatePoster: requestedGeneratePoster }) {
      if (requestedGeneratePoster !== undefined && typeof requestedGeneratePoster !== "boolean") {
        throw new Error("generatePoster must be a boolean.");
      }
      const current = readSettings();
      const shouldGeneratePoster = typeof requestedGeneratePoster === "boolean" ? requestedGeneratePoster : current.generatePoster;
      return generateLayoutSummary({ projectPath, reportPath, outputPath, posterPath, appPath, cssPath, locale, theme: current.theme, generatePoster: shouldGeneratePoster });
    },
  }));
}
