import TokenStyleSheet from './TokenStyleSheet.jsx';
import { cssVarName } from '../tokens/serialize.js';
import architectureImg from '../assets/architecture.png';

/**
 * Renders ONE of the two comparison systems (current or baseline) in ONE
 * context (Landing/Product/Specimen/Identity/Components). Both sides of
 * the comparison call this with identical content/layout/viewport — only
 * `system`/`theme` differ, so any visual difference comes from the design
 * system, never from the markup (the "same content, imagery, layout
 * template, preview viewport" requirement).
 *
 * In `selectable` mode, clicking a labeled element calls onSelect(path)
 * instead of doing whatever that element normally does (a button doesn't
 * submit, an input doesn't focus for typing) — see the interaction-mode
 * toggle in App.jsx. In `interact` mode, elements behave normally so
 * hover/focus/typing can actually be tried.
 */
export default function Preview({ system, theme, context, label, scopeId, selectable, selectedPath, onSelect }) {
  const scopeClass = `scope-${scopeId}`;

  function sel(path, extra = '') {
    if (!selectable) return extra;
    return `${extra} tp-selectable${selectedPath === path ? ' tp-selected' : ''}`.trim();
  }
  function selProps(path) {
    if (!selectable) return {};
    return {
      'data-token-path': path,
      onClick: (e) => { e.preventDefault(); onSelect(path); },
    };
  }

  return (
    <section className="preview-wrap" aria-label={label}>
      <div className="preview-label">{label}</div>
      <TokenStyleSheet system={system} theme={theme} selector={`.${scopeClass}`} />
      <div className={`token-preview ${scopeClass} tp-ctx-${context.toLowerCase()}`}>
        <nav className={sel('component.nav.background', 'tp-nav')} {...selProps('component.nav.background')}>
          <b className="tp-heading-3">FORMA</b>
          <span className="tp-body-small">
            Work&nbsp;&nbsp;
            <span className={sel('component.nav.activeText', 'tp-nav-active')} {...selProps('component.nav.activeText')}>Approach</span>
            &nbsp;&nbsp;Contact
          </span>
        </nav>

        {context === 'Landing' && <Landing sel={sel} selProps={selProps} />}
        {context === 'Product' && <Product sel={sel} selProps={selProps} />}
        {context === 'Specimen' && <Specimen sel={sel} selProps={selProps} />}
        {context === 'Identity' && <Identity sel={sel} selProps={selProps} />}
        {context === 'Components' && <ComponentsGallery sel={sel} selProps={selProps} />}
      </div>
    </section>
  );
}

function Landing({ sel, selProps }) {
  return (
    <>
      <div className="tp-hero">
        <img src={architectureImg} alt="Concrete residence and olive trees overlooking a lake" className="tp-hero-img" />
        <div className={sel('semantic.color.surface.default', 'tp-hero-copy tp-surface')}>
          <h1 className={sel('semantic.typography.heading.1', 'tp-heading-1')} {...selProps('semantic.typography.heading.1')}>Space<br />to think.</h1>
          <p className={sel('semantic.typography.body.default', 'tp-body')} {...selProps('semantic.typography.body.default')}>Architecture for a calmer,<br />more considered tomorrow.</p>
          <button className="tp-btn-primary" {...selProps('component.button.primary.background')}>Our work</button>
        </div>
      </div>
      <div className="tp-footer-row tp-body-small">
        <span className="tp-text-muted">01&nbsp;&nbsp;Human centred</span>
        <span className="tp-text-muted">Built for a brighter tomorrow.</span>
      </div>
    </>
  );
}

function Product({ sel, selProps }) {
  return (
    <div className="tp-section">
      <small className="tp-body-small tp-text-muted">YOUR WORKSPACE / PROJECTS</small>
      <h1 className={sel('semantic.typography.heading.2', 'tp-heading-2')} {...selProps('semantic.typography.heading.2')}>A considered<br />approach.</h1>
      <div className="tp-toolbar">
        <b className="tp-body">Active projects</b>
        <button className="tp-btn-secondary" {...selProps('component.button.secondary.background')}>New project</button>
      </div>
      {['Lakeside residence', 'Studio renovation', 'Garden pavilion'].map((name, i) => (
        <div className="tp-row tp-body-small" key={name}>
          <span className="tp-text-muted">0{i + 1}</span>
          <b className="tp-body">{name}</b>
          <span className="tp-text-muted">{['In review', 'Planning', 'Complete'][i]}</span>
        </div>
      ))}
      <div className={sel('component.card.background', 'tp-card')} {...selProps('component.card.background')}>
        <small className="tp-body-small tp-text-muted">NEXT MILESTONE</small>
        <h2 className="tp-heading-3">Design review</h2>
        <p className="tp-body">A shared space for ideas to take shape.</p>
      </div>
    </div>
  );
}

function Specimen({ sel, selProps }) {
  return (
    <div className="tp-section">
      <small className="tp-body-small tp-text-muted">COMPONENT SPECIMEN</small>
      <h1 className={sel('semantic.typography.heading.2', 'tp-heading-2')} {...selProps('semantic.typography.heading.2')}>Details matter.</h1>
      <label className="tp-field-label tp-body-small">
        Project name
        <input className={sel('component.input.background', 'tp-input')} placeholder="Lakeside residence" {...selProps('component.input.background')} />
      </label>
      <label className="tp-field-label tp-body-small">
        Needs attention
        <input className={sel('component.input.borderError', 'tp-input tp-input-error')} defaultValue="Missing budget" {...selProps('component.input.borderError')} />
      </label>
      <div className="tp-spec-buttons">
        <button className="tp-btn-primary" {...selProps('component.button.primary.background')}>Primary action</button>
        <button className="tp-btn-secondary" {...selProps('component.button.secondary.background')}>Secondary</button>
        <button className="tp-btn-primary" disabled>Disabled</button>
      </div>
      <div className={sel('component.card.background', 'tp-card')} {...selProps('component.card.background')}>
        <h2 className="tp-heading-3">Room to grow</h2>
        <p className="tp-body">One visual language, applied with care.</p>
      </div>
      <p className="tp-body-small" style={{ display: 'flex', alignItems: 'center' }}>
        <span className={sel('semantic.color.status.success', 'tp-status-dot tp-status-success')} {...selProps('semantic.color.status.success')} />
        Your project has been saved.
      </p>
    </div>
  );
}

function Identity({ sel, selProps }) {
  return (
    <div className="tp-section">
      <small className="tp-body-small tp-text-muted">VISUAL IDENTITY / FORMA</small>
      <h1 className={sel('semantic.typography.heading.1', 'tp-heading-1')} {...selProps('semantic.typography.heading.1')}>Aa Bb<br />Cc Dd</h1>
      <p className="tp-body">Spaces that make room for life.</p>
      <div className="tp-swatch-row">
        {['primitive.color.brand.600', 'semantic.color.surface.default', 'semantic.color.text.primary'].map((path) => (
          <div key={path} className={sel(path, 'tp-swatch')} style={{ background: `var(${cssVarName(path)})` }} {...selProps(path)} />
        ))}
      </div>
    </div>
  );
}

function ComponentsGallery({ sel, selProps }) {
  return (
    <div className="tp-section tp-components-gallery">
      <small className="tp-body-small tp-text-muted">COMPONENT STATES</small>
      <div className="tp-gallery-row">
        <button className="tp-btn-primary" {...selProps('component.button.primary.background')}>Primary</button>
        <button className="tp-btn-primary" disabled>Primary (disabled)</button>
        <button className="tp-btn-secondary" {...selProps('component.button.secondary.background')}>Secondary</button>
        <button className="tp-btn-secondary" disabled>Secondary (disabled)</button>
      </div>
      <div className="tp-gallery-row">
        <input className="tp-input" placeholder="Default input" {...selProps('component.input.background')} />
        <input className="tp-input tp-input-error" defaultValue="Error state" {...selProps('component.input.borderError')} />
        <input className="tp-input" placeholder="Disabled" disabled />
      </div>
      <div className="tp-gallery-row">
        <div className={sel('component.card.background', 'tp-card')} style={{ flex: 1 }} {...selProps('component.card.background')}>
          <h3 className="tp-heading-3">Card</h3>
          <p className="tp-body-small">Background, border, radius, padding, and shadow all come from component tokens.</p>
        </div>
      </div>
      <p className="tp-body-small tp-text-muted">Hover and focus states are real CSS — switch to Interact mode and try them.</p>
    </div>
  );
}
