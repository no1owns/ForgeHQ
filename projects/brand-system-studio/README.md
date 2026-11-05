# Brand System Studio v0.1

An editorial comparison workspace for exploring a brand's visual system — color, typography, type scale, weight, corner radius and spacing — with a graphite control panel and precise sliders, side by side against a saved baseline.

## Features

- **Guided** and **Studio** editing modes for the same underlying system
- Saved-versus-current comparison, with identical imagery, content and layout across both
- Four preview contexts rendered from the same values: Landing, Product, Specimen, Identity
- **Keep this direction** / **Revert** to move the saved baseline forward or discard an exploration
- Local autosave and restore, plus full project JSON import/export
- CSS custom-property and token JSON exports that preserve primitive → semantic → component references
- An experimental **Visual Character** instrument — a deterministic, explainable four-rule reading of your choices (see caveats below)

## Usage

Open `index.html` in a modern browser. Everything runs locally — no account, no backend, no external requests (fonts and the architecture photo are bundled).

The editable React/Vite source lives in `source/`; see `source/README.md` to run it locally or rebuild. `Brand-System-Studio-standalone.html` is a self-contained, offline copy of the same build (useful to pass around without the rest of this repo) — open it directly in a browser.

## Scope and limits

Color, type pairing, scale, weight, radius, spacing; Guided and Studio views; landing, product, components and identity previews. Example-brand buttons are specimens, not a functioning architecture business application. **The character score is a provisional, hand-authored heuristic** — a deterministic four-rule rubric, not a trained model or dataset. It does not measure market uniqueness, trademark clearance, legal ownability, or similarity against existing brands, and its rules favor certain expressive choices; treat it as a prompt for discussion, not a verdict. The accessibility (contrast) check is separate from the character score and covers only the main text/surface pairing. No full light/dark token themes, accounts, collaboration, AI APIs, cloud storage, external brand search or hosted integrations. CSS exports reference font family names; install or supply the fonts in a consuming project.

## Validation

Desktop browser interactions, persistence, and the production build were checked as part of this integration (see the PR/commit description for the full list). Mobile responsive CSS is implemented and was checked at phone/tablet/desktop viewport widths during integration, but real-device phone testing has not been done.

## Part of

[The Lab](https://work.akintilo.com) — tools and experiments by Ayodeji Akintilo, part of [Forge HQ](https://theforgehq.com).
