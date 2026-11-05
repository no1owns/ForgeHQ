import { getAtPath } from './edit.js';

/**
 * Guided-mode choices as explicit, relative token diffs — not absolute
 * presets — so choosing "softer" scales *this system's* current radius
 * values up, rather than jumping to one fixed number regardless of what
 * was already there. Each entry returns {edits, describe} so the UI can
 * show "this will change: ..." before/while applying it.
 */
export const GUIDED_DIMENSIONS = {
  hierarchy: {
    label: 'Hierarchy',
    help: 'How much headings stand apart from body text.',
    levels: [
      { id: 'quiet', label: 'Quieter', factor: 0.9, weightDelta: -100 },
      { id: 'balanced', label: 'Balanced', factor: 1, weightDelta: 0 },
      { id: 'expressive', label: 'More expressive', factor: 1.12, weightDelta: 100 },
    ],
    affects: ['primitive.font.size.*', 'primitive.font.weight.heading'],
    apply(system, level) {
      const sizeSteps = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
      const edits = sizeSteps.map((step) => {
        const node = getAtPath(system.primitive, `font.size.${step}`);
        return { path: `primitive.font.size.${step}`, value: { value: round1(node.$value.value * level.factor), unit: 'px' } };
      });
      const weightNode = getAtPath(system.primitive, 'font.weight.heading');
      edits.push({ path: 'primitive.font.weight.heading', value: clamp(weightNode.$value + level.weightDelta, 100, 900) });
      return edits;
    },
  },
  density: {
    label: 'Layout density',
    help: 'How much room content gets — tighter rows vs. more breathing space.',
    levels: [
      { id: 'compact', label: 'Compact', factor: 0.78 },
      { id: 'balanced', label: 'Balanced', factor: 1 },
      { id: 'spacious', label: 'Spacious', factor: 1.3 },
    ],
    affects: ['primitive.dimension.space.*', 'primitive.dimension.gutter'],
    apply(system, level) {
      const spaceSteps = [1, 2, 3, 4, 6, 8, 12, 16];
      const edits = spaceSteps.map((step) => {
        const node = getAtPath(system.primitive, `dimension.space.${step}`);
        return { path: `primitive.dimension.space.${step}`, value: { value: round1(node.$value.value * level.factor), unit: 'px' } };
      });
      const gutter = getAtPath(system.primitive, 'dimension.gutter');
      edits.push({ path: 'primitive.dimension.gutter', value: { value: round1(gutter.$value.value * level.factor), unit: 'px' } });
      return edits;
    },
  },
  geometry: {
    label: 'Geometry',
    help: 'How sharp or soft corners feel across buttons, inputs, and cards.',
    levels: [
      { id: 'sharp', label: 'Sharper', factor: 0.4 },
      { id: 'balanced', label: 'Balanced', factor: 1 },
      { id: 'soft', label: 'Softer', factor: 1.8 },
    ],
    affects: ['primitive.dimension.radius.*'],
    apply(system, level) {
      return ['sm', 'md', 'lg'].map((step) => {
        const node = getAtPath(system.primitive, `dimension.radius.${step}`);
        return { path: `primitive.dimension.radius.${step}`, value: { value: round1(node.$value.value * level.factor), unit: 'px' } };
      });
    },
  },
};

function round1(n) { return Math.round(n * 10) / 10; }
function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

/** Compute the edits for one dimension/level, filtering out any token
 * path the user has locked — a locked token is never touched by a Guided
 * recommendation, matching "lock decisions they want to preserve". */
export function computeGuidedEdits(system, dimensionId, levelId, locks = {}) {
  const dim = GUIDED_DIMENSIONS[dimensionId];
  const level = dim.levels.find((l) => l.id === levelId);
  const edits = dim.apply(system, level);
  return edits.filter((e) => !locks[e.path]);
}
