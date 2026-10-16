import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDemoDocument, resolvePreviewTheme } from "../src/poster-preview";
import { version } from "../package.json";
import { solidPng } from "./png-fixture";

class PreviewFileReader {
  result = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then((bytes) => {
      this.result = `data:${blob.type};base64,${Buffer.from(bytes).toString("base64")}`;
      this.onload?.();
    }).catch(() => this.onerror?.());
  }
}

function capture(theme: "blue-big-fish" | "frontier-signal") {
  const name = theme === "blue-big-fish" ? "fish" : "dijiang";
  return {
    id: name + "-desktop", theme, label: name + " / 当前源码截图",
    viewport: { name: "desktop", width: 1000, height: 900 },
    imagePath: `evidence/current-preview/${name}-1000x900.jpg`,
    url: `http://localhost:5173/?theme=${name}&capture=1`,
    capturedAt: "2026-10-16T06:00:00.000Z", kind: "after", captureMode: "viewport",
  };
}

const manifest = () => ({ version: 1, packageVersion: version, screenshots: [capture("blue-big-fish"), capture("frontier-signal")] });

describe("current plugin preview", () => {
  beforeEach(() => {
    vi.stubGlobal("location", { search: "?theme=fish" });
    vi.stubGlobal("FileReader", PreviewFileReader);
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.endsWith(".json")) return Response.json(manifest());
      return new Response(new Uint8Array(solidPng(2, 2)), { headers: { "Content-Type": "image/jpeg" } });
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it("renders the actual fish plugin layout and embeds the portrait instead of the legacy React poster", async () => {
    const html = await createDemoDocument("blue-big-fish");
    expect(html).toContain('data-theme="blue-big-fish"');
    expect(html).toContain('class="poster-layout"');
    expect(html).toContain('class="portrait-field"');
    expect(html).toContain('class="art" src="data:image/webp;base64,UklGR');
    expect(html.includes('class="route-evidence delivery-manifest"')).toBe(true);
    expect(html).not.toContain('class="poster-summary fish-poster"');
    expect(html).toContain('data-preview-renderer="plugin"');
    expect(html).toContain(`data-preview-version="${version}"`);
    expect(html.includes("fish / 当前源码截图")).toBe(true);
    expect(html.includes("dijiang / 当前源码截图")).toBe(false);
    expect(html.includes("历史演示截图")).toBe(false);
    expect(html.includes("不代表当前项目的实测结果")).toBe(true);
    expect(html.includes('data-preview-captures="current"')).toBe(true);
  });

  it("keeps the Dijiang console and avoids loading fish assets for it", async () => {
    const html = await createDemoDocument("frontier-signal");
    expect(html).toContain('class="poster dijiang-console"');
    expect(html).toContain('data-preview-renderer="plugin"');
    expect(fetch).not.toHaveBeenCalledWith("/whale-girl-keyvisual.webp");
    expect(html.includes("dijiang / 当前源码截图")).toBe(true);
    expect(html.includes("fish / 当前源码截图")).toBe(false);
  });

  it.each(["blue-big-fish", "frontier-signal"] as const)("labels %s preview status as demonstration data", async (theme) => {
    const html = await createDemoDocument(theme);
    expect(html).toContain('演示状态：待复核');
    expect(html).toContain('aria-label="状态：演示状态：待复核"');
    expect(html).toContain('data-status="partial"');
    expect(html).not.toContain('部分完成 / 需要复核');
  });

  it("keeps the portrait in capture mode without recursively loading demonstration screenshots", async () => {
    vi.stubGlobal("location", { search: "?theme=fish&capture=1" });
    const html = await createDemoDocument("blue-big-fish");
    expect(fetch).not.toHaveBeenCalled();
    expect(html).toContain('class="portrait-field"');
    expect(html).not.toContain("历史演示截图");
  });

  it("keeps the built-in portrait when captures are unavailable without restoring old screenshots", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));
    const html = await createDemoDocument("blue-big-fish");
    expect(html.includes("不会回退显示历史截图")).toBe(true);
    expect(html.includes('class="art" src="data:image/webp;base64,UklGR')).toBe(true);
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(["/evidence/current-preview/manifest.json"]);
  });

  it.each(["path", "version", "mime", "empty"])("rejects invalid current captures: %s", async (fault) => {
    const data = manifest();
    if (fault === "path") data.screenshots[0].imagePath = "../private.jpg";
    if (fault === "version") data.packageVersion = "0.0.0";
    vi.mocked(fetch).mockImplementation(async (url) => String(url).endsWith(".json") ? Response.json(data)
      : new Response(fault === "empty" ? null : "not an image", { headers: { "Content-Type": fault === "mime" ? "text/html" : "image/jpeg" } }));
    const html = await createDemoDocument("blue-big-fish");
    expect(html.includes("不会回退显示历史截图")).toBe(true);
    expect(html.includes("fish / 当前源码截图")).toBe(false);
  });

  it.each(["fish", "blue-big-fish"])("resolves fish theme alias %s", (value) => {
    expect(resolvePreviewTheme(value)).toBe("blue-big-fish");
  });

  it.each([null, "dijiang", "frontier-signal", "field"])("resolves Dijiang theme alias %s", (value) => {
    expect(resolvePreviewTheme(value)).toBe("frontier-signal");
  });
});
