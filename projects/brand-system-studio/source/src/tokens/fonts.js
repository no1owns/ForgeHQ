// Font catalog: every entry here is either a font actually bundled in
// src/assets/fonts/ (so no external request happens at runtime) or a
// system font stack already present on the device (no network request
// either way, just not a custom webfont). `weights` lists only the
// weights that really exist for that family — the typography controls
// must not offer a weight the font doesn't have.

export const FONT_CATALOG = {
  fraunces: {
    id: 'fraunces', label: 'Fraunces', role: 'serif-display', source: 'bundled',
    stack: ['Fraunces', 'Georgia', 'serif'],
    weights: [400, 500, 600, 700],
  },
  inter: {
    id: 'inter', label: 'Inter', role: 'sans', source: 'bundled',
    stack: ['Inter', 'Arial', 'sans-serif'],
    weights: [400, 500, 600],
  },
  systemSans: {
    id: 'systemSans', label: 'System sans (Arial)', role: 'sans', source: 'system',
    stack: ['Arial', 'Helvetica', 'sans-serif'],
    weights: [400, 700], // Arial only reliably has regular/bold across platforms
  },
  systemMono: {
    id: 'systemMono', label: 'System monospace', role: 'mono', source: 'system',
    stack: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
    weights: [400, 700],
  },
};

export function fontStackCss(id) {
  return FONT_CATALOG[id]?.stack.join(', ') ?? 'sans-serif';
}

export function closestAvailableWeight(fontId, desiredWeight) {
  const weights = FONT_CATALOG[fontId]?.weights ?? [400];
  return weights.reduce((best, w) => (Math.abs(w - desiredWeight) < Math.abs(best - desiredWeight) ? w : best), weights[0]);
}

// The three legacy "directions" from Brand System Studio v0.1, kept as
// Guided-mode presets (task: "Retain those directions as optional
// presets"). Each maps to a heading/body font pair.
export const LEGACY_DIRECTIONS = {
  Editorial: { heading: 'fraunces', body: 'systemSans' },
  Modern: { heading: 'inter', body: 'systemSans' },
  Technical: { heading: 'systemMono', body: 'systemSans' },
};
