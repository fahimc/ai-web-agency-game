export const componentLibrary = {
  name: 'MicroAgency Blocks',
  principles: [
    'Use semantic sections with clear h2 headings and one primary CTA per viewport.',
    'Keep all layouts mobile-first with CSS grid, flexible cards, and visible focus states.',
    'Compose pages from hero, trust strip, service cards, process, proof, FAQ, and contact blocks.',
    'Use local CSS custom properties for color, radius, spacing, and type scale.',
  ],
  components: [
    'Hero: eyebrow, headline, supporting copy, CTA group, and proof point.',
    'Service grid: 3 to 6 cards with short benefit-led descriptions.',
    'Process steps: numbered sequence explaining how the customer gets value.',
    'Proof band: testimonial, metric, logos, or guarantee.',
    'Contact form: name, email, project message, and strong reassurance copy.',
    'FAQ: concise objections and answers near the final CTA.',
  ],
};

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
  { id: 'conversion-classic', name: 'Conversion Classic', model: 'Hero + proof + services + process + CTA', tone: 'Direct, polished, high-converting', palette: ['#10213f', '#2563eb', '#f8fafc'] },
  { id: 'local-service', name: 'Local Service', model: 'Local hero + services + reviews + contact', tone: 'Friendly, trustworthy, practical', palette: ['#173d35', '#18a058', '#fff7ed'] },
  { id: 'premium-editorial', name: 'Premium Editorial', model: 'Large story-led hero + feature sections + proof', tone: 'Elegant, confident, brand-led', palette: ['#171717', '#b7791f', '#faf7f0'] },
  { id: 'saas-product', name: 'SaaS Product', model: 'Product hero + feature grid + workflow + pricing CTA', tone: 'Crisp, operational, product-focused', palette: ['#08111f', '#0ea5e9', '#eef6ff'] },
  { id: 'consultant-authority', name: 'Consultant Authority', model: 'Authority hero + outcomes + method + booking', tone: 'Expert, calm, advisory', palette: ['#1f2937', '#7c3aed', '#f5f3ff'] },
  { id: 'portfolio-studio', name: 'Portfolio Studio', model: 'Visual intro + selected work + capabilities + inquiry', tone: 'Creative, image-led, selective', palette: ['#111827', '#f43f5e', '#fff1f2'] },
  { id: 'restaurant-venue', name: 'Restaurant / Venue', model: 'Atmospheric hero + menu highlights + location + booking', tone: 'Sensory, warm, visit-focused', palette: ['#2f1b12', '#d97706', '#fff8eb'] },
  { id: 'health-wellness', name: 'Health & Wellness', model: 'Reassuring hero + services + credentials + enquiry', tone: 'Soft, credible, supportive', palette: ['#164e63', '#14b8a6', '#f0fdfa'] },
  { id: 'event-launch', name: 'Event / Launch', model: 'Announcement hero + agenda + speakers + signup', tone: 'Energetic, urgent, clear', palette: ['#240046', '#ff5a5f', '#fff7f7'] },
  { id: 'marketplace-directory', name: 'Marketplace / Directory', model: 'Search-led hero + categories + featured listings + trust', tone: 'Useful, scannable, broad', palette: ['#0f172a', '#22c55e', '#f8fafc'] },
  { id: 'nonprofit-campaign', name: 'Nonprofit Campaign', model: 'Mission hero + impact proof + ways to help + donate CTA', tone: 'Human, purposeful, action-led', palette: ['#123524', '#f59e0b', '#fefce8'] },
  { id: 'education-course', name: 'Education / Course', model: 'Course promise + curriculum + outcomes + enrolment', tone: 'Structured, motivating, clear', palette: ['#1e3a8a', '#06b6d4', '#eff6ff'] },
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

export function paletteOptionsForLayout(layout, state) {
  const base = normalizePalette(layout.palette);
  const brief = `${state?.brief || ''}\n${state?.clientDetails || ''}`.toLowerCase();
  const calm = normalizePalette(['#12343b', '#2bb3a3', '#f3fbf9', '#f7c948', '#ffffff']);
  const premium = normalizePalette(['#111827', '#b7791f', '#faf7f0', '#6b7280', '#ffffff']);
  const energetic = normalizePalette(['#1e1b4b', '#ef4444', '#fff7ed', '#f59e0b', '#ffffff']);
  const local = normalizePalette(['#173d35', '#18a058', '#fff7ed', '#eab308', '#ffffff']);
  const clean = normalizePalette(['#08111f', '#0ea5e9', '#eef6ff', '#22c55e', '#ffffff']);
  const soft = normalizePalette(['#164e63', '#14b8a6', '#f0fdfa', '#f4a261', '#ffffff']);
  const recommended = brief.match(/health|wellness|therapy|care|calm|yoga/) ? soft
    : brief.match(/event|launch|bold|energy|festival/) ? energetic
    : brief.match(/local|service|trade|repair|salon/) ? local
    : brief.match(/premium|luxury|boutique|brand/) ? premium
    : brief.match(/software|saas|app|platform|tool/) ? clean
    : base;
  return uniquePalettes([
    { id: 'recommended', name: 'Mira recommended', colors: recommended },
    { id: 'clean', name: 'Clean trust', colors: clean },
    { id: 'premium', name: 'Premium contrast', colors: premium },
    { id: 'warm', name: 'Warm local', colors: local },
    { id: 'calm', name: 'Calm support', colors: calm },
  ]).slice(0, 4);
}

export function recommendedStructure(layout, state) {
  const text = `${state?.brief || ''}\n${state?.clientDetails || ''}`.toLowerCase();
  let pages = ['Home', 'Services', 'About', 'FAQ', 'Contact'];
  let sections = ['Hero', 'Trust / proof bar', 'Services', 'Benefits', 'Process', 'Testimonials', 'FAQ', 'Lead capture form', 'Final CTA'];

  if (layout.id === 'saas-product' || /software|saas|app|platform|tool/.test(text)) {
    pages = ['Home', 'Pricing', 'Case Studies', 'FAQ', 'Contact'];
    sections = ['Hero', 'Trust / proof bar', 'Benefits', 'Featured products', 'Process', 'Pricing', 'Testimonials', 'FAQ', 'Lead capture form'];
  } else if (layout.id === 'restaurant-venue' || /restaurant|cafe|bar|venue|food|menu/.test(text)) {
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
  return [
    `Selected layout: ${layout.name}`,
    `Layout model: ${layout.model}`,
    `Tone: ${layout.tone}`,
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
    'Developer instruction: build the final site from this selected design direction, colour palette, pages, sections, and local placeholder image. Use local /placeholders assets where imagery is needed. Preserve the client brief, but adapt section order, copy density, and CTAs to this direction.',
  ].join('\n');
}

export function buildExampleSite(layout, state, palette = layout.palette, options = {}) {
  const brief = parseBrief(state?.brief || state?.clientDetails || '');
  const business = brief.businessName || state?.projectName || 'Client Website';
  const industry = brief.industry || 'professional services';
  const audience = brief.audience || 'busy customers who want a clear answer fast';
  const goal = brief.goal || 'turn visitors into confident enquiries';
  const offer = brief.offer || industry;
  const [ink, accent, bg, secondary, surface] = normalizePalette(palette);
  const image = placeholderForLayout(layout, state);
  const examples = exampleContentFor(layout, { business, industry, audience, goal, offer });
  const structure = recommendedStructure(layout, state);
  const isOnePagePackage = state?.projectPackage === 'launch';
  const sections = uniqueItems(state?.selectedSiteSections?.length ? state.selectedSiteSections : structure.sections).slice(0, 10);
  const pages = isOnePagePackage ? ['Home'] : normalizePages(state?.selectedSitePages?.length ? state.selectedSitePages : structure.pages);
  const onePageSections = isOnePagePackage ? normalizeOnePageSections(sections, structure.pages) : [];
  const isPreview = Boolean(options.preview);
  const navLabel = isPreview ? 'Preview client site' : 'Customer website';
  const eyebrow = isPreview ? `${layout.name} design direction` : `${business} website`;
  const navItems = isOnePagePackage ? ['Home', ...onePageSections] : pages;
  const ctaTarget = slugify(navItems.find((item) => /contact|book/i.test(item)) || 'Contact');
  const pageSections = (isOnePagePackage ? onePageSections : pages.filter((page) => page.toLowerCase() !== 'home'))
    .map((page) => pageSectionFor(page, { business, industry, audience, goal, offer, layout, examples, image, ctaTarget }))
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(business)} - Website</title>
<style>
:root{--ink:${ink};--accent:${accent};--bg:${bg};--secondary:${secondary};--card:${surface};--muted:#64748b;--line:rgba(15,23,42,.12);--radius:20px;--space:clamp(18px,4vw,56px);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);line-height:1.5}a{color:inherit}.shell{width:min(1120px,calc(100% - 32px));margin:auto}.nav{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 92%,white);backdrop-filter:blur(14px);display:flex;justify-content:space-between;align-items:center;gap:18px;padding:18px 0;font-weight:800}.nav strong{font-size:20px}.nav-links{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.nav-links a{color:var(--muted);text-decoration:none;border:1px solid transparent;border-radius:999px;padding:8px 10px;font-size:14px}.nav-links a:hover{border-color:var(--line);color:var(--ink);background:var(--card)}.nav span{color:var(--accent)}.hero{padding:var(--space) 0;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(20px,5vw,64px);align-items:center}.eyebrow{color:var(--accent);font-weight:900;text-transform:uppercase;font-size:12px;letter-spacing:0}.hero h1{font-size:clamp(34px,7vw,76px);line-height:.94;margin:10px 0 18px;letter-spacing:0}.hero p{font-size:clamp(16px,2vw,21px);color:var(--muted);max-width:62ch}.button{display:inline-flex;margin-top:14px;background:var(--accent);color:white;text-decoration:none;border-radius:999px;padding:13px 18px;font-weight:900}.button.secondary{background:var(--ink)}.panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:24px;box-shadow:0 24px 70px rgba(15,23,42,.12)}.metric{font-size:38px;font-weight:950;color:var(--secondary)}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:28px 0}.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px}.card b{display:block;margin-bottom:7px}.card span,.section p{color:var(--muted)}.section{padding:54px 0;scroll-margin-top:86px}.section h2{font-size:clamp(26px,4vw,44px);line-height:1;margin:0 0 14px}.page-kicker{color:var(--accent);font-weight:900;text-transform:uppercase;font-size:12px}.steps{counter-reset:step;display:grid;gap:12px}.step{counter-increment:step;display:flex;gap:14px;align-items:flex-start}.step:before{content:counter(step);background:var(--accent);color:#fff;border-radius:50%;width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;font-weight:900}.contact{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}.form{display:grid;gap:10px}.input{border:1px solid var(--line);border-radius:14px;padding:13px;background:white;color:var(--ink)}.tag-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.tag{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:8px 10px;font-weight:800;color:var(--muted);font-size:13px}.image-card{position:relative;overflow:hidden;min-height:360px;padding:0}.image-card img{width:100%;height:100%;min-height:360px;object-fit:cover;display:block}.image-card:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.42))}.image-caption{position:absolute;left:18px;right:18px;bottom:18px;color:white;z-index:2;font-weight:900}.media-strip{display:grid;grid-template-columns:1.1fr .9fr;gap:14px;align-items:stretch}.media-strip img{width:100%;height:260px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--line)}@media(max-width:760px){.nav{position:static;align-items:flex-start;flex-direction:column}.nav-links{justify-content:flex-start}.hero,.contact,.grid,.media-strip{grid-template-columns:1fr}.hero h1{font-size:42px}}</style>
</head>
<body>
<div class="shell">
<nav class="nav"><strong>${escapeHtml(business)}</strong><div class="nav-links">${navItems.map((page) => `<a href="#${escapeHtml(slugify(page))}">${escapeHtml(page)}</a>`).join('')}</div><span>${escapeHtml(navLabel)}</span></nav>
<main>
<section class="hero" id="home">
<div><div class="eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(headlineFor(layout, business, goal, audience))}</h1><p>${escapeHtml(copyFor(layout, audience, offer, goal))}</p><div class="tag-row">${sections.slice(0, 5).map((section) => `<span class="tag">${escapeHtml(section)}</span>`).join('')}</div><a class="button" href="#${escapeHtml(ctaTarget)}">Start an enquiry</a></div>
<aside class="panel image-card"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}"><div class="image-caption">${escapeHtml(business)} visual direction</div></aside>
</section>
${pageSections}
</main>
</div>
</body>
</html>`;
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
  return `${layout.name} is shaped for ${audience}, presenting ${offer} with a clear path toward ${goal}.`;
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

function servicesSection(id, { examples }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Services</span><h2>${escapeHtml(examples.servicesTitle)}</h2><p>${escapeHtml(examples.servicesLead)}</p><div class="grid">${examples.cards.map((card) => `<div class="card"><b>${escapeHtml(card.title)}</b><span>${escapeHtml(card.text)}</span></div>`).join('')}</div></section>`;
}

function aboutSection(id, { business, industry, audience, offer, image }) {
  return `<section class="section media-strip" id="${escapeHtml(id)}"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}"><div class="panel"><span class="page-kicker">About</span><h2>Built around what ${escapeHtml(audience)} need to know</h2><p>${escapeHtml(business)} works in ${escapeHtml(industry)} with a clear focus on ${escapeHtml(offer)}. This section gives visitors the context, credibility, and reassurance they need before taking action.</p></div></section>`;
}

function pricingSection(id, { business, offer, ctaTarget }) {
  const tiers = ['Starter', 'Standard', 'Complete'];
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Pricing</span><h2>Simple ways to start with ${escapeHtml(business)}</h2><p>Use these placeholder packages as a clear pricing structure until final prices are confirmed.</p><div class="grid">${tiers.map((tier, index) => `<div class="card"><b>${tier}</b><span>${escapeHtml(index === 0 ? `A focused introduction to ${offer}.` : index === 1 ? `A fuller option for customers ready to compare ${offer}.` : `The most complete route with extra support and priority response.`)}</span><a class="button" href="#${escapeHtml(ctaTarget)}">Enquire</a></div>`).join('')}</div></section>`;
}

function caseStudiesSection(id, { business, goal }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Case studies</span><h2>Proof that helps visitors decide</h2><div class="grid"><div class="card"><b>Recent customer win</b><span>${escapeHtml(business)} helped a customer move from browsing to enquiry with a clearer offer and direct next step.</span></div><div class="card"><b>Before and after</b><span>Replace this placeholder with a real example once the business has a project to showcase.</span></div><div class="card"><b>Outcome focus</b><span>Each story should connect the work back to the goal: ${escapeHtml(goal)}.</span></div></div></section>`;
}

function gallerySection(id, { image }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Gallery</span><h2>Visual highlights</h2><div class="grid"><div class="card"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}" style="width:100%;border-radius:16px"></div><div class="card"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}" style="width:100%;border-radius:16px"></div><div class="card"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)}" style="width:100%;border-radius:16px"></div></div></section>`;
}

function menuSection(id, { business }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Menu</span><h2>${escapeHtml(business)} menu highlights</h2><div class="grid"><div class="card"><b>Signature option</b><span>A customer favourite with a short description and clear price placeholder.</span></div><div class="card"><b>Seasonal feature</b><span>Use this space for a limited-time item or current promotion.</span></div><div class="card"><b>Group choice</b><span>A useful option for families, teams, groups, or repeat visitors.</span></div></div></section>`;
}

function eventsSection(id, { business }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Events</span><h2>Upcoming moments at ${escapeHtml(business)}</h2><div class="steps"><div class="step">Featured event with date, location, and who it is for.</div><div class="step">Simple agenda or what visitors can expect.</div><div class="step">Clear booking or registration action.</div></div></section>`;
}

function coursesSection(id, { offer }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Courses</span><h2>Learn ${escapeHtml(offer)} with a clear path</h2><div class="grid"><div class="card"><b>What you will learn</b><span>Summarise the key outcomes and practical skills.</span></div><div class="card"><b>How it works</b><span>Explain format, schedule, support, and what happens after enrolment.</span></div><div class="card"><b>Who it suits</b><span>Clarify the best-fit audience so the right people enquire.</span></div></div></section>`;
}

function faqSection(id, { business, offer }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">FAQ</span><h2>Questions before contacting ${escapeHtml(business)}</h2><div class="grid"><div class="card"><b>What do you offer?</b><span>${escapeHtml(business)} helps with ${escapeHtml(offer)} and guides customers to the right next step.</span></div><div class="card"><b>How quickly do you reply?</b><span>Most enquiries receive a response within one working day.</span></div><div class="card"><b>What should I include?</b><span>Share what you need, your timeline, and any details that would help the team respond properly.</span></div></div></section>`;
}

function bookingSection(id, context) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">Book a call</span><h2>Book a time to talk</h2><p>Use this section for a calendar link, phone booking route, or simple callback request.</p>${contactForm(context)}</section>`;
}

function contactSection(id, context) {
  const { examples } = context;
  return `<section class="section contact" id="${escapeHtml(id)}"><div><span class="page-kicker">Contact</span><h2>${escapeHtml(examples.contactTitle)}</h2><p>${escapeHtml(examples.contactText)}</p></div>${contactForm(context)}</section>`;
}

function genericPageSection(id, page, { business, offer, ctaTarget }) {
  return `<section class="section" id="${escapeHtml(id)}"><span class="page-kicker">${escapeHtml(page)}</span><h2>${escapeHtml(page)} for ${escapeHtml(business)}</h2><p>This page section is ready for final content. It should explain how ${escapeHtml(offer)} helps visitors and give them a clear next step.</p><a class="button secondary" href="#${escapeHtml(ctaTarget)}">Contact us</a></section>`;
}

function contactForm({ business }) {
  return `<form class="form" aria-label="Contact ${escapeHtml(business)}"><input class="input" placeholder="Name"><input class="input" placeholder="Email"><textarea class="input" rows="4" placeholder="Tell us what you need"></textarea><a class="button" href="#">Send enquiry</a></form>`;
}

function exampleContentFor(layout, context) {
  const { business, industry, audience, goal, offer } = context;
  const defaultContent = {
    servicesTitle: `How ${business} helps`,
    servicesLead: `This example shows how the finished site can explain ${offer} in plain language for ${audience}.`,
    cards: [
      { title: 'Clear first impression', text: `Visitors immediately understand what ${business} offers and who it is for.` },
      { title: 'Useful proof', text: 'Testimonials, outcomes, and reassurance sit close to the actions that matter.' },
      { title: 'Easy enquiry path', text: `The page keeps moving people toward ${goal} without forcing them to search.` },
    ],
    proofQuote: 'A confident example of the customer website direction.',
    proofText: `${business} can use this structure to present ${industry} clearly across mobile and desktop.`,
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
      servicesLead: `A product-led example for showing what ${business} does, why it matters, and how customers get value.`,
      cards: [
        { title: 'Live product overview', text: `Show the main ${offer} workflow with a concise product explanation and supporting image.` },
        { title: 'Feature outcomes', text: 'Group features around customer results instead of a long technical list.' },
        { title: 'Pricing confidence', text: 'Add a simple pricing or plan prompt after visitors understand the value.' },
      ],
      proofQuote: 'Built to make the product feel understandable before the demo request.',
      proofText: 'The page balances benefits, screenshots, workflow, and proof so visitors can decide faster.',
      processTitle: 'How the product story unfolds',
      steps: ['Show the product promise above the fold.', 'Explain the everyday workflow in practical terms.', 'Close with pricing, proof, and a demo or enquiry action.'],
      contactTitle: 'Book a product walkthrough',
      contactText: `A concise form asks for the essentials and routes serious ${audience} to the next step.`,
    },
    'restaurant-venue': {
      servicesTitle: 'Menu and visit highlights',
      servicesLead: 'A venue example that makes food, atmosphere, booking, and location easy to scan.',
      cards: [
        { title: 'Signature menu items', text: 'Feature the dishes, drinks, or experiences people should remember.' },
        { title: 'Atmosphere and occasions', text: 'Show whether the venue suits casual visits, celebrations, dates, or events.' },
        { title: 'Booking details', text: 'Make location, opening times, and table booking visible before the final action.' },
      ],
      proofQuote: 'A site direction that helps visitors picture the visit.',
      proofText: 'The layout uses imagery and short sections to turn interest into bookings.',
      processTitle: 'How a visitor decides to book',
      steps: ['They see the atmosphere and signature offer.', 'They check menu, location, reviews, and times.', 'They reserve a table or make an enquiry.'],
      contactTitle: 'Reserve a table',
      contactText: 'The final section keeps booking details, contact information, and reassurance together.',
    },
    'portfolio-studio': {
      servicesTitle: 'Selected work and capabilities',
      servicesLead: `A visual example that helps ${business} show taste, experience, and the kind of projects it wants more of.`,
      cards: [
        { title: 'Featured projects', text: 'Lead with a small number of strong examples instead of a crowded gallery.' },
        { title: 'Creative services', text: 'Explain what clients can commission and what the working relationship feels like.' },
        { title: 'Enquiry fit', text: 'Use the contact section to attract the right budgets, briefs, and timelines.' },
      ],
      proofQuote: 'A portfolio direction that feels selective and easy to judge.',
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
  const match = text.match(/restaurant|cafe|bar|food|menu/) ? 'restaurant'
    : text.match(/health|wellness|therapy|fitness|yoga|care/) ? 'wellness'
    : text.match(/software|saas|app|platform|tool|tech/) ? 'tech'
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
