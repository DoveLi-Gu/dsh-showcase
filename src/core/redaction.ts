import type { RedactionSummary } from "./report-schema";

export type RedactionResult = {
  text: string;
  summary: RedactionSummary;
};

type RedactionRule = {
  name: string;
  expression: RegExp;
  replacement: string;
};

const rules: RedactionRule[] = [
  {
    name: "authorization",
    expression: /\b(authorization\s*[:=]\s*)(?:bearer\s+)?[^\s,;]+/gi,
    replacement: "$1[REDACTED]",
  },
  {
    name: "token",
    expression: /\b(?:api[_-]?key|access[_-]?token|token)\s*[:=]\s*[^\s,;]+/gi,
    replacement: "[REDACTED_TOKEN]",
  },
  {
    name: "github-token",
    expression: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
    replacement: "[REDACTED_GITHUB_TOKEN]",
  },
  {
    name: "private-key",
    expression: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    replacement: "[REDACTED_PRIVATE_KEY]",
  },
  {
    name: "windows-path",
    expression: /\b[A-Za-z]:\\(?:[^\s<>:"|?*]+\\)*[^\s<>:"|?*]*/g,
    replacement: "[REDACTED_PATH]",
  },
  {
    name: "unix-path",
    expression: /(?<![\w/])\/(?:Users|home)\/[^\s/:]+(?:\/[^\s:]+)*/g,
    replacement: "[REDACTED_PATH]",
  },
];

export function redact(text: string): RedactionResult {
  const replacements: Record<string, number> = {};
  let redacted = text;

  for (const rule of rules) {
    redacted = redacted.replace(rule.expression, (...match) => {
      replacements[rule.name] = (replacements[rule.name] ?? 0) + 1;
      return typeof rule.replacement === "string"
        ? match[0].replace(rule.expression, rule.replacement)
        : rule.replacement;
    });
  }

  const totalReplacements = Object.values(replacements).reduce((total, count) => total + count, 0);
  return {
    text: redacted,
    summary: {
      originalLength: text.length,
      redactedLength: redacted.length,
      replacements,
      totalReplacements,
    },
  };
}
