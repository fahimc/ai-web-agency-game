import React, { useMemo, useState } from 'react';
import { siteLayouts, buildExampleSite } from '../data/siteBlueprints.js';
import { Modal } from './Modal.jsx';

export function DesignOptionsModal({ state, actions }) {
  const [activeId, setActiveId] = useState(state.selectedDesignStyle || siteLayouts[0].id);
  const activeLayout = siteLayouts.find((layout) => layout.id === activeId) || siteLayouts[0];
  const activeHtml = useMemo(() => buildExampleSite(activeLayout, state), [activeLayout, state]);
  return (
    <Modal title="Choose Design Direction" onClose={actions.closeModal} className="design-options-modal">
      <div className="modal-tabs"><span className="modal-tab active">Boilerplate directions</span></div>
      <div className="modal-body design-options-body">
        <aside className="design-list">
          <div className="card design-intro">
            <h3>Select a visual route</h3>
            <p className="muted">These examples use the client brief and the MicroAgency component system. Pick the closest direction before the designer creates the final plan.</p>
          </div>
          {siteLayouts.map((layout) => (
            <button type="button" className={`design-option ${layout.id === activeId ? 'active' : ''}`} key={layout.id} onClick={() => setActiveId(layout.id)}>
              <span>
                <b>{layout.name}</b>
                <small>{layout.model}</small>
              </span>
              <span className="swatches">{layout.palette.map((color) => <i key={color} style={{ background: color }} />)}</span>
            </button>
          ))}
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
