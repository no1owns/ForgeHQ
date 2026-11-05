# Brand System Studio v2

A design-system editor: edit a three-tier DTCG token model (primitive → semantic → component, light/dark), compare it live against a saved baseline, and export it as interoperable tokens plus a documented package for an AI coding agent to consume.

## Run
Node 22+. `npm install`, `npm run dev`. Production: `npm run build` (outputs to `dist/client/`). Tests: `npm test` (`node --test tests/*.test.mjs`, no external test framework).

`Brand-System-Studio-standalone.html` (one level up) is a standalone offline copy of a build. Open it directly in a browser — file previewers may not execute JavaScript.

## Token architecture

Tokens follow the [Design Tokens Community Group (DTCG) Format Module](https://www.designtokens.org/) shape — `$value`/`$type`/`$description`, groups, and `{alias.path}` references — in three layers:

- **primitive** — raw values (color scales, a spacing/radius/font scale, font families). Theme-independent.
- **semantic** — roles (`semantic.color.action.primary`, `semantic.color.surface.default`, `semantic.typography.heading.1`, …) that alias primitives. **One semantic mapping per theme** (`light`/`dark`) — the same role can point to a different primitive in each theme.
- **component** — component-level tokens (`component.button.primary.background`, `component.input.borderFocus`, `component.card.shadow`, …) that should alias semantic roles, not primitives directly, though the editor doesn't forbid the latter.

Primitive and component tokens are shared across themes; only the semantic *mapping* differs per theme. This keeps the two comparison systems (current vs. saved) rendering from identical component/content markup, and means CSS export doesn't duplicate primitive/component variables per theme — only semantic ones are re-emitted under `[data-theme="dark"]`.

`$value` shapes implemented: `color` (`{colorSpace, components, alpha, hex}`, accepts a plain hex string on input), `dimension` (`{value, unit}`), `fontFamily`, `fontWeight`, `number`, `string`, and the composite types `typography`, `border`, `shadow` (each with per-field values or aliases). `$type` is inherited from an ancestor group when not set on the token itself.

**Provenance note:** this was implemented from trained knowledge of the DTCG format; the live 2025.10 spec pages (`designtokens.org`, Figma's variables docs) were not reachable from this session's network (DNS-blocked) to verify the exact wording, so treat the color `$value` shape and any other spec detail here as "implemented to the best available understanding, not re-verified against the published spec in this session."

## Editing

- **Studio mode** — exact values: primitive color scales (with lock + regenerate-from-base), semantic role → primitive alias pickers, typography (independent heading/body font, weight, size steps, line height), geometry (radius, border width, spacing scale with density presets, content width/gutter), and component → semantic alias pickers.
- **Guided mode** — the *same* system, edited through plain-language choices (hierarchy/density/geometry, each a named level like "Spacious") that compute and apply an explicit, visible set of token diffs (`tokens/guided.js`) rather than swapping in a separate preset system. Switching to Studio shows the exact tokens a Guided choice just changed.
- **Selection + inspector** — toggle **Select** mode in the canvas toolbar, click any labeled element in a preview, and the inspector shows its full alias chain (`component.button.primary.background → semantic.color.action.primary → primitive.color.brand.600`) down to the resolved value, with each link clickable to re-center on it. **Interact** mode restores normal element behavior (buttons click, inputs focus) so hover/focus states can actually be tried.
- **Undo/redo** (toolbar buttons and Ctrl/Cmd+Z / Shift+Z), numeric fields beside every slider, per-token **Reset** (to the system's current baseline, not the original app default), per-token **Lock** (protects a primitive from palette regeneration), named **snapshots** (save/restore/delete), and an explicit **Keep this direction** / **Revert** baseline, distinct from snapshots.

## Exports

All four generated live from the in-memory system, so a preview can't drift from the download:

- **DTCG tokens** — one theme's fully-merged document (primitive + that theme's semantic + component), valid DTCG JSON.
- **CSS variables** — custom properties with `var()` aliases preserved (not flattened), semantic vars scoped under `:root, [data-theme="light"]` and `[data-theme="dark"]`.
- **Project JSON** — the complete app state (both comparison systems × both themes, snapshots, locks, UI state) — round-trips exactly through Import.
- **Agent package (ZIP)** — `tokens.json` (default theme) + `tokens.<theme>.json` per additional theme, `tokens.css`, a generated `DESIGN.md` (which semantic/component token to use for common elements, states, responsive guidance — pulled from live resolved values so it can't quote a stale color), `manifest.json`, and a `README.md`. Built with a small dependency-free ZIP writer (STORED entries, real CRC32); verified both by an independent test-only parser and by extracting it with the real `unzip` CLI.

**Compatibility:** these are DTCG-shaped exports. Compatibility with Figma's variable import, Tokens Studio, or any other specific external tool has **not been tested** in this project (no access to those tools from this environment) — don't rely on an untested "Figma compatible" or "Tokens Studio compatible" claim anywhere in this repo. If re-verifying, check in particular whether the external tool expects the structured `color.$value` shape used here (`{colorSpace, components, alpha, hex}`) or a plain hex/CSS-color string — that's the most likely point of divergence.

## Import

A JSON file is classified automatically, then shown for review before anything is replaced:
- **Current-format project JSON** (as produced by Export → Project JSON) — reviewed, then replaces the whole project on accept.
- **Legacy v0.1 project JSON** (the original flat `{accent, surface, text, font, scale, weight, radius, spacing}` shape) — migrated to the current token model, then shown for review the same way. Nothing from a legacy file is silently dropped; migration maps every legacy field to a token.
- **DTCG token file** — reviewed group-by-group (primitive/semantic/component, whichever top-level groups are recognized), with validation errors, conflicts against the current system, and a check for what importing everything would do to validation, all shown before you choose which groups to bring in. Only the groups you check are merged into the current system; everything else is left alone.

Nothing is replaced until you explicitly accept the review.

## Visual Character (experimental)

A collapsed-by-default panel, not a headline metric. Four hand-authored, deterministic rules — not a trained model, not a comparison against real brands, not an accessibility or uniqueness score. Needs designer validation before being relied on; see the in-app "Why this reading?" breakdown for the exact rules and their rationale.

## Scope and limits

No accounts, paid services, AI APIs, backend, MCP, or hosted sync — everything runs client-side with `localStorage` persistence and file-based import/export. No multi-user collaboration. Responsive behavior is not a DTCG value type, so it's documented as guidance in the generated `DESIGN.md`, not encoded as a token. Fonts are referenced by family name in exports; a consuming project supplies or installs them. The character score's limitations are above.

## Validation performed

- **Automated:** 96 `node --test` cases across the token engine (schema/resolve/validate/serialize/color-math), defaults, v1→v2 migration, mutation (`edit.js`), the reducer/undo-redo stack, guided-mode diffs, exports (DTCG/CSS/ZIP/agent package/design doc), and DTCG import review — all passing.
- **Browser (Playwright, headless Chromium):** app load, Studio ↔ Guided mode switch, theme switch, a committed slider edit with working undo/redo, Select mode → inspector showing a resolved alias chain, snapshot creation, all 4 export tabs including real file downloads (DTCG JSON and the agent ZIP, both opened and checked afterward), all three import paths (project JSON round-trip, legacy v1 migration, DTCG selective-group import) end to end, the character panel expanding, and no console/page errors throughout. Checked at both dev-server and production-build URLs, including served from the real nested `projects/brand-system-studio/` path.
- **Mobile:** no horizontal overflow at 390px width; the saved/current mobile toggle (replacing side-by-side compare, which doesn't fit) is visible and functional. Real phone-device testing has not been done.
- **Not done:** no testing against Figma, Tokens Studio, or any other external design tool (see Compatibility above); no load/stress testing of very large token sets; no automated accessibility audit beyond the in-app contrast readout.

## Repository integration notes

This source lives under `projects/brand-system-studio/` in the ForgeHQ repo and deploys as a static page on GitHub Pages, alongside the repo's other Lab experiments. `vite.config.mjs` builds with a relative `base: "./"` so asset URLs resolve correctly whether served from the domain root or nested under `/ForgeHQ/projects/brand-system-studio/`.

To rebuild after making changes here: `npm install && npm run build`, then copy the contents of `dist/client/` over the deployed files one level up (`projects/brand-system-studio/`), keeping this `source/` directory and the standalone HTML untouched.
