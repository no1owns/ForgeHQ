import { resolveToken, flattenSystem } from '../tokens/project.js';
import { colorToCss, dimensionToCss } from '../tokens/serialize.js';
import { contrastRatio } from '../tokens/color-math.js';

function resolvedHex(system, theme, path) {
  const r = resolveToken(path, system, theme);
  return r.ok ? colorToCss(r.value) : null;
}

/**
 * DESIGN.md is generated FROM the live system — every number/color
 * quoted below is pulled from tokens.json at export time, not hand-
 * written, so this file and the token files can't drift out of sync.
 * It's project guidance for a consuming agent/developer, not a claim of
 * industry-standard status.
 */
export function generateDesignDoc(system, { themes = ['light', 'dark'] } = {}) {
  const accent = resolvedHex(system, 'light', 'primitive.color.brand.600');
  const radius = resolveToken('primitive.dimension.radius.md', system, 'light').value?.value;
  const spacing = resolveToken('primitive.dimension.space.6', system, 'light').value?.value;
  const headingFamily = resolveToken('primitive.font.family.heading', system, 'light').value;
  const bodyFamily = resolveToken('primitive.font.family.body', system, 'light').value;
  const character = radius > 12 ? 'soft, approachable geometry' : radius < 4 ? 'crisp, precise geometry' : 'moderate, balanced geometry';
  const density = spacing > 28 ? 'generous, spacious layout' : spacing < 18 ? 'compact, dense layout' : 'balanced layout density';

  const contrastLines = themes.map((theme) => {
    const text = resolveToken('semantic.color.text.primary', system, theme);
    const surface = resolveToken('semantic.color.surface.default', system, theme);
    const ratio = text.ok && surface.ok ? contrastRatio(colorToCss(text.value), colorToCss(surface.value)).toFixed(2) : 'unresolved';
    return `- **${theme}**: text.primary on surface.default is ${ratio}:1${Number(ratio) >= 4.5 ? ' (meets WCAG AA for normal text)' : ' (below WCAG AA for normal text — review before shipping)'}`;
  });

  return `# Design system guidance

This file is generated from the current token values (see \`tokens.json\` and any additional theme files) and describes how to use them. **It is project guidance for this specific design system, not a universal industry standard.** If this file and the token files ever disagree, the token files are the source of truth — re-export this document rather than trusting stale prose.

## Brand character

- Primary brand color: \`${accent ?? 'unresolved'}\` (\`primitive.color.brand.600\`)
- Heading typeface: ${Array.isArray(headingFamily) ? headingFamily.join(', ') : headingFamily}
- Body typeface: ${Array.isArray(bodyFamily) ? bodyFamily.join(', ') : bodyFamily}
- Geometry: ${character} (\`primitive.dimension.radius.md\` = ${radius}px)
- Density: ${density} (\`primitive.dimension.space.6\` = ${spacing}px)

## Which semantic token to use for common elements

| Element | Token |
|---|---|
| Primary button / main CTA background | \`semantic.color.action.primary\` |
| Secondary button background | \`semantic.color.action.secondary\` |
| Body copy color | \`semantic.color.text.primary\` |
| De-emphasized / helper text | \`semantic.color.text.muted\` |
| Text on a filled/dark surface (e.g. inside a primary button) | \`semantic.color.text.inverse\` |
| Page/app background | \`semantic.color.surface.default\` |
| Card / panel background | \`semantic.color.surface.raised\` |
| Default dividers, input borders | \`semantic.color.border.subtle\` |
| Emphasized borders (e.g. focus-adjacent, active) | \`semantic.color.border.strong\` |
| Success / warning / error / info indicators | \`semantic.color.status.success\` / \`.warning\` / \`.error\` / \`.info\` |
| Page headings | \`semantic.typography.heading.1\` / \`.2\` / \`.3\` |
| Body copy, captions | \`semantic.typography.body.default\` / \`.small\` |

Prefer a semantic token over a primitive one, and a component token over a semantic one, whenever a component-level token already exists for what you're styling (e.g. use \`component.button.primary.background\`, not \`semantic.color.action.primary\`, when styling an actual button) — components intentionally reference semantics, which reference primitives, so changing a primitive updates everything downstream.

## Components and states

- **Buttons** (\`component.button.primary.*\`, \`component.button.secondary.*\`): default and hover (\`...backgroundHover\`) are real tokens; disabled is handled by reduced opacity, not a separate color token, in this version.
- **Inputs** (\`component.input.*\`): default, focus (\`borderFocus\`), and error (\`borderError\`) border colors are distinct tokens; placeholder text uses \`component.input.placeholder\`.
- **Cards** (\`component.card.*\`): background, border, radius, padding, and shadow are all tokens — don't hardcode a box-shadow, reference \`component.card.shadow\`.
- **Navigation** (\`component.nav.*\`): background, resting text color, and active-item text color.

## Responsive behavior

Responsive breakpoints and rules are **not** represented as DTCG tokens here (there's no standard token $type for a media query), so there's nothing to read for them in \`tokens.json\`. Treat \`primitive.dimension.contentWidth\` as the max width for centered content, and \`primitive.dimension.gutter\` as the side padding at any viewport; beyond that, apply ordinary responsive judgment (the preview's own mobile layout is one example, not a token-driven rule).

## Accessibility

${contrastLines.join('\n')}

These are plain WCAG contrast-ratio checks on one pairing (primary text over the default surface) in each theme — not a full accessibility audit, and not the same thing as the separate, experimental "Visual Character" reading elsewhere in this tool (which is about expressive style, not accessibility, and should never be used as a substitute for this check).

## When an override is acceptable

A one-off visual exception (e.g. a marketing page that wants a non-standard accent for a single hero) is acceptable when: (1) it doesn't redefine what an existing semantic/component token means elsewhere, and (2) it's documented inline as an intentional exception, not silently copy-pasted as a new "standard". Prefer adding a new, named token over hardcoding a raw value, even for a one-off — it keeps the override discoverable and themeable.

## If a token you need doesn't exist

Don't invent an arbitrary hardcoded value. Propose a new token instead: pick the right layer (primitive if it's a genuinely new raw value, semantic if it's a new *role*, component if it's specific to one component), follow the existing naming pattern in \`tokens.json\` for that layer, and alias it to an existing primitive/semantic value where that's true to intent rather than introducing an unrelated new color/size. If you can't tell which existing token is closest, say so explicitly rather than guessing — the token files, not this document, are the source of truth for exact values, and an agent silently inventing a value is exactly the failure mode this export is meant to avoid.
`;
}
