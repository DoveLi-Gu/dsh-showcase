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
      posterPath: { type: "string", description: "Optional project-relative poster path. Defaults to .showcase/layout-poster.html." },
    },
    output: {
      schema: outputSchema,
      render(_args, value) {
        return [{ type: "text", text: `Local layout artifacts generated. Markdown: ${value.outputPath}\nPoster: ${value.posterPath}\nSections: ${value.sections.join(", ")}\nThemes: ${value.themes.join(", ")}\nBreakpoints: ${value.breakpoints.join(", ")}\nTests: ${value.testCount}; redactions: ${value.redactionCount}.` }];
      },
    },
    async execute({ projectPath, reportPath, outputPath, posterPath }) {
      return generateLayoutSummary({ projectPath, reportPath, outputPath, posterPath });
    },
  }));
}
