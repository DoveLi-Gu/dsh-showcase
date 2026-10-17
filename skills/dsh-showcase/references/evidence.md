# Evidence Reference

## Configuration

The helper creates `.showcase/config.json` without overwriting an existing file:

```json
{
  "task": "Verify the actual user-requested changes.",
  "tests": [{ "command": "npm test -- --run", "timeoutMs": 120000 }],
  "timeoutMs": 120000
}
```

Choose commands for the actual project and package manager. Do not copy a Node
command into a Python, Rust or Go project. Use non-watch modes. Optional `baseRef`
selects a real Git revision; omit it for the working-tree comparison. A missing
test tool is an observed failure, not a reason to invent a passing receipt.

## Screenshots

The helper does not operate a browser. Use the agent's authorized browser tools to
capture the actual project, inspect the picture, and put it under `.showcase/`.
After capture, add entries to the existing `report.json` `screenshots` array,
preserving other fields. Example shape (replace every example value):

```json
{
  "id": "desktop-after",
  "label": "Actual application, desktop after changes",
  "viewport": { "name": "desktop", "width": 1500, "height": 1000 },
  "imagePath": ".showcase/desktop-after.png",
  "capturedAt": "2026-10-17T08:00:00.000Z",
  "kind": "after",
  "captureMode": "viewport",
  "deviceScaleFactor": 1,
  "url": "http://localhost:5173/"
}
```

Use the real capture timestamp, URL, viewport and pixel scale. Remove secrets in
the screenshot itself before any sharing. Keep paths project-relative. Do not
give ordinary app screenshots a showcase `theme`; that field is for theme demos.
Render again after adding screenshots. Up to three eligible screenshots are
embedded. Missing, unsupported, stale or inconsistent captures produce warnings
and may make the final report partial. HTML is self-contained; screenshots are
embedded, not loaded from the target application at view time.

## Status And Recovery

- `failed`: at least one configured verification command failed or timed out.
- `partial`: evidence is incomplete, for example no tests, unavailable Git,
  changes during verification, or missing required visual evidence.
- `completed`: recorded checks passed and required evidence is available.
  This is not a claim that every possible behavior has been tested.
- Read the final Markdown status, not just the capture JSON or render exit code.
- `init` refuses to overwrite config. Malformed existing reports are preserved.
- Project-bound output paths, bounded input sizes and a lock protect artifacts.
  Do not bypass these protections by deleting a lock while a capture is running.
- Run capture again after real code changes. Keep failed results visible until
  there is a new, legitimate verification run.
