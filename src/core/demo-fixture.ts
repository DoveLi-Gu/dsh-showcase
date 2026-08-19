import { reportSchema, type Report } from "./report-schema";

const fixture = {
  version: 1,
  generatedAt: "2026-08-16T14:30:00.000Z",
  task: {
    id: "task-frontend-redesign",
    goal: "为仪表盘改版补充可核验的交付证据。",
    status: "completed",
    startedAt: "2026-08-16T14:02:00.000Z",
    completedAt: "2026-08-16T14:30:00.000Z",
    durationMs: 1680000,
  },
  git: {
    baseRef: "main",
    headRef: "HEAD",
    files: [
      { path: "src/App.tsx", status: "modified", additions: 48, deletions: 12 },
      { path: "src/styles.css", status: "added", additions: 96, deletions: 0 },
    ],
    summary: { changedFiles: 2, additions: 144, deletions: 12 },
  },
  tests: [
    {
      id: "test-unit",
      command: "npm test -- --run",
      startedAt: "2026-08-16T14:26:00.000Z",
      durationMs: 4200,
      exitCode: 0,
      status: "passed",
      output: "7 项测试通过\nreport-schema.test.ts 2 项通过\nredaction.test.ts 2 项通过\ncommand.test.ts 2 项通过\ngit.test.ts 1 项通过",
    },
    {
      id: "typecheck",
      command: "npm run typecheck",
      startedAt: "2026-08-16T14:27:00.000Z",
      durationMs: 1850,
      exitCode: 0,
      status: "passed",
      output: "tsc -b --pretty false\n未发现类型错误。",
    },
  ],
  screenshots: [
    {
      id: "desktop-after",
      label: "桌面端界面证据",
      theme: "blue-big-fish",
      viewport: { name: "desktop", width: 1440, height: 900 },
      url: "http://localhost:5173",
      imagePath: "evidence/desktop-after.png",
      capturedAt: "2026-08-16T14:28:00.000Z",
      kind: "after",
    },
    {
      id: "tablet-after",
      label: "平板端界面证据",
      theme: "blue-big-fish",
      viewport: { name: "tablet", width: 834, height: 1112 },
      url: "http://localhost:5173",
      imagePath: "evidence/tablet-after.png",
      capturedAt: "2026-08-16T14:28:10.000Z",
      kind: "after",
    },
    {
      id: "mobile-after",
      label: "移动端界面证据",
      theme: "blue-big-fish",
      viewport: { name: "mobile", width: 390, height: 844 },
      url: "http://localhost:5173",
      imagePath: "evidence/mobile-after.png",
      capturedAt: "2026-08-16T14:28:20.000Z",
      kind: "after",
    },
  ],
  redaction: {
    originalLength: 2480,
    redactedLength: 2421,
    replacements: { "令牌": 1, "本机路径": 2 },
    totalReplacements: 3,
  },
};

export const demoReport: Report = reportSchema.parse(fixture);
