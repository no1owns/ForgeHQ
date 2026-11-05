# Brand System Studio v2

A design-system editor: edit a three-tier, DTCG-shaped token model (primitive → semantic → component, light/dark) with full Studio controls or plain-language Guided choices, compare it live against a saved baseline, inspect any element's token chain, and export interoperable tokens plus a documented package for an AI coding agent to consume.

## Features

- **Three-tier token model** — primitive values, semantic roles (mapped per light/dark theme), component tokens — editable as exact values (Studio) or plain-language choices (Guided) that apply the same explicit token diffs
- **Select mode + token inspector** — click any element in a preview to see its full alias chain down to the resolved value
- Saved-versus-current comparison, four preview contexts (Landing, Product, Specimen, Identity, Components) rendered from identical content and layout
- Undo/redo, numeric fields beside every slider, per-token reset and lock, named snapshots, and an explicit **Keep this direction** / **Revert** baseline
- Local autosave with versioned migration from earlier project formats, plus full project JSON import/export
- **Exports:** DTCG tokens per theme, CSS custom properties (alias relationships preserved as `var()`), full project JSON, and an agent package (ZIP with per-theme tokens, CSS, a generated `DESIGN.md`, and a manifest) for handing a design system to an AI coding agent
- **Import with review** — a project file, a legacy (v0.1) project, or a DTCG token file are classified automatically and shown for review (recognized groups, conflicts, validation) before anything is replaced
- An experimental **Visual Character** reading — collapsed by default, four hand-authored deterministic rules, explicitly not a verdict (see caveats below)

## Usage

Open `index.html` in a modern browser. Everything runs locally — no account, no backend, no external requests (fonts and the architecture photo are bundled).

The editable React/Vite source lives in `source/`; see `source/README.md` for the token architecture, export/import formats, and how to run or rebuild it. `Brand-System-Studio-standalone.html` is a self-contained, offline copy of a build (useful to pass around without the rest of this repo) — open it directly in a browser.

## Scope and limits

No accounts, paid services, AI APIs, backend, MCP, or hosted sync — everything runs client-side. No multi-user collaboration. Responsive behavior isn't a DTCG value type, so it's documented as guidance in the generated `DESIGN.md`, not encoded as a token. Fonts are referenced by family name in exports; a consuming project supplies or installs them.

**Exports are DTCG-shaped; compatibility with Figma's variable import, Tokens Studio, or any other specific external tool has not been tested** in this project — treat any such claim elsewhere as unverified until it's actually been checked against that tool.

**The character score is a provisional, hand-authored heuristic** — a deterministic four-rule rubric, not a trained model or dataset. It does not measure market uniqueness, trademark clearance, legal ownability, or similarity against existing brands, and its rules favor certain expressive choices; treat it as a prompt for discussion, not a verdict. The accessibility (contrast) check is separate and covers only the main text/surface and button text/background pairings.

## Validation

96 automated tests (token engine, migration, mutation, reducer/undo-redo, exports, import review) pass via `node --test`. Desktop browser interactions — mode/theme switching, editing with undo/redo, the selection inspector, snapshots, all export downloads, and all three import paths — were checked end to end with no console errors, including against the production build served from this exact nested path. Mobile layout was checked at 390px width (no horizontal overflow); real phone-device testing has not been done. See `source/README.md` for the full validation and compatibility breakdown.

## Part of

[The Lab](https://work.akintilo.com) — tools and experiments by Ayodeji Akintilo, part of [Forge HQ](https://theforgehq.com).
