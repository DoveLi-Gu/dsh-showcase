import z from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { generateLayoutSummary } from "./layout-summary.js";
import { isAbsolute, resolve } from "node:path";

export const name = "showcase-layout-summary";
export const inject = ["tools", "settings"];
// The settings service addresses forms by the profile entry id declared in
// cordis.patch.yml. Keep this stable across plugin releases so old profiles
// keep their selected theme and poster preference.
export const SETTINGS_NAMESPACE = "showcase-layout-summary";
export const Config = z.object({
  theme: z.union(["frontier-signal", "blue-big-fish"])
    .default("frontier-signal")
    .volatile()
    .description("生成 HTML 海报时使用的视觉风格：终末地帝江号或蓝色大肥鱼。主题只从插件设置读取。"),
  generatePoster: z.boolean()
    .default(false)
    .volatile()
    .description("是否生成自包含 HTML 海报。关闭时只生成 Markdown 摘要。"),
});

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    locale: { type: "string", enum: ["zh-CN", "en"], required: true },
    outputPath: { type: "string", description: "Project-relative path to the generated Markdown file.", required: true },
    posterPath: { type: "string", description: "Project-relative path to the self-contained evidence poster when generated." },
    posterGenerated: { type: "boolean", description: "Whether this call wrote a self-contained HTML poster.", required: true },
    sections: { type: "array", items: { type: "string" }, required: true },
    theme: { type: "string", required: true },
    themeKey: { type: "string", enum: ["frontier-signal", "blue-big-fish"], required: true },
    breakpoints: { type: "array", items: { type: "string" }, required: true },
    stages: { type: "array", items: { type: "string" }, required: true },
    freshnessWarnings: { type: "array", items: { type: "string" }, required: true },
    testCount: { type: "integer", required: true },
    redactionCount: { type: "integer", required: true },
  },
};

export function apply(ctx, config = {}) {
  // Cordis supplies a parsed Config whose volatile fields are stable refs. The
  // plain-object branch keeps direct consumers and older test harnesses useful.
  const entry = hasVolatileFields(config) ? config : Config(config);
  const initial = {
    theme: readConfigValue(entry.theme, "frontier-signal"),
    generatePoster: readConfigValue(entry.generatePoster, false),
  };
  const legacySettings = typeof ctx.settings?.register === "function";
  let legacyRegistrationError;
  let legacy;
  if (legacySettings) {
    try {
      legacy = ctx.settings.register(SETTINGS_NAMESPACE, Config, { base: initial });
    } catch (error) {
      // Keep the tool available when an older host has an invalid persisted
      // section; the new SettingsForms service rejects the same write itself.
      legacyRegistrationError = error instanceof Error ? error.message : String(error);
      legacy = { get: () => initial, async update() { throw new Error(`Stored plugin settings could not be loaded: ${legacyRegistrationError}`); } };
    }
  }
  if (!legacySettings && typeof ctx.inject === "function") {
    // This plugin owns a custom Plugins-page form. Disable the generic form so
    // DSH does not render a second, competing editor for the same fields.
    ctx.inject(["settings"], (child) => {
      child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
    });
  }
  const readSettings = () => {
    const descriptor = !legacySettings && typeof ctx.settings?.describe === "function"
      ? ctx.settings.describe().find((candidate) => candidate.ns === SETTINGS_NAMESPACE)
      : undefined;
    const value = legacySettings ? legacy.get?.() ?? initial : descriptor?.value ?? {
      theme: readConfigValue(entry.theme, initial.theme),
      generatePoster: readConfigValue(entry.generatePoster, initial.generatePoster),
    };
    return {
      theme: value.theme === "blue-big-fish" || value.theme === "frontier-signal" ? value.theme : initial.theme,
      generatePoster: typeof value.generatePoster === "boolean" ? value.generatePoster : initial.generatePoster,
      revision: descriptor?.revision,
    };
  };
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
    async execute({ projectPath, reportPath, outputPath, posterPath, appPath, cssPath, locale, generatePoster: requestedGeneratePoster }, exec) {
      if (requestedGeneratePoster !== undefined && typeof requestedGeneratePoster !== "boolean") {
        throw new Error("generatePoster must be a boolean.");
      }
      const current = readSettings();
      const sessionRoot = exec?.agent?.session?.meta?.cwd;
      if (!isAbsolute(projectPath)) {
        if (!sessionRoot) throw new Error("Relative projectPath requires a session workspace. Provide an absolute projectPath.");
        projectPath = resolve(sessionRoot, projectPath);
      }
      const shouldGeneratePoster = typeof requestedGeneratePoster === "boolean" ? requestedGeneratePoster : current.generatePoster;
      return generateLayoutSummary({ projectPath, reportPath, outputPath, posterPath, appPath, cssPath, locale, theme: current.theme, generatePoster: shouldGeneratePoster, signal: exec?.signal });
    },
  }));
}

function hasVolatileFields(value) {
  return value !== null && typeof value === "object" && hasVolatile(value.theme) && hasVolatile(value.generatePoster);
}

function hasVolatile(value) {
  return value !== null && typeof value === "object" && typeof value.get === "function";
}

function readConfigValue(value, fallback) {
  const current = hasVolatile(value) ? value.get() : value;
  return current === undefined ? fallback : current;
}
