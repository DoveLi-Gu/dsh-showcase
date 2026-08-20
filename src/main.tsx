import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import dijiangThemeHtml from "./dijiang-theme.html?raw";
import { dijiangHardeningCss, dijiangReadoutMarkup } from "./dijiang-hardening";
import "./styles.css";

const params = new URLSearchParams(window.location.search);
const selectedTheme = params.get("theme");
const motionMode = params.get("motion") === "accessible" ? "accessible" : "full";

if (selectedTheme !== "fish") {
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
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
