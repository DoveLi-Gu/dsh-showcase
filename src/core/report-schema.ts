import { z } from "zod";
import { taskSchema, gitChangeSchema, testReceiptSchema, screenshotEvidenceSchema, redactionSummarySchema, reportSchema } from "../../plugin/report-schema.js";
export { taskSchema, gitChangeSchema, testReceiptSchema, screenshotEvidenceSchema, redactionSummarySchema, reportSchema };
export type Task = z.infer<typeof taskSchema>;
export type GitChange = z.infer<typeof gitChangeSchema>;
export type TestReceipt = z.infer<typeof testReceiptSchema>;
export type ScreenshotEvidence = z.infer<typeof screenshotEvidenceSchema>;
export type RedactionSummary = z.infer<typeof redactionSummarySchema>;
export type Report = z.infer<typeof reportSchema>;
