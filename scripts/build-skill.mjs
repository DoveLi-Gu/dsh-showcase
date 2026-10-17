import { createHash } from "node:crypto";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { rolldown } from "rolldown";
import { zipSync } from "fflate";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SKILL_VERSION = "1.0.0";

export async function buildSkill(destination = join(ROOT, "output", "skills")) {
  const directory = join(destination, "dsh-showcase");
  await mkdir(join(directory, "scripts", "assets"), { recursive: true });
  const sources = ["SKILL.md", "references/evidence.md", "agents/openai.yaml"];
  for (const name of sources) {
    await mkdir(dirname(join(directory, name)), { recursive: true });
    await cp(join(ROOT, "skills", "dsh-showcase", name), join(directory, name));
  }
  for (const name of ["LICENSE", "CHARACTER_ASSET_NOTICE.md", "THIRD_PARTY_NOTICES.md"]) {
    await cp(join(ROOT, name), join(directory, name));
  }
  await cp(join(ROOT, "plugin", "assets", "dijiang-survey-surface.webp"), join(directory, "scripts", "assets", "dijiang-survey-surface.webp"));
  const zodLicense = await readFile(join(ROOT, "node_modules", "zod", "LICENSE"), "utf8");
  await writeFile(join(directory, "DEPENDENCY_LICENSES.txt"), `Bundled dependency: Zod\nhttps://github.com/colinhacks/zod\n\n${zodLicense}`, "utf8");
  const bundle = await rolldown({
    cwd: ROOT,
    input: "src/skill/index.ts",
    platform: "node",
    external: /^node:/,
  });
  try {
    await bundle.write({ file: join(directory, "scripts", "showcase.mjs"), format: "esm", minify: false, sourcemap: false });
  } finally {
    await bundle.close();
  }
  const entries = {};
  // Never include unrelated files left in a previously generated directory.
  const releaseFiles = [...sources, "LICENSE", "CHARACTER_ASSET_NOTICE.md", "THIRD_PARTY_NOTICES.md", "DEPENDENCY_LICENSES.txt", "scripts/showcase.mjs", "scripts/assets/dijiang-survey-surface.webp"];
  for (const name of releaseFiles.sort((a, b) => a.localeCompare(b))) {
    entries[`dsh-showcase/${name}`] = [await readFile(join(directory, name)), { mtime: new Date("2026-10-17T00:00:00Z") }];
  }
  const zipPath = join(destination, `dsh-showcase-skill-${SKILL_VERSION}.zip`);
  const zip = zipSync(entries, { level: 9 });
  await writeFile(zipPath, zip);
  const sha256 = createHash("sha256").update(zip).digest("hex");
  const checksumPath = `${zipPath}.sha256`;
  await writeFile(checksumPath, `${sha256}  dsh-showcase-skill-${SKILL_VERSION}.zip\n`, "utf8");
  return { directory, zipPath, checksumPath, bytes: zip.length, sha256 };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildSkill().then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
