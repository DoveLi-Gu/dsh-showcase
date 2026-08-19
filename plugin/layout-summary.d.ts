export type LayoutSummaryResult = {
  locale: "zh-CN" | "en";
  outputPath: string;
  posterPath?: string;
  posterGenerated: boolean;
  sections: string[];
  theme: string;
  themeKey: "frontier-signal" | "blue-big-fish";
  freshnessWarnings: string[];
  breakpoints: string[];
  stages: string[];
  testCount: number;
  redactionCount: number;
};

export function generateLayoutSummary(options: {
  projectPath: string;
  reportPath?: string;
  /** Optional Markdown output under .showcase; must end in .md or .markdown. */
  outputPath?: string;
  /** Optional HTML poster output under .showcase; must end in .html or .htm. */
  posterPath?: string;
  /** Optional project-relative layout source override. Auto-discovered when omitted. */
  appPath?: string;
  /** Optional project-relative stylesheet override. Auto-discovered when omitted. */
  cssPath?: string;
  locale?: "zh-CN" | "en";
  theme?: "frontier-signal" | "blue-big-fish";
  /** Generate the self-contained HTML poster. Defaults to true for direct API compatibility. */
  generatePoster?: boolean;
}): Promise<LayoutSummaryResult>;
