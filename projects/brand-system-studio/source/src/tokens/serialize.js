import { parseAlias } from './resolve.js';
import { COMPOSITE_TYPES } from './schema.js';

/** Color -> CSS. Accepts either the structured DTCG color object or a
 * plain hex string (see schema.js's provenance note on the color type). */
export function colorToCss(value) {
  if (typeof value === 'string') return value;
  if (value?.hex) return value.hex;
  if (value?.components && value.colorSpace) {
    const [r, g, b] = value.components;
    const a = value.alpha ?? 1;
    const rgb = [r, g, b].map((c) => Math.round(c * 255));
    return a < 1 ? `rgba(${rgb.join(', ')}, ${a})` : `rgb(${rgb.join(', ')})`;
  }
  return null;
}

export function dimensionToCss(value) {
  if (typeof value === 'object' && value && 'value' in value && 'unit' in value) {
    return `${value.value}${value.unit}`;
  }
  return null;
}

function literalToCss(type, value) {
  switch (type) {
    case 'color': return colorToCss(value);
    case 'dimension': return dimensionToCss(value);
    case 'fontFamily': return Array.isArray(value) ? value.join(', ') : value;
    case 'fontWeight': return String(value);
    case 'number': return String(value);
    case 'string': return value;
    default: return typeof value === 'string' ? value : JSON.stringify(value);
  }
}

// Exported so UI code (Preview/Inspector) can compute the exact same CSS
// custom-property name a token path maps to, e.g. for a style={{...}}
// lookup or a "this token backs that var" inspector link.
export function cssVarName(path, prefix = '--') {
  return `${prefix}${path.replace(/\./g, '-')}`;
}

/**
 * Generate CSS custom properties from a flat token map. Alias chains are
 * preserved as `var(--other-name)` references (not flattened to literals)
 * wherever the alias target is itself emitted as a CSS variable, which is
 * how relationships survive the JSON -> CSS boundary.
 */
export function toCSSVariables(flatMap, { selector = ':root', prefix = '--' } = {}) {
  const lines = [];
  for (const [path, entry] of [...flatMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (COMPOSITE_TYPES.has(entry.type)) continue; // composites expand to multiple properties by the caller, not as a single var
    const alias = parseAlias(entry.value);
    const varName = cssVarName(path, prefix);
    if (alias !== null) {
      lines.push(`  ${varName}: var(${cssVarName(alias, prefix)});`);
    } else {
      const css = literalToCss(entry.type, entry.value);
      if (css !== null) lines.push(`  ${varName}: ${css};`);
    }
  }
  return `${selector} {\n${lines.join('\n')}\n}\n`;
}

/** Composite tokens (typography, border, shadow) don't map to a single CSS
 * custom property; expand each into its constituent `--path-field` vars so
 * consumers can still compose them (e.g. font: var(--...weight) var(--...size) var(--...family)). */
export function toCompositeCSSVariables(flatMap, { prefix = '--', selector = ':root' } = {}) {
  const lines = [];
  for (const [path, entry] of flatMap) {
    if (!COMPOSITE_TYPES.has(entry.type)) continue;
    for (const [field, raw] of Object.entries(entry.value)) {
      const varName = `${cssVarName(path, prefix)}-${field}`;
      const alias = parseAlias(raw);
      if (alias !== null) {
        lines.push(`  ${varName}: var(${cssVarName(alias, prefix)});`);
      } else {
        const subType = inferLiteralType(raw);
        const css = literalToCss(subType, raw);
        if (css !== null) lines.push(`  ${varName}: ${css};`);
      }
    }
  }
  return lines.length ? `${selector} {\n${lines.join('\n')}\n}\n` : '';
}

function inferLiteralType(raw) {
  if (typeof raw === 'number') return 'number';
  if (typeof raw === 'object' && raw && 'unit' in raw) return 'dimension';
  if (typeof raw === 'object' && raw && 'components' in raw) return 'color';
  return 'string';
}

/** Strip any non-DTCG editor metadata before exporting a document. The
 * token documents in this app don't carry editor state inline (that lives
 * in the separate project document, see project.js), so this is mostly a
 * defensive deep-clone + stable key order, not a real transformation. */
export function toDTCG(doc) {
  return JSON.parse(JSON.stringify(doc));
}
