import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import dijiangThemeHtml from "./dijiang-theme.html?raw";
import { dijiangHardeningCss, dijiangReadoutMarkup } from "./dijiang-hardening";
import "./styles.css";

export function openLegacyPreview(theme: string | null, motionMode: string) {
  if (theme === "fish") {
    createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
  } else {
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
  }
  document.documentElement.dataset.previewRenderer = "legacy";
  document.title = `[旧版存档] ${document.title}`;
}
