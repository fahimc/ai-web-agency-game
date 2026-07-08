/* Section engine API:
   renderPage(pageData), renderSection(section), renderLayout(layout, content),
   renderComponent(component), getLayoutClass(layout), applyTheme(theme).
   Small LLM workflow: edit page.sections in site-data.js, choose kind/layout/content,
   and let this renderer build Bootstrap-compatible semantic HTML. */
window.MicroAgencyLayoutEngine = (() => {
  const C = window.MicroAgencyComponents;
  const esc = C.escapeHtml;
  function applyTheme(theme = 'default') {
    document.documentElement.dataset.theme = typeof theme === 'string' ? theme : (theme.id || 'default');
    if (theme && typeof theme === 'object') {
      if (window.MicroAgencyTheme?.exporter) {
        window.MicroAgencyTheme.exporter.injectTheme(theme);
      } else {
        Object.entries(theme.tokens || {}).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
      }
      if (theme.buttonStyle) document.documentElement.dataset.buttonStyle = theme.buttonStyle;
      if (theme.cardStyle) document.documentElement.dataset.cardStyle = theme.cardStyle;
    }
  }
  function getLayoutClass(layout = {}) {
    const aliases = { 'bento-grid': 'bento', 'asymmetric-two-column': 'asymmetric' };
    const type = aliases[layout.type] || layout.type || 'single-column';
    const classes = [`layout-${type}`];
    if (layout.ratio) classes.push(`ratio-${layout.ratio}`);
    if (layout.reverse) classes.push('layout-reverse');
    if (layout.sidebarPosition === 'left') classes.push('sidebar-left');
    if (layout.equalHeight) classes.push('equal-height');
    if (layout.maxColumns) classes.push(`max-${layout.maxColumns}`);
    if (layout.variant) classes.push(`cta-${layout.variant}`);
    return classes.join(' ');
  }
  function containerClass(layout = {}) {
    return `container-width-${layout.container || (layout.type === 'wide-single-column' ? 'xl' : 'lg')}`;
  }
  function styleFor(layout = {}) {
    const styles = [];
    if (layout.minCardWidth) styles.push(`--min-card-width:${layout.minCardWidth}`);
    if (layout.gap) styles.push(`--grid-gap:var(--space-${layout.gap})`);
    if (layout.align) styles.push(`--vertical-align:${layout.align}`);
    if (layout.columns) styles.push(`--masonry-columns:${layout.columns}`);
    return styles.length ? ` style="${styles.join(';')}"` : '';
  }
  function renderComponent(component, sectionId = 'section') {
    if (!component) return '';
    if (typeof component === 'string') return component;
    return C.render(component.component || component.type || 'feature-card', component, sectionId);
  }
  function renderItems(content = {}, sectionId = 'section') {
    return (content.items || []).map((item) => renderComponent(item, sectionId)).join('');
  }
  function renderIntro(content = {}) {
    if (!content.eyebrow && !content.heading && !content.text) return '';
    return `<div class="mb-4">${content.eyebrow ? `<div class="eyebrow">${esc(content.eyebrow)}</div>` : ''}${content.heading ? `<h2 class="section-heading">${esc(content.heading)}</h2>` : ''}${content.text ? `<p class="lead-text">${esc(content.text)}</p>` : ''}</div>`;
  }
  function renderLayout(layout = {}, content = {}, sectionId = 'section') {
    const type = layout.type || decideLayout({ kind: content.kind, content });
    const nextLayout = { ...layout, type };
    if (type === 'split-hero') return `<div class="${containerClass(nextLayout)} ${getLayoutClass(nextLayout)}"${styleFor(nextLayout)}>${C.heroText(content)}${C.media(content.media || {})}</div>`;
    if (type === 'centered-hero') return `<div class="${containerClass(nextLayout)} ${getLayoutClass(nextLayout)}"${styleFor(nextLayout)}><div>${C.heroText(content)}${content.media ? C.media(content.media) : ''}</div></div>`;
    if (type === 'two-column' || type === 'asymmetric-two-column' || type === 'sidebar') {
      const layoutType = type === 'asymmetric-two-column' ? 'asymmetric' : type;
      const primary = content.primary || `<div>${renderIntro(content)}${renderItems(content, sectionId)}</div>`;
      const secondary = content.secondary || (content.media ? C.media(content.media) : '');
      const sticky = nextLayout.sticky ? ' sticky-side' : '';
      return `<div class="${containerClass(nextLayout)} ${getLayoutClass({ ...nextLayout, type: layoutType })}"${styleFor(nextLayout)}><div>${primary}</div><aside class="${sticky.trim()}">${secondary}</aside></div>`;
    }
    if (type === 'full-width-media') return `<div class="${getLayoutClass(nextLayout)} ${nextLayout.fullBleed ? 'full-bleed' : containerClass(nextLayout)}"><div class="aspect-${nextLayout.aspect || '16-9'}">${C.media(content.media || {})}</div></div>`;
    if (type === 'cta-band') return `<div class="${containerClass(nextLayout)}"><div class="${getLayoutClass(nextLayout)}">${renderIntro(content)}${content.buttons ? C.buttonGroup(content.buttons) : ''}</div></div>`;
    if (type === 'cover') return `<div class="${getLayoutClass(nextLayout)}"><div>${C.heroText(content)}</div></div>`;
    if (type === 'cluster') return `<div class="${containerClass(nextLayout)}">${renderIntro(content)}<div class="${getLayoutClass(nextLayout)}">${(content.items || content.buttons || []).map((item) => item.label ? C.button(item) : `<span class="trust-badge">${esc(item)}</span>`).join('')}</div></div>`;
    const intro = renderIntro(content);
    const body = content.component ? renderComponent(content, sectionId) : renderItems(content, sectionId);
    return `<div class="${containerClass(nextLayout)}">${intro}<div class="${getLayoutClass(nextLayout)}"${styleFor(nextLayout)}>${body}</div></div>`;
  }
  function renderSection(section = {}) {
    const spacing = section.spacing || 'md';
    const bg = section.background || 'default';
    const content = { ...(section.content || {}), kind: section.kind };
    const layout = section.layout || { type: decideLayout(section) };
    return `<section id="${esc(section.id || section.kind || 'section')}" class="site-section section-space-${esc(spacing)} section-bg-${esc(bg)}">${renderLayout(layout, content, section.id)}</section>`;
  }
  function renderHeader(page = {}) {
    const nav = page.nav || [
      { label: 'Home', href: '../index.html' },
      { label: 'About', href: './about.html' },
      { label: 'Services', href: './services.html' },
      { label: 'Contact', href: './contact.html' },
    ];
    return `<header class="site-header"><nav class="navbar navbar-expand-lg"><div class="container-width-xl px-3"><a class="navbar-brand" href="${esc(page.homeHref || './index.html')}">${esc(page.logo || 'MicroAgency AI')}</a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Open menu"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="mainNav"><ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">${nav.map((item) => `<li class="nav-item"><a class="nav-link" href="${esc(item.href)}">${esc(item.label)}</a></li>`).join('')}</ul>${page.headerCta ? `<div class="ms-lg-3">${C.button(page.headerCta)}</div>` : ''}</div></div></nav></header>`;
  }
  function renderFooter(page = {}) {
    const links = page.footerLinks || [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Contact', href: './contact.html' }];
    return `<footer class="site-footer"><div class="container-width-xl layout-two-column ratio-2-1"><div><h2>${esc(page.logo || 'MicroAgency AI')}</h2><p>${esc(page.footerText || 'Reusable static websites generated from structured data.')}</p></div><div class="layout-stack"><nav class="layout-cluster">${links.map((item) => `<a href="${esc(item.href)}">${esc(item.label)}</a>`).join('')}</nav><p>${esc(page.contact || 'hello@microagency.ai')}</p><p class="muted">Copyright ${new Date().getFullYear()}</p></div></div></footer>`;
  }
  function renderPage(pageData = {}) {
    applyTheme(pageData.theme || 'default');
    document.title = pageData.title || 'MicroAgency AI';
    const meta = document.querySelector('meta[name="description"]');
    if (meta && pageData.description) meta.setAttribute('content', pageData.description);
    const sections = (pageData.sections || []).map(renderSection).join('');
    return `<div class="site-page">${pageData.hideHeader ? '' : renderHeader(pageData)}<main>${sections}</main>${pageData.hideFooter ? '' : renderFooter(pageData)}</div>`;
  }
  function decideLayout(section = {}) {
    const kind = section.kind || '';
    const content = section.content || {};
    if (kind === 'hero' && content.media) return 'split-hero';
    if (kind === 'hero') return 'centered-hero';
    if (kind === 'legal' || kind === 'article') return 'single-column';
    if (content.sidebar) return 'sidebar';
    if (kind === 'gallery') return 'masonry';
    if (kind === 'features' && (content.items || []).length > 4) return 'bento';
    if (kind === 'cta') return 'cta-band';
    if (content.tags || content.buttons) return 'cluster';
    if (kind === 'faq' || kind === 'timeline') return 'stack';
    if ((content.items || []).length >= 3) return 'card-grid';
    return 'single-column';
  }
  return { renderPage, renderSection, renderLayout, renderComponent, getLayoutClass, applyTheme, decideLayout };
})();
