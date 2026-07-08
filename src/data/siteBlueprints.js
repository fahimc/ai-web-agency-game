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

export function buildExampleSite(layout, state, palette = layout.palette) {
  const brief = parseBrief(state?.brief || state?.clientDetails || '');
  const business = brief.businessName || state?.projectName || 'Client Website';
  const industry = brief.industry || 'professional services';
  const audience = brief.audience || 'busy customers who want a clear answer fast';
  const goal = brief.goal || 'turn visitors into confident enquiries';
  const offer = brief.offer || industry;
  const [ink, accent, bg, secondary, surface] = normalizePalette(palette);
  const image = placeholderForLayout(layout, state);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(business)} - ${escapeHtml(layout.name)}</title>
<style>
:root{--ink:${ink};--accent:${accent};--bg:${bg};--secondary:${secondary};--card:${surface};--muted:#64748b;--line:rgba(15,23,42,.12);--radius:20px;--space:clamp(18px,4vw,56px);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);line-height:1.5}a{color:inherit}.shell{width:min(1120px,calc(100% - 32px));margin:auto}.nav{display:flex;justify-content:space-between;align-items:center;padding:18px 0;font-weight:800}.nav span{color:var(--accent)}.hero{padding:var(--space) 0;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(20px,5vw,64px);align-items:center}.eyebrow{color:var(--accent);font-weight:900;text-transform:uppercase;font-size:12px;letter-spacing:0}.hero h1{font-size:clamp(34px,7vw,76px);line-height:.94;margin:10px 0 18px;letter-spacing:0}.hero p{font-size:clamp(16px,2vw,21px);color:var(--muted);max-width:62ch}.button{display:inline-flex;margin-top:14px;background:var(--accent);color:white;text-decoration:none;border-radius:999px;padding:13px 18px;font-weight:900}.panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:24px;box-shadow:0 24px 70px rgba(15,23,42,.12)}.metric{font-size:38px;font-weight:950;color:var(--secondary)}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:28px 0}.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px}.card b{display:block;margin-bottom:7px}.section{padding:42px 0}.section h2{font-size:clamp(26px,4vw,44px);line-height:1;margin:0 0 14px}.steps{counter-reset:step;display:grid;gap:12px}.step{counter-increment:step;display:flex;gap:14px;align-items:flex-start}.step:before{content:counter(step);background:var(--accent);color:#fff;border-radius:50%;width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;font-weight:900}.contact{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}.form{display:grid;gap:10px}.input{border:1px solid var(--line);border-radius:14px;padding:13px;background:white;color:var(--ink)}@media(max-width:760px){.hero,.contact,.grid{grid-template-columns:1fr}.hero h1{font-size:42px}}
.image-card{position:relative;overflow:hidden;min-height:360px;padding:0}.image-card img{width:100%;height:100%;min-height:360px;object-fit:cover;display:block}.image-card:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.42))}.image-caption{position:absolute;left:18px;right:18px;bottom:18px;color:white;z-index:2;font-weight:900}.media-strip{display:grid;grid-template-columns:1.1fr .9fr;gap:14px;align-items:stretch}.media-strip img{width:100%;height:260px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--line)}@media(max-width:760px){.hero,.contact,.grid,.media-strip{grid-template-columns:1fr}.hero h1{font-size:42px}}</style>
</head>
<body>
<div class="shell">
<nav class="nav"><strong>${escapeHtml(business)}</strong><span>Example client site</span></nav>
<main>
<section class="hero">
<div><div class="eyebrow">${escapeHtml(layout.name)} design direction sample</div><h1>${escapeHtml(headlineFor(layout, business, goal))}</h1><p>${escapeHtml(copyFor(layout, audience, offer, goal))}</p><a class="button" href="#contact">Start an enquiry</a></div>
<aside class="panel image-card"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)} placeholder"><div class="image-caption">${escapeHtml(layout.name)} image direction</div></aside>
</section>
<section class="section"><h2>What this layout emphasises</h2><div class="grid">${cardsFor(layout, offer).map((card) => `<div class="card"><b>${escapeHtml(card.title)}</b><span>${escapeHtml(card.text)}</span></div>`).join('')}</div></section>
<section class="section media-strip"><img src="${escapeHtml(image.path)}" alt="${escapeHtml(image.label)} sample"><div class="panel"><div class="metric">${escapeHtml(metricFor(layout))}</div><b>${escapeHtml(layout.model)}</b><p>${escapeHtml(layout.tone)} layout built from the MicroAgency component system with local placeholder imagery.</p></div></section>
<section class="section"><h2>Customer journey</h2><div class="steps"><div class="step">Understand the offer and why it matters.</div><div class="step">See proof, services, or product details in a scannable order.</div><div class="step">Reach a confident CTA without hunting for contact details.</div></div></section>
<section class="section contact" id="contact"><div><h2>Ready to use this direction?</h2><p>${escapeHtml(business)} can use this as the visual route for the final generated site.</p></div><form class="form"><input class="input" placeholder="Name"><input class="input" placeholder="Email"><textarea class="input" rows="4" placeholder="Project message"></textarea><a class="button" href="#">Send enquiry</a></form></section>
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

function headlineFor(layout, business, goal) {
  if (layout.id.includes('event')) return `${business} built for attention and action`;
  if (layout.id.includes('premium')) return `${business}, presented with clarity and confidence`;
  if (layout.id.includes('marketplace')) return `Find the right answer with ${business}`;
  return `${business} site concept focused on ${goal}`;
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

function cardsFor(layout, offer) {
  return [
    { title: 'Structure', text: layout.model },
    { title: 'Offer clarity', text: `Turns ${offer} into easy-to-scan sections.` },
    { title: 'Components', text: 'Uses hero, proof, service cards, process, FAQ, and contact blocks.' },
  ];
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

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
