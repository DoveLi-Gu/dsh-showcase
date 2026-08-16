# dsh-showcase Dual Theme Brief

## Shared product direction

Build a working, local-first showcase report generator for coding-agent work. The interface must present verifiable evidence rather than a marketing landing page.

The same report data and functionality must work in two switchable themes. Theme changes must not alter content hierarchy, interaction behavior, accessibility, or layout stability.

## Theme A: Frontier Industrial

Inspired by contemporary industrial science-fiction and tactical operations interfaces, without copying any game logo, character, illustration, icon, proprietary layout, or named faction.

- Tone: remote industrial facility, field engineering, tactical telemetry, precise machinery.
- Palette: carbon black, cold white, mineral gray, safety yellow, signal orange, restrained cyan.
- Geometry: hard edges, clipped corners used sparingly, thin rules, calibration marks, asymmetric grid.
- Typography: condensed display face paired with a highly readable technical sans and monospace data face.
- Motion: scan progression, measurement ticks, staged evidence reveal, no decorative floating blobs.
- Signature element: a stable `PROMPT -> PLAN -> BUILD -> VERIFY -> SHIP` operations rail.
- Avoid: copied Endfield logos, characters, screenshots, exact UI panels, or recognizable proprietary symbols.

## Theme B: Blue Big Fish

A playful deep-sea operations console centered on an original round blue fish mascot. It should feel charming and screenshot-friendly while remaining useful for professional review.

- Tone: deep-sea lab, friendly navigator, buoyant but competent.
- Palette: midnight navy, ocean blue, cyan, foam white, coral red, lime status accents.
- Geometry: compact panels with subtle porthole and sonar references; maximum 8px card radius.
- Mascot: original large blue fish silhouette with simple fins and expressive status poses. Do not copy the DeepSeek whale or any existing mascot artwork.
- Motion: gentle swim-in for empty/loading states, sonar sweep for capture progress, bubbles only as functional progress indicators rather than background decoration.
- Signature element: the fish travels along the same five-stage operations rail and changes state at verification milestones.
- Avoid: childish toy UI, excessive rounded pills, unreadable novelty typography, or decorative animation that obscures evidence.

## Required screens and interactions

1. Report overview with task goal, status, commit range, duration, changed files, and verification summary.
2. Responsive evidence gallery for desktop, tablet, and mobile screenshots.
3. Before/after comparison slider.
4. Code change explorer with file navigation and readable unified diff.
5. Test receipts with command, duration, exit code, and expandable output.
6. Privacy review showing detected and redacted secrets before export.
7. Export panel for self-contained HTML, JSON report, cover image, and README snippet.
8. Theme switcher implemented as a segmented control with persisted preference.
9. Empty, loading, success, warning, failure, and redacted states.

## Technical and quality constraints

- TypeScript, React, Vite, Zod, Vitest, Playwright-ready architecture.
- Local-first and no account requirement.
- Use Lucide icons where available.
- No nested cards and no oversized marketing hero.
- Stable responsive dimensions at desktop and mobile widths.
- Respect `prefers-reduced-motion`.
- Keyboard-accessible controls and visible focus treatment.
- English primary README plus a complete Chinese README.
- Include realistic demo fixture data so the UI is useful immediately after install.
