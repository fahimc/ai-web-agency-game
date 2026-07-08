import React, { useEffect, useMemo, useState } from 'react';
import { employees } from '../data/employees.js';
import {
  MAX_PALETTE_COLORS,
  PALETTE_ROLES,
  PAGE_PRESETS,
  SECTION_PRESETS,
  buildExampleSite,
  directionSummary,
  normalizePalette,
  paletteLabel,
  paletteOptionsForLayout,
  recommendedStructure,
  recommendedDesignLayouts,
} from '../data/siteBlueprints.js';
import { Modal } from './Modal.jsx';

export function DesignOptionsModal({ state, actions }) {
  const designOptions = useMemo(() => recommendedDesignLayouts(state, 4), [state]);
  const initialIndex = Math.max(0, designOptions.findIndex((layout) => layout.id === state.selectedDesignStyle));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeLayout = designOptions[activeIndex] || designOptions[0];
  const paletteOptions = useMemo(() => paletteOptionsForLayout(activeLayout, state), [activeLayout, state]);
  const structureRecommendation = useMemo(() => recommendedStructure(activeLayout, state), [activeLayout, state]);
  const [paletteMode, setPaletteMode] = useState('preset');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [customColors, setCustomColors] = useState(() => normalizePalette(state.selectedDesignPalette || activeLayout.palette));
  const [selectedPages, setSelectedPages] = useState(() => state.selectedSitePages?.length ? state.selectedSitePages : structureRecommendation.pages);
  const [selectedSections, setSelectedSections] = useState(() => state.selectedSiteSections?.length ? state.selectedSiteSections : structureRecommendation.sections);
  const [fullScreen, setFullScreen] = useState(false);
  const designer = employees.design;
  const optionNumber = activeIndex + 1;
  const selectedPalette = paletteMode === 'custom'
    ? normalizePalette(customColors)
    : normalizePalette(paletteOptions[paletteIndex]?.colors || activeLayout.palette);
  const activeHtml = useMemo(() => buildExampleSite(activeLayout, state, selectedPalette, { preview: true }), [activeLayout, selectedPalette, state]);

  useEffect(() => {
    setPaletteMode('preset');
    setPaletteIndex(0);
    setCustomColors(normalizePalette(activeLayout.palette));
    setSelectedPages(state.selectedSitePages?.length ? state.selectedSitePages : structureRecommendation.pages);
    setSelectedSections(state.selectedSiteSections?.length ? state.selectedSiteSections : structureRecommendation.sections);
  }, [activeLayout, state.selectedSitePages, state.selectedSiteSections, structureRecommendation]);

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
    actions.selectDesignStyle(activeLayout.id, selectedPalette, { pages: selectedPages, sections: selectedSections });
  }

  return (
    <Modal title="Choose Design Direction" onClose={actions.closeModal} className="design-options-modal">
      <div className="modal-tabs">
        <span className="modal-tab active">Design controls</span>
        <span className="modal-tab preview-label">Example client site</span>
      </div>
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
            <p className="muted">{directionSummary(activeLayout)}</p>
            <PaletteSwatches colors={selectedPalette} compact />
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
          <StructureChooser
            selectedPages={selectedPages}
            setSelectedPages={setSelectedPages}
            selectedSections={selectedSections}
            setSelectedSections={setSelectedSections}
          />
          <div className="design-dots" aria-label="Design options">
            {designOptions.map((layout, index) => (
              <button type="button" className={index === activeIndex ? 'active' : ''} key={layout.id} onClick={() => setActiveIndex(index)} aria-label={`Show ${layout.name}`} />
            ))}
          </div>
        </aside>
        <section className="design-preview-panel">
          <div className="client-preview-label">
            <span>Client site example</span>
            <b>Not the MicroAgency app</b>
          </div>
          <div className="design-preview-head">
            <div>
              <h3>{activeLayout.name} direction</h3>
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
              <b>Client site example: {activeLayout.name}</b>
              <span>This is the proposed customer website direction, not the MicroAgency app.</span>
              <PaletteSwatches colors={selectedPalette} />
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

function PaletteSwatches({ colors, compact = false }) {
  const normalized = normalizePalette(colors);
  return (
    <div className={`palette-summary ${compact ? 'compact' : ''}`} aria-label="Selected colour palette">
      {normalized.map((color, index) => (
        <span className="palette-chip" key={`${color}-${index}`}>
          <i style={{ background: color }} />
          {!compact && <b>{PALETTE_ROLES[index] || `Colour ${index + 1}`}</b>}
          <small>{paletteLabel(color)}</small>
        </span>
      ))}
    </div>
  );
}

function StructureChooser({ selectedPages, setSelectedPages, selectedSections, setSelectedSections }) {
  const [customPage, setCustomPage] = useState('');
  const [customSection, setCustomSection] = useState('');

  function toggle(items, setItems, item) {
    setItems((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  function addCustom(event, value, setValue, setItems) {
    event.preventDefault();
    const next = value.trim().replace(/\s+/g, ' ');
    if (!next) return;
    setItems((current) => current.includes(next) ? current : [...current, next]);
    setValue('');
  }

  return (
    <div className="structure-panel">
      <div>
        <h3>Pages and sections</h3>
        <p className="small muted">Mira recommends this structure. Remove anything unnecessary or add from presets.</p>
      </div>
      <ChipGroup title="Pages" items={PAGE_PRESETS} selected={selectedPages} onToggle={(item) => toggle(selectedPages, setSelectedPages, item)} />
      <form className="inline-add" onSubmit={(event) => addCustom(event, customPage, setCustomPage, setSelectedPages)}>
        <input value={customPage} onChange={(event) => setCustomPage(event.target.value)} placeholder="Add page" />
        <button type="submit" className="secondary">Add</button>
      </form>
      <ChipGroup title="Sections" items={SECTION_PRESETS} selected={selectedSections} onToggle={(item) => toggle(selectedSections, setSelectedSections, item)} />
      <form className="inline-add" onSubmit={(event) => addCustom(event, customSection, setCustomSection, setSelectedSections)}>
        <input value={customSection} onChange={(event) => setCustomSection(event.target.value)} placeholder="Add section" />
        <button type="submit" className="secondary">Add</button>
      </form>
    </div>
  );
}

function ChipGroup({ title, items, selected, onToggle }) {
  return (
    <div>
      <b className="chip-title">{title}</b>
      <div className="structure-chips">
        {items.map((item) => (
          <button type="button" className={`structure-chip ${selected.includes(item) ? 'active' : ''}`} key={item} onClick={() => onToggle(item)}>
            {item}
          </button>
        ))}
      </div>
    </div>
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
            <span className="swatches">{option.colors.map((color) => <i key={color} title={paletteLabel(color)} style={{ background: color }} />)}</span>
          </button>
        ))}
      </div>
      <button type="button" className={`palette-option custom-toggle ${paletteMode === 'custom' ? 'active' : ''}`} onClick={() => setPaletteMode('custom')}>
        <span>Use my colours</span>
        <span className="swatches">{normalizePalette(customColors).map((color) => <i key={color} title={paletteLabel(color)} style={{ background: color }} />)}</span>
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
