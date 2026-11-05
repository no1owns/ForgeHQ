import { mergeForTheme } from '../tokens/project.js';
import { toDTCG } from '../tokens/serialize.js';

/** One self-contained DTCG document per theme (primitive + that theme's
 * semantic layer + component), per the "one self-contained token file per
 * theme" packaging note — there's no single standardized multi-theme
 * wrapper in the DTCG spec itself, so this app doesn't invent one. */
export function exportThemeTokens(system, theme) {
  return toDTCG(mergeForTheme(system, theme));
}

export function exportAllThemeTokens(system) {
  const out = {};
  for (const theme of Object.keys(system.semanticByTheme)) out[theme] = exportThemeTokens(system, theme);
  return out;
}
