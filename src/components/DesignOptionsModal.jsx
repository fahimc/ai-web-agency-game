import React, { useMemo, useState } from 'react';
import { employees } from '../data/employees.js';
import { buildExampleSite, recommendedDesignLayouts } from '../data/siteBlueprints.js';
import { Modal } from './Modal.jsx';

export function DesignOptionsModal({ state, actions }) {
  const designOptions = useMemo(() => recommendedDesignLayouts(state, 4), [state]);
  const initialIndex = Math.max(0, designOptions.findIndex((layout) => layout.id === state.selectedDesignStyle));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeLayout = designOptions[activeIndex] || designOptions[0];
  const activeHtml = useMemo(() => buildExampleSite(activeLayout, state), [activeLayout, state]);
  const designer = employees.design;
  const optionNumber = activeIndex + 1;

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? designOptions.length - 1 : current - 1));
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % designOptions.length);
  }

  return (
    <Modal title="Choose Design Direction" onClose={actions.closeModal} className="design-options-modal">
      <div className="modal-tabs"><span className="modal-tab active">Boilerplate directions</span></div>
      <div className="modal-body design-options-body">
        <aside className="design-side-panel">
          <div className="designer-badge">
            <span>{designer.icon}</span>
            <div>
              <b>{designer.name}</b>
              <small>{designer.role}</small>
            </div>
          </div>
          <div className="card design-intro">
            <h3>Pick a visual route</h3>
            <p className="muted">Mira selected {designOptions.length} directions that fit the brief. Use Previous and Next to compare them, then choose one before production starts.</p>
          </div>
          <div className="design-carousel-card">
            <div className="design-count">Option {optionNumber} of {designOptions.length}</div>
            <h3>{activeLayout.name}</h3>
            <p className="muted">{activeLayout.model}</p>
            <div className="swatches">{activeLayout.palette.map((color) => <i key={color} style={{ background: color }} />)}</div>
            <div className="design-carousel-actions">
              <button type="button" className="secondary" onClick={showPrevious}>Previous</button>
              <button type="button" className="secondary" onClick={showNext}>Next</button>
            </div>
          </div>
          <div className="design-dots" aria-label="Design options">
            {designOptions.map((layout, index) => (
              <button type="button" className={index === activeIndex ? 'active' : ''} key={layout.id} onClick={() => setActiveIndex(index)} aria-label={`Show ${layout.name}`} />
            ))}
          </div>
        </aside>
        <section className="design-preview-panel">
          <div className="design-preview-head">
            <div>
              <h3>{activeLayout.name}</h3>
              <p className="muted">{activeLayout.tone}</p>
            </div>
            <button type="button" className="green" onClick={() => actions.selectDesignStyle(activeLayout.id)}>
              Select this direction
            </button>
          </div>
          <iframe className="design-preview-frame" title={`${activeLayout.name} preview`} srcDoc={activeHtml} />
        </section>
      </div>
    </Modal>
  );
}
