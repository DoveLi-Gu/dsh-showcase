export { redact } from "../../plugin/redaction.js";
import type { RedactionSummary } from "./report-schema";
export type RedactionResult = { text: string; summary: RedactionSummary };
