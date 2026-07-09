import React, { useEffect, useMemo, useState } from 'react';
import { employees } from '../data/employees.js';
import {
  MAX_PALETTE_COLORS,
  PALETTE_ROLES,
  PAGE_PRESETS,
  SECTION_PRESETS,
  buildExampleSite,
  directionSummary,
  fallbackDesignRecommendations,
  normalizePalette,
  paletteLabel,
  paletteOptionsForLayout,
  siteLayouts,
} from '../data/siteBlueprints.js';
import { Modal } from './Modal.jsx';

const ONE_PAGE_SECTION_PRESETS = [
  ...SECTION_PRESETS,
  ...PAGE_PRESETS.filter((item) => item !== 'Home'),
];

export function DesignOptionsModal({ state, actions }) {
  const hasModelRecommendations = Array.isArray(state.designRecommendations) && state.designRecommendations.length > 0;
  const isLoadingRecommendations = state.designRecommendationStatus === 'loading' && !hasModelRecommendations;
  const designOptions = useMemo(() => {
    const savedRecommendations = Array.isArray(state.designRecommendations) ? state.designRecommendations : [];
    if (state.designRecommendationStatus === 'loading' && !savedRecommendations.length) return [];
    const recommendations = savedRecommendations.length ? savedRecommendations : fallbackDesignRecommendations(state, 4);
    return recommendations
      .map((recommendation) => {
        const layout = siteLayouts.find((item) => item.id === recommendation.layoutId) || siteLayouts[0];
        return { ...recommendation, layout };
      })
      .filter((option) => option.layout);
  }, [state, state.designRecommendationStatus, state.designRecommendations]);
  const initialIndex = Math.max(0, designOptions.findIndex((option) => option.layout.id === state.selectedDesignStyle));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeOption = designOptions[activeIndex] || designOptions[0] || null;
  const activeLayout = activeOption?.layout || siteLayouts[0];
  const activeOptionKey = activeOption?.id || activeLayout.id;
  const paletteOptions = useMemo(() => {
    const modelPalette = {
      id: 'model',
      name: activeOption?.paletteName || 'Mira recommended',
      colors: normalizePalette(activeOption?.palette || activeLayout.palette),
    };
    const presets = paletteOptionsForLayout(activeLayout, state);
    return [modelPalette, ...presets.filter((option) => normalizePalette(option.colors).join('|') !== modelPalette.colors.join('|'))].slice(0, 8);
  }, [activeLayout, activeOption, state]);
  const structureRecommendation = useMemo(() => ({
    pages: activeOption?.pages?.length ? activeOption.pages : ['Home', 'Services', 'About', 'FAQ', 'Contact'],
    sections: activeOption?.sections?.length ? activeOption.sections : ['Hero', 'Services', 'Benefits', 'Process', 'Testimonials', 'FAQ', 'Lead capture form'],
  }), [activeOption]);
  const [paletteMode, setPaletteMode] = useState('preset');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [customColors, setCustomColors] = useState(() => normalizePalette(state.selectedDesignPalette || activeOption?.palette || activeLayout.palette));
  const isOnePagePackage = state.projectPackage === 'launch';
  const initialSections = () => onePageSections(structureRecommendation, state.selectedSiteSections);
  const [selectedPages, setSelectedPages] = useState(() => isOnePagePackage ? ['Home'] : (state.selectedSitePages?.length ? state.selectedSitePages : structureRecommendation.pages));
  const [selectedSections, setSelectedSections] = useState(() => isOnePagePackage ? initialSections() : (state.selectedSiteSections?.length ? state.selectedSiteSections : structureRecommendation.sections));
  const [fullScreen, setFullScreen] = useState(false);
  const designer = employees.design;
  const optionNumber = designOptions.length ? activeIndex + 1 : 0;
  const selectedPalette = paletteMode === 'custom'
    ? normalizePalette(customColors)
    : normalizePalette(paletteOptions[paletteIndex]?.colors || activeLayout.palette);
  const previewState = useMemo(() => ({
    ...state,
    selectedSitePages: selectedPages,
    selectedSiteSections: selectedSections,
  }), [selectedPages, selectedSections, state]);
  const activeHtml = useMemo(() => {
    if (isLoadingRecommendations || !activeOption) return '';
    return buildExampleSite(activeLayout, previewState, selectedPalette, { preview: true });
  }, [activeLayout, activeOption, isLoadingRecommendations, selectedPalette, previewState]);

  useEffect(() => {
    if (designOptions.length && activeIndex > designOptions.length - 1) setActiveIndex(0);
  }, [activeIndex, designOptions.length]);

  useEffect(() => {
    if (!activeOption) return;
    setPaletteMode('preset');
    setPaletteIndex(0);
    setCustomColors(normalizePalette(activeOption?.palette || activeLayout.palette));
    setSelectedPages(isOnePagePackage ? ['Home'] : (state.selectedSitePages?.length ? state.selectedSitePages : structureRecommendation.pages));
    setSelectedSections(isOnePagePackage ? onePageSections(structureRecommendation, state.selectedSiteSections) : (state.selectedSiteSections?.length ? state.selectedSiteSections : structureRecommendation.sections));
  }, [activeOption, activeOptionKey, activeLayout, isOnePagePackage, state.selectedSitePages, state.selectedSiteSections, structureRecommendation]);

  useEffect(() => {
    if (paletteOptions.length && paletteIndex > paletteOptions.length - 1) setPaletteIndex(0);
  }, [paletteIndex, paletteOptions.length]);

  function showPrevious() {
    if (!designOptions.length) return;
    setActiveIndex((current) => (current === 0 ? designOptions.length - 1 : current - 1));
  }

  function showNext() {
    if (!designOptions.length) return;
    setActiveIndex((current) => (current + 1) % designOptions.length);
  }

  function updateCustomColor(index, value) {
    setCustomColors((current) => current.map((color, colorIndex) => colorIndex === index ? value : color));
  }

  function keepPaletteScroll(event, callback) {
    event.preventDefault();
    const scrollBox = event.currentTarget.closest('.modal-body');
    const scrollTop = scrollBox?.scrollTop;
    callback();
    event.currentTarget.blur();
    if (scrollBox && typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollBox.scrollTop = scrollTop;
        });
      });
    }
  }

  function selectCurrent() {
    if (isLoadingRecommendations || !activeOption) {
      actions.notify('Mira is still preparing recommendations.');
      return;
    }
    actions.selectDesignStyle(activeLayout.id, selectedPalette, { pages: selectedPages, sections: selectedSections, recommendation: activeOption });
  }

  return (
    <Modal title="Choose Design Direction" onClose={actions.closeModal} className="design-options-modal">
      <div className="modal-tabs">
        <span className="modal-tab active">Design controls</span>
        {!isLoadingRecommendations && <span className="modal-tab preview-label">Example client site</span>}
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
            <p className="muted">
              {isLoadingRecommendations
                ? 'Mira is preparing design directions from the brief.'
                : `Mira selected ${designOptions.length} recommended directions from the brief. Compare them, choose a colour palette, then production can start.`}
            </p>
          </div>
          {isLoadingRecommendations || !activeOption ? (
            <div className="empty">Preparing recommendations...</div>
          ) : (
            <>
              <div className="design-carousel-card">
                <div className="design-count">Option {optionNumber} of {designOptions.length}</div>
                <h3>{activeOption.name || activeLayout.name}</h3>
                <p className="muted">{activeOption.rationale || directionSummary(activeLayout)}</p>
                {activeOption.baseTemplateName && (
                  <p className="muted"><b>Base template:</b> {activeOption.baseTemplateName}</p>
                )}
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
                keepPaletteScroll={keepPaletteScroll}
              />
              <StructureChooser
                isOnePagePackage={isOnePagePackage}
                selectedPages={selectedPages}
                setSelectedPages={setSelectedPages}
                selectedSections={selectedSections}
                setSelectedSections={setSelectedSections}
              />
              <div className="design-dots" aria-label="Design options">
                {designOptions.map((option, index) => (
                  <button type="button" className={index === activeIndex ? 'active' : ''} key={option.id || `${option.layoutId}-${index}`} onClick={() => setActiveIndex(index)} aria-label={`Show ${option.name}`} />
                ))}
              </div>
            </>
          )}
        </aside>
        <section className="design-preview-panel">
          {isLoadingRecommendations || !activeOption ? (
            <div className="empty design-preview-empty">Previews and palettes will appear after Mira has prepared the recommendations.</div>
          ) : (
            <>
              <div className="client-preview-label">
                <span>Client site example</span>
                <b>Not the MicroAgency app</b>
              </div>
              <div className="design-preview-head">
                <div>
                  <h3>{activeOption.name || activeLayout.name}</h3>
                  <p className="muted">{activeOption.tone || activeLayout.tone}</p>
                  {activeOption.baseTemplateName && <p className="muted">Base template: {activeOption.baseTemplateName}</p>}
                </div>
                <div className="stack">
                  <button type="button" className="secondary" onClick={() => setFullScreen(true)}>Full screen</button>
                  <button type="button" className="green" onClick={selectCurrent}>Select this direction</button>
                </div>
              </div>
              <iframe className="design-preview-frame" title={`${activeOption.name || activeLayout.name} preview`} srcDoc={activeHtml} />
            </>
          )}
        </section>
      </div>
      {fullScreen && activeOption && !isLoadingRecommendations && (
        <div className="design-fullscreen" role="dialog" aria-label={`${activeOption.name || activeLayout.name} full screen preview`}>
          <div className="design-fullscreen-bar">
            <div>
              <b>Client site direction: {activeOption.name || activeLayout.name}</b>
              <span>This is the proposed customer website direction, not the MicroAgency app.</span>
              <PaletteSwatches colors={selectedPalette} />
            </div>
            <div className="stack">
              <button type="button" className="secondary" onClick={() => setFullScreen(false)}>Close</button>
              <button type="button" className="green" onClick={selectCurrent}>Select this direction</button>
            </div>
          </div>
          <iframe className="design-fullscreen-frame" title={`${activeOption.name || activeLayout.name} full screen`} srcDoc={activeHtml} />
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

function onePageSections(recommendation, savedSections = []) {
  const fromPages = (recommendation.pages || [])
    .filter((item) => item !== 'Home')
    .map((item) => item === 'Contact' ? 'Contact details' : item);
  return uniqueItems([...(savedSections || []), ...(recommendation.sections || []), ...fromPages, 'Final CTA']);
}

function StructureChooser({ isOnePagePackage, selectedPages, setSelectedPages, selectedSections, setSelectedSections }) {
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
        <h3>{isOnePagePackage ? 'One-page sections' : 'Pages and sections'}</h3>
        <p className="small muted">
          {isOnePagePackage
            ? 'Launch Site is a one-page package. Add About, Contact, FAQ, Pricing, or other content as sections on the same page.'
            : 'Mira recommends this structure. Remove anything unnecessary or add from presets.'}
        </p>
      </div>
      {!isOnePagePackage && (
        <>
          <ChipGroup title="Pages" items={PAGE_PRESETS} selected={selectedPages} onToggle={(item) => toggle(selectedPages, setSelectedPages, item)} />
          <form className="inline-add" onSubmit={(event) => addCustom(event, customPage, setCustomPage, setSelectedPages)}>
            <input value={customPage} onChange={(event) => setCustomPage(event.target.value)} placeholder="Add page" />
            <button type="submit" className="secondary">Add</button>
          </form>
        </>
      )}
      <ChipGroup title={isOnePagePackage ? 'Sections' : 'Sections'} items={isOnePagePackage ? uniqueItems(ONE_PAGE_SECTION_PRESETS) : SECTION_PRESETS} selected={selectedSections} onToggle={(item) => toggle(selectedSections, setSelectedSections, item)} />
      <form className="inline-add" onSubmit={(event) => addCustom(event, customSection, setCustomSection, setSelectedSections)}>
        <input value={customSection} onChange={(event) => setCustomSection(event.target.value)} placeholder="Add section" />
        <button type="submit" className="secondary">Add</button>
      </form>
    </div>
  );
}

function uniqueItems(items) {
  return [...new Set((items || []).map((item) => String(item || '').trim()).filter(Boolean))];
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
  keepPaletteScroll,
}) {
  function selectPreset(event, index) {
    keepPaletteScroll(event, () => {
      setPaletteMode('preset');
      setPaletteIndex(index);
    });
  }

  function selectCustom(event) {
    keepPaletteScroll(event, () => setPaletteMode('custom'));
  }

  return (
    <div className="palette-panel">
      <div>
        <h3>Colour palette</h3>
        <p className="small muted">Use up to {MAX_PALETTE_COLORS} colours: text, primary, background, accent, and surface.</p>
      </div>
      <div className="palette-mode-toggle" aria-label="Palette mode">
        <button type="button" className={paletteMode === 'preset' ? 'active' : ''} onClick={(event) => selectPreset(event, paletteIndex)}>Presets</button>
        <button type="button" className={paletteMode === 'custom' ? 'active' : ''} onClick={selectCustom}>User colours</button>
      </div>
      <div className="palette-options">
        {paletteOptions.map((option, index) => (
          <button
            type="button"
            className={`palette-option ${paletteMode === 'preset' && paletteIndex === index ? 'active' : ''}`}
            key={`${option.id}-${index}`}
            aria-pressed={paletteMode === 'preset' && paletteIndex === index}
            onClick={(event) => selectPreset(event, index)}
          >
            <span>{option.name}</span>
            <span className="swatches">{option.colors.map((color) => <i key={color} title={paletteLabel(color)} style={{ background: color }} />)}</span>
            <b className="palette-selected-label" aria-hidden={paletteMode === 'preset' && paletteIndex === index ? 'false' : 'true'}>Selected</b>
          </button>
        ))}
      </div>
      <button type="button" className={`palette-option custom-toggle ${paletteMode === 'custom' ? 'active' : ''}`} aria-pressed={paletteMode === 'custom'} onClick={selectCustom}>
        <span>Use my colours</span>
        <span className="swatches">{normalizePalette(customColors).map((color) => <i key={color} title={paletteLabel(color)} style={{ background: color }} />)}</span>
        <b className="palette-selected-label" aria-hidden={paletteMode === 'custom' ? 'false' : 'true'}>Selected</b>
      </button>
      {paletteMode === 'custom' && (
        <div className="custom-palette-grid">
          {normalizePalette(customColors).map((color, index) => (
            <label className="custom-colour-tile" key={index}>
              <span>{PALETTE_ROLES[index] || `Colour ${index + 1}`}</span>
              <i style={{ background: color }} />
              <small>{color.toUpperCase()}</small>
              <input aria-label={`Pick ${PALETTE_ROLES[index] || `colour ${index + 1}`}`} type="color" value={color} onChange={(event) => updateCustomColor(index, event.target.value)} />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
