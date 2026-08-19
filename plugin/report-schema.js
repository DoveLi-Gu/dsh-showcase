import { z } from "zod";

const isoDate = z.string().datetime();

const taskSchema = z.object({
  id: z.string().min(1),
  goal: z.string().min(1),
  status: z.enum(["completed", "partial", "failed"]),
  startedAt: isoDate,
  completedAt: isoDate.optional(),
  durationMs: z.number().int().nonnegative(),
});

const gitChangeSchema = z.object({
  baseRef: z.string().min(1).optional(),
  headRef: z.string().min(1).optional(),
  files: z.array(z.object({
    path: z.string().min(1),
    status: z.enum(["added", "modified", "deleted", "renamed", "untracked"]),
    additions: z.number().int().nonnegative(),
    deletions: z.number().int().nonnegative(),
    previousPath: z.string().min(1).optional(),
  })),
  summary: z.object({
    changedFiles: z.number().int().nonnegative(),
    additions: z.number().int().nonnegative(),
    deletions: z.number().int().nonnegative(),
  }),
});

const testReceiptSchema = z.object({
  id: z.string().min(1).optional().default("test"),
  command: z.string().min(1),
  startedAt: isoDate.optional().default("1970-01-01T00:00:00.000Z"),
  durationMs: z.number().int().nonnegative().optional().default(0),
  exitCode: z.number().int(),
  status: z.enum(["passed", "failed", "skipped"]),
  output: z.string().optional().default(""),
});

const screenshotEvidenceSchema = z.object({
  id: z.string().min(1).optional().default("capture"),
  label: z.string().min(1).optional().default("capture"),
  // Accept the two legacy URL/theme aliases so reports created before the
  // settings rename can still be read and isolated safely.
  theme: z.enum(["frontier-signal", "blue-big-fish", "field", "fish"]).optional(),
  viewport: z.object({
    name: z.enum(["desktop", "tablet", "mobile"]),
    width: z.number().int().positive().max(16384),
    height: z.number().int().positive().max(16384),
  }),
  url: z.string().url().optional().default("http://localhost/"),
  imagePath: z.string().min(1),
  capturedAt: isoDate.optional().default("1970-01-01T00:00:00.000Z"),
  kind: z.enum(["after", "before"]).optional().default("after"),
});

const redactionSummarySchema = z.object({
  originalLength: z.number().int().nonnegative().optional().default(0),
  redactedLength: z.number().int().nonnegative().optional().default(0),
  replacements: z.record(z.string(), z.number().int().nonnegative()).default({}),
  totalReplacements: z.number().int().nonnegative().default(0),
});

// This is the runtime mirror of src/core/report-schema.ts. It lives beside
// the plugin because the published plugin is plain ESM JavaScript and cannot
// import the source-only TypeScript module at runtime.
export const reportSchema = z.object({
  version: z.literal(1),
  generatedAt: isoDate,
  project: z.object({ name: z.string().min(1) }).optional(),
  task: taskSchema,
  git: gitChangeSchema,
  tests: z.array(testReceiptSchema),
  screenshots: z.array(screenshotEvidenceSchema),
  redaction: redactionSummarySchema,
}).passthrough();

export function formatReportIssues(error) {
  const issues = Array.isArray(error?.issues) ? error.issues : [];
  if (!issues.length) return error instanceof Error ? error.message : String(error);
  return issues.slice(0, 8).map((issue) => {
    const path = issue.path?.length ? issue.path.join(".") : "<root>";
    return `${path}: ${issue.message}`;
  }).join("; ");
}
