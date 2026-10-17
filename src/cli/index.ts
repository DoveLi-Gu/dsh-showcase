import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { reportSchema } from "../core/report-schema";
import { capture, init } from "./commands";

export { capture, init } from "./commands";

async function main() {
  const [command] = process.argv.slice(2);
  if (command === "init") {
    console.log(`Created ${await init()}`);
    return;
  }
  if (command === "capture") {
    const destination = await capture();
    console.log(`Created ${destination}`);
    const report = reportSchema.parse(JSON.parse(await readFile(destination, "utf8")));
    if (report.task.status === "failed") process.exitCode = 1;
    return;
  }
  throw new Error("Usage: dsh-showcase <init|capture>");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
