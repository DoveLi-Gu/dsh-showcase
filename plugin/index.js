import z from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { generateLayoutSummary } from "./layout-summary.js";

export const name = "showcase-layout-summary";
export const inject = ["tools"];
export const Config = z.object({});

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    locale: { type: "string", required: true, enum: ["zh-CN", "en"] },
    outputPath: { type: "string", required: true, description: "Project-relative path to the generated Markdown file." },
    posterPath: { type: "string", required: true, description: "Project-relative path to the self-contained evidence poster." },
    sections: { type: "array", required: true, items: { type: "string" } },
    themes: { type: "array", required: true, items: { type: "string" } },
    breakpoints: { type: "array", required: true, items: { type: "string" } },
    stages: { type: "array", required: true, items: { type: "string" } },
    testCount: { type: "integer", required: true },
    redactionCount: { type: "integer", required: true },
  },
};

export function apply(ctx) {
  ctx.tools.register(defineTool({
    name: "showcase_layout_summary",
    description: "Generate a local Markdown layout summary and self-contained evidence poster. Reads only project files, writes only inside the project, and never uploads content.",
    parameters: {
      projectPath: { type: "string", description: "Absolute or relative path to the project root.", required: true },
      reportPath: { type: "string", description: "Optional project-relative report path. Defaults to .showcase/report.json." },
      outputPath: { type: "string", description: "Optional project-relative Markdown path. Defaults to .showcase/layout-summary.md." },
      locale: { type: "string", description: "Output language: zh-CN (default) or en.", enum: ["zh-CN", "en"], default: "zh-CN" },
      posterPath: { type: "string", description: "Optional project-relative poster path. Defaults to .showcase/layout-poster.html." },
    },
    output: {
      schema: outputSchema,
      render(_args, value) {
        const english = value.locale === "en";
        const labels = english ? { heading: "Local layout artifacts generated", markdown: "Markdown", poster: "Poster", sections: "Sections", themes: "Themes", stages: "Stages", breakpoints: "Breakpoints", tests: "Tests", redactions: "redactions" } : { heading: "本地布局产物已生成", markdown: "Markdown", poster: "海报", sections: "区段", themes: "主题", stages: "阶段", breakpoints: "断点", tests: "测试", redactions: "已脱敏" };
        const punctuation = english ? "." : "。";
        return [{ type: "text", text: `${labels.heading}${punctuation}\n${labels.markdown}: ${value.outputPath}\n${labels.poster}: ${value.posterPath}\n${labels.sections}: ${value.sections.join(", ")}\n${labels.themes}: ${value.themes.join(", ")}\n${labels.stages}: ${value.stages.join(", ")}\n${labels.breakpoints}: ${value.breakpoints.join(", ")}\n${labels.tests}: ${value.testCount}; ${labels.redactions}: ${value.redactionCount}${punctuation}` }];
      },
    },
    async execute({ projectPath, reportPath, outputPath, posterPath, locale }) {
      return generateLayoutSummary({ projectPath, reportPath, outputPath, posterPath, locale });
    },
  }));
}
