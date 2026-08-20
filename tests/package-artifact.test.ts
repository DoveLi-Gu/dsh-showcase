import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

describe("published package artifact", () => {
  it("contains the DSH runtime without repository-only build output", () => {
    const windows = process.platform === "win32";
    const command = windows ? process.env.ComSpec ?? "cmd.exe" : "npm";
    const args = windows
      ? ["/d", "/s", "/c", "npm pack --dry-run --json --ignore-scripts"]
      : ["pack", "--dry-run", "--json", "--ignore-scripts"];
    const result = spawnSync(command, args, {
      cwd: projectRoot,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      throw new Error(`npm pack --dry-run failed:\n${result.stderr || result.stdout}`);
    }

    const [artifact] = JSON.parse(result.stdout) as Array<{ files: Array<{ path: string }> }>;
    const paths = artifact.files.map((file) => file.path);
    const required = [
      "CHARACTER_ASSET_NOTICE.md",
      "CHANGELOG.md",
      "LICENSE",
      "README.md",
      "README.zh-CN.md",
      "SECURITY.md",
      "cordis.patch.yml",
      "package.json",
      "plugin/client-host.js",
      "plugin/client.js",
      "plugin/index.d.ts",
      "plugin/index.js",
      "plugin/layout-summary.d.ts",
      "plugin/layout-summary.js",
      "plugin/poster-html.js",
      "plugin/report-schema.js",
    ];

    expect(paths).toEqual(expect.arrayContaining(required));
    expect(paths).toContain("plugin/assets/dijiang-survey-surface.webp");
    expect(paths).toContain("plugin/assets/whale-girl-keyvisual.webp");
    expect(paths).not.toContain("plugin/assets/dijiang-orbital-graphic.png");
    expect(paths).not.toContain("plugin/assets/frontier-industrial.webp");
    expect(paths).not.toContain("plugin/assets/whale-girl-poster.webp");
    expect(paths.some((path) => /^(?:dist|src|tests|tmp|output|\.showcase|\.codex-tmp)\//.test(path))).toBe(false);
    expect(paths.some((path) => /(?:^|\/)(?:\.env(?:\..*)?|[^/]+\.(?:log|map|tsbuildinfo))$/.test(path))).toBe(false);
  });

  it("keeps repository build tooling out of production dependencies", async () => {
    const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    for (const dependency of ["@vitejs/plugin-react", "lucide-react", "react", "react-dom", "vite"]) {
      expect(manifest.dependencies).not.toHaveProperty(dependency);
      expect(manifest.devDependencies).toHaveProperty(dependency);
    }
  });
});
