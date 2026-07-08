import React, { useEffect, useMemo, useState } from 'react';
import { employees } from '../data/employees.js';
import {
  MAX_PALETTE_COLORS,
  buildExampleSite,
  normalizePalette,
  paletteOptionsForLayout,
  recommendedDesignLayouts,
} from '../data/siteBlueprints.js';
import { Modal } from './Modal.jsx';

export function DesignOptionsModal({ state, actions }) {
  const designOptions = useMemo(() => recommendedDesignLayouts(state, 4), [state]);
  const initialIndex = Math.max(0, designOptions.findIndex((layout) => layout.id === state.selectedDesignStyle));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeLayout = designOptions[activeIndex] || designOptions[0];
  const paletteOptions = useMemo(() => paletteOptionsForLayout(activeLayout, state), [activeLayout, state]);
  const [paletteMode, setPaletteMode] = useState('preset');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [customColors, setCustomColors] = useState(() => normalizePalette(state.selectedDesignPalette || activeLayout.palette));
  const [fullScreen, setFullScreen] = useState(false);
  const designer = employees.design;
  const optionNumber = activeIndex + 1;
  const selectedPalette = paletteMode === 'custom'
    ? normalizePalette(customColors)
    : normalizePalette(paletteOptions[paletteIndex]?.colors || activeLayout.palette);
  const activeHtml = useMemo(() => buildExampleSite(activeLayout, state, selectedPalette), [activeLayout, selectedPalette, state]);

  useEffect(() => {
    setPaletteMode('preset');
    setPaletteIndex(0);
    setCustomColors(normalizePalette(activeLayout.palette));
  }, [activeLayout]);

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? designOptions.length - 1 : current - 1));
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % designOptions.length);
  }

  function updateCustomColor(index, value) {
    setCustomColors((current) => current.map((color, colorIndex) => colorIndex === index ? value : color));
  }

  function selectCurrent() {
    actions.selectDesignStyle(activeLayout.id, selectedPalette);
  }

  return (
    <Modal title="Choose Design Direction" onClose={actions.closeModal} className="design-options-modal">
      <div className="modal-tabs"><span className="modal-tab active">Design directions</span></div>
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
            <p className="muted">Mira selected {designOptions.length} design directions that fit the brief. Compare them, choose a colour palette, then production can start.</p>
          </div>
          <div className="design-carousel-card">
            <div className="design-count">Option {optionNumber} of {designOptions.length}</div>
            <h3>{activeLayout.name}</h3>
            <p className="muted">{activeLayout.model}</p>
            <div className="swatches">{selectedPalette.map((color) => <i key={color} style={{ background: color }} />)}</div>
            <div className="design-carousel-actions">
              <button type="button" className="secondary" onClick={showPrevious}>Previous</button>
              <button type="button" className="secondary" onClick={showNext}>Next</button>
            </div>
          </div>
          <PaletteChooser
            paletteMode={paletteMode}
            setPaletteMode={setPaletteMode}
            paletteIndex={paletteIndex}
            setPaletteIndex={setPaletteIndex}
            paletteOptions={paletteOptions}
            customColors={customColors}
            updateCustomColor={updateCustomColor}
          />
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
            <div className="stack">
              <button type="button" className="secondary" onClick={() => setFullScreen(true)}>Full screen</button>
              <button type="button" className="green" onClick={selectCurrent}>Select this direction</button>
            </div>
          </div>
          <iframe className="design-preview-frame" title={`${activeLayout.name} preview`} srcDoc={activeHtml} />
        </section>
      </div>
      {fullScreen && (
        <div className="design-fullscreen" role="dialog" aria-label={`${activeLayout.name} full screen preview`}>
          <div className="design-fullscreen-bar">
            <div>
              <b>{activeLayout.name}</b>
              <span>{selectedPalette.join(' / ')}</span>
            </div>
            <div className="stack">
              <button type="button" className="secondary" onClick={() => setFullScreen(false)}>Close</button>
              <button type="button" className="green" onClick={selectCurrent}>Select this direction</button>
            </div>
          </div>
          <iframe className="design-fullscreen-frame" title={`${activeLayout.name} full screen`} srcDoc={activeHtml} />
        </div>
      )}
    </Modal>
  );
}

function PaletteChooser({
  paletteMode,
  setPaletteMode,
  paletteIndex,
  setPaletteIndex,
  paletteOptions,
  customColors,
  updateCustomColor,
}) {
  return (
    <div className="palette-panel">
      <div>
        <h3>Colour palette</h3>
        <p className="small muted">Use up to {MAX_PALETTE_COLORS} colours: text, primary, background, accent, and surface.</p>
      </div>
      <div className="palette-options">
        {paletteOptions.map((option, index) => (
          <button
            type="button"
            className={`palette-option ${paletteMode === 'preset' && paletteIndex === index ? 'active' : ''}`}
            key={option.id}
            onClick={() => {
              setPaletteMode('preset');
              setPaletteIndex(index);
            }}
          >
            <span>{option.name}</span>
            <span className="swatches">{option.colors.map((color) => <i key={color} style={{ background: color }} />)}</span>
          </button>
        ))}
      </div>
      <button type="button" className={`palette-option custom-toggle ${paletteMode === 'custom' ? 'active' : ''}`} onClick={() => setPaletteMode('custom')}>
        <span>Use my colours</span>
        <span className="swatches">{normalizePalette(customColors).map((color) => <i key={color} style={{ background: color }} />)}</span>
      </button>
      {paletteMode === 'custom' && (
        <div className="custom-palette-grid">
          {normalizePalette(customColors).map((color, index) => (
            <label key={index}>Colour {index + 1}
              <input type="color" value={color} onChange={(event) => updateCustomColor(index, event.target.value)} />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
