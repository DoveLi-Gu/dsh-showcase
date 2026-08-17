export type LayoutSummaryResult = {
  locale: "zh-CN" | "en";
  outputPath: string;
  posterPath: string;
  sections: string[];
  themes: string[];
  breakpoints: string[];
  stages: string[];
  testCount: number;
  redactionCount: number;
};

export function generateLayoutSummary(options: {
  projectPath: string;
  reportPath?: string;
  outputPath?: string;
  posterPath?: string;
  locale?: "zh-CN" | "en";
}): Promise<LayoutSummaryResult>;
