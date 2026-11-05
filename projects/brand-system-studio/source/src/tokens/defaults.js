import { makeAlias } from './resolve.js';
import { generateTonalScale, generateNeutralScale, hexToRgb } from './color-math.js';
import { FONT_CATALOG, closestAvailableWeight } from './fonts.js';

function hexToStructuredColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  return { colorSpace: 'srgb', components: [round3(r), round3(g), round3(b)], alpha: 1, hex: hex.toLowerCase() };
}
function round3(n) { return Math.round(n * 1000) / 1000; }

const color = (hex, $description) => ({ $value: hexToStructuredColor(hex), ...(($description) && { $description }) });
const dim = (value, unit = 'px', $description) => ({ $value: { value, unit }, ...(($description) && { $description }) });
const num = (value, $description) => ({ $value: value, ...(($description) && { $description }) });
const str = (value, $description) => ({ $value: value, ...(($description) && { $description }) });
// Component-layer tokens mix types within one group (e.g. button.primary
// has color aliases alongside dimension aliases), so they can't rely on
// group-level $type inheritance the way primitive/semantic do — every
// alias() call in buildComponents() must say what type it's aliasing.
const alias = (path, $type, $description) => ({ $type, $value: makeAlias(path), ...(($description) && { $description }) });

/**
 * Build the PRIMITIVE layer: raw color scales, font properties, and
 * geometry — shared by both the light and dark semantic layers of a
 * system (only the semantic *mapping* changes between themes, not the
 * underlying palette; see semantic() below).
 */
export function buildPrimitives(seed) {
  const brand = generateTonalScale(seed.accentHex);
  const neutral = generateNeutralScale(seed.surfaceHex);
  const headingFont = FONT_CATALOG[seed.headingFont] ?? FONT_CATALOG.fraunces;
  const bodyFont = FONT_CATALOG[seed.bodyFont] ?? FONT_CATALOG.systemSans;
  const headingWeight = closestAvailableWeight(headingFont.id, seed.headingWeight ?? 500);
  const scale = seed.scale ?? 1.25;
  const baseSize = 16;
  const sizeSteps = { xs: -2, sm: -1, base: 0, lg: 1, xl: 2, '2xl': 3, '3xl': 4, '4xl': 5, '5xl': 6 };
  const spacingUnit = (seed.spacing ?? 24) / 24; // 24px is the legacy "1x" spacing value

  return {
    color: {
      $type: 'color',
      brand: Object.fromEntries(Object.entries(brand).map(([step, hex]) => [step, color(hex)])),
      neutral: Object.fromEntries(Object.entries(neutral).map(([step, hex]) => [step, color(hex)])),
      success: { 500: color('#2f9e58'), 600: color('#1f7a40') },
      warning: { 500: color('#c98a1b'), 600: color('#9c6a12') },
      error: { 500: color('#c6402f'), 600: color('#9c2e20') },
      info: { 500: color('#2f7fc9'), 600: color('#1f5e9c') },
    },
    font: {
      family: {
        $type: 'fontFamily',
        heading: { $value: headingFont.stack, $description: `Bundled/system source: ${headingFont.source}.` },
        body: { $value: bodyFont.stack, $description: `Bundled/system source: ${bodyFont.source}.` },
      },
      weight: {
        $type: 'fontWeight',
        heading: num(headingWeight, `Nearest weight ${headingFont.label} actually ships.`),
        body: num(closestAvailableWeight(bodyFont.id, 400)),
      },
      size: {
        $type: 'dimension',
        ...Object.fromEntries(Object.entries(sizeSteps).map(([name, step]) => [name, dim(round1(baseSize * scale ** step), 'px')])),
      },
      lineHeight: {
        $type: 'number',
        tight: num(1.1), normal: num(1.5), relaxed: num(1.7),
      },
      letterSpacing: {
        $type: 'dimension',
        tight: dim(-0.02, 'rem'), normal: dim(0, 'rem'), wide: dim(0.04, 'rem'),
      },
    },
    dimension: {
      radius: {
        $type: 'dimension',
        none: dim(0), sm: dim(Math.max(0, round1((seed.radius ?? 4) / 2))), md: dim(seed.radius ?? 4), lg: dim(round1((seed.radius ?? 4) * 2)), full: dim(999),
      },
      space: {
        $type: 'dimension',
        0: dim(0), 1: dim(round1(4 * spacingUnit)), 2: dim(round1(8 * spacingUnit)), 3: dim(round1(12 * spacingUnit)),
        4: dim(round1(16 * spacingUnit)), 6: dim(round1(24 * spacingUnit)), 8: dim(round1(32 * spacingUnit)),
        12: dim(round1(48 * spacingUnit)), 16: dim(round1(64 * spacingUnit)),
      },
      borderWidth: {
        $type: 'dimension',
        thin: dim(1), default: dim(1.5), thick: dim(2.5),
      },
      contentWidth: { $type: 'dimension', ...dim(1100, 'px') },
      gutter: { $type: 'dimension', ...dim(round1(24 * spacingUnit), 'px') },
    },
  };
}

function round1(n) { return Math.round(n * 10) / 10; }

/**
 * Build the SEMANTIC layer for one theme. Every role aliases into the
 * (theme-independent) primitive palette; only *which* primitive step each
 * role points to changes between light and dark.
 */
export function buildSemantic(theme) {
  const isDark = theme === 'dark';
  const n = (lightStep, darkStep) => `primitive.color.neutral.${isDark ? darkStep : lightStep}`;
  const b = (lightStep, darkStep) => `primitive.color.brand.${isDark ? darkStep : lightStep}`;

  return {
    color: {
      $type: 'color',
      text: {
        primary: alias(n(900, 50)),
        muted: alias(n(600, 300)),
        inverse: alias(n(0, 950)),
      },
      surface: {
        default: alias(n(0, 950)),
        raised: alias(n(50, 900)),
      },
      border: {
        subtle: alias(n(200, 700)),
        strong: alias(n(400, 500)),
      },
      action: {
        primary: alias(b(600, 400)),
        secondary: alias(b(200, 800)),
      },
      status: {
        success: alias(isDark ? 'primitive.color.success.500' : 'primitive.color.success.600'),
        warning: alias(isDark ? 'primitive.color.warning.500' : 'primitive.color.warning.600'),
        error: alias(isDark ? 'primitive.color.error.500' : 'primitive.color.error.600'),
        info: alias(isDark ? 'primitive.color.info.500' : 'primitive.color.info.600'),
      },
    },
    typography: {
      heading: {
        1: { $type: 'typography', $value: { fontFamily: '{primitive.font.family.heading}', fontSize: '{primitive.font.size.4xl}', fontWeight: '{primitive.font.weight.heading}', lineHeight: '{primitive.font.lineHeight.tight}', letterSpacing: '{primitive.font.letterSpacing.tight}' } },
        2: { $type: 'typography', $value: { fontFamily: '{primitive.font.family.heading}', fontSize: '{primitive.font.size.2xl}', fontWeight: '{primitive.font.weight.heading}', lineHeight: '{primitive.font.lineHeight.tight}', letterSpacing: '{primitive.font.letterSpacing.normal}' } },
        3: { $type: 'typography', $value: { fontFamily: '{primitive.font.family.heading}', fontSize: '{primitive.font.size.xl}', fontWeight: '{primitive.font.weight.heading}', lineHeight: '{primitive.font.lineHeight.normal}', letterSpacing: '{primitive.font.letterSpacing.normal}' } },
      },
      body: {
        default: { $type: 'typography', $value: { fontFamily: '{primitive.font.family.body}', fontSize: '{primitive.font.size.base}', fontWeight: '{primitive.font.weight.body}', lineHeight: '{primitive.font.lineHeight.normal}', letterSpacing: '{primitive.font.letterSpacing.normal}' } },
        small: { $type: 'typography', $value: { fontFamily: '{primitive.font.family.body}', fontSize: '{primitive.font.size.sm}', fontWeight: '{primitive.font.weight.body}', lineHeight: '{primitive.font.lineHeight.normal}', letterSpacing: '{primitive.font.letterSpacing.normal}' } },
      },
    },
  };
}

/** Build the COMPONENT layer. Paths alias into `semantic.*` (not a
 * resolved value), so the SAME component document re-resolves correctly
 * against whichever theme's semantic document is active — see
 * tokens/project.js for how a theme is selected at resolve time. */
export function buildComponents() {
  return {
    button: {
      primary: {
        background: alias('semantic.color.action.primary', 'color'),
        backgroundHover: alias('primitive.color.brand.700', 'color'),
        text: alias('semantic.color.text.inverse', 'color'),
        border: { $type: 'border', $value: { color: '{semantic.color.action.primary}', width: '{primitive.dimension.borderWidth.thin}', style: 'solid' } },
        radius: alias('primitive.dimension.radius.md', 'dimension'),
        paddingX: alias('primitive.dimension.space.4', 'dimension'),
        paddingY: alias('primitive.dimension.space.2', 'dimension'),
      },
      secondary: {
        background: alias('semantic.color.surface.default', 'color'),
        backgroundHover: alias('semantic.color.surface.raised', 'color'),
        text: alias('semantic.color.text.primary', 'color'),
        border: { $type: 'border', $value: { color: '{semantic.color.border.strong}', width: '{primitive.dimension.borderWidth.thin}', style: 'solid' } },
        radius: alias('primitive.dimension.radius.md', 'dimension'),
        paddingX: alias('primitive.dimension.space.4', 'dimension'),
        paddingY: alias('primitive.dimension.space.2', 'dimension'),
      },
    },
    input: {
      background: alias('semantic.color.surface.default', 'color'),
      text: alias('semantic.color.text.primary', 'color'),
      placeholder: alias('semantic.color.text.muted', 'color'),
      border: { $type: 'border', $value: { color: '{semantic.color.border.subtle}', width: '{primitive.dimension.borderWidth.thin}', style: 'solid' } },
      borderFocus: alias('semantic.color.action.primary', 'color'),
      borderError: alias('semantic.color.status.error', 'color'),
      radius: alias('primitive.dimension.radius.sm', 'dimension'),
      paddingX: alias('primitive.dimension.space.3', 'dimension'),
      paddingY: alias('primitive.dimension.space.2', 'dimension'),
    },
    card: {
      background: alias('semantic.color.surface.raised', 'color'),
      border: { $type: 'border', $value: { color: '{semantic.color.border.subtle}', width: '{primitive.dimension.borderWidth.thin}', style: 'solid' } },
      radius: alias('primitive.dimension.radius.lg', 'dimension'),
      padding: alias('primitive.dimension.space.6', 'dimension'),
      // Literal (not aliased) low-alpha near-black — shadows should stay
      // dark in both themes, unlike text color which flips with the theme.
      shadow: { $type: 'shadow', $value: { color: { colorSpace: 'srgb', components: [0.05, 0.05, 0.04], alpha: 0.18 }, offsetX: { value: 0, unit: 'px' }, offsetY: { value: 2, unit: 'px' }, blur: { value: 10, unit: 'px' }, spread: { value: 0, unit: 'px' } } },
    },
    nav: {
      background: alias('semantic.color.surface.default', 'color'),
      text: alias('semantic.color.text.muted', 'color'),
      activeText: alias('semantic.color.text.primary', 'color'),
    },
  };
}

/** The two legacy "directions" (now presets), used both as the starting
 * current/baseline systems and offered in Guided mode. Values match
 * Brand System Studio v0.1's defaults/baseline exactly, so migrated
 * projects land on recognizable ground (see tokens/migrate.js). */
export const SEED_PRESETS = {
  editorial: { accentHex: '#B64E32', surfaceHex: '#F1EDE4', textHex: '#222821', headingFont: 'fraunces', bodyFont: 'systemSans', headingWeight: 500, scale: 1.25, radius: 4, spacing: 24 },
  modern: { accentHex: '#5F6C50', surfaceHex: '#DFE5DC', textHex: '#222821', headingFont: 'inter', bodyFont: 'systemSans', headingWeight: 500, scale: 1.2, radius: 16, spacing: 24 },
};

export function buildSystem(seed) {
  return {
    primitive: buildPrimitives(seed),
    semanticByTheme: { light: buildSemantic('light'), dark: buildSemantic('dark') },
    component: buildComponents(),
    seed, // kept for the editor's higher-level "quick" controls (accent/surface/text/font/etc.); not part of the DTCG export
  };
}
