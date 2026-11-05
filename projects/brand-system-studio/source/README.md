# Brand System Studio v0.1
Approved hybrid: comparison desk plus graphite precision controls.

## Run
Node 22+, npm install, npm run dev. Production: npm run build.
Brand-System-Studio.html is a standalone offline version. Open it in a browser. File previewers may not execute JavaScript.

## Architecture
React/Vite, no backend. One current system plus a saved comparison snapshot. Three-level exports retain references. All four specimen contexts render from the same values. Versioned localStorage persistence, project JSON restore, CSS and token JSON exports. Fonts and architectural imagery bundled locally.

## Scope and limits
Color, type pairing, scale, weight, radius, spacing; Guided and Studio views; landing, product, components and identity previews. Example-brand buttons are specimens, not a functioning architecture business application. Character score is an experimental, deterministic four-rule rubric; no dataset, AI inference, market comparison, trademark or uniqueness check. Its rules favor certain expressive choices and need validation with designers before being relied on. Accessibility check covers main text/surface pairing only. No full light/dark token themes, accounts, collaboration or hosted integrations yet. CSS exports refer to font family names; install or supply the fonts in a consuming project.

## Validation
Desktop browser interactions and persistence checked. CSS download confirmed. Production build passed. Mobile responsive CSS is implemented but phone browser testing remains outstanding.

## Repository integration notes
This source was adapted to live under `projects/brand-system-studio/` in the ForgeHQ repo and deploy as a static page on GitHub Pages, alongside the repo's other Lab experiments:
- `vite.config.mjs` builds with a relative `base: "./"` so asset URLs resolve correctly whether served from the domain root or nested under `/ForgeHQ/projects/brand-system-studio/`.
- The architecture photo and bundled fonts moved from `public/assets/` into `src/assets/` and are referenced as proper Vite module imports (an import in `App.jsx`, relative `url()`s in `fonts.css`) instead of root-absolute paths like `/assets/...`, which would 404 once hosted in a subdirectory.
- `worker/index.js`, `scripts/prepare-sites-build.mjs`, `tests/sites-worker.test.mjs`, and this package's original `AGENTS.md` were removed — they targeted a different ("Sites") hosting platform's SPA-fallback routing and build/test pipeline, which doesn't apply to this repo's plain static GitHub Pages deploy (no server runtime, no client-side routing).
- The footer's existing "THE LAB" credit is now a link back to https://work.akintilo.com, matching this repo's convention for linking Lab experiments back to their index.

To rebuild after making changes here: `npm install && npm run build`, then copy the contents of `dist/client/` over the deployed files one level up (`projects/brand-system-studio/`), keeping this `source/` directory and the standalone HTML untouched.
