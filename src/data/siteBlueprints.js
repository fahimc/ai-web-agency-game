import { createSitePackageString, fileNameForPage } from '../utils/sitePackage.js';
import {
  fallbackLogoConfig,
  logoGeneratorSummary,
  normalizeLogoConfig,
  renderNavLogo,
} from './logoGenerator.js';
import { downloadedTemplateLibrary, downloadedTemplateSummary } from './templateLibrary.js';
import { siteMotionCss, siteMotionScript, siteMotionSummary } from './siteMotion.js';

const BOOTSTRAP_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
const BOOTSTRAP_JS = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';

export const componentLibrary = {
  name: 'Bootstrap 5.3 + MicroAgency Layout Engine',
  principles: [
    'Use Bootstrap 5.3 components for navigation, forms, buttons, cards, accordions, modals, carousels, offcanvas menus, and responsive grid behaviour.',
    'Compose pages as Page -> Sections -> Layouts -> Components -> Content so small models can edit structured data instead of hand-coding every page.',
    'Choose layout primitives such as single-column, two-column, asymmetric, sidebar, card-grid, bento, split hero, centered hero, masonry, horizontal scroller, stack, cluster, cover, and CTA band.',
    'Use semantic theme roles from the validated theme generator: background, foreground, surface, card, primary, secondary, accent, muted, border, success, warning, and danger with their matching foreground tokens.',
    'Never invent arbitrary foreground/background component pairs; choose semantic roles from a validated WCAG AA theme and repair unsafe pairs before output.',
    'Build pages from reusable website sections in the MicroAgency section library before falling back to smaller components. Prefer section type + variant + layout + content over hand-coded page-specific blocks.',
    'Use registered section types such as hero-split, services-grid, features-bento, pricing-cards, faq-accordion, contact-form-split, and cta-band when planning or building static sites.',
    'Use downloaded MIT template references for composition ideas, then rebuild them through MicroAgency sections, Bootstrap markup, semantic theme tokens, and original client-specific content.',
    'Use the MicroAgency motion system for rich sites: reveal, stagger, parallax media, floating panels, carousel motion where useful, and reduced-motion fallbacks.',
    'Every generated site header must use a Bootstrap responsive navbar with a visible hamburger toggler on mobile.',
    'Use semantic sections with clear h2 headings and one primary CTA per viewport.',
    'Keep all layouts mobile-first with CSS grid, flexible cards, and visible focus states.',
    'Compose pages from hero, trust strip, service cards, process, proof, FAQ, and contact blocks.',
    'Use local CSS custom properties for color, radius, spacing, and type scale.',
  ],
  components: [
    'Responsive header: Bootstrap navbar, navbar-toggler, collapse/offcanvas mobile menu, current-page state, and accessible labels.',
    'Hero: eyebrow, headline, supporting copy, CTA group, and proof point.',
    'Service grid: 3 to 6 cards with short benefit-led descriptions.',
    'Process steps: numbered sequence explaining how the customer gets value.',
    'Proof band: testimonial, metric, logos, or guarantee.',
    'Contact form: name, email, project message, and strong reassurance copy.',
    'FAQ: concise objections and answers near the final CTA.',
  ],
};

export function buildEngineCapabilityContext() {
  return [
  'MicroAgency AI build system capabilities:',
  '',
  'Architecture: Page -> Sections -> Layouts -> Components -> Content. Prefer complete reusable website sections over tiny atomic component assembly.',
  'Engine: Bootstrap 5.3 + MicroAgency Layout Engine + MicroAgency section registry + validated theme generator. Use semantic HTML, responsive Bootstrap markup, CSS grid/flex, visible focus states, and local CSS variables.',
  '',
  'Core production section types available:',
  [
    'header-with-cta', 'footer-standard', 'hero-centered', 'hero-split', 'hero-with-form',
    'intro-centered', 'intro-two-column', 'services-grid', 'services-tabs',
    'features-grid', 'features-bento', 'features-tabs', 'process-numbered-cards',
    'process-timeline', 'pricing-cards', 'pricing-comparison', 'testimonials-grid',
    'testimonials-carousel', 'logo-strip', 'portfolio-grid', 'gallery-grid',
    'cta-band', 'cta-split', 'contact-form-split', 'contact-details-cards',
    'faq-accordion', 'team-grid', 'stats-bar', 'blog-card-grid', 'article-body',
    'areas-served', 'opening-hours', 'multi-step-form', 'legal-page',
    'thank-you-section', '404-section',
  ].join(', '),
  '',
  'Registered section categories with placeholder support: navigation, hero, content, services, features, process, pricing, trust/social proof, portfolio, gallery/media, CTA, contact/lead capture, FAQ, team/people, about/story, stats, comparison, product, blog/article, location/local SEO, booking, menu/catalogue, event, forms, utility/system, legal/policy, search/filter.',
  'Use placeholders only when a requested section type is not part of the core production set. If needed, add a custom section renderer or custom markup, but first try an existing type plus variant/layout/content.',
  '',
  'Layout primitives available:',
  [
    'single-column', 'wide-single-column', 'two-column ratios 1:1 2:1 1:2 3:2 2:3',
    'asymmetric-two-column', 'sidebar', 'three-column', 'responsive card-grid',
    'bento-grid', 'split-hero', 'centered-hero', 'full-width-media', 'masonry',
    'horizontal-scroller', 'stack', 'cluster', 'cover', 'cta-band',
  ].join(', '),
  '',
  'Reusable components available when a section needs internal items:',
  [
    'Bootstrap responsive header/navbar/offcanvas', 'footer', 'hero text block',
    'button group', 'service card', 'feature card', 'pricing card',
    'testimonial card', 'portfolio card', 'blog card', 'team card',
    'FAQ accordion', 'contact form', 'newsletter form', 'gallery grid',
    'stats block', 'process steps', 'logo strip', 'map/location block',
    'alert/notice block',
  ].join(', '),
  '',
  'Bootstrap behaviours available through the behaviour object/data attributes: collapse, accordion, dropdown, modal, offcanvas, tabs, carousel, toast, tooltip, popover, scrollspy.',
  '',
  'Rich motion system available:',
  siteMotionSummary(),
  '',
  logoGeneratorSummary(),
  '',
  'Downloaded MIT template reference library available to the LLM:',
  downloadedTemplateSummary(),
  '',
  'Base design directions and palettes available:',
  siteLayouts.map((layout) => `${layout.id}: ${layout.name} (${layout.model}; ${layout.tone}; palette ${layout.palette.join(', ')})`).join('\n'),
  '',
  'Theme generator palette presets available: Mira recommended, modern mono (#0a0a0a #111111 #ffffff #6b7280 #f7f7f7), earthy vibrancy (#2f3a23 #b7791f #f4e7d3 #8b3a2b #ffffff), moody botanical (#123524 #2f6f5b #f7f3ea #c7a76c #ffffff), electric SaaS (#08111f #4f46e5 #f8fafc #22d3ee #ffffff), soft editorial (#111111 #efe9e1 #d8c3ad #8a6a4f #ffffff), wellness mist (#164e63 #2bb3a3 #f3fbf9 #f4a261 #ffffff), luxury neutral (#1f130f #6b3f2a #f7efe5 #b08d57 #ffffff), warm venue (#2f1b12 #c2410c #fff7ed #f59e0b #ffffff). The static engine also has 30 preset seed palettes across AI agency, SaaS, local business, trades, legal, finance, healthcare, beauty, restaurant, education, charity, portfolio, luxury, playful, and dark premium.',
  'You may create a custom palette when the brief needs it, but use 3-5 real hex colours and map them to semantic roles: background, foreground, surface, card, primary, secondary, accent, muted, border, success, warning, danger and matching foreground tokens. Validate WCAG AA contrast.',
  '',
  'Typography presets available: Modern SaaS, Friendly Local, Professional, Editorial, Premium, Playful, Technical. You may choose a custom font pairing if it better fits the brand; keep body text at 16px or larger and line-height 1.5-1.75.',
  '',
  'Local placeholder imagery available: /placeholders/business-team.jpg, /placeholders/office-workspace.jpg, /placeholders/restaurant-table.jpg, /placeholders/wellness-studio.jpg, /placeholders/tech-product.jpg, /placeholders/premium-interior.jpg, /placeholders/event-audience.jpg, /placeholders/education-laptop.jpg, /placeholders/creative-studio.jpg, /placeholders/community-impact.jpg.',
  '',
  'Authoring rules: choose existing section types first; prefer variant/layout/settings over new types; use validated theme tokens rather than arbitrary colour pairs; use Bootstrap behaviours accessibly; include image alt text; for Growth/Signature output separate full HTML pages; avoid agency-facing words like example, sample, preview, customer website, visual direction, or design direction in the final customer site.',
  ].join('\n');
}

export const placeholderImages = [
  { id: 'business', label: 'Business team', path: '/placeholders/business-team.jpg' },
  { id: 'office', label: 'Office workspace', path: '/placeholders/office-workspace.jpg' },
  { id: 'restaurant', label: 'Restaurant table', path: '/placeholders/restaurant-table.jpg' },
  { id: 'wellness', label: 'Wellness studio', path: '/placeholders/wellness-studio.jpg' },
  { id: 'tech', label: 'Tech product team', path: '/placeholders/tech-product.jpg' },
  { id: 'premium', label: 'Premium interior', path: '/placeholders/premium-interior.jpg' },
  { id: 'event', label: 'Event audience', path: '/placeholders/event-audience.jpg' },
  { id: 'education', label: 'Education laptop', path: '/placeholders/education-laptop.jpg' },
  { id: 'creative', label: 'Creative studio', path: '/placeholders/creative-studio.jpg' },
  { id: 'community', label: 'Community impact', path: '/placeholders/community-impact.jpg' },
];

export const siteLayouts = [
  { id: 'conversion-classic', name: 'Conversion Classic', model: 'Hero + proof + services + process + CTA', tone: 'Direct, polished, high-converting', palette: ['#10213f', '#2563eb', '#f8fafc', '#0f766e', '#ffffff'] },
  { id: 'local-service', name: 'Local Service', model: 'Local hero + services + reviews + contact', tone: 'Friendly, trustworthy, practical', palette: ['#173d35', '#18a058', '#fff7ed', '#eab308', '#ffffff'] },
  { id: 'premium-editorial', name: 'Premium Editorial', model: 'Large story-led hero + feature sections + proof', tone: 'Elegant, confident, brand-led', palette: ['#171717', '#b7791f', '#faf7f0', '#6b3f2a', '#ffffff'] },
  { id: 'saas-product', name: 'SaaS Product', model: 'Product hero + feature grid + workflow + pricing CTA', tone: 'Crisp, operational, product-focused', palette: ['#08111f', '#4f46e5', '#f8fafc', '#22d3ee', '#ffffff'] },
  { id: 'consultant-authority', name: 'Consultant Authority', model: 'Authority hero + outcomes + method + booking', tone: 'Expert, calm, advisory', palette: ['#1f2937', '#7c3aed', '#f5f3ff', '#0f766e', '#ffffff'] },
  { id: 'portfolio-studio', name: 'Portfolio Studio', model: 'Visual intro + selected work + capabilities + inquiry', tone: 'Creative, image-led, selective', palette: ['#111827', '#f43f5e', '#fff1f2', '#8b5cf6', '#ffffff'] },
  { id: 'restaurant-venue', name: 'Restaurant / Venue', model: 'Atmospheric hero + menu highlights + location + booking', tone: 'Sensory, warm, visit-focused', palette: ['#2f1b12', '#c2410c', '#fff7ed', '#f59e0b', '#ffffff'] },
  { id: 'health-wellness', name: 'Health & Wellness', model: 'Reassuring hero + services + credentials + enquiry', tone: 'Soft, credible, supportive', palette: ['#164e63', '#2bb3a3', '#f3fbf9', '#f4a261', '#ffffff'] },
  { id: 'event-launch', name: 'Event / Launch', model: 'Announcement hero + agenda + speakers + signup', tone: 'Energetic, urgent, clear', palette: ['#240046', '#ff5a5f', '#fff7f7', '#f59e0b', '#ffffff'] },
  { id: 'marketplace-directory', name: 'Marketplace / Directory', model: 'Search-led hero + categories + featured listings + trust', tone: 'Useful, scannable, broad', palette: ['#0f172a', '#22c55e', '#f8fafc', '#0ea5e9', '#ffffff'] },
  { id: 'nonprofit-campaign', name: 'Nonprofit Campaign', model: 'Mission hero + impact proof + ways to help + donate CTA', tone: 'Human, purposeful, action-led', palette: ['#123524', '#f59e0b', '#fefce8', '#2f6f5b', '#ffffff'] },
  { id: 'education-course', name: 'Education / Course', model: 'Course promise + curriculum + outcomes + enrolment', tone: 'Structured, motivating, clear', palette: ['#1e3a8a', '#06b6d4', '#eff6ff', '#7c3aed', '#ffffff'] },
];

export const MAX_PALETTE_COLORS = 5;

export const PALETTE_ROLES = ['Text', 'Primary', 'Background', 'Accent', 'Surface'];

export const PAGE_PRESETS = [
  'Home',
  'Services',
  'About',
  'Pricing',
  'Case Studies',
  'Gallery',
  'Menu',
  'Events',
  'Courses',
  'FAQ',
  'Contact',
  'Book a Call',
];

export const SECTION_PRESETS = [
  'Hero',
  'Trust / proof bar',
  'Services',
  'Featured products',
  'Benefits',
  'Process',
  'Testimonials',
  'Gallery',
  'Pricing',
  'FAQ',
  'Lead capture form',
  'Contact details',
  'Location map',
  'Final CTA',
];

const layoutKeywords = {
  'local-service': ['local', 'trade', 'plumber', 'electrician', 'cleaning', 'garden', 'repair', 'service', 'clinic', 'salon'],
  'saas-product': ['software', 'saas', 'app', 'platform', 'dashboard', 'automation', 'tool', 'product'],
  'premium-editorial': ['luxury', 'premium', 'brand', 'boutique', 'interior', 'fashion', 'jewellery', 'consulting'],
  'consultant-authority': ['consultant', 'coach', 'advisor', 'agency', 'law', 'accountant', 'finance', 'expert'],
  'portfolio-studio': ['portfolio', 'studio', 'creative', 'photography', 'designer', 'artist', 'film'],
  'restaurant-venue': ['restaurant', 'cafe', 'bar', 'venue', 'food', 'menu', 'hotel'],
  'health-wellness': ['health', 'wellness', 'therapy', 'fitness', 'dentist', 'medical', 'yoga', 'care'],
  'event-launch': ['event', 'conference', 'launch', 'webinar', 'ticket', 'festival'],
  'marketplace-directory': ['marketplace', 'directory', 'listing', 'search', 'community', 'members'],
  'nonprofit-campaign': ['charity', 'nonprofit', 'campaign', 'donate', 'fundraiser', 'cause'],
  'education-course': ['course', 'school', 'education', 'training', 'lesson', 'academy'],
};

export function recommendedDesignLayouts(state, count = 4) {
  const text = `${state?.brief || ''}\n${state?.clientDetails || ''}`.toLowerCase();
  const scored = siteLayouts.map((layout, index) => {
    const keywords = layoutKeywords[layout.id] || [];
    const keywordScore = keywords.reduce((score, word) => score + (text.includes(word) ? 3 : 0), 0);
    const defaultScore = ['conversion-classic', 'local-service', 'premium-editorial', 'saas-product'].includes(layout.id) ? 1 : 0;
    return { layout, score: keywordScore + defaultScore, index };
  });
  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.max(3, Math.min(count, 4)))
    .map((item) => item.layout);
}

export function fallbackDesignRecommendations(state, count = 4) {
  const templateCandidates = recommendedTemplateReferences(state, 6);
  return recommendedDesignLayouts(state, count).map((layout, index) => {
    const structure = recommendedStructure(layout, state);
    const palette = normalizePalette(layout.palette);
    const template = templateForLayout(layout, templateCandidates, index);
    const logo = fallbackLogoConfig(state, layout, palette);
    return {
      id: `fallback-${layout.id}`,
      layoutId: layout.id,
      name: layout.name,
      tone: layout.tone,
      rationale: directionSummary(layout),
      baseTemplateId: template?.id || '',
      baseTemplateName: template?.name || '',
      templateReason: template ? `Use ${template.name} as the composition reference for ${template.useCases.join(', ')} patterns.` : '',
      logo,
      palette,
      paletteName: index === 0 ? 'Recommended palette' : `${layout.name} palette`,
      pages: state?.projectPackage === 'launch' ? ['Home'] : structure.pages,
      sections: state?.projectPackage === 'launch' ? normalizeOnePageSections(structure.sections, structure.pages) : structure.sections,
      source: 'fallback',
    };
  });
}

export function normalizeDesignRecommendations(raw, state, count = 4) {
  const parsed = parseRecommendationJson(raw);
  const candidates = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
  const normalized = candidates
    .map((item, index) => normalizeRecommendation(item, state, index))
    .filter(Boolean);
  return normalized.length >= 3 ? normalized.slice(0, Math.max(3, Math.min(count, 4))) : fallbackDesignRecommendations(state, count);
}

export function designRecommendationsTask(state) {
  const packageName = state?.projectPackage === 'launch' ? 'Launch Site one-page package'
    : state?.projectPackage === 'signature' ? 'Signature Site multi-page package'
    : 'Growth Site multi-page package';
  const layoutList = siteLayouts.map((layout) => `${layout.id}: ${layout.name} - ${layout.model} - ${layout.tone}`).join('\n');
  const templateCandidates = recommendedTemplateReferences(state, 10);
  const templateList = templateCandidates.map((template) => [
    `${template.id}: ${template.name}`,
    `Use cases: ${(template.useCases || []).join(', ')}`,
    `Sections: ${(template.sectionPatterns || []).join(', ')}`,
    `Motion: ${(template.motionPatterns || []).join(', ') || 'none detected'}`,
    `Guidance: ${template.llmGuidance}`,
  ].join('. ')).join('\n');
  const pageInstruction = state?.projectPackage === 'launch'
    ? 'Launch Site must recommend Home only for pages and put About, Services, Contact, FAQ, Pricing, etc. into sections.'
    : 'Growth Site and Signature Site should recommend multiple pages where useful, normally 4 to 6 pages.';

  return [
    'You are deciding the client-facing design directions before production.',
    'Return JSON only. Do not include markdown fences.',
    `Package: ${packageName}. ${pageInstruction}`,
    'Choose 3 or 4 recommendations. They should be meaningfully different directions, not duplicates.',
    'Each recommendation must use one of the available base layout ids so the builder can render the direction.',
    'Each recommendation must also choose one baseTemplateId from the relevant template candidates. Use the template as the composition base/reference for section order, visual rhythm, Bootstrap behaviours, and motion patterns. Rebuild it through MicroAgency sections and original client copy; do not copy demo content.',
    'Each recommendation must include a logo object. Decide the business logo elements from the brief: icon, layout, container, font, primary, secondary, textColor, tagline, iconSize, radius, weight, and tracking. Use the logo generator catalogue from the capability context.',
    '',
    'Available base layouts:',
    layoutList,
    '',
    'Relevant template candidates selected from intake:',
    templateList || downloadedTemplateSummary(12),
    '',
    'Palette guidance for 2026-style recommendations: use modern monochrome for corporate/luxury restraint; earthy vibrancy for organic, community, nature and grounded brands; moody botanical greens for local trust and sustainability; electric indigo/cyan for SaaS and technical products; soft editorial neutrals for weddings, fashion, beauty and lifestyle; warm venue tones for restaurants and hospitality; wellness mist tones for health, care and calm services.',
    '',
    'JSON shape:',
    '{"recommendations":[{"layoutId":"local-service","baseTemplateId":"startbootstrap-small-business","baseTemplateName":"Small Business","templateReason":"Why this template is the best base for the intake.","logo":{"icon":"shield","layout":"horizontal","container":"rounded","font":"Inter","primary":"#173d35","secondary":"#18a058","textColor":"#0f172a","tagline":"Reliable service, clearly explained.","iconSize":92,"radius":24,"weight":800,"tracking":-0.5},"name":"Trust-led Local Booking","tone":"Friendly, reassuring, polished","rationale":"Why this direction fits the brief.","paletteName":"Fresh trust","palette":["#173d35","#18a058","#fff7ed","#eab308","#ffffff"],"pages":["Home","Services","About","FAQ","Contact"],"sections":["Hero","Trust / proof bar","Services","Benefits","Process","Testimonials","FAQ","Lead capture form"]}]}',
    '',
    'Rules: baseTemplateId must be an exact id from the template candidates; logo icon/layout/container/font must be valid generator options; palette must contain 3 to 5 real hex colours; pages and sections must be concrete customer-site structure; avoid agency words like example, sample, preview, customer website, visual direction, design direction in names/rationale.',
  ].join('\n');
}

export function recommendedTemplateReferences(state, limit = 8) {
  const text = `${state?.brief || ''}\n${state?.clientDetails || ''}`.toLowerCase();
  const desired = templatePreferenceFromText(text);
  const scored = downloadedTemplateLibrary.map((template, index) => {
    const haystack = [
      template.id,
      template.name,
      ...(template.useCases || []),
      ...(template.sectionPatterns || []),
      template.description,
      template.llmGuidance,
    ].join(' ').toLowerCase();
    let score = template.priority === 'high' ? 4 : template.priority === 'medium' ? 2 : 0;
    if (desired && haystack.includes(desired)) score += 12;
    for (const keyword of templateKeywordsForText(text)) {
      if (haystack.includes(keyword)) score += 5;
    }
    if (/portfolio|photography|gallery|creative|work/.test(text) && template.hasPortfolioGrid) score += 6;
    if (/blog|article|insight|news|content/.test(text) && template.hasBlog) score += 6;
    if (/shop|ecommerce|product|catalogue|store|sell products/.test(text) && template.hasShop) score += 6;
    if (/booking|contact|enquir|lead/.test(text) && template.hasContactForm) score += 3;
    if (/timeline|process|story|about/.test(text) && template.hasTimeline) score += 3;
    if (/animation|motion|rich|parallax|dynamic/.test(text) && template.hasScrollAnimation) score += 3;
    return { template, score, index };
  });
  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.max(3, Math.min(limit, 12)))
    .map((item) => item.template);
}

export function selectedTemplateReference(state = {}) {
  const selected = String(state.selectedTemplateId || '').trim();
  if (selected) {
    const direct = downloadedTemplateLibrary.find((template) => template.id === selected);
    if (direct) return direct;
  }
  return recommendedTemplateReferences(state, 1)[0] || null;
}

function templatePreferenceFromText(text) {
  const match = String(text || '').match(/template starting point:\s*([^\n]+)/i);
  const value = match?.[1]?.toLowerCase() || '';
  if (!value || /designer choose|recommend|not sure/.test(value)) return '';
  if (/portfolio|gallery|visual/.test(value)) return 'portfolio';
  if (/restaurant|menu|venue/.test(value)) return 'restaurant';
  if (/shop|store|catalogue|product/.test(value)) return 'shop';
  if (/blog|article|content/.test(value)) return 'blog';
  if (/landing|campaign|launch/.test(value)) return 'landing';
  if (/agency|service|business/.test(value)) return 'business';
  if (/resume|personal/.test(value)) return 'resume';
  return value;
}

function templateKeywordsForText(text) {
  const value = String(text || '').toLowerCase();
  const keywords = [];
  if (/restaurant|food|menu|cafe|bar|venue/.test(value)) keywords.push('restaurant', 'menu', 'business');
  if (/portfolio|photography|creative|designer|artist|gallery/.test(value)) keywords.push('portfolio', 'gallery', 'visual landing');
  if (/blog|article|insight|news|content/.test(value)) keywords.push('blog', 'article', 'content');
  if (/shop|ecommerce|product|catalogue|store/.test(value)) keywords.push('shop', 'product', 'catalogue');
  if (/agency|consultant|service|professional|local|trade/.test(value)) keywords.push('agency', 'business', 'landing page');
  if (/event|launch|campaign|webinar|conference/.test(value)) keywords.push('landing page', 'event');
  if (/resume|personal|cv/.test(value)) keywords.push('resume', 'portfolio');
  return keywords;
}

function templateForLayout(layout, candidates, index = 0) {
  const layoutHints = {
    'portfolio-studio': ['portfolio', 'gallery'],
    'restaurant-venue': ['restaurant', 'business'],
    'saas-product': ['landing page', 'business'],
    'local-service': ['business', 'agency'],
    'consultant-authority': ['agency', 'business'],
    'event-launch': ['landing page'],
    'education-course': ['blog', 'business'],
    'marketplace-directory': ['portfolio', 'business'],
  }[layout.id] || ['business'];
  return candidates.find((template) => {
    const useCases = (template.useCases || []).join(' ').toLowerCase();
    return layoutHints.some((hint) => useCases.includes(hint));
  }) || candidates[index % Math.max(1, candidates.length)] || null;
}

function sectionsFromTemplate(template) {
  if (!template) return [];
  const patterns = [
    ...(template.sectionPatterns || []),
    ...(template.useCases || []),
  ].join(' ').toLowerCase();
  const sections = [];
  if (/hero/.test(patterns)) sections.push('Hero');
  if (/services/.test(patterns)) sections.push('Services');
  if (/features/.test(patterns)) sections.push('Benefits');
  if (/portfolio|gallery|case/.test(patterns)) sections.push('Gallery');
  if (/process|timeline/.test(patterns)) sections.push('Process');
  if (/pricing/.test(patterns)) sections.push('Pricing');
  if (/blog|article/.test(patterns)) sections.push('Blog');
  if (/contact|lead form|form/.test(patterns)) sections.push('Lead capture form');
  if (/footer/.test(patterns)) sections.push('Final CTA');
  return uniqueItems(sections);
}

export function paletteOptionsForLayout(layout, state) {
  const base = normalizePalette(layout.palette);
  const brief = `${state?.brief || ''}\n${state?.clientDetails || ''}`.toLowerCase();
  const palettes = modernPaletteSet();
  const recommended = brief.match(/health|wellness|therapy|care|calm|yoga|skincare/) ? palettes.wellness
    : brief.match(/event|launch|bold|energy|festival/) ? palettes.electric
    : brief.match(/\b(restaurant|cafe|bar|venue|food|menu)\b/) ? palettes.warmVenue
    : brief.match(/wedding|bridal|bride|beauty|fashion|editorial/) ? palettes.softEditorial
    : brief.match(/local|service|trade|repair|salon/) ? palettes.botanical
    : brief.match(/premium|luxury|boutique|brand|jewellery/) ? palettes.luxury
    : brief.match(/\b(software|saas|app|apps|platform|tool|tools|tech)\b/) ? palettes.saas
    : brief.match(/nonprofit|community|sustainable|nature/) ? palettes.earthy
    : base;
  return uniquePalettes([
    { id: 'recommended', name: 'Mira recommended', colors: recommended },
    { id: 'modern-mono', name: 'Modern mono', colors: palettes.mono },
    { id: 'earthy-vibrancy', name: 'Earthy vibrancy', colors: palettes.earthy },
    { id: 'moody-botanical', name: 'Moody botanical', colors: palettes.botanical },
    { id: 'electric-saas', name: 'Electric SaaS', colors: palettes.saas },
    { id: 'soft-editorial', name: 'Soft editorial', colors: palettes.softEditorial },
    { id: 'wellness-mist', name: 'Wellness mist', colors: palettes.wellness },
    { id: 'luxury-neutral', name: 'Luxury neutral', colors: palettes.luxury },
    { id: 'warm-venue', name: 'Warm venue', colors: palettes.warmVenue },
  ]).slice(0, 6);
}

function modernPaletteSet() {
  return {
    mono: normalizePalette(['#0a0a0a', '#111111', '#ffffff', '#6b7280', '#f7f7f7']),
    earthy: normalizePalette(['#2f3a23', '#b7791f', '#fbf7ed', '#8b3a2b', '#f4e7d3']),
    botanical: normalizePalette(['#123524', '#2f6f5b', '#fbfaf4', '#c7a76c', '#eef5ed']),
    saas: normalizePalette(['#08111f', '#4f46e5', '#f8fafc', '#22d3ee', '#ffffff']),
    softEditorial: normalizePalette(['#111111', '#8a6a4f', '#fffaf5', '#d8c3ad', '#ffffff']),
    wellness: normalizePalette(['#164e63', '#2bb3a3', '#f3fbf9', '#f4a261', '#ffffff']),
    luxury: normalizePalette(['#1f130f', '#6b3f2a', '#fbf7ef', '#b08d57', '#ffffff']),
    warmVenue: normalizePalette(['#2f1b12', '#c2410c', '#fff7ed', '#f59e0b', '#ffffff']),
  };
}

export function recommendedStructure(layout, state) {
  const text = `${state?.brief || ''}\n${state?.clientDetails || ''}`.toLowerCase();
  let pages = ['Home', 'Services', 'About', 'FAQ', 'Contact'];
  let sections = ['Hero', 'Trust / proof bar', 'Services', 'Benefits', 'Process', 'Testimonials', 'FAQ', 'Lead capture form', 'Final CTA'];

  if (layout.id === 'saas-product' || /\b(software|saas|app|apps|platform|tool|tools)\b/.test(text)) {
    pages = ['Home', 'Pricing', 'Case Studies', 'FAQ', 'Contact'];
    sections = ['Hero', 'Trust / proof bar', 'Benefits', 'Featured products', 'Process', 'Pricing', 'Testimonials', 'FAQ', 'Lead capture form'];
  } else if (layout.id === 'restaurant-venue' || /\b(restaurant|cafe|bar|venue|food|menu)\b/.test(text)) {
    pages = ['Home', 'Menu', 'Gallery', 'Events', 'Contact'];
    sections = ['Hero', 'Featured products', 'Gallery', 'Testimonials', 'Location map', 'FAQ', 'Final CTA'];
  } else if (layout.id === 'portfolio-studio' || /portfolio|studio|creative|photography|designer|artist/.test(text)) {
    pages = ['Home', 'Gallery', 'Case Studies', 'About', 'Contact'];
    sections = ['Hero', 'Gallery', 'Services', 'Process', 'Testimonials', 'Lead capture form', 'Final CTA'];
  } else if (layout.id === 'education-course' || /course|training|school|academy/.test(text)) {
    pages = ['Home', 'Courses', 'Pricing', 'FAQ', 'Contact'];
    sections = ['Hero', 'Benefits', 'Process', 'Pricing', 'Testimonials', 'FAQ', 'Lead capture form'];
  } else if (layout.id === 'event-launch' || /event|conference|launch|ticket|festival/.test(text)) {
    pages = ['Home', 'Events', 'Pricing', 'FAQ', 'Contact'];
    sections = ['Hero', 'Trust / proof bar', 'Benefits', 'Process', 'Pricing', 'FAQ', 'Lead capture form', 'Final CTA'];
  }

  return {
    pages: uniqueItems(pages).slice(0, 6),
    sections: uniqueItems(sections).slice(0, 10),
  };
}

export function normalizePalette(colors = []) {
  const fallback = ['#10213f', '#2563eb', '#f8fafc', '#64748b', '#ffffff'];
  return [...colors, ...fallback]
    .filter((color) => /^#[0-9a-f]{6}$/i.test(String(color || '').trim()))
    .map((color) => color.trim())
    .slice(0, MAX_PALETTE_COLORS);
}

function hexToRgb(hex) {
  const value = String(hex || '').replace('#', '').trim();
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function srgbToLinear(value) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return 0.2126 * srgbToLinear(rgb.r) + 0.7152 * srgbToLinear(rgb.g) + 0.0722 * srgbToLinear(rgb.b);
}

export function contrastRatio(foreground, background) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

function pickReadableForeground(background, candidates = ['#0f172a', '#111827', '#ffffff', '#f8fafc']) {
  return candidates
    .map((color) => ({ color, ratio: contrastRatio(color, background) }))
    .sort((a, b) => b.ratio - a.ratio)[0]?.color || '#0f172a';
}

function ensureReadableColor(foreground, background, minRatio = 4.5) {
  if (contrastRatio(foreground, background) >= minRatio) return foreground;
  return pickReadableForeground(background);
}

function pickMutedForeground(background, preferred = '#64748b') {
  if (contrastRatio(preferred, background) >= 4.5) return preferred;
  return pickReadableForeground(background, ['#475569', '#334155', '#1f2937', '#0f172a', '#cbd5e1', '#f8fafc', '#ffffff']);
}

function readableThemeFromPalette(palette) {
  const [rawInk, accent, rawBg, secondary, rawSurface] = normalizePalette(palette);
  const bg = pickPageBackground(rawBg, rawSurface);
  const surface = pickSurface(rawSurface, rawBg, bg);
  const ink = ensureReadableColor(rawInk, bg);
  const cardInk = ensureReadableColor(rawInk, surface);
  const inputBg = contrastRatio('#ffffff', bg) >= 1.2 ? '#ffffff' : surface;
  return {
    ink,
    accent,
    accentInk: pickReadableForeground(accent),
    accentText: ensureReadableColor(accent, bg),
    bg,
    secondary,
    secondaryInk: pickReadableForeground(secondary),
    secondaryText: ensureReadableColor(secondary, bg),
    surface,
    cardInk,
    muted: pickMutedForeground(bg),
    cardMuted: pickMutedForeground(surface),
    inputBg,
    inputInk: ensureReadableColor(rawInk, inputBg),
  };
}

function pickPageBackground(preferred, surface) {
  const candidates = [preferred, surface, '#ffffff', '#f8fafc', '#fffaf2']
    .filter((color, index, values) => color && values.indexOf(color) === index);
  const usable = candidates.find((color) => luminance(color) >= 0.82 && contrastRatio('#111827', color) >= 8);
  return usable || candidates
    .map((color) => ({ color, luminance: luminance(color), contrast: contrastRatio('#111827', color) }))
    .sort((a, b) => b.contrast - a.contrast || b.luminance - a.luminance)[0]?.color || '#ffffff';
}

function pickSurface(preferred, fallback, background) {
  const candidates = [preferred, fallback, '#ffffff', '#f8fafc', '#fffaf2']
    .filter((color, index, values) => color && values.indexOf(color) === index);
  const usable = candidates.find((color) => contrastRatio('#111827', color) >= 7 && contrastRatio(color, background) >= 1.08);
  return usable || (background === '#ffffff' ? '#f8fafc' : '#ffffff');
}

function parseRecommendationJson(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;
  const direct = tryParseJson(text);
  if (direct) return direct;
  const match = text.match(/\{[\s\S]*\}/);
  return match ? tryParseJson(match[0]) : null;
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeRecommendation(item, state, index) {
  if (!item || typeof item !== 'object') return null;
  const layout = layoutFromRecommendation(item);
  if (!layout) return null;
  const templateCandidates = recommendedTemplateReferences(state, 10);
  const template = templateFromRecommendation(item, templateCandidates) || templateForLayout(layout, templateCandidates, index);
  const structure = recommendedStructure(layout, state);
  const palette = normalizePalette(Array.isArray(item.palette) ? item.palette : layout.palette);
  const logo = item.logo || item.brandLogo
    ? normalizeLogoConfig(item.logo || item.brandLogo, { state, layout, palette })
    : fallbackLogoConfig(state, layout, palette);
  const isOnePagePackage = state?.projectPackage === 'launch';
  const rawPages = uniqueItems(Array.isArray(item.pages) ? item.pages : structure.pages);
  const pages = isOnePagePackage ? ['Home'] : normalizePages(rawPages);
  const rawSections = uniqueItems(Array.isArray(item.sections) ? item.sections : structure.sections);
  const sections = isOnePagePackage ? normalizeOnePageSections(rawSections, rawPages.length ? rawPages : structure.pages) : rawSections.slice(0, 10);
  const name = cleanRecommendationText(item.name || layout.name, layout.name);
  const rationale = cleanRecommendationText(item.rationale || directionSummary(layout), directionSummary(layout));
  const tone = cleanRecommendationText(item.tone || layout.tone, layout.tone);
  return {
    id: `llm-${layout.id}-${index}`,
    layoutId: layout.id,
    name,
    tone,
    rationale,
    baseTemplateId: template?.id || '',
    baseTemplateName: cleanRecommendationText(item.baseTemplateName || item.templateName || template?.name || '', template?.name || ''),
    templateReason: cleanRecommendationText(item.templateReason || item.baseTemplateReason || (template ? `Uses ${template.name} as the composition reference.` : ''), template ? `Uses ${template.name} as the composition reference.` : ''),
    logo,
    palette,
    paletteName: cleanRecommendationText(item.paletteName || 'Recommended palette', 'Recommended palette'),
    pages,
    sections,
    source: 'llm',
  };
}

function templateFromRecommendation(item, candidates) {
  const requested = String(item.baseTemplateId || item.templateId || item.template || '').trim().toLowerCase();
  if (!requested) return null;
  return candidates.find((template) => template.id.toLowerCase() === requested)
    || downloadedTemplateLibrary.find((template) => template.id.toLowerCase() === requested)
    || null;
}

function layoutFromRecommendation(item) {
  const requested = String(item.layoutId || item.baseLayoutId || item.id || '').trim().toLowerCase();
  const byId = siteLayouts.find((layout) => layout.id === requested);
  if (byId) return byId;
  const name = String(item.layout || item.layoutName || item.name || '').toLowerCase();
  return siteLayouts.find((layout) => name.includes(layout.name.toLowerCase())) || null;
}

function cleanRecommendationText(value, fallback) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text || /example|sample|preview|customer website|visual direction|design direction/i.test(text)) return fallback;
  return text.slice(0, 180);
}

export function paletteLabel(color) {
  const value = String(color || '').toLowerCase();
  const names = {
    '#08111f': 'Midnight navy',
    '#0ea5e9': 'Sky blue',
    '#eef6ff': 'Soft blue',
    '#22c55e': 'Fresh green',
    '#ffffff': 'White',
    '#10213f': 'Deep navy',
    '#2563eb': 'Bright blue',
    '#f8fafc': 'Cloud white',
    '#64748b': 'Slate grey',
    '#173d35': 'Forest green',
    '#18a058': 'Leaf green',
    '#fff7ed': 'Warm cream',
    '#eab308': 'Golden yellow',
    '#171717': 'Charcoal',
    '#b7791f': 'Antique gold',
    '#faf7f0': 'Porcelain',
    '#6b7280': 'Warm grey',
    '#111827': 'Ink black',
    '#7c3aed': 'Royal violet',
    '#f5f3ff': 'Lavender mist',
    '#f43f5e': 'Rose red',
    '#fff1f2': 'Blush',
    '#2f1b12': 'Espresso',
    '#d97706': 'Amber',
    '#fff8eb': 'Vanilla',
    '#164e63': 'Teal slate',
    '#14b8a6': 'Sea green',
    '#f0fdfa': 'Mint white',
    '#f4a261': 'Soft coral',
    '#240046': 'Plum',
    '#ff5a5f': 'Coral red',
    '#fff7f7': 'Rose white',
    '#0f172a': 'Blue black',
    '#123524': 'Evergreen',
    '#f59e0b': 'Honey',
    '#fefce8': 'Ivory',
    '#1e3a8a': 'Royal blue',
    '#06b6d4': 'Cyan',
    '#eff6ff': 'Ice blue',
    '#12343b': 'Deep teal',
    '#2bb3a3': 'Aqua green',
    '#f3fbf9': 'Seafoam',
    '#f7c948': 'Sun yellow',
    '#1e1b4b': 'Indigo',
    '#ef4444': 'Signal red',
    '#0a0a0a': 'Black',
    '#f7f7f7': 'Soft white',
    '#2f3a23': 'Earth olive',
    '#f4e7d3': 'Clay linen',
    '#8b3a2b': 'Terracotta',
    '#2f6f5b': 'Jade green',
    '#f7f3ea': 'Warm ivory',
    '#c7a76c': 'Muted gold',
    '#4f46e5': 'Electric indigo',
    '#22d3ee': 'Bright cyan',
    '#efe9e1': 'Editorial cream',
    '#d8c3ad': 'Soft taupe',
    '#8a6a4f': 'Walnut',
    '#1f130f': 'Espresso black',
    '#6b3f2a': 'Rich brown',
    '#f7efe5': 'Warm porcelain',
    '#b08d57': 'Champagne',
    '#c2410c': 'Burnt orange',
  };
  return names[value] || value.toUpperCase();
}

export function directionSummary(layout) {
  const summaries = {
    'conversion-classic': 'A clear sales page that moves visitors from promise, to proof, to enquiry.',
    'local-service': 'A practical local business site built around trust, reviews, services, and fast contact.',
    'premium-editorial': 'A refined brand-led site with larger imagery, slower pacing, and polished storytelling.',
    'saas-product': 'A product-led site that explains features, outcomes, pricing, and the next action clearly.',
    'consultant-authority': 'An expert-led site that builds confidence through outcomes, method, and booking prompts.',
    'portfolio-studio': 'A visual portfolio direction for showing selected work and turning interest into enquiries.',
    'restaurant-venue': 'A visit-focused direction for menus, atmosphere, location, booking, and events.',
    'health-wellness': 'A calm, credible direction that explains care, credentials, services, and how to enquire.',
    'event-launch': 'A high-energy direction for dates, benefits, speakers, tickets, and urgent signup.',
    'marketplace-directory': 'A search-led direction that helps visitors compare categories, listings, and trust signals.',
    'nonprofit-campaign': 'A mission-led direction that makes impact, stories, and donation actions easy to understand.',
    'education-course': 'A structured course direction for outcomes, curriculum, pricing, proof, and enrolment.',
  };
  return summaries[layout?.id] || 'A complete website direction tailored to the brief, audience, and conversion goal.';
}

export function buildDesignSelectionMarkdown(layout, palette = layout.palette, structure = {}) {
  const colors = normalizePalette(palette);
  const pages = uniqueItems(structure.pages || []);
  const sections = uniqueItems(structure.sections || []);
  const image = placeholderForLayout(layout);
  const baseTemplate = structure.recommendation?.baseTemplateId
    ? downloadedTemplateLibrary.find((template) => template.id === structure.recommendation.baseTemplateId)
    : null;
  const logo = structure.recommendation?.logo ? normalizeLogoConfig(structure.recommendation.logo, { layout, palette: colors }) : null;
  return [
    `Selected layout: ${layout.name}`,
    `Layout model: ${layout.model}`,
    `Tone: ${layout.tone}`,
    baseTemplate ? `Base template reference: ${baseTemplate.name} (${baseTemplate.id})` : '',
    structure.recommendation?.templateReason ? `Base template reason: ${structure.recommendation.templateReason}` : '',
    baseTemplate ? `Base template patterns: ${(baseTemplate.sectionPatterns || []).join(', ')}` : '',
    baseTemplate ? `Base template motion: ${(baseTemplate.motionPatterns || []).join(', ') || 'none detected'}` : '',
    baseTemplate ? `Base template guidance: ${baseTemplate.llmGuidance}` : '',
    logo ? `Generated logo: icon ${logo.icon}, layout ${logo.layout}, container ${logo.container}, font ${logo.font}, colours ${logo.primary}, ${logo.secondary}, ${logo.textColor}, tagline "${logo.tagline}".` : '',
    `Palette: ${colors.join(', ')}`,
    `Palette max: ${MAX_PALETTE_COLORS} colours. Use them as text, primary, background, accent, and surface colours.`,
    `Recommended pages: ${pages.length ? pages.join(', ') : 'Home, Contact'}`,
    `Recommended sections: ${sections.length ? sections.join(', ') : 'Hero, Services, Contact details, Final CTA'}`,
    `Placeholder image: ${image.path} (${image.label})`,
    '',
    `Design system: ${componentLibrary.name}`,
    ...componentLibrary.principles.map((item) => `- ${item}`),
    '',
    'Component library:',
    ...componentLibrary.components.map((item) => `- ${item}`),
    '',
    'Developer instruction: build the final site from this selected design direction, base template reference, colour palette, pages, sections, and local placeholder image. Use the chosen base template as the composition reference for section order, rhythm, Bootstrap behaviours, and motion, but rebuild with MicroAgency sections, validated theme tokens, original client-specific copy, and local /placeholders assets where imagery is needed.',
  ].filter(Boolean).join('\n');
}

function pageContentMapFromState(state = {}) {
  const raw = String(state.outputs?.PageContent || '').trim();
  if (!raw) return {};
  const chunks = raw.split(/\n\s*---+\s*\n/g);
  return chunks.reduce((map, chunk) => {
    const match = chunk.match(/^\s*##\s+(.+?)\s*$/m);
    if (!match) return map;
    const page = match[1].trim();
    const body = chunk.slice(match.index + match[0].length).trim();
    const parsed = parsePageCopy(body);
    if (parsed.headline || parsed.lead || parsed.blocks.length) map[pageKey(page)] = parsed;
    return map;
  }, {});
}

function parsePageCopy(markdown) {
  const text = sanitizePageCopyText(markdown);
  const fields = {
    objective: fieldValue(text, 'Page objective'),
    intent: fieldValue(text, 'Visitor intent'),
    headline: fieldValue(text, 'Hero headline'),
    lead: fieldValue(text, 'Hero support copy') || fieldValue(text, 'Hero copy'),
    trust: fieldValue(text, 'Trust and proof') || fieldValue(text, 'Proof ideas'),
    cta: fieldValue(text, 'Primary CTA') || fieldValue(text, 'CTA copy'),
    blocks: [],
  };
  const blockPattern = /Content block\s+\d+\s*:\s*([^\n]+)\n([\s\S]*?)(?=\n\s*Content block\s+\d+\s*:|\n\s*Trust and proof\s*:|\n\s*Primary CTA\s*:|$)/gi;
  let match;
  while ((match = blockPattern.exec(text))) {
    const title = match[1].trim();
    const rawBody = match[2].trim();
    const ctaMatch = rawBody.match(/CTA idea\s*:\s*(.+)$/im);
    const body = rawBody
      .replace(/CTA idea\s*:\s*.+$/gim, '')
      .replace(/^[*-]\s*/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (title && body) fields.blocks.push({ title, body, cta: ctaMatch?.[1]?.trim() || fields.cta });
  }
  if (!fields.blocks.length) {
    const paragraphs = text
      .split(/\n{2,}/)
      .map((item) => cleanPageCopyLine(item.replace(/^#+\s*/, '').trim()))
      .filter((item) => item.length > 40 && !isPageCopyMetaLine(item));
    fields.blocks = paragraphs.slice(0, 4).map((paragraph, index) => ({
      title: titleFromParagraph(paragraph, index),
      body: paragraph.replace(/\s+/g, ' '),
      cta: fields.cta,
    }));
  }
  return fields;
}

function sanitizePageCopyText(value) {
  return String(value || '')
    .replace(/```[a-z0-9-]*\s*/gi, '')
    .replace(/```/g, '')
    .split('\n')
    .map((line) => cleanPageCopyLine(line))
    .filter((line) => !/^\s*#*\s*(home|about|services?|contact|faq|pricing|gallery|menu|events?)\s+page\s+content\b/i.test(line))
    .filter((line) => !/^\s*#*\s*page\s+content\s+for\b/i.test(line))
    .filter((line) => !/^\s*markdown\s*$/i.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanPageCopyLine(value) {
  return String(value || '')
    .replace(/^\s*[-*]\s+/, '')
    .replace(/^\s*#{1,6}\s*/, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*markdown\s*/i, '')
    .trim();
}

function isPageCopyMetaLine(value) {
  return /^(page objective|visitor intent|hero headline|hero support copy|hero copy|trust and proof|proof ideas|primary cta|cta copy)\s*:?\s*/i.test(value)
    || /\b(page content for|markdown)\b/i.test(value);
}

function titleFromParagraph(paragraph, index) {
  const firstSentence = String(paragraph || '').split(/[.!?]/)[0].trim();
  const title = firstSentence.split(/\s+/).slice(0, 6).join(' ');
  return title.length >= 8 ? title : (index === 0 ? 'Key information' : `Useful detail ${index + 1}`);
}

function fieldValue(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const value = String(text || '');
  const sameLine = value.match(new RegExp(`^\\s*(?:#+\\s*)?${escaped}\\s*(?::|-)?\\s+(.+)$`, 'im'));
  if (sameLine?.[1]?.trim()) return cleanPageCopyLine(sameLine[1]);
  const nextLine = value.match(new RegExp(`^\\s*(?:#+\\s*)?${escaped}\\s*(?::|-)?\\s*$\\n+([^\\n]+)`, 'im'));
  return nextLine?.[1] ? cleanPageCopyLine(nextLine[1]) : '';
}

function pageCopyFor(pageCopy = {}, page) {
  return pageCopy[pageKey(page)] || null;
}

function pageKey(page) {
  return String(page || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'home';
}

export function buildExampleSite(layout, state, palette = layout.palette, options = {}) {
  const brief = parseBrief(state?.brief || state?.clientDetails || '');
  const business = brief.businessName || state?.projectName || 'Client Website';
  const industry = brief.industry || 'professional services';
  const audience = brief.audience || 'busy customers who want a clear answer fast';
  const goal = brief.goal || 'turn visitors into confident enquiries';
  const offer = brief.offer || industry;
  const theme = readableThemeFromPalette(palette);
  const image = placeholderForLayout(layout, state);
  const examples = exampleContentFor(layout, { business, industry, audience, goal, offer });
  const pageCopy = pageContentMapFromState(state);
  const baseTemplate = selectedTemplateReference(state);
  const logo = normalizeLogoConfig(state.selectedLogoConfig || fallbackLogoConfig(state, layout, palette), { state, layout, palette, company: business });
  const structure = recommendedStructure(layout, state);
  const isOnePagePackage = state?.projectPackage === 'launch';
  const sections = uniqueItems([...(state?.selectedSiteSections?.length ? state.selectedSiteSections : structure.sections), ...sectionsFromTemplate(baseTemplate)]).slice(0, 10);
  const pages = isOnePagePackage ? ['Home'] : normalizePages(state?.selectedSitePages?.length ? state.selectedSitePages : structure.pages);
  const onePageSections = isOnePagePackage ? normalizeOnePageSections(sections, structure.pages) : [];
  if (!isOnePagePackage && !options.preview) {
    return buildMultiPageSitePackage({ layout, state, business, industry, audience, goal, offer, image, examples, pages, sections, theme, pageCopy, baseTemplate, logo });
  }
  const isMultiPage = !isOnePagePackage;
  const isPreview = Boolean(options.preview);
  const navLabel = isPreview ? 'Design option' : '';
  const eyebrow = isPreview ? `${layout.name} direction` : `${business}`;
  const homeCopy = pageCopyFor(pageCopy, 'Home');
  const navItems = isOnePagePackage ? ['Home', ...onePageSections] : pages;
  const ctaTarget = slugify(navItems.find((item) => /contact|book/i.test(item)) || 'Contact');
  const ctaHref = isMultiPage ? `#/${ctaTarget}` : `#${ctaTarget}`;
  const homeClass = isMultiPage ? 'hero site-page active' : 'hero';
  const heroTags = customerTagsFor({ business, audience, goal, offer, layout });
  const pageSections = (isOnePagePackage ? onePageSections : pages.filter((page) => page.toLowerCase() !== 'home'))
    .map((page) => {
      const section = pageSectionFor(page, { business, industry, audience, goal, offer, layout, examples, image, ctaTarget, ctaHref, pageCopy });
      return isMultiPage ? asPagePanel(section) : section;
    })
    .join('\n');
  const navLinks = navItems.map((page) => {
    const slug = slugify(page);
    return `<li class="nav-item"><a class="nav-link" href="${isMultiPage ? '#/' : '#'}${escapeHtml(slug)}" data-page-link="${escapeHtml(slug)}">${escapeHtml(page)}</a></li>`;
  }).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(business)} - Website</title>
<link href="${BOOTSTRAP_CSS}" rel="stylesheet">
<style>
${siteCss(theme)}
${siteMotionCss()}
</style>
</head>
<body>
<div class="shell">
<nav class="navbar navbar-expand-md site-nav" aria-label="Main navigation"><a class="navbar-brand" href="${isMultiPage ? '#/home' : '#home'}">${renderNavLogo(logo, { idPrefix: `${business}-preview-logo`, title: `${business} logo` })}<span class="sr-only">${escapeHtml(business)}</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#siteNavbar" aria-controls="siteNavbar" aria-expanded="false" aria-label="Open menu"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="siteNavbar"><ul class="navbar-nav ms-auto align-items-md-center gap-md-2">${navLinks}</ul>${navLabel ? `<span class="nav-label ms-md-3">${escapeHtml(navLabel)}</span>` : ''}</div></nav>
<main>
<section class="${homeClass}" id="home">
<div><div class="eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(homeCopy?.headline || headlineFor(layout, business, goal, audience))}</h1><p>${escapeHtml(homeCopy?.lead || copyFor(layout, audience, offer, goal))}</p><div class="tag-row">${heroTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div><a class="button" href="${escapeHtml(ctaHref)}">${escapeHtml(homeCopy?.cta || 'Start an enquiry')}</a></div>
<aside class="panel image-card parallax-media depth-panel float-card" data-parallax="0.12"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}"><div class="image-caption">${escapeHtml(heroImageCaptionFor(business, offer))}</div></aside>
</section>
${pageSections}
</main>
</div>
<script>
var MULTI_PAGE_SITE = ${isMultiPage ? 'true' : 'false'};
function showPage(id) {
  var targetId = id || 'home';
  document.querySelectorAll('.site-page').forEach(function(page) {
    page.classList.toggle('active', page.id === targetId);
  });
  document.querySelectorAll('[data-page-link]').forEach(function(link) {
    link.classList.toggle('active', link.getAttribute('data-page-link') === targetId);
  });
  if (MULTI_PAGE_SITE) window.scrollTo({ top: 0, behavior: 'smooth' });
}
if (MULTI_PAGE_SITE) {
  showPage((location.hash || '#/home').replace(/^#\\/?/, '') || 'home');
}
document.addEventListener('click', function(event) {
  var link = event.target.closest && event.target.closest('a[href^="#"]');
  if (!link) return;
  var href = link.getAttribute('href');
  if (MULTI_PAGE_SITE && href.indexOf('#/') === 0) {
    var pageId = decodeURIComponent(href.slice(2)) || 'home';
    if (!document.getElementById(pageId)) return;
    event.preventDefault();
    showPage(pageId);
    if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#/' + pageId);
    return;
  }
  var id = decodeURIComponent(href.slice(1));
  var target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + id);
});
</script>
<script>${siteMotionScript()}</script>
<script src="${BOOTSTRAP_JS}"></script>
</body>
</html>`;
}

function buildMultiPageSitePackage({ layout, business, industry, audience, goal, offer, image, examples, pages, sections, theme, pageCopy = {}, baseTemplate = null, logo = null }) {
  const navItems = normalizePages(pages);
  const ctaPage = navItems.find((item) => /contact|book/i.test(item)) || 'Contact';
  const ctaHref = fileNameForPage(ctaPage);
  const css = `${siteCss(theme)}\n${siteMotionCss()}`;
  const files = {};
  navItems.forEach((page) => {
    const fileName = fileNameForPage(page);
    const navLinks = navItems.map((item) => {
      const href = fileNameForPage(item);
      const active = href === fileName ? ' class="active"' : '';
      const aria = href === fileName ? ' aria-current="page"' : '';
      return `<li class="nav-item"><a class="nav-link${active ? ' active' : ''}" href="${escapeHtml(href)}"${aria}>${escapeHtml(item)}</a></li>`;
    }).join('');
    const body = page.toLowerCase() === 'home'
      ? homePageBody({ layout, business, industry, audience, goal, offer, image, examples, sections, ctaHref, pageCopy })
      : pageBodyFor(page, { business, industry, audience, goal, offer, layout, examples, image, ctaHref, pageCopy });
    files[fileName] = siteDocument({
      title: `${business} - ${page}`,
      business,
      navLinks,
      css,
      body,
      baseTemplate,
      logo,
    });
  });
  return createSitePackageString(files, 'index.html');
}

function siteDocument({ title, business, navLinks, css, body, baseTemplate = null, logo = null }) {
  const templateMeta = baseTemplate ? `<meta name="microagency-template-base" content="${escapeHtml(`${baseTemplate.name} (${baseTemplate.id})`)}">` : '';
  const templateComment = baseTemplate ? `<!-- MicroAgency template base: ${escapeHtml(baseTemplate.name)} (${escapeHtml(baseTemplate.id)}). Rebuilt with MicroAgency sections and original customer content. -->\n` : '';
  const brandLogo = renderNavLogo(logo || { company: business }, { idPrefix: `${business}-logo`, title: `${business} logo` });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
${templateMeta}
<link href="${BOOTSTRAP_CSS}" rel="stylesheet">
<style>${css}</style>
</head>
<body>
${templateComment}<div class="shell">
<nav class="navbar navbar-expand-md site-nav" aria-label="Main navigation"><a class="navbar-brand" href="index.html">${brandLogo}<span class="sr-only">${escapeHtml(business)}</span></a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#siteNavbar" aria-controls="siteNavbar" aria-expanded="false" aria-label="Open menu"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="siteNavbar"><ul class="navbar-nav ms-auto align-items-md-center gap-md-2">${navLinks}</ul></div></nav>
<main>${body}</main>
</div>
<script>${siteMotionScript()}</script>
<script src="${BOOTSTRAP_JS}"></script>
</body>
</html>`;
}

function homePageBody({ layout, business, audience, goal, offer, image, examples, sections, ctaHref, pageCopy = {} }) {
  const sectionTags = customerTagsFor({ business, audience, goal, offer, layout });
  const homeCopy = pageCopyFor(pageCopy, 'Home');
  const homeBlocks = completeContentBlocks(homeCopy?.blocks, examples.cards);
  const overviewTitle = homeBlocks[0]?.title || examples.servicesTitle;
  const overviewLead = homeBlocks[0]?.body || homeBlocks[0]?.text || examples.servicesLead;
  const overviewCards = homeBlocks.slice(0, 6);
  return `<section class="hero" id="home">
<div><div class="eyebrow">${escapeHtml(business)}</div><h1>${escapeHtml(homeCopy?.headline || headlineFor(layout, business, goal, audience))}</h1><p>${escapeHtml(homeCopy?.lead || copyFor(layout, audience, offer, goal))}</p><div class="tag-row">${sectionTags.map((section) => `<span class="tag">${escapeHtml(section)}</span>`).join('')}</div><a class="button" href="${escapeHtml(ctaHref)}">${escapeHtml(homeCopy?.cta || 'Start an enquiry')}</a></div>
<aside class="panel image-card parallax-media depth-panel float-card" data-parallax="0.12"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}"><div class="image-caption">${escapeHtml(heroImageCaptionFor(business, offer))}</div></aside>
</section>
<section class="section"><span class="page-kicker">Overview</span><h2>${escapeHtml(overviewTitle)}</h2><p>${escapeHtml(overviewLead)}</p><div class="grid">${overviewCards.map((card) => `<div class="card"><b>${escapeHtml(card.title)}</b><span>${escapeHtml(card.body || card.text)}</span></div>`).join('')}</div></section>
<section class="section"><span class="page-kicker">Why it works</span><h2>Useful information before visitors commit</h2><p>${escapeHtml(business)} answers the practical questions before asking for the enquiry: what is available, who it is for, what happens next, and why the business can be trusted.</p><div class="grid"><div class="card"><b>Plain-language offer</b><span>${escapeHtml(business)} explains what is included, who it suits, and what makes the service worth enquiring about.</span></div><div class="card"><b>Practical proof</b><span>Reviews, response expectations, process notes, and realistic outcomes sit close to the key decisions.</span></div><div class="card"><b>Mobile-first contact</b><span>Every page keeps the next action easy to find, with a short route to send details or ask a question.</span></div></div></section>
<section class="section"><span class="page-kicker">Process</span><h2>A clear path from interest to action</h2><div class="steps"><div class="step">Understand the offer and who it is for.</div><div class="step">Review the details, proof, and practical fit.</div><div class="step">Send an enquiry when the next step is clear.</div></div><a class="button" href="${escapeHtml(ctaHref)}">Contact ${escapeHtml(business)}</a></section>
<section class="section"><span class="page-kicker">Common questions</span><h2>Answers that reduce hesitation</h2><div class="grid"><div class="card"><b>What should I send?</b><span>Share what you need, timing, location if relevant, and anything that would affect the recommendation.</span></div><div class="card"><b>How quickly will I hear back?</b><span>Set a clear response expectation so visitors know when the next useful answer should arrive.</span></div><div class="card"><b>Can I ask before deciding?</b><span>Yes. The first enquiry can be a fit check, not a commitment to buy immediately.</span></div></div></section>
<section class="section contact"><div><span class="page-kicker">Contact</span><h2>${escapeHtml(examples.contactTitle)}</h2><p>${escapeHtml(examples.contactText)}</p><div class="tag-row"><span class="tag">Fast reply</span><span class="tag">Clear recommendation</span><span class="tag">No pressure</span></div></div>${contactForm({ business })}</section>`;
}

function customerTagsFor({ business, audience, goal, offer, layout }) {
  const text = `${business} ${audience} ${goal} ${offer} ${layout?.id || ''}`.toLowerCase();
  if (/wedding|bride|bridal|photography|portfolio|gallery|creative/.test(text)) {
    return ['Selected work', 'Clear packages', 'Easy enquiry'];
  }
  if (/\b(restaurant|cafe|bar|venue|menu|food|dining)\b/.test(text)) {
    return ['Menu highlights', 'Opening details', 'Simple booking'];
  }
  if (/\b(software|saas|app|platform|tool|tech)\b/.test(text)) {
    return ['Product benefits', 'Workflow clarity', 'Book a demo'];
  }
  if (/health|wellness|therapy|care|clinic|beauty/.test(text)) {
    return ['Reassuring care', 'Clear services', 'Book a visit'];
  }
  if (/trade|repair|local|service|builder|plumb|electric|clean/.test(text)) {
    return ['Local service', 'Trusted process', 'Fast quote'];
  }
  return ['Clear services', 'Useful proof', 'Easy contact'];
}

function completeContentBlocks(blocks = [], fallbackBlocks = []) {
  const cleanBlocks = (blocks || [])
    .map((block) => ({
      title: cleanPageCopyLine(block.title || ''),
      body: cleanPageCopyLine(block.body || block.text || ''),
      cta: cleanPageCopyLine(block.cta || ''),
    }))
    .filter((block) => block.title && block.body);
  const cleanFallbacks = (fallbackBlocks || [])
    .map((block) => ({
      title: cleanPageCopyLine(block.title || ''),
      body: cleanPageCopyLine(block.body || block.text || ''),
      cta: cleanPageCopyLine(block.cta || ''),
    }))
    .filter((block) => block.title && block.body);
  return uniqueItemsByTitle([...cleanBlocks, ...cleanFallbacks]).slice(0, 6);
}

function uniqueItemsByTitle(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item.title || '').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function siteCss(theme) {
  return `:root{--ink:${theme.ink};--accent:${theme.accent};--accent-ink:${theme.accentInk};--accent-text:${theme.accentText};--bg:${theme.bg};--secondary:${theme.secondary};--secondary-ink:${theme.secondaryInk};--secondary-text:${theme.secondaryText};--card:${theme.surface};--card-ink:${theme.cardInk};--muted:${theme.muted};--card-muted:${theme.cardMuted};--input-bg:${theme.inputBg};--input-ink:${theme.inputInk};--line:rgba(15,23,42,.14);--radius:20px;--space:clamp(18px,4vw,56px);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);line-height:1.5;color:var(--ink);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif}a{color:inherit}.shell{width:min(1120px,calc(100% - 32px));margin:auto}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.site-nav{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 92%,white);backdrop-filter:blur(14px);padding:12px 0;font-weight:800}.site-nav .navbar-brand{font-size:20px;font-weight:950;color:var(--ink);display:inline-flex;align-items:center;max-width:min(260px,62vw);padding:0}.brand-logo{display:block;width:min(240px,58vw);height:52px}.site-nav .nav-link{color:var(--muted);border:1px solid transparent;border-radius:999px;padding:8px 10px;font-size:14px;font-weight:850}.site-nav .nav-link:hover,.site-nav .nav-link.active{border-color:var(--line);color:var(--card-ink);background:var(--card)}.site-nav .navbar-toggler{border-color:var(--line);border-radius:14px;background:var(--card);color:var(--card-ink);box-shadow:none}.nav-label{color:var(--accent-text);font-weight:900}.hero{padding:var(--space) 0;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(20px,5vw,64px);align-items:center}.site-page{display:none}.site-page.active{display:grid}.section.site-page.active{display:block}.eyebrow{color:var(--accent-text);font-weight:900;text-transform:uppercase;font-size:12px;letter-spacing:0}.hero h1{font-size:clamp(34px,7vw,76px);line-height:.94;margin:10px 0 18px;letter-spacing:0}.hero p{font-size:clamp(16px,2vw,21px);color:var(--muted);max-width:62ch}.button{display:inline-flex;margin-top:14px;background:var(--accent);color:var(--accent-ink);text-decoration:none;border:0;border-radius:999px;padding:13px 18px;font-weight:900;cursor:pointer}.button.secondary{background:var(--secondary);color:var(--secondary-ink)}.button:focus-visible,.input:focus-visible,.nav-link:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 42%,white);outline-offset:3px}.panel{background:var(--card);color:var(--card-ink);border:1px solid var(--line);border-radius:var(--radius);padding:24px;box-shadow:0 24px 70px rgba(15,23,42,.12)}.metric{font-size:38px;font-weight:950;color:var(--secondary-text)}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:28px 0}.card{background:var(--card);color:var(--card-ink);border:1px solid var(--line);border-radius:var(--radius);padding:20px}.card b{display:block;margin-bottom:7px}.card span{color:var(--card-muted)}.section p{color:var(--muted)}.section{padding:54px 0;scroll-margin-top:86px;animation:section-in .55s ease both}.section h2{font-size:clamp(26px,4vw,44px);line-height:1;margin:0 0 14px}.page-kicker{color:var(--accent-text);font-weight:900;text-transform:uppercase;font-size:12px}.steps{counter-reset:step;display:grid;gap:12px}.step{counter-increment:step;display:flex;gap:14px;align-items:flex-start}.step:before{content:counter(step);background:var(--accent);color:var(--accent-ink);border-radius:50%;width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;font-weight:900}.contact{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}.form{display:grid;gap:12px}.form label{display:grid;gap:6px;font-weight:850;color:var(--card-ink)}.input{width:100%;border:1px solid var(--line);border-radius:14px;padding:13px;background:var(--input-bg);color:var(--input-ink)}.tag-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.tag{background:var(--accent);border:1px solid transparent;border-radius:999px;padding:8px 10px;font-weight:800;color:var(--accent-ink);font-size:13px}.image-card{position:relative;overflow:hidden;min-height:360px;padding:0}.image-card img{width:100%;height:100%;min-height:360px;object-fit:cover;display:block}.image-card:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.42))}.image-caption{position:absolute;left:18px;right:18px;bottom:18px;color:white;z-index:2;font-weight:900}.media-strip{display:grid;grid-template-columns:1.1fr .9fr;gap:14px;align-items:stretch}.media-strip img{width:100%;height:260px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--line)}@keyframes section-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.section{animation:none}html{scroll-behavior:auto}}@media(max-width:760px){.hero,.contact,.grid,.media-strip{grid-template-columns:1fr}.hero h1{font-size:42px}.site-nav .navbar-collapse{padding-top:10px}.site-nav .navbar-nav{gap:6px}.brand-logo{height:46px;width:min(220px,56vw)}}`;
}

function parseBrief(text) {
  const fields = {};
  String(text || '').split('\n').forEach((line) => {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) return;
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key.includes('business') || key.includes('client name')) fields.businessName = value;
    else if (key.includes('industry')) fields.industry = value;
    else if (key.includes('audience') || key.includes('customer')) fields.audience = value;
    else if (key.includes('goal')) fields.goal = value;
    else if (key.includes('offer') || key.includes('service')) fields.offer = value;
  });
  return fields;
}

function headlineFor(layout, business, goal, audience) {
  if (layout.id.includes('event')) return `${business} built for attention and action`;
  if (layout.id.includes('premium')) return `${business}, presented with clarity and confidence`;
  if (layout.id.includes('marketplace')) return `Find the right answer with ${business}`;
  if (/showcase|present|display/i.test(goal)) return `${business} presented clearly for ${audience}`;
  return `${business} built to ${goal}`;
}

function copyFor(layout, audience, offer, goal) {
  return `Built for ${audience}, with ${offer} presented clearly and a simple path to ${goalAsNounPhrase(goal)}.`;
}

function goalAsNounPhrase(goal) {
  const text = String(goal || 'the next enquiry').trim();
  const replacements = [
    [/^get\b/i, 'getting'],
    [/^increase\b/i, 'increasing'],
    [/^book\b/i, 'booking'],
    [/^showcase\b/i, 'showcasing'],
    [/^generate\b/i, 'generating'],
    [/^receive\b/i, 'receiving'],
    [/^turn\b/i, 'turning'],
    [/^launch\b/i, 'launching'],
    [/^sell\b/i, 'selling'],
    [/^grow\b/i, 'growing'],
    [/^build\b/i, 'building'],
  ];
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(text)) return text.replace(pattern, replacement);
  }
  return text;
}

function heroImageCaptionFor(business, offer) {
  return `${business} - ${offer}`;
}

function metricFor(layout) {
  if (layout.id.includes('event')) return '01';
  if (layout.id.includes('marketplace')) return '10+';
  if (layout.id.includes('premium')) return 'A+';
  return '3x';
}

function normalizePages(pages) {
  const values = uniqueItems(pages?.length ? pages : ['Home', 'Services', 'About', 'FAQ', 'Contact']);
  const withoutHome = values.filter((page) => page.toLowerCase() !== 'home');
  const withHome = ['Home', ...withoutHome];
  return withHome.some((page) => page.toLowerCase() === 'contact') ? withHome.slice(0, 8) : [...withHome, 'Contact'].slice(0, 8);
}

function normalizeOnePageSections(sections, recommendedPages = []) {
  const pageSections = uniqueItems(recommendedPages)
    .filter((page) => page.toLowerCase() !== 'home')
    .map((page) => page === 'Contact' ? 'Contact details' : page);
  const values = uniqueItems([...sections, ...pageSections, 'Final CTA'])
    .filter((section) => !/^hero$/i.test(section));
  const hasContact = values.some((section) => /contact|book/i.test(section));
  return (hasContact ? values : [...values, 'Contact details']).slice(0, 9);
}

function pageSectionFor(page, context) {
  const id = slugify(page);
  const lower = page.toLowerCase();
  const copy = pageCopyFor(context.pageCopy, page);
  if (copy?.blocks?.length || copy?.headline || copy?.lead) return contentDrivenPageSection(id, page, copy, context);
  if (lower.includes('service')) return servicesSection(id, context);
  if (lower.includes('pricing')) return pricingSection(id, context);
  if (lower.includes('case')) return caseStudiesSection(id, context);
  if (lower.includes('gallery')) return gallerySection(id, context);
  if (lower.includes('menu')) return menuSection(id, context);
  if (lower.includes('event')) return eventsSection(id, context);
  if (lower.includes('course')) return coursesSection(id, context);
  if (lower.includes('faq')) return faqSection(id, context);
  if (lower.includes('book')) return bookingSection(id, context);
  if (lower.includes('contact')) return contactSection(id, context);
  if (lower.includes('about')) return aboutSection(id, context);
  return genericPageSection(id, page, context);
}

function contentDrivenPageSection(id, page, copy, context) {
  const { business, offer, ctaHref } = context;
  const fallbackBlocks = [
    { title: `What ${business} offers`, body: `${business} helps visitors understand ${offer} clearly and choose the right next step.`, cta: copy.cta || 'Start an enquiry' },
    { title: 'What to expect', body: 'The page answers practical questions around fit, timing, support, and the information needed for a useful response.', cta: copy.cta || 'Ask a question' },
    { title: 'Next step', body: 'Visitors can send a short enquiry with enough context for a helpful reply.', cta: copy.cta || 'Contact us' },
  ];
  const blocks = completeContentBlocks(copy.blocks, fallbackBlocks);
  const isContact = /contact|book/i.test(page);
  return `<section class="section${isContact ? ' contact' : ''}" id="${escapeHtml(id)}"><div><span class="page-kicker">${escapeHtml(page)}</span><h2>${escapeHtml(copy.headline || `${page} for ${business}`)}</h2><p>${escapeHtml(copy.lead || copy.objective || `${offer} from ${business}, explained in practical terms.`)}</p><div class="grid">${blocks.slice(0, 6).map((block) => `<div class="card"><b>${escapeHtml(block.title)}</b><span>${escapeHtml(block.body || block.text)}</span>${block.cta ? `<a class="button secondary" href="${escapeHtml(ctaHref)}">${escapeHtml(block.cta)}</a>` : ''}</div>`).join('')}</div>${copy.trust ? `<div class="panel"><b>Why people can enquire with confidence</b><p>${escapeHtml(copy.trust)}</p></div>` : ''}</div>${isContact ? contactForm(context) : ''}</section>`;
}

function pageBodyFor(page, context) {
  const id = slugify(page);
  const lower = String(page || '').toLowerCase();
  const primary = pageSectionFor(page, context);
  if (lower.includes('contact') || lower.includes('book')) {
    return `${primary}${pageTrustSection(`${id}-trust`, context)}${pageFaqSection(`${id}-faq`, context)}`;
  }
  if (lower.includes('faq')) {
    return `${primary}${pageTrustSection(`${id}-trust`, context)}${pageCtaSection(`${id}-next`, context)}`;
  }
  return `${primary}${pageTrustSection(`${id}-trust`, context)}${pageFaqSection(`${id}-faq`, context)}${pageCtaSection(`${id}-next`, context)}`;
}

function asPagePanel(sectionHtml) {
  return sectionHtml.replace('<section class="section', '<section class="section site-page');
}

function pageTrustSection(id, { business, audience, offer, goal }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Trust</span><h2>Why ${escapeHtml(audience)} can take the next step</h2><div class="grid"><div class="card"><b>Clear fit</b><span>${escapeHtml(business)} makes it obvious who ${escapeHtml(offer)} is for and what information is needed before a useful recommendation can be made.</span></div><div class="card"><b>Realistic expectations</b><span>Visitors can see common timings, decision points, and what happens after the first enquiry instead of guessing.</span></div><div class="card"><b>Focused outcome</b><span>Every page connects the information back to the goal: ${escapeHtml(goal)}.</span></div></div></section>`;
}

function pageFaqSection(id, { business, offer }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Helpful details</span><h2>Before you contact ${escapeHtml(business)}</h2><div class="grid"><div class="card"><b>What is included?</b><span>${escapeHtml(offer)} can be shaped around the customer's timing, priorities, and level of support needed.</span></div><div class="card"><b>What should I prepare?</b><span>A short message with timing, location if relevant, budget range if useful, and must-have details is enough to start.</span></div><div class="card"><b>What happens next?</b><span>The team reviews the details, asks any missing questions, and recommends the most practical route.</span></div></div></section>`;
}

function pageCtaSection(id, { business, ctaHref }) {
  return `<section class="section" id="${escapeHtml(id)}"><div class="panel"><span class="page-kicker">Next step</span><h2>Ready to ask ${escapeHtml(business)}?</h2><p>Send the essentials and get a clear response with the next useful action. Keep the message short, practical, and focused on what you need.</p><a class="button" href="${escapeHtml(ctaHref)}">Start an enquiry</a></div></section>`;
}

function servicesSection(id, context) {
  const { business, audience, goal, offer } = context;
  const services = serviceCardsFor(context);
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Services</span><h2>${escapeHtml(`${offer} shaped around what ${audience} need`)}</h2><p>${escapeHtml(`${business} gives visitors enough detail to understand the service, compare the right level of support, and move toward ${goalAsNounPhrase(goal)} with confidence.`)}</p><div class="grid">${services.map((card) => `<div class="card"><b>${escapeHtml(card.title)}</b><span>${escapeHtml(card.text)}</span><a class="button secondary" href="${escapeHtml(context.ctaHref)}">${escapeHtml(card.cta)}</a></div>`).join('')}</div><div class="panel"><span class="page-kicker">How it works</span><h2>A simple route from first enquiry to clear next step</h2><div class="steps"><div class="step">Share the key details so ${escapeHtml(business)} can understand the need, timing, and preferred outcome.</div><div class="step">Get a practical recommendation that explains the best-fit service and any useful options.</div><div class="step">Confirm the route, receive the next actions, and keep communication clear from the start.</div></div></div></section>`;
}

function aboutSection(id, { business, industry, audience, offer, image }) {
  return `<section class="section media-strip" id="${escapeHtml(id)}"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}"><div class="panel"><span class="page-kicker">About</span><h2>Built around what ${escapeHtml(audience)} need to know</h2><p>${escapeHtml(business)} works in ${escapeHtml(industry)} with a clear focus on ${escapeHtml(offer)}. Visitors can see who the business helps, what standards it works to, and how customers are supported before and after they enquire.</p><div class="steps"><div class="step">Straightforward advice before customers commit.</div><div class="step">Clear expectations around timing, fit, and next steps.</div><div class="step">A practical route to ask questions or request support.</div></div></div></section>`;
}

function pricingSection(id, { business, offer, ctaHref }) {
  const tiers = [
    { name: 'Starter', text: `A focused route for customers who need the essentials around ${offer}, a clear recommendation, and a simple next step.` },
    { name: 'Standard', text: `A fuller option with more guidance, stronger support, and enough detail for customers comparing ${offer}.` },
    { name: 'Complete', text: 'The most supported route for customers who want priority response, extra guidance, and a more complete handover.' },
  ];
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Pricing</span><h2>Simple ways to start with ${escapeHtml(business)}</h2><p>Customers can compare common routes, understand what affects the quote, and choose the next step without pressure.</p><div class="grid">${tiers.map((tier) => `<div class="card"><b>${escapeHtml(tier.name)}</b><span>${escapeHtml(tier.text)}</span><a class="button" href="${escapeHtml(ctaHref)}">Ask about ${escapeHtml(tier.name)}</a></div>`).join('')}</div><div class="panel"><b>What can affect the final price</b><p>Scope, timing, location, quantity, preparation, and the level of support can all change the recommendation. A short enquiry gives ${escapeHtml(business)} enough context to respond properly.</p></div></section>`;
}

function caseStudiesSection(id, { business, goal }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Case studies</span><h2>Proof that helps visitors decide</h2><div class="grid"><div class="card"><b>Recent customer win</b><span>${escapeHtml(business)} helped a customer move from browsing to enquiry with a clearer offer and direct next step.</span></div><div class="card"><b>Before and after</b><span>A clear comparison of the challenge, the work, and the improvement visitors can understand quickly.</span></div><div class="card"><b>Outcome focus</b><span>Each story connects the work back to the goal: ${escapeHtml(goal)}.</span></div></div></section>`;
}

function gallerySection(id, { image }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Gallery</span><h2>Visual highlights</h2><div class="grid"><div class="card"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}" style="width:100%;border-radius:16px"></div><div class="card"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}" style="width:100%;border-radius:16px"></div><div class="card"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}" style="width:100%;border-radius:16px"></div></div></section>`;
}

function menuSection(id, { business }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Menu</span><h2>${escapeHtml(business)} menu highlights</h2><div class="grid"><div class="card"><b>Signature option</b><span>A customer favourite with a short description, seasonal details, and a clear price.</span></div><div class="card"><b>Seasonal feature</b><span>A timely menu item or promotion gives regular visitors a fresh reason to book.</span></div><div class="card"><b>Group choice</b><span>A useful option for families, teams, groups, or repeat visitors.</span></div></div></section>`;
}

function eventsSection(id, { business }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Events</span><h2>Upcoming moments at ${escapeHtml(business)}</h2><div class="steps"><div class="step">Featured event with date, location, and who it is for.</div><div class="step">Simple agenda or what visitors can expect.</div><div class="step">Clear booking or registration action.</div></div></section>`;
}

function coursesSection(id, { offer }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Courses</span><h2>Learn ${escapeHtml(offer)} with a clear path</h2><div class="grid"><div class="card"><b>What you will learn</b><span>The course focuses on practical outcomes, useful skills, and a clear sense of progress.</span></div><div class="card"><b>How it works</b><span>Visitors can see the format, schedule, support, and what happens after enrolment.</span></div><div class="card"><b>Who it suits</b><span>The page makes the best-fit audience clear so the right people enquire.</span></div></div></section>`;
}

function faqSection(id, { business, offer }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">FAQ</span><h2>Questions before contacting ${escapeHtml(business)}</h2><div class="grid"><div class="card"><b>What do you offer?</b><span>${escapeHtml(business)} helps with ${escapeHtml(offer)} and guides customers toward the right option rather than leaving them to guess.</span></div><div class="card"><b>How quickly do you reply?</b><span>Most enquiries should receive a response within one working day, with any urgent timing flagged early.</span></div><div class="card"><b>What should I include?</b><span>Share what you need, preferred timing, location if relevant, budget range if useful, and any must-have details.</span></div><div class="card"><b>Can I ask before deciding?</b><span>Yes. The first message is used to understand fit, explain options, and recommend a practical next step.</span></div><div class="card"><b>What happens after I enquire?</b><span>The team reviews the details, asks any missing questions, then confirms the recommended route and next action.</span></div><div class="card"><b>Do you offer different levels?</b><span>Where useful, ${escapeHtml(business)} can present a lighter, standard, or complete route so customers can choose the support level that fits.</span></div></div></section>`;
}

function bookingSection(id, context) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Book a call</span><h2>Book a time to talk</h2><p>Customers can request a call, share the essentials, and choose the most practical next step.</p>${contactForm(context)}</section>`;
}

function contactSection(id, context) {
  const { examples } = context;
  return `<section class="section contact" id="${escapeHtml(id)}"><div><span class="page-kicker">Contact</span><h2>${escapeHtml(examples.contactTitle)}</h2><p>${escapeHtml(examples.contactText)} Include the service needed, preferred timing, location if relevant, and any must-have details so the first response can be useful.</p><div class="steps"><div class="step">Send the essentials in the form.</div><div class="step">Receive a clear response with any follow-up questions.</div><div class="step">Choose the next step when the fit is clear.</div></div></div>${contactForm(context)}</section>`;
}

function genericPageSection(id, page, { business, offer, ctaHref }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">${escapeHtml(page)}</span><h2>${escapeHtml(page)} for ${escapeHtml(business)}</h2><p>${escapeHtml(offer)} is explained here in practical terms so visitors can understand the value and choose the next step.</p><div class="grid"><div class="card"><b>What visitors need to know</b><span>The offer, best-fit customer, and key details are presented in plain language.</span></div><div class="card"><b>Why it matters</b><span>The page connects the customer problem, desired result, and proof that ${escapeHtml(business)} can help.</span></div><div class="card"><b>Next step</b><span>Visitors get one clear action instead of having to work out what to do next.</span></div></div><a class="button secondary" href="${escapeHtml(ctaHref)}">Contact us</a></section>`;
}

function contactForm({ business }) {
  const safeBusiness = escapeHtml(business);
  return `<form class="form" aria-label="Contact ${safeBusiness}"><label>Name<input class="input" name="name" autocomplete="name" required></label><label>Email<input class="input" name="email" type="email" autocomplete="email" required></label><label>What do you need?<textarea class="input" name="message" rows="4" required></textarea></label><button class="button" type="submit">Send enquiry</button></form>`;
}

function serviceCardsFor({ business, industry, audience, offer }) {
  const text = `${business} ${industry} ${audience} ${offer}`.toLowerCase();
  if (/wedding|bridal|bride|groom/.test(text)) {
    return [
      { title: 'Wedding planning and coordination', text: `${business} can help couples organise the moving parts of the day, from early planning to timeline checks and supplier coordination.`, cta: 'Plan the day' },
      { title: 'Styling and guest experience', text: 'Couples can see the look, flow, and moments that matter, including setup, atmosphere, arrivals, and the details guests remember.', cta: 'Discuss the style' },
      { title: 'On-the-day support', text: 'Practical support keeps the day moving, handles small issues, and gives couples a calmer route through the event.', cta: 'Check availability' },
      { title: 'Packages for different needs', text: 'Lighter guidance, fuller coordination, and complete support help visitors compare the right level before enquiring.', cta: 'Compare support' },
    ];
  }
  if (/\b(restaurant|cafe|bar|food|menu|venue)\b/.test(text)) {
    return [
      { title: 'Signature menu highlights', text: 'Feature the dishes, drinks, or experiences visitors should remember first, with clear descriptions and seasonal notes.', cta: 'View highlights' },
      { title: 'Bookings and occasions', text: 'Table bookings, group visits, private events, and atmosphere details are easy to understand before visitors book.', cta: 'Make a booking' },
      { title: 'Location and visit details', text: 'Make opening times, location, accessibility, and practical visit information easy to find on mobile.', cta: 'Plan a visit' },
      { title: 'Special offers', text: 'Current menus, set options, tasting events, and limited reasons to visit sit close to the booking action.', cta: 'Ask what is on' },
    ];
  }
  if (/\b(software|saas|app|apps|platform|tool|tools)\b/.test(text)) {
    return [
      { title: 'Product workflow', text: `${offer} is shown in the context of the customer day, the task it improves, and what happens after signup or demo request.`, cta: 'See workflow' },
      { title: 'Outcome-led features', text: 'Group features by the result they create, so visitors understand value before technical detail.', cta: 'Compare features' },
      { title: 'Implementation path', text: 'Show setup, onboarding, support, and what a new customer needs to get started.', cta: 'Plan rollout' },
      { title: 'Pricing confidence', text: 'Connect plan options to team size, usage, support level, and the best next action.', cta: 'Check plans' },
    ];
  }
  return [
    { title: `Core ${offer}`, text: `${business} sets out what is provided, who it suits, what is included, and what customers receive after they enquire.`, cta: 'Ask about this' },
    { title: 'Tailored recommendation', text: `Help ${audience} choose the right route by asking about timing, priorities, budget, and the level of support needed.`, cta: 'Get guidance' },
    { title: 'Clear delivery process', text: 'Show how the work is planned, confirmed, delivered, reviewed, and supported so there are fewer surprises.', cta: 'See the process' },
    { title: 'Proof and reassurance', text: 'Testimonials, response expectations, guarantees, common questions, and practical proof reduce hesitation near the enquiry action.', cta: 'Talk to the team' },
  ];
}

function exampleContentFor(layout, context) {
  const { business, industry, audience, goal, offer } = context;
  const defaultContent = {
    servicesTitle: `How ${business} helps`,
    servicesLead: `${offer} explained in plain language for ${audience}.`,
    cards: [
      { title: 'Clear first impression', text: `Visitors immediately understand what ${business} offers and who it is for.` },
      { title: 'Useful proof', text: 'Testimonials, outcomes, and reassurance sit close to the actions that matter.' },
      { title: 'Easy enquiry path', text: `The page keeps moving people toward ${goalAsNounPhrase(goal)} without forcing them to search.` },
    ],
    proofQuote: 'Clear information, useful proof, and a direct next step.',
    proofText: `${business} presents ${industry} clearly across mobile and desktop.`,
    processTitle: 'How a visitor moves through the page',
    steps: [
      `They see the main promise and understand ${offer}.`,
      'They compare benefits, proof, and practical details.',
      'They reach a simple enquiry form with confidence.',
    ],
    contactTitle: 'Start the conversation',
    contactText: `A focused contact section gives ${audience} a clear next step.`,
  };

  const variants = {
    'saas-product': {
      servicesTitle: 'Product highlights',
      servicesLead: `${business} explains what the product does, why it matters, and how customers get value.`,
      cards: [
        { title: 'Live product overview', text: `The main ${offer} workflow is paired with a concise product explanation and supporting image.` },
        { title: 'Feature outcomes', text: 'Group features around customer results instead of a long technical list.' },
        { title: 'Pricing confidence', text: 'A simple pricing or plan prompt appears after visitors understand the value.' },
      ],
      proofQuote: 'Built to make the product feel understandable before the demo request.',
      proofText: 'The page balances benefits, screenshots, workflow, and proof so visitors can decide faster.',
      processTitle: 'How the product story unfolds',
      steps: ['Visitors see the product promise above the fold.', 'The everyday workflow is explained in practical terms.', 'Pricing, proof, and a demo or enquiry action close the page.'],
      contactTitle: 'Book a product walkthrough',
      contactText: `A concise form asks for the essentials and routes serious ${audience} to the next step.`,
    },
    'restaurant-venue': {
      servicesTitle: 'Menu and visit highlights',
      servicesLead: 'Food, atmosphere, booking, and location are easy to scan before visitors decide.',
      cards: [
        { title: 'Signature menu items', text: 'Feature the dishes, drinks, or experiences people should remember.' },
        { title: 'Atmosphere and occasions', text: 'Show whether the venue suits casual visits, celebrations, dates, or events.' },
        { title: 'Booking details', text: 'Make location, opening times, and table booking visible before the final action.' },
      ],
      proofQuote: 'A site that helps visitors picture the visit.',
      proofText: 'The layout uses imagery and short sections to turn interest into bookings.',
      processTitle: 'How a visitor decides to book',
      steps: ['They see the atmosphere and signature offer.', 'They check menu, location, reviews, and times.', 'They reserve a table or make an enquiry.'],
      contactTitle: 'Reserve a table',
      contactText: 'The final section keeps booking details, contact information, and reassurance together.',
    },
    'portfolio-studio': {
      servicesTitle: 'Portfolio services and selected work',
      servicesLead: `${business} can show taste, experience, and the kind of projects it wants more of.`,
      cards: [
        { title: 'Featured projects', text: 'A focused set of strong examples shows the studio standard without making the gallery feel crowded.' },
        { title: 'Creative services', text: 'Clients can understand what they can commission and what the working relationship feels like.' },
        { title: 'Enquiry fit', text: 'The enquiry path attracts the right budgets, briefs, and timelines with a clear project request.' },
      ],
      proofQuote: 'A portfolio that feels selective and easy to judge.',
      proofText: 'The page gives space to imagery while still making services and enquiry steps clear.',
      processTitle: 'How a project enquiry builds',
      steps: ['Visitors see the visual standard quickly.', 'They understand services, process, and fit.', 'They send a brief with enough context to respond well.'],
      contactTitle: 'Discuss a project',
      contactText: 'The form invites a useful project message rather than a vague contact request.',
    },
  };

  return { ...defaultContent, ...(variants[layout.id] || {}) };
}

function placeholderForLayout(layout, state = {}) {
  const text = `${layout?.id || ''} ${state?.brief || ''} ${state?.clientDetails || ''}`.toLowerCase();
  const match = text.match(/\b(restaurant|cafe|bar|food|menu)\b/) ? 'restaurant'
    : text.match(/health|wellness|therapy|fitness|yoga|care/) ? 'wellness'
    : text.match(/\b(software|saas|app|apps|platform|tool|tools|tech)\b/) ? 'tech'
    : text.match(/premium|luxury|interior|boutique/) ? 'premium'
    : text.match(/event|conference|launch|festival/) ? 'event'
    : text.match(/education|course|training|school|academy/) ? 'education'
    : text.match(/portfolio|studio|creative|photography|designer|artist/) ? 'creative'
    : text.match(/nonprofit|charity|community|campaign|donate/) ? 'community'
    : text.match(/office|consultant|agency|service|local/) ? 'office'
    : 'business';
  return placeholderImages.find((image) => image.id === match) || placeholderImages[0];
}

function uniquePalettes(options) {
  const seen = new Set();
  return options.filter((option) => {
    const key = option.colors.join('|').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueItems(items) {
  return [...new Set((items || []).map((item) => String(item || '').trim()).filter(Boolean))];
}

function slugify(value) {
  return String(value || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
