const rules = [
  ["private-key", /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]"],
  ["authorization", /\b(authorization[\"']?\s*[:=]\s*[\"']?)(?:(?:bearer|basic)\s+)?[^\s,;\"'}]+/gi, "$1[REDACTED]"],
  ["cookie", /\b((?:set-cookie|cookie)[\"']?\s*[:=]\s*)[^\r\n]+/gi, "$1[REDACTED_COOKIE]"],
  ["token", /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|password|secret)[\"']?\s*[:=]\s*(?:\"[^\"]*\"|'[^']*'|[^\s,;}]+)/gi, "[REDACTED_TOKEN]"],
  ["provider-key", /\b(?:sk-(?:proj-|ant-|or-v1-)?[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{20,}|xai-[A-Za-z0-9_-]{16,}|pplx-[A-Za-z0-9_-]{16,}|hf_[A-Za-z0-9_-]{16,})\b/g, "[REDACTED_KEY]"],
  ["github-token", /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, "[REDACTED_GITHUB_TOKEN]"],
  ["url-credentials", /\b(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi, "$1[REDACTED]@"],
  ["windows-path", /\b[A-Za-z]:[\\/][^\s<>:"|?*]+/g, "[REDACTED_PATH]"],
  ["unix-path", /(?<![\w/])\/(?:Users|home|mnt|var|tmp)\/[^\s/:]+(?:\/[^\s:]+)*/g, "[REDACTED_PATH]"],
];

export function redact(text) {
  const replacements = {};
  let redacted = String(text);
  for (const [name, expression, replacement] of rules) {
    redacted = redacted.replace(expression, (match) => {
      replacements[name] = (replacements[name] ?? 0) + 1;
      return match.replace(expression, replacement);
    });
  }
  return { text: redacted, summary: {
    originalLength: text.length, redactedLength: redacted.length, replacements,
    totalReplacements: Object.values(replacements).reduce((sum, count) => sum + count, 0),
  } };
}
