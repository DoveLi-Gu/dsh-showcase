import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { capture, init, readConfig } from "../cli/commands";
import { reportSchema } from "../core/report-schema";
import { generateLayoutSummary } from "../../plugin/layout-summary.js";
import { atomicProjectWrite, parseJson, projectFile, readBoundedFile, withProjectLock } from "../../plugin/project-io.js";

const SOURCE = "https://github.com/DoveLi-Gu/dsh-showcase";
const HELP = `DSH Showcase Skill (free, local, no DSH server required)
Usage: node scripts/showcase.mjs <command> --project <directory>
  init     Create .showcase/config.json without overwriting existing config
  plan     Show configured commands without executing them
  capture  Collect real Git/test evidence; requires --run-tests
  render   Generate Markdown + offline HTML from existing evidence
Options: --theme dijiang|fish (render only), --locale en|zh-CN (render only)
Source: ${SOURCE}`;

function print(value: unknown) {
  console.log(JSON.stringify(value, null, 2));
}

async function loadReport(project: string) {
  return reportSchema.parse(parseJson(await readBoundedFile(await projectFile(project, ".showcase/report.json"), 2 * 1024 * 1024)));
}

async function addSource(project: string, markdownPath: string, htmlPath?: string) {
  // Reacquire the project lock after the renderer's own transaction has finished.
  await withProjectLock(project, async () => {
    const markdown = (await readBoundedFile(await projectFile(project, markdownPath), 8 * 1024 * 1024)).toString("utf8");
    await atomicProjectWrite(project, markdownPath, `${markdown}\n---\nGenerated locally with [DSH Showcase](${SOURCE}) · Free and open source.\n`);
    if (htmlPath) {
      const html = (await readBoundedFile(await projectFile(project, htmlPath), 32 * 1024 * 1024)).toString("utf8");
      const footer = `<footer style="padding:16px;text-align:center;font:12px Arial,sans-serif"><a href="${SOURCE}" target="_blank" rel="noopener noreferrer">DSH Showcase · Free and open source</a></footer>`;
      await atomicProjectWrite(project, htmlPath, html.replace(/<\/body>/i, `${footer}</body>`));
    }
  });
}

export async function main(args = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    strict: true,
    options: {
      project: { type: "string" },
      "run-tests": { type: "boolean", default: false },
      theme: { type: "string" },
      locale: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) { console.log(HELP); return; }
  const [command] = positionals;
  if (positionals.length !== 1 || !["init", "plan", "capture", "render"].includes(command)) throw new Error(HELP);
  if (!values.project?.trim()) throw new Error("An explicit --project <directory> is required. No files were changed.");
  if (command !== "render" && (values.theme !== undefined || values.locale !== undefined)) throw new Error("--theme and --locale are render-only options.");
  if (command !== "capture" && values["run-tests"]) throw new Error("--run-tests is a capture-only option.");
  const project = resolve(values.project);
  if (!(await stat(project)).isDirectory()) throw new Error("--project must point to an existing directory.");
  if (command === "init") {
    print({ config: await init(project), source: SOURCE });
  } else if (command === "plan") {
    print({ project, config: await readConfig(project), executesCommands: false, source: SOURCE });
  } else if (command === "capture") {
    if (!values["run-tests"]) throw new Error("Review `plan` first. Capture executes configured shell commands and requires --run-tests.");
    const reportPath = await capture(project);
    const report = await loadReport(project);
    print({ reportPath, status: report.task.status, tests: report.tests.map(({ command, status }) => ({ command, status })), warnings: report.warnings, source: SOURCE });
    if (report.task.status === "failed") process.exitCode = 1;
  } else {
    const themes = { dijiang: "frontier-signal", "frontier-signal": "frontier-signal", fish: "blue-big-fish", "blue-big-fish": "blue-big-fish" } as const;
    const theme = themes[(values.theme ?? "dijiang") as keyof typeof themes];
    if (!theme) throw new Error("Unknown theme. Use dijiang or fish.");
    const locale = values.locale ?? "en";
    if (locale !== "en" && locale !== "zh-CN") throw new Error("Unknown locale. Use en or zh-CN.");
    const result = await generateLayoutSummary({ projectPath: project, theme, locale, generatePoster: true });
    await addSource(project, result.outputPath, result.posterPath);
    print({ ...result, note: "Read the final Markdown status. Successful rendering is not a claim that tests or visual checks passed.", source: SOURCE });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
