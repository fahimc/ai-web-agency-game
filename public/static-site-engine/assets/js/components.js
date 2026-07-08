/* MicroAgencyComponents contains small Bootstrap-compatible renderers.
   A small LLM should add new renderers here, then reference them from section content. */
window.MicroAgencyComponents = (() => {
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const attrs = (map = {}) => Object.entries(map).filter(([, value]) => value !== undefined && value !== false && value !== '').map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(' ');
  const button = (item = {}) => {
    const style = item.style || 'primary';
    const klass = style === 'primary' ? 'btn-primary-micro' : style === 'secondary' ? 'btn-secondary-micro' : 'btn-link-micro';
    return `<a class="btn-micro ${klass}" href="${escapeHtml(item.href || '#')}">${escapeHtml(item.label || 'Learn more')}</a>`;
  };
  const buttonGroup = (buttons = []) => `<div class="layout-cluster">${buttons.map(button).join('')}</div>`;
  const heroText = (content = {}) => `
    <div class="hero-text">
      ${content.eyebrow ? `<div class="eyebrow">${escapeHtml(content.eyebrow)}</div>` : ''}
      <h1 class="hero-title">${escapeHtml(content.heading || content.title || 'MicroAgency AI')}</h1>
      ${content.text ? `<p class="lead-text">${escapeHtml(content.text)}</p>` : ''}
      ${content.buttons ? buttonGroup(content.buttons) : ''}
      ${content.badges ? `<div class="trust-badges">${content.badges.map((badge) => `<span class="trust-badge">${escapeHtml(badge)}</span>`).join('')}</div>` : ''}
    </div>`;
  const media = (item = {}) => {
    if (!item.src) return '';
    if (item.type === 'video') return `<video class="rounded-4 shadow-sm" src="${escapeHtml(item.src)}" controls></video>`;
    if (item.type === 'map') return `<div class="map-block">${escapeHtml(item.label || 'Map placeholder')}</div>`;
    return `<img class="rounded-4 shadow-sm" src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || '')}">`;
  };
  const serviceCard = (item = {}) => `<article class="micro-card h-100"><div class="card-icon">${escapeHtml(item.icon || 'S')}</div><h3>${escapeHtml(item.title || 'Service')}</h3><p class="muted">${escapeHtml(item.description || '')}</p>${item.href ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.linkLabel || 'Learn more')}</a>` : ''}</article>`;
  const featureCard = (item = {}) => `<article class="micro-card h-100"><div class="card-icon">${escapeHtml(item.icon || 'F')}</div><h3>${escapeHtml(item.title || 'Feature')}</h3><p class="muted">${escapeHtml(item.description || '')}</p></article>`;
  const pricingCard = (item = {}) => `<article class="micro-card h-100 ${item.highlight ? 'highlight' : ''}"><h3>${escapeHtml(item.name || 'Plan')}</h3><div class="price">${escapeHtml(item.price || '£0')}</div><p class="muted">${escapeHtml(item.note || '')}</p><ul>${(item.features || []).map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>${button(item.cta || { label: 'Choose plan', href: '#' })}</article>`;
  const testimonialCard = (item = {}) => `<figure class="micro-card h-100"><div class="rating">${item.rating ? '★★★★★'.slice(0, Number(item.rating)) : ''}</div><blockquote class="testimonial-quote">"${escapeHtml(item.quote || '')}"</blockquote><figcaption><b>${escapeHtml(item.name || 'Customer')}</b><br><span class="muted">${escapeHtml(item.role || '')}</span></figcaption></figure>`;
  const portfolioCard = (item = {}) => `<article class="micro-card portfolio-card h-100">${media({ src: item.image, alt: item.title })}<p class="eyebrow mt-3">${escapeHtml(item.category || 'Work')}</p><h3>${escapeHtml(item.title || 'Project')}</h3><p class="muted">${escapeHtml(item.description || '')}</p>${item.href ? `<a href="${escapeHtml(item.href)}">View project</a>` : ''}</article>`;
  const blogCard = (item = {}) => `<article class="micro-card blog-card h-100">${media({ src: item.image, alt: item.title })}<p class="eyebrow mt-3">${escapeHtml(item.category || 'Article')}</p><h3>${escapeHtml(item.title || 'Article')}</h3><p class="muted">${escapeHtml(item.excerpt || '')}</p><small class="muted">${escapeHtml(item.date || '')}</small>${item.href ? `<p><a href="${escapeHtml(item.href)}">Read article</a></p>` : ''}</article>`;
  const teamCard = (item = {}) => `<article class="micro-card team-card h-100">${media({ src: item.image, alt: item.name })}<h3 class="mt-3">${escapeHtml(item.name || 'Team member')}</h3><p class="eyebrow">${escapeHtml(item.role || '')}</p><p class="muted">${escapeHtml(item.bio || '')}</p></article>`;
  const faqAccordion = (items = [], id = 'faq') => `<div class="accordion" id="${escapeHtml(id)}">${items.map((item, index) => `<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button ${index ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#${escapeHtml(id)}-${index}" aria-expanded="${index ? 'false' : 'true'}">${escapeHtml(item.question || 'Question')}</button></h3><div id="${escapeHtml(id)}-${index}" class="accordion-collapse collapse ${index ? '' : 'show'}" data-bs-parent="#${escapeHtml(id)}"><div class="accordion-body">${escapeHtml(item.answer || '')}</div></div></div>`).join('')}</div>`;
  const contactForm = (content = {}) => `<form class="micro-card" novalidate><div class="row g-3"><div class="col-md-6"><label class="form-label">Name</label><input class="form-control" required></div><div class="col-md-6"><label class="form-label">Email</label><input class="form-control" type="email" required></div><div class="col-md-6"><label class="form-label">Phone</label><input class="form-control" type="tel"></div><div class="col-md-6"><label class="form-label">Service</label><select class="form-select">${(content.services || ['Website', 'SEO', 'Support']).map((item) => `<option>${escapeHtml(item)}</option>`).join('')}</select></div><div class="col-12"><label class="form-label">Message</label><textarea class="form-control" rows="5" required></textarea></div><div class="col-12"><button class="btn-micro btn-primary-micro" type="submit">${escapeHtml(content.submitLabel || 'Send enquiry')}</button></div></div></form>`;
  const newsletterForm = () => `<form class="layout-cluster"><label class="visually-hidden" for="newsletter-email">Email</label><input id="newsletter-email" class="form-control" type="email" placeholder="Email address"><button class="btn-micro btn-primary-micro">Subscribe</button></form>`;
  const stats = (items = []) => `<div class="layout-card-grid max-3">${items.map((item) => `<div class="micro-card"><div class="stat-number">${escapeHtml(item.number || '0')}</div><p><b>${escapeHtml(item.label || '')}</b></p><p class="muted">${escapeHtml(item.text || '')}</p></div>`).join('')}</div>`;
  const processSteps = (items = []) => `<div class="layout-stack">${items.map((item, index) => `<div class="process-step"><span class="step-number">${index + 1}</span><div><h3>${escapeHtml(item.title || `Step ${index + 1}`)}</h3><p class="muted">${escapeHtml(item.description || '')}</p></div></div>`).join('')}</div>`;
  const logoStrip = (items = []) => `<div class="logo-strip">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>`;
  const alert = (item = {}) => `<div class="notice notice-${escapeHtml(item.variant || 'info')}"><b>${escapeHtml(item.title || 'Note')}</b><p>${escapeHtml(item.text || '')}</p></div>`;
  const galleryGrid = (items = []) => `<div class="layout-masonry">${items.map((item) => `<a class="gallery-item" href="${escapeHtml(item.src || '#')}">${media(item)}</a>`).join('')}</div>`;
  const mapLocation = (item = {}) => `<div class="micro-card"><h3>${escapeHtml(item.title || 'Visit us')}</h3><p>${escapeHtml(item.address || '')}</p><p class="muted">${escapeHtml(item.hours || '')}</p><div class="map-block">${escapeHtml(item.mapLabel || 'Map embed placeholder')}</div></div>`;
  const render = (type, data, sectionId) => ({
    'hero-text': () => heroText(data),
    'button-group': () => buttonGroup(data),
    'service-card': () => serviceCard(data),
    'feature-card': () => featureCard(data),
    'pricing-card': () => pricingCard(data),
    'testimonial-card': () => testimonialCard(data),
    'portfolio-card': () => portfolioCard(data),
    'blog-card': () => blogCard(data),
    'team-card': () => teamCard(data),
    'faq-accordion': () => faqAccordion(data.items || data, sectionId),
    'contact-form': () => contactForm(data),
    'newsletter-form': () => newsletterForm(data),
    'gallery-grid': () => galleryGrid(data.items || data),
    'stats-block': () => stats(data.items || data),
    'process-steps': () => processSteps(data.items || data),
    'logo-strip': () => logoStrip(data.items || data),
    'map-location': () => mapLocation(data),
    'alert': () => alert(data),
    media: () => media(data),
  }[type] || (() => serviceCard(data)))();
  return { render, button, buttonGroup, heroText, media, escapeHtml };
})();
