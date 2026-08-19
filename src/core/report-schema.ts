import { z } from "zod";

export const taskSchema = z.object({
  id: z.string().min(1),
  goal: z.string().min(1),
  status: z.enum(["completed", "partial", "failed"]),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().int().nonnegative(),
});

export const gitChangeSchema = z.object({
  baseRef: z.string().min(1).optional(),
  headRef: z.string().min(1).optional(),
  files: z.array(
    z.object({
      path: z.string().min(1),
      status: z.enum(["added", "modified", "deleted", "renamed", "untracked"]),
      additions: z.number().int().nonnegative(),
      deletions: z.number().int().nonnegative(),
      previousPath: z.string().min(1).optional(),
    }),
  ),
  summary: z.object({
    changedFiles: z.number().int().nonnegative(),
    additions: z.number().int().nonnegative(),
    deletions: z.number().int().nonnegative(),
  }),
});

export const testReceiptSchema = z.object({
  id: z.string().min(1),
  command: z.string().min(1),
  startedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative(),
  exitCode: z.number().int(),
  status: z.enum(["passed", "failed", "skipped"]),
  output: z.string(),
});

export const screenshotEvidenceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  theme: z.enum(["frontier-signal", "blue-big-fish", "field", "fish"]).optional(),
  viewport: z.object({
    name: z.enum(["desktop", "tablet", "mobile"]),
    width: z.number().int().positive().max(16384),
    height: z.number().int().positive().max(16384),
  }),
  url: z.string().url(),
  imagePath: z.string().min(1),
  capturedAt: z.string().datetime(),
  kind: z.enum(["after", "before"]),
});

export const redactionSummarySchema = z.object({
  originalLength: z.number().int().nonnegative(),
  redactedLength: z.number().int().nonnegative(),
  replacements: z.record(z.string(), z.number().int().nonnegative()),
  totalReplacements: z.number().int().nonnegative(),
});

export const reportSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string().datetime(),
  project: z.object({ name: z.string().min(1) }).optional(),
  task: taskSchema,
  git: gitChangeSchema,
  tests: z.array(testReceiptSchema),
  screenshots: z.array(screenshotEvidenceSchema),
  redaction: redactionSummarySchema,
});

export type Task = z.infer<typeof taskSchema>;
export type GitChange = z.infer<typeof gitChangeSchema>;
export type TestReceipt = z.infer<typeof testReceiptSchema>;
export type ScreenshotEvidence = z.infer<typeof screenshotEvidenceSchema>;
export type RedactionSummary = z.infer<typeof redactionSummarySchema>;
export type Report = z.infer<typeof reportSchema>;
