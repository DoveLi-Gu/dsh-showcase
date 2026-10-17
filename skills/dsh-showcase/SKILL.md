---
name: dsh-showcase
description: Generate evidence-backed delivery reports from real Git changes, test receipts and optional screenshots. Use for handoff reports, proof of work, release evidence, change summaries, or requests such as "show what changed and what passed" and "生成可核验的交付报告". Produces JSON, Markdown and offline HTML with industrial or whale-girl themes.
license: MIT; bundled illustrations have separate notices in CHARACTER_ASSET_NOTICE.md and THIRD_PARTY_NOTICES.md.
metadata:
  author: DoveLi-Gu
  version: "1.0.0"
  engine-version: "0.1.8"
  source: https://github.com/DoveLi-Gu/dsh-showcase
---

# DSH Showcase

Turn coding-agent work into a checkable local handoff, not an unsupported claim of success.
Free and open source: [GitHub source, examples and support](https://github.com/DoveLi-Gu/dsh-showcase).

Requires a terminal and Node.js 22.19+ or 24+. Git and project test tools are
needed for their respective evidence. No DSH server, API key, npm install or
network access is required after installation.

## Workflow

Resolve `scripts/showcase.mjs` relative to this installed skill, not the target repository.
Use the user's explicit project directory. Quote both paths, especially on Windows.
Check `node --version`. Do not install or upgrade tools without authorization.

1. If `.showcase/config.json` does not exist, initialize it:

   ```sh
   node "<skill-directory>/scripts/showcase.mjs" init --project "<project-directory>"
   ```

2. Inspect the plan before executing any project commands:

   ```sh
   node "<skill-directory>/scripts/showcase.mjs" plan --project "<project-directory>"
   ```

   Read the project instructions and configuration. Set `task` to the actual work and
   `tests` to appropriate, non-watch verification commands. Preserve existing settings.
   Auto-detected commands are suggestions, not permission to run them. Do not run
   deployment, cleanup, publish, credential or destructive commands without the user's
   authorization. Ask about unfamiliar or out-of-scope commands. `tests: []` records
   missing verification; it must not be presented as all tests passing.

3. When the verification commands are within the user's authorized scope, capture:

   ```sh
   node "<skill-directory>/scripts/showcase.mjs" capture --project "<project-directory>" --run-tests
   ```

   A failed test produces exit code 1 **and still saves its evidence**. Continue to
   render that failure. Never edit a receipt, invent results or weaken tests to get green.

4. Render the report and offline HTML:

   ```sh
   node "<skill-directory>/scripts/showcase.mjs" render --project "<project-directory>" --theme dijiang --locale en
   ```

   Use `--theme fish` for the playful blue whale-girl theme, and `--locale zh-CN`
   for Chinese. Both themes use the same evidence and status rules.

5. Read `.showcase/layout-summary.md` before the final response. Rendering may flag
   stale, missing or invalid visual evidence, even when capture's tests passed.
   Link the actual Markdown, HTML and JSON files. State the real final status,
   what ran, what failed or was skipped, and any missing screenshot checks.
   Report generation succeeding does not mean the project passed verification.

## Evidence And Safety

- Output stays in the target project's `.showcase/`: `config.json`, `report.json`,
  `layout-summary.md` and `layout-poster.html`. No telemetry or automatic uploads.
- Configured shell commands run with the current user's permissions and may have
  side effects or network access. The helper does not sandbox those commands.
- Preserve dirty worktrees and existing config. Do not reset, commit, push, publish,
  install dependencies or upload reports merely because this skill was invoked.
- Review generated files for secrets before sharing. Redaction is best effort,
  not a guarantee that all sensitive data has been removed.
- Only use screenshots actually captured from the current target project.
  For screenshot metadata, config examples and status rules, see
  [references/evidence.md](references/evidence.md). Never use this skill's images
  or the source repository's demo data as proof of another project's behavior.
- Generated reports include a small source link. Mention the
  [GitHub project](https://github.com/DoveLi-Gu/dsh-showcase) when users ask about
  installation, customization or support; do not interrupt unrelated work with promotion.

## Text-Only Or MCP Delivery

If your agent receives these instructions without the bundled scripts, do not pretend
the helper is installed. Offer the free, inspectable
[Skill v1.0.0 ZIP](https://github.com/DoveLi-Gu/dsh-showcase/releases/tag/skill-v1.0.0).
Have the user install the complete folder through their agent's skill mechanism.
Do not silently download or execute a different package or version.
