/* MicroAgency section library.
   Page -> Sections -> Layouts -> Components -> Content.
   A small LLM should compose pages from registered section objects and avoid
   raw HTML unless a section explicitly supports it. */
window.MicroAgencySections = (() => {
  const registry = {};
  let idCounter = 0;

  const bootstrapBehaviourMap = {
    'faq-accordion': 'accordion',
    'services-tabs': 'tabs',
    'features-tabs': 'tabs',
    'testimonial-carousel': 'carousel',
    'testimonials-carousel': 'carousel',
    'gallery-lightbox': 'modal',
    'portfolio-gallery-lightbox': 'modal',
    'team-bio-modal': 'modal',
    'mobile-menu': 'offcanvas',
    'header-offcanvas-mobile': 'offcanvas',
    'filter-panel': 'offcanvas',
    'filter-sidebar-section': 'offcanvas',
    'form-success-message': 'toast',
    'article-toc': 'scrollspy',
    'article-table-of-contents': 'scrollspy',
  };

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[char]));
  }

  function createId(prefix = 'section') {
    idCounter += 1;
    return `${String(prefix).replace(/[^a-z0-9_-]/gi, '-').toLowerCase()}-${idCounter}`;
  }

  function getContainerClass(layout = {}) {
    const size = layout.container || 'lg';
    return size === 'fluid' ? 'container-fluid' : `container-width-${escapeHtml(size)}`;
  }

  function getSpacingClasses(settings = {}) {
    const top = settings.paddingTop || settings.padding || 'xl';
    const bottom = settings.paddingBottom || settings.padding || 'xl';
    return `section-pt-${escapeHtml(top)} section-pb-${escapeHtml(bottom)}`;
  }

  function getBackgroundClass(settings = {}) {
    return `section-bg-${escapeHtml(settings.background || 'background')}`;
  }

  function getSectionClasses(section = {}) {
    return [
      'section',
      `section-type-${section.type || 'unknown'}`,
      section.variant ? `section-variant-${section.variant}` : '',
      getSpacingClasses(section.settings || {}),
      getBackgroundClass(section.settings || {}),
    ].filter(Boolean).join(' ');
  }

  function renderSectionHeader(content = {}, options = {}) {
    if (!content.eyebrow && !content.title && !content.heading && !content.text) return '';
    const align = options.align || content.align || 'start';
    const heading = content.title || content.heading;
    return `
      <div class="section-header section-header-${escapeHtml(align)}">
        ${content.eyebrow ? `<p class="section-eyebrow">${escapeHtml(content.eyebrow)}</p>` : ''}
        ${heading ? `<h2>${escapeHtml(heading)}</h2>` : ''}
        ${content.text ? `<p>${escapeHtml(content.text)}</p>` : ''}
      </div>`;
  }

  function renderButtons(buttons = []) {
    if (!Array.isArray(buttons) || !buttons.length) return '';
    return `<div class="section-buttons">${buttons.map((button) => {
      const style = button.style || 'primary';
      const klass = style === 'primary' ? 'btn-primary-micro' : style === 'outline' || style === 'secondary' ? 'btn-secondary-micro' : 'btn-link-micro';
      return `<a class="btn-micro ${klass}" href="${escapeHtml(button.href || '#')}">${escapeHtml(button.label || 'Learn more')}</a>`;
    }).join('')}</div>`;
  }

  function renderIcon(icon) {
    if (!icon) return '';
    if (typeof icon === 'object' && icon.src) return `<img class="section-icon-img" src="${escapeHtml(icon.src)}" alt="${escapeHtml(icon.alt || '')}">`;
    return `<span class="section-icon" aria-hidden="true">${escapeHtml(typeof icon === 'object' ? icon.label || 'I' : icon)}</span>`;
  }

  function renderImage(media = {}) {
    if (!media?.src) return '';
    const alt = escapeHtml(media.alt || media.title || '');
    if (media.type === 'video') return `<video class="section-media rounded-4" src="${escapeHtml(media.src)}" controls${media.poster ? ` poster="${escapeHtml(media.poster)}"` : ''}></video>`;
    return `<img class="section-media rounded-4" src="${escapeHtml(media.src)}" alt="${alt}" loading="lazy">`;
  }

  function renderItems(items = [], renderer = renderBasicCard) {
    return Array.isArray(items) ? items.map((item, index) => renderer(item, index)).join('') : '';
  }

  function sectionWrap(section, inner) {
    const id = section.id || createId(section.type || 'section');
    return `<section id="${escapeHtml(id)}" class="${getSectionClasses(section)}">${inner}</section>`;
  }

  function renderSection(section = {}) {
    if (!section || typeof section !== 'object' || !section.type) {
      return renderUnknownSection({ id: createId('invalid'), type: 'invalid-section', content: { text: 'Invalid section object.' } });
    }
    const renderer = registry[section.type];
    const behaviour = section.behaviour?.bootstrap || bootstrapBehaviourMap[section.type] || null;
    const normalized = { ...section, behaviour: { ...(section.behaviour || {}), bootstrap: behaviour } };
    return renderer ? renderer(normalized) : renderUnknownSection(normalized);
  }

  function renderPage(page = {}) {
    if (window.MicroAgencyLayoutEngine?.applyTheme) window.MicroAgencyLayoutEngine.applyTheme(page.theme || 'default');
    document.title = page.title || 'MicroAgency AI';
    const meta = document.querySelector('meta[name="description"]');
    if (meta && page.description) meta.setAttribute('content', page.description);
    return `<div class="section-page">${(page.sections || []).map(renderSection).join('')}</div>`;
  }

  function renderUnknownSection(section = {}) {
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}"><div class="section-placeholder"><p>Section type "${escapeHtml(section.type || 'unknown')}" is registered but not implemented yet.</p></div></div>`);
  }

  function register(map = {}) {
    Object.entries(map).forEach(([type, renderer]) => {
      registry[type] = typeof renderer === 'function' ? renderer : renderUnknownSection;
    });
  }

  function registerPlaceholders(types = []) {
    types.forEach((type) => {
      if (!registry[type]) registry[type] = renderUnknownSection;
    });
  }

  function columnsClass(layout = {}) {
    const columns = layout.columns || {};
    const desktop = columns.desktop || layout.maxColumns || 3;
    const tablet = columns.tablet || Math.min(desktop, 2);
    const mobile = columns.mobile || 1;
    return `section-grid cols-${mobile} cols-md-${tablet} cols-lg-${desktop}`;
  }

  function renderBasicCard(item = {}) {
    return `<article class="section-card h-100">${renderIcon(item.icon)}${item.image ? renderImage({ src: item.image, alt: item.title }) : ''}<h3>${escapeHtml(item.title || item.name || 'Item')}</h3><p>${escapeHtml(item.text || item.description || '')}</p>${item.href ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.linkLabel || 'Learn more')}</a>` : ''}</article>`;
  }

  function renderHeaderWithCta(section) {
    const c = section.content || {};
    const navId = createId('main-nav');
    const offcanvas = section.behaviour?.mobile === 'offcanvas';
    const target = offcanvas ? `#${navId}-offcanvas` : `#${navId}`;
    const navLinks = renderItems(c.nav || [], (item) => `<li class="nav-item"><a class="nav-link" href="${escapeHtml(item.href || '#')}">${escapeHtml(item.label || 'Link')}</a></li>`);
    const nav = `<ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">${navLinks}</ul>${c.cta ? `<div class="ms-lg-3">${renderButtons([c.cta])}</div>` : ''}`;
    return sectionWrap(section, `
      <nav class="navbar navbar-expand-lg ${section.behaviour?.sticky ? 'sticky-top' : ''}" aria-label="Main navigation">
        <div class="${getContainerClass(section.layout)} px-3">
          <a class="navbar-brand" href="${escapeHtml(c.logo?.href || c.homeHref || '#')}">${c.logo?.image ? `<img src="${escapeHtml(c.logo.image)}" alt="${escapeHtml(c.logo.alt || c.logo.text || 'Logo')}">` : escapeHtml(c.logo?.text || c.logo || 'MicroAgency AI')}</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="${offcanvas ? 'offcanvas' : 'collapse'}" data-bs-target="${target}" aria-controls="${target.slice(1)}" aria-label="Open menu"><span class="navbar-toggler-icon"></span></button>
          ${offcanvas ? `<div class="offcanvas offcanvas-end" tabindex="-1" id="${navId}-offcanvas" aria-labelledby="${navId}-label"><div class="offcanvas-header"><h2 class="offcanvas-title" id="${navId}-label">${escapeHtml(c.logo?.text || 'Menu')}</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body">${nav}</div></div>` : `<div class="collapse navbar-collapse" id="${navId}">${nav}</div>`}
        </div>
      </nav>`);
  }

  function renderFooterStandard(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)} footer-standard-inner"><div><h2>${escapeHtml(c.logo?.text || c.logo || 'MicroAgency AI')}</h2><p>${escapeHtml(c.text || c.description || 'Reusable static websites generated from structured sections.')}</p></div><nav class="section-cluster" aria-label="Footer navigation">${renderItems(c.nav || c.links || [], (item) => `<a href="${escapeHtml(item.href || '#')}">${escapeHtml(item.label || 'Link')}</a>`)}</nav><div>${c.contact ? `<p>${escapeHtml(c.contact)}</p>` : ''}<p class="small mb-0">${escapeHtml(c.copyright || `Copyright ${new Date().getFullYear()}`)}</p></div></div>`);
  }

  function renderHero(section, split = false) {
    const c = section.content || {};
    const media = renderImage(c.media);
    const text = `<div class="hero-copy">${renderSectionHeader(c, { align: split ? 'start' : 'center' })}${renderButtons(c.buttons)}${c.stats ? renderStatsInline(c.stats) : ''}${c.form ? renderForm(c.form, 'hero-form') : ''}</div>`;
    const inner = split
      ? `<div class="${getContainerClass(section.layout)} section-split ${section.layout?.imageSide === 'left' ? 'section-reverse' : ''}">${text}<div>${media}</div></div>`
      : `<div class="${getContainerClass(section.layout)} hero-centered-inner">${text}${media ? `<div class="mt-4">${media}</div>` : ''}</div>`;
    return sectionWrap(section, inner);
  }

  function renderIntro(section, twoColumn = false) {
    const c = section.content || {};
    const inner = twoColumn
      ? `<div class="${getContainerClass(section.layout)} section-two-column"><div>${renderSectionHeader(c)}</div><div><p>${escapeHtml(c.secondaryText || c.text || '')}</p>${renderButtons(c.buttons)}</div></div>`
      : `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}${renderButtons(c.buttons)}</div>`;
    return sectionWrap(section, inner);
  }

  function renderGridSection(section, cardRenderer = renderBasicCard) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: section.layout?.headerAlign || 'center' })}<div class="${columnsClass(section.layout)}">${renderItems(c.items, cardRenderer)}</div></div>`);
  }

  function renderTabsSection(section, cardRenderer = renderBasicCard) {
    const c = section.content || {};
    const id = section.id || createId(section.type);
    const tabs = c.tabs || groupItemsAsTabs(c.items);
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<ul class="nav nav-pills section-tabs" id="${escapeHtml(id)}-tabs" role="tablist">${tabs.map((tab, index) => `<li class="nav-item" role="presentation"><button class="nav-link ${index ? '' : 'active'}" id="${escapeHtml(id)}-${index}-tab" data-bs-toggle="tab" data-bs-target="#${escapeHtml(id)}-${index}" type="button" role="tab" aria-controls="${escapeHtml(id)}-${index}" aria-selected="${index ? 'false' : 'true'}">${escapeHtml(tab.label || tab.title || `Tab ${index + 1}`)}</button></li>`).join('')}</ul><div class="tab-content">${tabs.map((tab, index) => `<div class="tab-pane fade ${index ? '' : 'show active'}" id="${escapeHtml(id)}-${index}" role="tabpanel" aria-labelledby="${escapeHtml(id)}-${index}-tab" tabindex="0"><div class="${columnsClass(section.layout)}">${renderItems(tab.items || [], cardRenderer)}</div></div>`).join('')}</div></div>`);
  }

  function groupItemsAsTabs(items = []) {
    return [{ label: 'Overview', items }];
  }

  function renderBento(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<div class="section-bento">${renderItems(c.items, (item, index) => `<article class="section-card bento-item bento-${item.span || (index === 0 ? 'wide' : 'normal')}">${renderIcon(item.icon)}<h3>${escapeHtml(item.title || 'Feature')}</h3><p>${escapeHtml(item.text || item.description || '')}</p></article>`)}</div></div>`);
  }

  function renderProcessCards(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<div class="${columnsClass(section.layout)}">${renderItems(c.items, (item, index) => `<article class="section-card process-card"><span class="process-number">${item.number || index + 1}</span><h3>${escapeHtml(item.title || `Step ${index + 1}`)}</h3><p>${escapeHtml(item.text || item.description || '')}</p></article>`)}</div></div>`);
  }

  function renderTimeline(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<ol class="section-timeline">${renderItems(c.items, (item, index) => `<li><span>${item.number || index + 1}</span><div><h3>${escapeHtml(item.title || `Step ${index + 1}`)}</h3><p>${escapeHtml(item.text || item.description || '')}</p></div></li>`)}</ol></div>`);
  }

  function renderPricingCards(section) {
    const c = section.content || {};
    return renderGridSection({ ...section, layout: { ...section.layout, columns: section.layout?.columns || { desktop: 3, tablet: 2, mobile: 1 } } }, (item) => `<article class="pricing-card ${item.highlight ? 'highlight' : ''}"><h3>${escapeHtml(item.name || item.title || 'Plan')}</h3><div class="pricing-price">${escapeHtml(item.price || 'Custom')}</div><p>${escapeHtml(item.note || item.text || '')}</p><ul>${renderItems(item.features || [], (feature) => `<li>${escapeHtml(feature)}</li>`)}</ul>${renderButtons([item.cta || { label: 'Choose plan', href: '#' }])}</article>`);
  }

  function renderComparison(section) {
    const c = section.content || {};
    const rows = c.rows || c.items || [];
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<div class="table-responsive"><table class="table section-table"><thead><tr>${renderItems(c.columns || ['Feature', 'Option A', 'Option B'], (item) => `<th scope="col">${escapeHtml(item)}</th>`)}</tr></thead><tbody>${renderItems(rows, (row) => `<tr>${renderItems(row.cells || row, (cell) => `<td>${escapeHtml(cell)}</td>`)}</tr>`)}</tbody></table></div></div>`);
  }

  function renderTestimonialsCarousel(section) {
    const c = section.content || {};
    const id = section.id || createId('testimonials');
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<div id="${escapeHtml(id)}-carousel" class="carousel slide" data-bs-ride="carousel"><div class="carousel-indicators">${renderItems(c.items || [], (_, index) => `<button type="button" data-bs-target="#${escapeHtml(id)}-carousel" data-bs-slide-to="${index}" class="${index ? '' : 'active'}" aria-label="Show testimonial ${index + 1}"></button>`)}</div><div class="carousel-inner">${renderItems(c.items || [], (item, index) => `<div class="carousel-item ${index ? '' : 'active'}"><div class="testimonial-card mx-auto"><blockquote>${escapeHtml(item.quote || '')}</blockquote><p><b>${escapeHtml(item.name || 'Customer')}</b><br><span>${escapeHtml(item.role || '')}</span></p></div></div>`)}</div><button class="carousel-control-prev" type="button" data-bs-target="#${escapeHtml(id)}-carousel" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button><button class="carousel-control-next" type="button" data-bs-target="#${escapeHtml(id)}-carousel" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button></div></div>`);
  }

  function renderLogoStrip(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<div class="logo-strip">${renderItems(c.items || [], (item) => `<span>${escapeHtml(item.logo || item.name || item)}</span>`)}</div></div>`);
  }

  function renderGallery(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<div class="gallery-grid">${renderItems(c.items, (item) => `<figure>${renderImage(item)}${item.caption ? `<figcaption>${escapeHtml(item.caption)}</figcaption>` : ''}</figure>`)}</div></div>`);
  }

  function renderCta(section, split = false) {
    const c = section.content || {};
    const body = `${renderSectionHeader(c, { align: split ? 'start' : 'center' })}${renderButtons(c.buttons)}`;
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}"><div class="cta-panel ${split ? 'cta-split-inner' : ''}">${body}${split && c.secondaryText ? `<p>${escapeHtml(c.secondaryText)}</p>` : ''}</div></div>`);
  }

  function renderContactFormSplit(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)} section-two-column"><div>${renderSectionHeader(c)}${renderContactDetails(c.details || [])}</div>${renderForm(c.form || {}, 'contact-form')}</div>`);
  }

  function renderContactDetailsCards(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}${renderContactDetails(c.items || c.details || [])}</div>`);
  }

  function renderContactDetails(items = []) {
    return `<div class="section-grid cols-1 cols-md-2 cols-lg-3">${renderItems(items, (item) => `<article class="section-card"><h3>${escapeHtml(item.title || item.label || 'Contact')}</h3><p>${escapeHtml(item.text || item.value || '')}</p></article>`)}</div>`;
  }

  function renderFaqAccordion(section) {
    const c = section.content || {};
    const id = section.id || createId('faq');
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<div class="accordion" id="${escapeHtml(id)}-accordion">${renderItems(c.items || [], (item, index) => `<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button ${index ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#${escapeHtml(id)}-answer-${index}" aria-expanded="${index ? 'false' : 'true'}" aria-controls="${escapeHtml(id)}-answer-${index}">${escapeHtml(item.question || item.title || 'Question')}</button></h3><div id="${escapeHtml(id)}-answer-${index}" class="accordion-collapse collapse ${index ? '' : 'show'}" data-bs-parent="#${escapeHtml(id)}-accordion"><div class="accordion-body">${escapeHtml(item.answer || item.text || '')}</div></div></div>`)}</div></div>`);
  }

  function renderStatsInline(items = []) {
    return `<div class="stats-bar">${renderItems(items, (item) => `<div><strong>${escapeHtml(item.number || item.value || '0')}</strong><span>${escapeHtml(item.label || '')}</span></div>`)}</div>`;
  }

  function renderStatsBar(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}${renderStatsInline(c.items || [])}</div>`);
  }

  function renderArticleBody(section) {
    const c = section.content || {};
    const blocks = c.blocks || c.paragraphs || [];
    return sectionWrap(section, `<article class="${getContainerClass(section.layout)} legal-content">${renderSectionHeader(c)}${renderItems(blocks, (block) => block.heading ? `<h3>${escapeHtml(block.heading)}</h3><p>${escapeHtml(block.text || '')}</p>` : `<p>${escapeHtml(block.text || block)}</p>`)}</article>`);
  }

  function renderForm(config = {}, idPrefix = 'form') {
    const fields = config.fields || [
      { label: 'Name', type: 'text', name: 'name', required: true },
      { label: 'Email', type: 'email', name: 'email', required: true },
      { label: 'Message', type: 'textarea', name: 'message', required: true },
    ];
    return `<form class="section-form needs-validation" novalidate>${renderItems(fields, (field) => {
      const id = createId(`${idPrefix}-${field.name || 'field'}`);
      if (field.type === 'textarea') return `<div><label class="form-label" for="${id}">${escapeHtml(field.label)}</label><textarea class="form-control" id="${id}" name="${escapeHtml(field.name || id)}" rows="${field.rows || 4}" ${field.required ? 'required' : ''}></textarea><div class="invalid-feedback">Please complete this field.</div></div>`;
      if (field.type === 'select') return `<div><label class="form-label" for="${id}">${escapeHtml(field.label)}</label><select class="form-select" id="${id}" name="${escapeHtml(field.name || id)}" ${field.required ? 'required' : ''}>${renderItems(field.options || [], (option) => `<option>${escapeHtml(option)}</option>`)}</select><div class="invalid-feedback">Please choose an option.</div></div>`;
      return `<div><label class="form-label" for="${id}">${escapeHtml(field.label)}</label><input class="form-control" id="${id}" name="${escapeHtml(field.name || id)}" type="${escapeHtml(field.type || 'text')}" ${field.required ? 'required' : ''}><div class="invalid-feedback">Please complete this field.</div></div>`;
    })}<button class="btn-micro btn-primary-micro" type="submit">${escapeHtml(config.submitLabel || 'Submit')}</button></form>`;
  }

  function renderMultiStepForm(section) {
    const c = section.content || {};
    const steps = c.steps || [{ title: 'Your details', fields: c.fields || [] }, { title: 'Project details', fields: [] }];
    const id = section.id || createId('wizard');
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<ul class="nav nav-pills mb-4" role="tablist">${renderItems(steps, (step, index) => `<li class="nav-item" role="presentation"><button class="nav-link ${index ? '' : 'active'}" id="${id}-step-${index}-tab" data-bs-toggle="pill" data-bs-target="#${id}-step-${index}" type="button" role="tab" aria-controls="${id}-step-${index}" aria-selected="${index ? 'false' : 'true'}">${escapeHtml(step.title || `Step ${index + 1}`)}</button></li>`)}</ul><div class="progress mb-4" role="progressbar" aria-label="Form progress"><div class="progress-bar" style="width:${Math.round(100 / steps.length)}%"></div></div><div class="tab-content">${renderItems(steps, (step, index) => `<div class="tab-pane fade ${index ? '' : 'show active'}" id="${id}-step-${index}" role="tabpanel" tabindex="0">${renderForm({ fields: step.fields || [], submitLabel: index === steps.length - 1 ? (c.submitLabel || 'Send') : 'Continue' }, `${id}-${index}`)}</div>`)}</div><div class="toast-container position-fixed bottom-0 end-0 p-3"><div class="toast" role="status" aria-live="polite" aria-atomic="true"><div class="toast-body">${escapeHtml(c.successMessage || 'Form saved.')}</div></div></div></div>`);
  }

  function renderOpeningHours(section) {
    const c = section.content || {};
    return sectionWrap(section, `<div class="${getContainerClass(section.layout)}">${renderSectionHeader(c, { align: 'center' })}<div class="opening-hours">${renderItems(c.items || [], (item) => `<div><span>${escapeHtml(item.day || item.label)}</span><strong>${escapeHtml(item.hours || item.value)}</strong></div>`)}</div></div>`);
  }

  const renderers = {
    headerWithCta: renderHeaderWithCta,
    footerStandard: renderFooterStandard,
    heroCentered: (section) => renderHero(section, false),
    heroSplit: (section) => renderHero(section, true),
    heroWithForm: (section) => renderHero({ ...section, content: { ...(section.content || {}), form: section.content?.form || {} } }, true),
    introCentered: (section) => renderIntro(section, false),
    introTwoColumn: (section) => renderIntro(section, true),
    servicesGrid: renderGridSection,
    servicesTabs: renderTabsSection,
    featuresGrid: renderGridSection,
    featuresBento: renderBento,
    featuresTabs: renderTabsSection,
    processNumberedCards: renderProcessCards,
    processTimeline: renderTimeline,
    pricingCards: renderPricingCards,
    pricingComparison: renderComparison,
    testimonialsGrid: (section) => renderGridSection(section, (item) => `<figure class="testimonial-card"><blockquote>${escapeHtml(item.quote || item.text || '')}</blockquote><figcaption><b>${escapeHtml(item.name || 'Customer')}</b><br><span>${escapeHtml(item.role || '')}</span></figcaption></figure>`),
    testimonialsCarousel: renderTestimonialsCarousel,
    logoStrip: renderLogoStrip,
    portfolioGrid: renderGridSection,
    galleryGrid: renderGallery,
    ctaBand: (section) => renderCta(section, false),
    ctaSplit: (section) => renderCta(section, true),
    contactFormSplit: renderContactFormSplit,
    contactDetailsCards: renderContactDetailsCards,
    faqAccordion: renderFaqAccordion,
    teamGrid: (section) => renderGridSection(section, (item) => `<article class="section-card team-card">${renderImage(item.image ? { src: item.image, alt: item.name } : {})}<h3>${escapeHtml(item.name || 'Team member')}</h3><p class="section-eyebrow">${escapeHtml(item.role || '')}</p><p>${escapeHtml(item.bio || '')}</p></article>`),
    statsBar: renderStatsBar,
    blogCardGrid: renderGridSection,
    articleBody: renderArticleBody,
    areasServed: renderGridSection,
    openingHours: renderOpeningHours,
    multiStepForm: renderMultiStepForm,
    legalPage: renderArticleBody,
    thankYou: (section) => sectionWrap(section, `<div class="${getContainerClass(section.layout)} utility-center">${renderSectionHeader(section.content || {}, { align: 'center' })}${renderButtons(section.content?.buttons || [])}</div>`),
    notFound: (section) => sectionWrap(section, `<div class="${getContainerClass(section.layout)} utility-center">${renderSectionHeader(section.content || { title: 'Page not found', text: 'The page you wanted is not available.' }, { align: 'center' })}${renderButtons(section.content?.buttons || [{ label: 'Return home', href: '/' }])}</div>`),
  };

  return {
    registry,
    bootstrapBehaviourMap,
    register,
    registerPlaceholders,
    renderSection,
    renderPage,
    getSectionClasses,
    getContainerClass,
    getSpacingClasses,
    getBackgroundClass,
    renderSectionHeader,
    renderButtons,
    renderIcon,
    renderImage,
    renderItems,
    escapeHtml,
    createId,
    renderers,
    placeholder: renderUnknownSection,
  };
})();
