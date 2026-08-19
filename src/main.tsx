import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import dijiangThemeHtml from "./dijiang-theme.html?raw";
import "./styles.css";

const selectedTheme = new URLSearchParams(window.location.search).get("theme");

if (selectedTheme !== "fish") {
  document.open();
  document.write(dijiangThemeHtml);
  document.close();
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
