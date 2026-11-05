// Small, dependency-free color helpers: hex <-> HSL, and a deterministic
// tonal-scale generator. This is explicit, inspectable math (per the
// "palette generation must be explicit" requirement) — not a perceptual
// color-science library. Good enough for an editable starting ramp; it is
// not a substitute for a real tool (e.g. APCA-aware scale generation) and
// the README says so.

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16) / 255, g: parseInt(m[2], 16) / 255, b: parseInt(m[3], 16) / 255 };
}

export function rgbToHex({ r, g, b }) {
  const c = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function rgbToHsl({ r, g, b }) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
}

export function hslToRgb({ h, s, l }) {
  if (s === 0) return { r: l, g: l, b: l };
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return { r: hue2rgb(p, q, h + 1 / 3), g: hue2rgb(p, q, h), b: hue2rgb(p, q, h - 1 / 3) };
}

export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
}

export function hslToHex(hsl) {
  return rgbToHex(hslToRgb(hsl));
}

// Relative luminance / contrast ratio (WCAG 2.x formula).
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [r, g, b].map(lin);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(hexA, hexB) {
  const a = relativeLuminance(hexA), b = relativeLuminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
// Lightness targets for a 10-step ramp; step 500 sits near the input color.
const LIGHTNESS_CURVE = [0.96, 0.9, 0.82, 0.71, 0.6, 0.5, 0.42, 0.33, 0.24, 0.14];

/** Build a 10-step tonal scale {50..900} from one base hex color, by
 * walking its hue/saturation across a fixed lightness curve. Deterministic
 * and explicit on purpose, so a locked/edited step is never silently
 * regenerated over.
 *
 * The input color is preserved *exactly* (not just approximately, by
 * hue/saturation) at whichever step's target lightness it's closest to —
 * this matters for migrating an existing project, where the user's exact
 * original hex must survive, not drift toward the curve's idealized value
 * for that step. */
export function generateTonalScale(baseHex) {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return null;
  const out = {};
  let closestIndex = 0, closestDelta = Infinity;
  LIGHTNESS_CURVE.forEach((l, i) => {
    const delta = Math.abs(l - hsl.l);
    if (delta < closestDelta) { closestDelta = delta; closestIndex = i; }
  });
  SCALE_STEPS.forEach((step, i) => {
    out[step] = i === closestIndex ? baseHex.toLowerCase() : hslToHex({ h: hsl.h, s: hsl.s, l: LIGHTNESS_CURVE[i] });
  });
  return out;
}

const NEUTRAL_STEPS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const NEUTRAL_LIGHTNESS = [1, 0.97, 0.93, 0.85, 0.75, 0.62, 0.5, 0.38, 0.27, 0.18, 0.1, 0.05];

/** A true neutral gray scale, optionally tinted very slightly by a hue (so
 * "neutral" can still feel cohesive with a warm or cool brand color). */
export function generateNeutralScale(tintHex, tintAmount = 0.04) {
  const hsl = tintHex ? hexToHsl(tintHex) : { h: 0, s: 0, l: 0.5 };
  const out = {};
  NEUTRAL_STEPS.forEach((step, i) => {
    out[step] = hslToHex({ h: hsl.h, s: hsl.s * tintAmount, l: NEUTRAL_LIGHTNESS[i] });
  });
  return out;
}
