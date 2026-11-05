// Design Tokens Community Group (DTCG) Format Module — schema primitives.
//
// IMPORTANT PROVENANCE NOTE: this implementation targets the DTCG Format
// Module, version 2025.10 (https://www.designtokens.org/tr/2025.10/format/),
// but this session could not fetch that spec text — outbound network access
// to designtokens.org is blocked in this environment. Everything here is
// built from trained knowledge of the format's long-stable mechanics
// (groups, $value/$type/$description/$extensions, {dot.path} aliasing,
// $type inheritance), which have been consistent across drafts. The one
// area of real uncertainty is the `color` $value shape: earlier informal
// "design tokens" conventions (and some tools, e.g. Style Dictionary) use a
// plain hex string, while more recent DTCG drafts moved to a structured,
// colorSpace-aware object to support wide-gamut color. This implementation
// treats the structured object as canonical (see COLOR below) and accepts
// a plain hex string on input as a convenience, normalizing it on save —
// but this choice has not been verified against the live 2025.10 text in
// this session. If you can supply the spec text, this is the first thing
// to check.

export const RESERVED_CHARS = /[.{}$]/;

export function isValidName(name) {
  return typeof name === 'string' && name.length > 0 && !RESERVED_CHARS.test(name);
}

// Supported $type values. Each entry describes its $value shape and a
// shape-checker used by validate.js. Composite types reference *shapes*,
// not resolved values — their sub-fields may themselves be alias strings.
export const TOKEN_TYPES = {
  color: {
    description:
      'A color in a defined color space. $value is {colorSpace, components, alpha?, hex?} ' +
      'per DTCG 2025.10 (structured form). A plain hex string is accepted on input and ' +
      'normalized to this shape, for compatibility with older/simpler token sources.',
    check(value) {
      if (typeof value === 'string') return /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
      if (value && typeof value === 'object') {
        if (!Array.isArray(value.components) || value.components.length !== 3) return false;
        if (!value.components.every((c) => typeof c === 'number' && c >= 0 && c <= 1)) return false;
        if (typeof value.colorSpace !== 'string') return false;
        if (value.alpha !== undefined && (typeof value.alpha !== 'number' || value.alpha < 0 || value.alpha > 1)) return false;
        if (value.hex !== undefined && !/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(value.hex)) return false;
        return true;
      }
      return false;
    },
  },
  dimension: {
    description: '$value is {value: number, unit: "px"|"rem"}.',
    check(value) {
      return (
        value && typeof value === 'object' &&
        typeof value.value === 'number' &&
        (value.unit === 'px' || value.unit === 'rem')
      );
    },
  },
  fontFamily: {
    description: '$value is a string or an array of strings (fallback stack).',
    check(value) {
      if (typeof value === 'string') return value.length > 0;
      if (Array.isArray(value)) return value.length > 0 && value.every((v) => typeof v === 'string');
      return false;
    },
  },
  fontWeight: {
    description:
      '$value is a number 1-1000, or one of the DTCG fontWeight keyword aliases ' +
      '(thin, extra-light, light, normal, medium, semi-bold, bold, extra-bold, black, and a ' +
      'few synonyms). This app only emits weights the active font family actually ships.',
    keywords: new Set([
      'thin', 'hairline', 'extra-light', 'ultra-light', 'light', 'normal', 'regular', 'book',
      'medium', 'semi-bold', 'demi-bold', 'bold', 'extra-bold', 'ultra-bold', 'black', 'heavy',
      'extra-black', 'ultra-black',
    ]),
    check(value) {
      if (typeof value === 'number') return value >= 1 && value <= 1000;
      if (typeof value === 'string') return TOKEN_TYPES.fontWeight.keywords.has(value);
      return false;
    },
  },
  number: {
    description: '$value is a plain JSON number (e.g. a unitless line-height multiplier).',
    check(value) {
      return typeof value === 'number' && Number.isFinite(value);
    },
  },
  string: {
    description: '$value is a plain string (used for free-text tokens, e.g. a density label).',
    check(value) {
      return typeof value === 'string';
    },
  },
  // Composite: references the *names* of its sub-fields; each sub-field's
  // value is itself either a literal of the implied sub-type or an alias
  // string. Resolution walks into these explicitly (see resolve.js).
  typography: {
    description:
      '$value is {fontFamily, fontSize, fontWeight, lineHeight, letterSpacing}; each field ' +
      'holds a literal of its implied type or an alias string to a token of that type.',
    subfields: { fontFamily: 'fontFamily', fontSize: 'dimension', fontWeight: 'fontWeight', lineHeight: 'number', letterSpacing: 'dimension' },
    check(value) {
      if (!value || typeof value !== 'object') return false;
      const required = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight'];
      return required.every((k) => k in value);
    },
  },
  border: {
    description: '$value is {color, width, style}; color/width may be aliases.',
    subfields: { color: 'color', width: 'dimension', style: 'string' },
    check(value) {
      return !!value && typeof value === 'object' && 'color' in value && 'width' in value;
    },
  },
  shadow: {
    description: '$value is {color, offsetX, offsetY, blur, spread}; color/dimensions may be aliases.',
    subfields: { color: 'color', offsetX: 'dimension', offsetY: 'dimension', blur: 'dimension', spread: 'dimension' },
    check(value) {
      return !!value && typeof value === 'object' && 'color' in value && 'offsetX' in value && 'offsetY' in value;
    },
  },
};

export const COMPOSITE_TYPES = new Set(
  Object.entries(TOKEN_TYPES)
    .filter(([, def]) => def.subfields)
    .map(([name]) => name)
);

export function isToken(node) {
  return !!node && typeof node === 'object' && !Array.isArray(node) && '$value' in node;
}

export function isGroup(node) {
  return !!node && typeof node === 'object' && !Array.isArray(node) && !('$value' in node);
}
