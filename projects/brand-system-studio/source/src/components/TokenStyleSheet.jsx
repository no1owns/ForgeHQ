import { useMemo } from 'react';
import { flattenSystem } from '../tokens/project.js';
import { toCSSVariables, toCompositeCSSVariables } from '../tokens/serialize.js';

/**
 * Resolves one system+theme into CSS custom properties scoped under a
 * selector, and injects them as a real <style> element — not inline
 * style props — specifically so component states (:hover, :focus,
 * :disabled) can be real CSS pseudo-classes rather than something faked
 * in JS. The *values* are dynamic (per edit); the *rules* that consume
 * them (in styles.css) are static, keyed to these same deterministic
 * variable names (dotted token paths with "." replaced by "-").
 */
export default function TokenStyleSheet({ system, theme, selector }) {
  const css = useMemo(() => {
    const flat = flattenSystem(system, theme);
    return toCSSVariables(flat, { selector }) + toCompositeCSSVariables(flat, { selector });
  }, [system, theme, selector]);

  return <style>{css}</style>;
}
