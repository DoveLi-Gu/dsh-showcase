const params = new URLSearchParams(window.location.search);
const selectedTheme = params.get("theme");
const motionMode = params.get("motion") === "accessible" ? "accessible" : "full";
const root = document.getElementById("root")!;

async function openPreview() {
  if (params.get("legacy") === "1") {
    const { openLegacyPreview } = await import("./legacy-preview");
    openLegacyPreview(selectedTheme, motionMode);
    return;
  }
  root.textContent = "正在准备交付报告…";
  const { createDemoDocument, resolvePreviewTheme } = await import("./poster-preview");
  const html = await createDemoDocument(resolvePreviewTheme(selectedTheme));
  document.open();
  document.write(html);
  document.close();
}

openPreview().catch((error: unknown) => {
  root.textContent = error instanceof Error ? error.message : "交付报告加载失败。";
  const retry = document.createElement("button");
  retry.textContent = "重新加载";
  retry.addEventListener("click", () => location.reload());
  root.append(retry);
});
