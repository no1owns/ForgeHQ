import { getAtPath } from './edit.js';
import { FONT_CATALOG } from './fonts.js';

/**
 * The SAME experimental, deterministic four-rule heuristic from Brand
 * System Studio v0.1 — adapted to read from the token model instead of a
 * flat {font,accent,radius,scale} object, not redesigned or expanded.
 * Still not a measure of uniqueness, trademark clearance, legal
 * ownability, or similarity to existing brands, and still not an
 * accessibility score (see tokens/color-math.js's contrastRatio for
 * that, which this file does not call).
 */
export function readCharacter(system) {
  const headingFont = getAtPath(system.primitive, 'font.family.heading').$value;
  const headingId = Object.values(FONT_CATALOG).find((f) => sameStack(f.stack, headingFont))?.id;
  const headingRole = FONT_CATALOG[headingId]?.role ?? 'sans';

  const accentHex = getAtPath(system.primitive, 'color.brand.600').$value.hex;
  const radius = getAtPath(system.primitive, 'dimension.radius.md').$value.value;
  const base = getAtPath(system.primitive, 'font.size.base').$value.value;
  const lg = getAtPath(system.primitive, 'font.size.lg').$value.value;
  const impliedScale = base > 0 ? lg / base : 1;

  const rules = [
    {
      name: 'Type contrast',
      value: headingRole === 'serif-display' ? 22 : headingRole === 'mono' ? 18 : 8,
      why: headingRole === 'serif-display'
        ? 'The serif heading against a sans body adds an editorial voice.'
        : headingRole === 'mono'
          ? 'A monospaced heading creates a technical voice.'
          : 'A sans/sans pairing creates a restrained, familiar voice.',
    },
    {
      name: 'Color relationship',
      value: parseInt(accentHex.slice(1, 3), 16) > parseInt(accentHex.slice(5, 7), 16) ? 18 : 14,
      why: 'A warmer or cooler accent changes the palette’s expression. This rule does not measure rarity.',
    },
    {
      name: 'Shape language',
      value: radius <= 6 ? 15 : radius <= 16 ? 11 : 7,
      why: radius <= 6 ? 'Crisp corners reinforce a precise silhouette.' : 'Softer corners create an approachable silhouette.',
    },
    {
      name: 'Hierarchy',
      value: impliedScale >= 1.22 && impliedScale <= 1.38 ? 13 : 9,
      why: 'The implied type scale (large step ÷ base step) changes the separation between headings and body text.',
    },
  ];

  return { score: rules.reduce((n, r) => n + r.value, 0), rules };
}

function sameStack(a, b) {
  const norm = (x) => (Array.isArray(x) ? x.join(',') : x);
  return norm(a) === norm(b);
}

export function characterBand(score) {
  if (score < 25) return 'Conventional';
  if (score < 50) return 'Emerging';
  if (score < 75) return 'Characterful';
  if (score < 90) return 'Distinctive';
  return 'Highly differentiated';
}
