export const LOGO_ICONS = {
  spark: { label: 'Spark / AI', keywords: ['ai', 'agency', 'creative', 'automation'] },
  chip: { label: 'AI Chip', keywords: ['ai', 'software', 'saas', 'technology', 'automation'] },
  code: { label: 'Code', keywords: ['software', 'developer', 'web', 'technology'] },
  rocket: { label: 'Rocket', keywords: ['startup', 'launch', 'event', 'growth'] },
  globe: { label: 'Globe', keywords: ['international', 'travel', 'marketplace', 'education'] },
  leaf: { label: 'Leaf', keywords: ['wellness', 'health', 'eco', 'food', 'beauty'] },
  shield: { label: 'Shield', keywords: ['legal', 'finance', 'security', 'health', 'trust'] },
  shop: { label: 'Shop', keywords: ['shop', 'restaurant', 'retail', 'ecommerce', 'products'] },
  chat: { label: 'Chat', keywords: ['consultant', 'support', 'service', 'community'] },
  house: { label: 'Property', keywords: ['property', 'estate', 'home', 'local'] },
  wrench: { label: 'Tools', keywords: ['trades', 'repair', 'maintenance', 'local'] },
  camera: { label: 'Camera', keywords: ['photography', 'portfolio', 'studio', 'creative', 'wedding'] },
  fork: { label: 'Dining', keywords: ['restaurant', 'food', 'cafe', 'venue', 'menu'] },
  scales: { label: 'Legal', keywords: ['legal', 'law', 'professional', 'finance'] },
};

export const LOGO_LAYOUTS = ['horizontal', 'stacked', 'badge', 'iconOnly'];
export const LOGO_CONTAINERS = ['rounded', 'circle', 'hex', 'diamond', 'none'];
export const LOGO_FONTS = ['Inter', 'Arial', 'Georgia', 'Trebuchet MS', 'Verdana', 'Courier New'];

export const LOGO_PALETTES = [
  ['#2563eb', '#7c3aed', '#0f172a'],
  ['#0f766e', '#14b8a6', '#102a27'],
  ['#ea580c', '#f59e0b', '#111827'],
  ['#be123c', '#fb7185', '#1f1020'],
  ['#4338ca', '#06b6d4', '#0f172a'],
  ['#16a34a', '#84cc16', '#10210f'],
  ['#7c2d12', '#fdba74', '#1f130b'],
  ['#111827', '#64748b', '#0f172a'],
];

const ICON_RENDERERS = {
  spark: (c) => `<path d="M50 8l9 29 29 9-29 9-9 29-9-29-29-9 29-9 9-29z" fill="${c.secondary}"/><circle cx="74" cy="24" r="8" fill="${c.primary}"/><circle cx="24" cy="72" r="7" fill="${c.primary}"/>`,
  chip: (c) => `<rect x="24" y="24" width="52" height="52" rx="12" fill="none" stroke="${c.secondary}" stroke-width="10"/><path d="M39 50h22M50 39v22" stroke="${c.primary}" stroke-width="9" stroke-linecap="round"/><path d="M18 34H8M18 50H8M18 66H8M92 34H82M92 50H82M92 66H82M34 18V8M50 18V8M66 18V8M34 92V82M50 92V82M66 92V82" stroke="${c.primary}" stroke-width="6" stroke-linecap="round"/>`,
  code: (c) => `<path d="M36 30L16 50l20 20" fill="none" stroke="${c.primary}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M64 30l20 20-20 20" fill="none" stroke="${c.secondary}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M55 23L44 78" stroke="${c.text}" stroke-width="8" stroke-linecap="round" opacity=".85"/>`,
  rocket: (c) => `<path d="M60 12c16 8 24 24 24 48L62 70 50 50 30 38C36 22 46 14 60 12z" fill="${c.primary}"/><path d="M30 38L16 54l21 4zM62 70l-4 21 16-14z" fill="${c.secondary}"/><circle cx="60" cy="34" r="8" fill="#fff" opacity=".9"/><path d="M42 66c-10 3-18 9-25 18 10-3 17-5 25-4z" fill="${c.secondary}" opacity=".9"/>`,
  globe: (c) => `<circle cx="50" cy="50" r="34" fill="none" stroke="${c.primary}" stroke-width="9"/><path d="M18 50h64M50 16c12 12 17 24 17 34s-5 22-17 34M50 16C38 28 33 40 33 50s5 22 17 34" fill="none" stroke="${c.secondary}" stroke-width="6" stroke-linecap="round"/>`,
  leaf: (c) => `<path d="M82 18C44 18 18 37 18 64c0 13 10 22 24 22 28 0 44-30 40-68z" fill="${c.primary}"/><path d="M31 73c17-19 31-29 51-55" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".9"/><path d="M43 72c-1 9-6 14-15 18" stroke="${c.secondary}" stroke-width="8" stroke-linecap="round"/>`,
  shield: (c) => `<path d="M50 9l32 12v25c0 22-12 38-32 47-20-9-32-25-32-47V21z" fill="${c.primary}"/><path d="M36 51l10 10 21-24" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 9v84" stroke="${c.secondary}" stroke-width="5" opacity=".45"/>`,
  shop: (c) => `<path d="M20 42h60l-6-22H26z" fill="${c.primary}"/><path d="M22 42c0 8 7 12 14 7 5 7 14 7 19 0 7 5 18 1 18-7" fill="${c.secondary}"/><rect x="26" y="49" width="48" height="34" rx="6" fill="${c.primary}" opacity=".9"/><rect x="43" y="60" width="14" height="23" fill="#fff" opacity=".9"/>`,
  chat: (c) => `<path d="M18 24h64v43H44L25 82l5-15H18z" fill="${c.primary}"/><circle cx="38" cy="46" r="5" fill="#fff"/><circle cx="51" cy="46" r="5" fill="#fff"/><circle cx="64" cy="46" r="5" fill="#fff"/><path d="M30 74l-5 8 12-10z" fill="${c.secondary}"/>`,
  house: (c) => `<path d="M14 47L50 18l36 29" fill="none" stroke="${c.primary}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 45v37h48V45" fill="${c.secondary}"/><rect x="43" y="60" width="14" height="22" fill="#fff" opacity=".9"/>`,
  wrench: (c) => `<path d="M75 15c-9-3-20 0-26 8-6 8-6 18-1 26L17 80l12 12 31-31c9 5 20 4 27-3 7-7 10-17 6-27L77 47 63 33z" fill="${c.primary}"/><circle cx="25" cy="84" r="5" fill="#fff" opacity=".9"/><path d="M55 55l-8-8" stroke="${c.secondary}" stroke-width="7" stroke-linecap="round"/>`,
  camera: (c) => `<rect x="15" y="30" width="70" height="48" rx="12" fill="${c.primary}"/><path d="M34 30l7-10h18l7 10" fill="${c.secondary}"/><circle cx="50" cy="54" r="16" fill="#fff" opacity=".95"/><circle cx="50" cy="54" r="9" fill="${c.secondary}"/><circle cx="72" cy="41" r="5" fill="#fff" opacity=".9"/>`,
  fork: (c) => `<path d="M31 14v34M21 14v34M41 14v34M21 48c0 9 20 9 20 0" fill="none" stroke="${c.primary}" stroke-width="8" stroke-linecap="round"/><path d="M31 56v31" stroke="${c.primary}" stroke-width="9" stroke-linecap="round"/><path d="M66 14c13 11 13 30 0 42v31" fill="none" stroke="${c.secondary}" stroke-width="10" stroke-linecap="round"/>`,
  scales: (c) => `<path d="M50 15v68M26 28h48M50 25l-24 34M50 25l24 34" fill="none" stroke="${c.primary}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 60h26c-2 12-24 12-26 0zM61 60h26c-2 12-24 12-26 0z" fill="${c.secondary}"/><path d="M32 87h36" stroke="${c.primary}" stroke-width="9" stroke-linecap="round"/>`,
};

export function logoGeneratorSummary() {
  return [
    'Business logo generator available:',
    `Icons: ${Object.entries(LOGO_ICONS).map(([id, icon]) => `${id} (${icon.label})`).join(', ')}`,
    `Layouts: ${LOGO_LAYOUTS.join(', ')}`,
    `Containers: ${LOGO_CONTAINERS.join(', ')}`,
    `Fonts: ${LOGO_FONTS.join(', ')}`,
    'The LLM should choose logo.icon, logo.layout, logo.container, logo.font, logo.primary, logo.secondary, logo.textColor, logo.tagline, logo.iconSize, logo.radius, logo.weight, and logo.tracking. Use 3 real hex colours and keep the logo suitable for a responsive website navbar.',
  ].join('\n');
}

export function fallbackLogoConfig(state = {}, layout = {}, palette = []) {
  const text = `${state.brief || ''} ${state.clientDetails || ''} ${layout.id || ''}`.toLowerCase();
  const icon = text.match(/photo|photography|portfolio|studio|creative|wedding/) ? 'camera'
    : text.match(/restaurant|food|cafe|bar|venue|menu/) ? 'fork'
    : text.match(/legal|law|finance|account|security/) ? 'scales'
    : text.match(/health|wellness|therapy|care|beauty|eco|green/) ? 'leaf'
    : text.match(/property|estate|home|real/) ? 'house'
    : text.match(/trade|repair|plumb|electric|build|roof/) ? 'wrench'
    : text.match(/software|saas|ai|app|platform|tech/) ? 'chip'
    : text.match(/shop|ecommerce|product|retail/) ? 'shop'
    : text.match(/event|launch|startup/) ? 'rocket'
    : 'spark';
  const company = parseBusinessName(state) || state.projectName || 'Client Website';
  const [primary, secondary, textColor] = normalizeLogoPalette(palette);
  return normalizeLogoConfig({
    company,
    tagline: fallbackTagline(text),
    icon,
    layout: 'horizontal',
    font: text.match(/luxury|premium|editorial|wedding/) ? 'Georgia' : 'Inter',
    container: icon === 'camera' || icon === 'fork' ? 'circle' : 'rounded',
    primary,
    secondary,
    textColor,
    iconSize: 92,
    radius: 24,
    weight: 800,
    tracking: -0.5,
  }, { state, layout, palette });
}

export function normalizeLogoConfig(input = {}, context = {}) {
  const fallback = fallbackLogoConfigBase(context);
  const icon = LOGO_ICONS[input.icon] ? input.icon : fallback.icon;
  const layout = LOGO_LAYOUTS.includes(input.layout) ? input.layout : fallback.layout;
  const container = LOGO_CONTAINERS.includes(input.container) ? input.container : fallback.container;
  const font = LOGO_FONTS.includes(input.font) ? input.font : fallback.font;
  const palette = normalizeLogoPalette([input.primary, input.secondary, input.textColor || input.text]);
  return {
    company: cleanLogoText(input.company || fallback.company, 46),
    tagline: cleanLogoText(input.tagline || fallback.tagline, 72),
    icon,
    layout,
    font,
    container,
    primary: palette[0],
    secondary: palette[1],
    textColor: palette[2],
    iconSize: clampNumber(input.iconSize, 54, 150, fallback.iconSize),
    radius: clampNumber(input.radius, 0, 48, fallback.radius),
    weight: clampNumber(input.weight, 500, 900, fallback.weight),
    tracking: clampNumber(input.tracking, -2, 5, fallback.tracking),
  };
}

export function renderLogoSvg(config, options = {}) {
  const state = normalizeLogoConfig(config, options);
  const id = safeId(options.idPrefix || state.company || 'brand-logo');
  const s = Number(state.iconSize);
  const defs = `<defs><linearGradient id="${id}-brandGrad" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${state.primary}"/><stop offset="1" stop-color="${state.secondary}"/></linearGradient><filter id="${id}-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000" flood-opacity=".16"/></filter></defs>`;
  let body = '';
  if (state.layout === 'horizontal') body = `<g filter="url(#${id}-shadow)">${logoIcon(155, 282, s, state, id)}</g>${textBlock(155 + s + 38, 338, 'start', 74, 25, state)}`;
  if (state.layout === 'stacked') body = `<g filter="url(#${id}-shadow)">${logoIcon(500 - s / 2, 178, s, state, id)}</g>${textBlock(500, 390, 'middle', 78, 26, state)}`;
  if (state.layout === 'badge') body = `<circle cx="500" cy="345" r="215" fill="url(#${id}-brandGrad)" filter="url(#${id}-shadow)"/><g transform="translate(${500 - s / 2} 190)">${logoIcon(0, 0, s, { ...state, container: 'none' }, id)}</g><text x="500" y="375" text-anchor="middle" font-family="${escapeAttr(state.font)}, Arial" font-size="64" font-weight="${state.weight}" letter-spacing="${state.tracking}" fill="#fff">${escapeHtml(state.company)}</text><text x="500" y="420" text-anchor="middle" font-family="${escapeAttr(state.font)}, Arial" font-size="22" font-weight="500" letter-spacing="2" fill="#fff" opacity=".78">${escapeHtml(state.tagline)}</text>`;
  if (state.layout === 'iconOnly') body = `<g filter="url(#${id}-shadow)">${logoIcon(500 - s, 345 - s, s * 2, state, id)}</g>`;
  const bg = options.background === 'transparent' ? '' : `<rect width="1000" height="690" fill="${options.background || '#f8fafc'}"/>`;
  const className = options.className ? ` class="${escapeAttr(options.className)}"` : '';
  const title = options.title || `${state.company} logo`;
  return `<svg${className} viewBox="0 0 1000 690" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeAttr(title)}">${defs}<title>${escapeHtml(title)}</title>${bg}${body}</svg>`;
}

export function renderNavLogo(config, options = {}) {
  return renderLogoSvg({ ...config, layout: 'horizontal' }, { ...options, background: 'transparent', className: options.className || 'brand-logo' });
}

function fallbackLogoConfigBase(context = {}) {
  const state = context.state || {};
  const palette = normalizeLogoPalette(context.palette || []);
  return {
    company: context.company || parseBusinessName(state) || state.projectName || 'Client Website',
    tagline: fallbackTagline(`${state.brief || ''} ${state.clientDetails || ''}`.toLowerCase()),
    icon: 'spark',
    layout: 'horizontal',
    font: 'Inter',
    container: 'rounded',
    primary: palette[0],
    secondary: palette[1],
    textColor: palette[2],
    iconSize: 96,
    radius: 24,
    weight: 800,
    tracking: -0.5,
  };
}

function logoIcon(x, y, size, state, id) {
  const bg = state.container === 'circle' ? `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="url(#${id}-brandGrad)"/>`
    : state.container === 'hex' ? `<path d="M${x + size * 0.5} ${y} L${x + size * 0.93} ${y + size * 0.25} L${x + size * 0.93} ${y + size * 0.75} L${x + size * 0.5} ${y + size} L${x + size * 0.07} ${y + size * 0.75} L${x + size * 0.07} ${y + size * 0.25} Z" fill="url(#${id}-brandGrad)"/>`
    : state.container === 'diamond' ? `<path d="M${x + size / 2} ${y} L${x + size} ${y + size / 2} L${x + size / 2} ${y + size} L${x} ${y + size / 2} Z" fill="url(#${id}-brandGrad)"/>`
    : state.container === 'none' ? ''
    : `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${Math.min(state.radius, size / 2)}" fill="url(#${id}-brandGrad)"/>`;
  const inner = size * 0.62;
  const pad = (size - inner) / 2;
  const iconColors = {
    primary: state.container === 'none' ? state.primary : '#fff',
    secondary: state.container === 'none' ? state.secondary : 'rgba(255,255,255,.72)',
    text: state.container === 'none' ? state.textColor : '#fff',
  };
  return `<g>${bg}<g transform="translate(${x + pad} ${y + pad}) scale(${inner / 100})">${ICON_RENDERERS[state.icon](iconColors)}</g></g>`;
}

function textBlock(x, y, align, nameSize, tagSize, state) {
  return `<text x="${x}" y="${y}" text-anchor="${align}" font-family="${escapeAttr(state.font)}, Arial, sans-serif" font-size="${nameSize}" font-weight="${state.weight}" letter-spacing="${state.tracking}" fill="${state.textColor}">${escapeHtml(state.company)}</text><text x="${x}" y="${y + tagSize + 18}" text-anchor="${align}" font-family="${escapeAttr(state.font)}, Arial, sans-serif" font-size="${tagSize}" font-weight="500" letter-spacing="1.2" fill="${state.textColor}" opacity=".66">${escapeHtml(state.tagline)}</text>`;
}

function normalizeLogoPalette(values = []) {
  const fallback = ['#2563eb', '#7c3aed', '#0f172a'];
  return [...values, ...fallback].filter((color) => /^#[0-9a-f]{6}$/i.test(String(color || '').trim())).map((color) => color.trim()).slice(0, 3);
}

function parseBusinessName(state = {}) {
  const text = `${state.brief || ''}\n${state.clientDetails || ''}`;
  const match = text.match(/(?:business|client name|business \/ client name)\s*:\s*(.+)$/im);
  return match?.[1]?.trim() || '';
}

function fallbackTagline(text) {
  if (/photo|wedding|portfolio|studio/.test(text)) return 'Work with clarity and feeling.';
  if (/restaurant|food|menu|venue/.test(text)) return 'Fresh moments. Easy bookings.';
  if (/legal|finance|account/.test(text)) return 'Clear advice. Trusted support.';
  if (/health|wellness|care|beauty/.test(text)) return 'Calm care, clearly explained.';
  if (/trade|repair|local/.test(text)) return 'Reliable service, close to home.';
  if (/software|saas|ai|tech/.test(text)) return 'Smarter tools for modern teams.';
  return 'Clear service. Confident next steps.';
}

function cleanLogoText(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function safeId(value) {
  return String(value || 'logo').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'logo';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}
