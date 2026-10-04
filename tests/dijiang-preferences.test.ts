import { describe, expect, it } from "vitest";
import { readDijiangPreferences } from "../plugin/dijiang-motion.js";

const embedded = JSON.stringify({ palette: "dark", accent: "cyan", motion: false, background: false, fps: 60, speed: 1.5 });

describe("standalone Dijiang display preferences", () => {
  it("retains exported preferences when browser storage is denied", () => {
    expect(readDijiangPreferences(embedded, () => { throw new Error("Storage denied"); })).toEqual(JSON.parse(embedded));
  });

  it("retains exported preferences when stored JSON is corrupt", () => {
    expect(readDijiangPreferences(embedded, () => "{corrupt")).toEqual(JSON.parse(embedded));
  });

  it("applies valid viewer preferences over an exported report", () => {
    expect(readDijiangPreferences(embedded, () => JSON.stringify({ palette: "light", fps: 120 }))).toEqual({ ...JSON.parse(embedded), palette: "light", fps: 120 });
  });

  it("does not replace valid embedded values with invalid stored settings", () => {
    expect(readDijiangPreferences(embedded, () => JSON.stringify({ palette: "invalid", motion: "true", background: 1, fps: 100000, speed: -1 }))).toEqual(JSON.parse(embedded));
  });

  it.each(["null", "[]", "true", '"dark"', "{broken"])("uses bounded defaults for malformed preferences: %s", (source) => {
    expect(readDijiangPreferences(source, () => source)).toEqual({ palette: "light", accent: "yellow", background: true, motion: true, fps: 24, speed: 1 });
  });
});
