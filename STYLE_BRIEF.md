# dsh-showcase Dual Theme Brief

## Shared product direction

Build a working, local-first showcase report generator for coding-agent work. The interface must present verifiable evidence rather than a marketing landing page.

The same evidence and status semantics must work in both themes. Themed layouts may differ, but must not drop evidence, invent results, break keyboard access, or reuse another project's demo content.

## Theme A: Dijiang

Current direction (2026-09-28): industrial editorial, checked against the live official Endfield site styles and loading screen, without copying game logos, characters, screenshots or proprietary panels. See VISUAL_RESEARCH_ZH.md for sources and verification limits.

- Palette: neutral white `#fff`, light gray `#f2f2f2`, ink `#191919`, and signal yellow `#fffa00`, observed in the official site CSS. Use a dark `#141414` loader. The optional cyan `#14d0d0` and dark report mode are project adaptations, not claims about an official color standard.
- Geometry: square edges, 1px rules, a restrained dot grid and localized terrain contours. Keep text on legible surfaces; do not spread texture over the evidence body or return to green-black terminal defaults.
- Typography: Arial / Helvetica Neue / PingFang SC / Microsoft YaHei, tabular numbers, a strong announcement heading, compact record labels and monospace code. Font sizes use fixed responsive steps, not viewport scaling.
- Shell: white topbar and one narrow left rail with a gray active area and ink edge marker; on mobile, navigation moves to the bottom edge. Separate the light-gray project heading, dark outcome instrument and white evidence body. Keep content clear of both fixed edges.
- Hierarchy: project and outcome, compact review metadata, delivery summary, changes and tests, visual evidence, privacy and exports. Avoid a long empty sidebar beside the report.
- Motion: masked lateral reveal, rotating calibrated loader instrument, thick progress strip and a full-height signal-color sweep. The loader opens retained evidence; it must not imply that tests are running or passing.
- Controls: persisted light/dark and accent selection, full-motion toggle, contour toggle, background frame cap (24/60/120) and speed. Frame cap is not a guaranteed rendering FPS. Pause backgrounds while hidden or offscreen.
- Use one standalone renderer for the plugin and current preview. Preserve the legacy comparison and the fish theme independently.

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
- Retain the explicitly requested full-motion Dijiang default, with a working persisted motion-off control and `?motion=accessible`; do not remove accessible alternatives.
- Keyboard-accessible controls and visible focus treatment.
- Chinese primary README with current screenshots and clear per-project setup instructions.
- Demo data belongs only to the preview. Installed reports must use the target project's records and honest empty states.
