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

export function buildDesignSelectionMarkdown(layout) {
  return [
    `Selected layout: ${layout.name}`,
    `Layout model: ${layout.model}`,
    `Tone: ${layout.tone}`,
    `Palette: ${layout.palette.join(', ')}`,
    '',
    `Design system: ${componentLibrary.name}`,
    ...componentLibrary.principles.map((item) => `- ${item}`),
    '',
    'Component library:',
    ...componentLibrary.components.map((item) => `- ${item}`),
    '',
    'Developer instruction: build the final site from this selected layout and component system. Preserve the client brief, but adapt section order, copy density, and CTAs to this direction.',
  ].join('\n');
}

export function buildExampleSite(layout, state) {
  const brief = parseBrief(state?.brief || state?.clientDetails || '');
  const business = brief.businessName || state?.projectName || 'Client Website';
  const industry = brief.industry || 'professional services';
  const audience = brief.audience || 'busy customers who want a clear answer fast';
  const goal = brief.goal || 'turn visitors into confident enquiries';
  const offer = brief.offer || industry;
  const [ink, accent, bg] = layout.palette;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(business)} - ${escapeHtml(layout.name)}</title>
<style>
:root{--ink:${ink};--accent:${accent};--bg:${bg};--card:#ffffff;--muted:#64748b;--line:rgba(15,23,42,.12);--radius:20px;--space:clamp(18px,4vw,56px);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);line-height:1.5}a{color:inherit}.shell{width:min(1120px,calc(100% - 32px));margin:auto}.nav{display:flex;justify-content:space-between;align-items:center;padding:18px 0;font-weight:800}.nav span{color:var(--accent)}.hero{padding:var(--space) 0;display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(20px,5vw,64px);align-items:center}.eyebrow{color:var(--accent);font-weight:900;text-transform:uppercase;font-size:12px;letter-spacing:0}.hero h1{font-size:clamp(34px,7vw,76px);line-height:.94;margin:10px 0 18px;letter-spacing:0}.hero p{font-size:clamp(16px,2vw,21px);color:var(--muted);max-width:62ch}.button{display:inline-flex;margin-top:14px;background:var(--accent);color:white;text-decoration:none;border-radius:999px;padding:13px 18px;font-weight:900}.panel{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:24px;box-shadow:0 24px 70px rgba(15,23,42,.12)}.metric{font-size:38px;font-weight:950;color:var(--accent)}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:28px 0}.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px}.card b{display:block;margin-bottom:7px}.section{padding:42px 0}.section h2{font-size:clamp(26px,4vw,44px);line-height:1;margin:0 0 14px}.steps{counter-reset:step;display:grid;gap:12px}.step{counter-increment:step;display:flex;gap:14px;align-items:flex-start}.step:before{content:counter(step);background:var(--accent);color:#fff;border-radius:50%;width:30px;height:30px;display:grid;place-items:center;flex:0 0 auto;font-weight:900}.contact{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}.form{display:grid;gap:10px}.input{border:1px solid var(--line);border-radius:14px;padding:13px;background:white;color:var(--ink)}@media(max-width:760px){.hero,.contact,.grid{grid-template-columns:1fr}.hero h1{font-size:42px}}
</style>
</head>
<body>
<div class="shell">
<nav class="nav"><strong>${escapeHtml(business)}</strong><span>${escapeHtml(layout.name)}</span></nav>
<main>
<section class="hero">
<div><div class="eyebrow">${escapeHtml(industry)} website direction</div><h1>${escapeHtml(headlineFor(layout, business, goal))}</h1><p>${escapeHtml(copyFor(layout, audience, offer, goal))}</p><a class="button" href="#contact">Start an enquiry</a></div>
<aside class="panel"><div class="metric">${escapeHtml(metricFor(layout))}</div><b>${escapeHtml(layout.model)}</b><p>${escapeHtml(layout.tone)} layout built from the MicroAgency component system.</p></aside>
</section>
<section class="section"><h2>What this layout emphasises</h2><div class="grid">${cardsFor(layout, offer).map((card) => `<div class="card"><b>${escapeHtml(card.title)}</b><span>${escapeHtml(card.text)}</span></div>`).join('')}</div></section>
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
  return `${business} website direction focused on ${goal}`;
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

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
