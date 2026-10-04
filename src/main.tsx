import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import dijiangThemeHtml from "./dijiang-theme.html?raw";
import { dijiangHardeningCss, dijiangReadoutMarkup } from "./dijiang-hardening";
import "./styles.css";

const params = new URLSearchParams(window.location.search);
const selectedTheme = params.get("theme");
const motionMode = params.get("motion") === "accessible" ? "accessible" : "full";

if (selectedTheme !== "fish" && params.get("legacy") === "1") {
  document.open();
  document.write(dijiangThemeHtml);
  document.close();
  document.documentElement.dataset.dijiangMotion = motionMode;
  const hardening = document.createElement("style");
  hardening.textContent = dijiangHardeningCss;
  document.head.append(hardening);
  const copy = document.querySelector(".copy");
  if (copy && !document.querySelector(".field-readout")) {
    copy.insertAdjacentHTML("afterend", dijiangReadoutMarkup);
  }
} else if (selectedTheme !== "fish") {
  const root = document.getElementById("root")!;
  root.textContent = "正在准备交付报告…";
  import("./dijiang-preview").then(({ createDijiangDemoDocument }) => createDijiangDemoDocument()).then((html) => {
    document.open();
    document.write(html);
    document.close();
  }).catch((error: unknown) => {
    root.textContent = error instanceof Error ? error.message : "交付报告加载失败。";
    const retry = document.createElement("button");
    retry.textContent = "重新加载";
    retry.addEventListener("click", () => location.reload());
    root.append(retry);
  });
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
