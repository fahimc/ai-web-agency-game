import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = process.cwd();
const outputRoot = join(root, 'public', 'placeholders', 'library');
const manifestPath = join(root, 'public', 'placeholders', 'library.json');
const jsModulePath = join(root, 'src', 'data', 'placeholderImageLibrary.js');
const docsPath = join(root, 'docs', 'placeholder-images.md');

const targetPerCategory = 8;
const maxCandidatesPerTerm = 40;
const thumbWidth = 1200;
const userAgent = 'MicroAgencyAI/1.0 placeholder image downloader (local project asset generation)';

const categories = [
  { id: 'business', name: 'Business', terms: ['business meeting office', 'professional team meeting', 'modern office workspace'], slots: ['hero', 'about', 'team', 'services'] },
  { id: 'local-service', name: 'Local Service', terms: ['local shop service', 'customer service counter', 'small business storefront'], slots: ['hero', 'services', 'contact'] },
  { id: 'trades', name: 'Trades', terms: ['construction worker tools', 'electrician work', 'workshop tools'], slots: ['hero', 'services', 'process'] },
  { id: 'restaurant', name: 'Restaurant', terms: ['restaurant table food', 'restaurant interior dining', 'chef cooking kitchen'], slots: ['hero', 'menu', 'gallery'] },
  { id: 'food-drink', name: 'Food And Drink', terms: ['coffee cup cafe', 'fresh food market', 'cocktail bar drink'], slots: ['hero', 'products', 'gallery'] },
  { id: 'wellness', name: 'Wellness', terms: ['wellness spa treatment', 'yoga studio', 'therapy room calm'], slots: ['hero', 'services', 'about'] },
  { id: 'healthcare', name: 'Healthcare', terms: ['medical clinic doctor', 'healthcare consultation', 'dentist clinic'], slots: ['hero', 'trust', 'services'] },
  { id: 'beauty', name: 'Beauty', terms: ['beauty salon interior', 'skincare treatment', 'hair salon'], slots: ['hero', 'services', 'gallery'] },
  { id: 'fitness', name: 'Fitness', terms: ['fitness gym training', 'personal trainer workout', 'yoga class'], slots: ['hero', 'programmes', 'gallery'] },
  { id: 'technology', name: 'Technology', terms: ['software team laptop', 'technology dashboard office', 'developer laptop'], slots: ['hero', 'features', 'product'] },
  { id: 'saas', name: 'SaaS', terms: ['app dashboard laptop', 'startup office laptop', 'software product screen'], slots: ['hero', 'features', 'pricing'] },
  { id: 'education', name: 'Education', terms: ['students laptop classroom', 'online course laptop', 'education training workshop'], slots: ['hero', 'courses', 'about'] },
  { id: 'creative', name: 'Creative Studio', terms: ['creative studio desk', 'design studio workspace', 'artist studio'], slots: ['hero', 'portfolio', 'about'] },
  { id: 'photography', name: 'Photography', terms: ['wedding photographer camera', 'photography studio camera', 'photo gallery'], slots: ['hero', 'gallery', 'portfolio'] },
  { id: 'portfolio', name: 'Portfolio', terms: ['portfolio workspace designer', 'architecture portfolio project', 'creative work table'], slots: ['hero', 'work', 'case-study'] },
  { id: 'legal', name: 'Legal', terms: ['law office books', 'court building', 'legal documents desk'], slots: ['hero', 'trust', 'about'] },
  { id: 'finance', name: 'Finance', terms: ['finance meeting documents', 'accounting desk calculator', 'bank office'], slots: ['hero', 'services', 'trust'] },
  { id: 'property', name: 'Property', terms: ['real estate house exterior', 'modern home interior', 'property keys'], slots: ['hero', 'listings', 'about'] },
  { id: 'ecommerce', name: 'Ecommerce', terms: ['online shopping package', 'retail product shelves', 'warehouse package'], slots: ['hero', 'products', 'catalogue'] },
  { id: 'fashion', name: 'Fashion', terms: ['fashion boutique clothing', 'clothing rack shop', 'fashion model studio'], slots: ['hero', 'gallery', 'products'] },
  { id: 'luxury', name: 'Luxury', terms: ['luxury hotel interior', 'premium interior design', 'boutique hotel lobby'], slots: ['hero', 'about', 'gallery'] },
  { id: 'events', name: 'Events', terms: ['conference audience', 'event stage audience', 'wedding event table'], slots: ['hero', 'schedule', 'gallery'] },
  { id: 'travel', name: 'Travel', terms: ['hotel travel destination', 'tourism landscape', 'travel agency'], slots: ['hero', 'locations', 'gallery'] },
  { id: 'charity', name: 'Charity', terms: ['community volunteers', 'charity event people', 'nonprofit community'], slots: ['hero', 'impact', 'team'] },
  { id: 'community', name: 'Community', terms: ['community meeting people', 'local community event', 'volunteers group'], slots: ['hero', 'impact', 'about'] },
];

const licenseAllowList = [
  'public domain',
  'cc0',
  'pdm',
  'cc by',
  'cc by-sa',
];

const entries = [];
const seenSource = new Set();

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const category of categories) {
  const categoryDir = join(outputRoot, category.id);
  await mkdir(categoryDir, { recursive: true });
  const selected = [];
  for (let index = 0; index < targetPerCategory; index += 1) {
    const term = category.terms[index % category.terms.length];
    const normalized = loremFlickrCandidate(category, term, index);
    const fileName = `${category.id}-${String(index + 1).padStart(2, '0')}${normalized.extension}`;
    const outputPath = join(categoryDir, fileName);
    try {
      await downloadFile(normalized.downloadUrl, outputPath);
    } catch {
      continue;
    }
    const entry = {
      ...normalized,
      fileName,
      path: `/placeholders/library/${category.id}/${fileName}`,
    };
    selected.push(entry);
    entries.push(entry);
    seenSource.add(entry.sourcePage);
  }
  console.log(`${category.id}: ${selected.length}/${targetPerCategory}`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  source: 'LoremFlickr keyworded Creative Commons placeholders',
  licenseNote: 'Images are Creative Commons Flickr media served through LoremFlickr for placeholder use. Replace with client-owned or final licensed imagery before final production handover where required.',
  categories: categories.map(({ id, name, slots }) => ({ id, name, slots })),
  images: entries,
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(jsModulePath, moduleSource(manifest));
await writeFile(docsPath, docsSource(manifest));

const readmePath = join(root, 'public', 'placeholders', 'README.md');
const baseReadme = existsSync(readmePath) ? await readFile(readmePath, 'utf8') : '# Placeholder images\n';
const nextReadme = `${baseReadme.replace(/\n+$/, '')}\n\n## Generated library\n\nThe generated category library lives in \`/placeholders/library/\` and is indexed by \`/placeholders/library.json\` plus \`src/data/placeholderImageLibrary.js\`.\n\nRun \`node tools/download-placeholder-images.mjs\` to refresh the library from Wikimedia Commons thumbnails.\n`;
await writeFile(readmePath, nextReadme);

console.log(`Downloaded ${entries.length} images.`);

async function searchCommons(term) {
  await sleep(900);
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrnamespace: '6',
    gsrlimit: String(maxCandidatesPerTerm),
    gsrsearch: term,
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: String(thumbWidth),
  });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': userAgent },
    });
    const body = await response.text();
    if (/too many requests/i.test(body)) {
      await sleep(4000 + attempt * 3000);
      continue;
    }
    if (!response.ok) return [];
    try {
      const json = JSON.parse(body);
      return Object.values(json.query?.pages || {});
    } catch {
      return [];
    }
  }
  return [];
}

function loremFlickrCandidate(category, term, index) {
  const query = encodeURIComponent(term.replace(/\s+/g, ','));
  const lock = 1000 + categories.findIndex((item) => item.id === category.id) * 100 + index;
  const downloadUrl = `https://loremflickr.com/1200/800/${query}?lock=${lock}`;
  const title = `${category.name} ${index + 1}`;
  return {
    id: `${category.id}-${String(index + 1).padStart(2, '0')}`,
    category: category.id,
    categoryName: category.name,
    slots: category.slots,
    title,
    alt: `${category.name} website placeholder image ${index + 1}`,
    searchTerm: term,
    source: 'LoremFlickr',
    sourcePage: 'https://loremflickr.com/',
    downloadUrl,
    license: 'Creative Commons via Flickr/LoremFlickr',
    attributionRequired: true,
    credit: 'Flickr Creative Commons contributor via LoremFlickr',
    extension: '.jpg',
  };
}

function normalizeCandidate(page, category, term) {
  const info = page.imageinfo?.[0];
  if (!info?.thumburl && !info?.url) return null;
  if (!/^image\/(jpeg|png|webp)$/i.test(info.mime || '')) return null;
  const ext = extensionFor(info.mime, info.thumburl || info.url);
  const meta = info.extmetadata || {};
  const license = stripHtml(meta.LicenseShortName?.value || meta.UsageTerms?.value || 'Unknown');
  const licenseKey = license.toLowerCase();
  if (!licenseAllowList.some((item) => licenseKey.includes(item))) return null;
  const title = String(page.title || '').replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  if (!title || /logo|seal|coat of arms|map|diagram|icon|svg|chart/i.test(title)) return null;
  const artist = stripHtml(meta.Artist?.value || meta.Credit?.value || 'Wikimedia Commons contributor');
  const sourcePage = meta.DescriptionUrl?.value || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`;
  const attributionRequired = !/public domain|cc0|pdm/i.test(license);
  return {
    id: `${category.id}-${slugify(title).slice(0, 42)}`,
    category: category.id,
    categoryName: category.name,
    slots: category.slots,
    title,
    alt: altText(title, category),
    searchTerm: term,
    source: 'Wikimedia Commons',
    sourcePage,
    downloadUrl: info.thumburl || info.url,
    license,
    attributionRequired,
    credit: artist,
    extension: ext,
  };
}

async function downloadFile(url, outputPath) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
    if (response.status === 429 || response.status === 503) {
      await sleep(3000 + attempt * 2000);
      continue;
    }
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 12000) throw new Error('Image too small');
    await writeFile(outputPath, buffer);
    return;
  }
  throw new Error('Download rate limited');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extensionFor(mime, url) {
  if (/png/i.test(mime)) return '.png';
  if (/webp/i.test(mime)) return '.webp';
  const ext = extname(new URL(url).pathname).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? (ext === '.jpeg' ? '.jpg' : ext) : '.jpg';
}

function moduleSource(manifest) {
  const compactImages = manifest.images.map(({ downloadUrl, extension, ...entry }) => entry);
  return `// Generated by tools/download-placeholder-images.mjs\nexport const placeholderImageCategories = ${JSON.stringify(manifest.categories, null, 2)};\n\nexport const placeholderImageLibrary = ${JSON.stringify(compactImages, null, 2)};\n\nexport function placeholderImageSummary(limitPerCategory = 3) {\n  const groups = placeholderImageCategories.map((category) => {\n    const items = placeholderImageLibrary.filter((image) => image.category === category.id).slice(0, limitPerCategory);\n    return \`\${category.id}: \${category.name} slots \${category.slots.join(', ')} -> \${items.map((image) => image.path).join(', ')}\`;\n  });\n  return groups.join('\\n');\n}\n\nexport function findPlaceholderImages({ text = '', category = '', slot = '', limit = 6 } = {}) {\n  const haystack = String([text, category, slot].filter(Boolean).join(' ')).toLowerCase();\n  const scored = placeholderImageLibrary.map((image) => {\n    let score = 0;\n    if (category && image.category === category) score += 8;\n    if (slot && image.slots.includes(slot)) score += 5;\n    if (haystack.includes(image.category)) score += 6;\n    image.slots.forEach((item) => { if (haystack.includes(item)) score += 3; });\n    image.title.toLowerCase().split(/\\W+/).forEach((word) => { if (word.length > 3 && haystack.includes(word)) score += 1; });\n    return { image, score };\n  });\n  return scored.sort((a, b) => b.score - a.score || a.image.path.localeCompare(b.image.path)).slice(0, limit).map((item) => item.image);\n}\n`;
}

function docsSource(manifest) {
  const byCategory = manifest.categories.map((category) => {
    const rows = manifest.images
      .filter((image) => image.category === category.id)
      .map((image) => `| ${image.path} | ${image.slots.join(', ')} | ${image.license} | ${image.attributionRequired ? 'yes' : 'no'} |`);
    return `## ${category.name}\n\n| Path | Slots | License | Attribution required |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`;
  }).join('\n');
  return `# Placeholder Image Library\n\nGenerated from keyworded LoremFlickr Creative Commons placeholder photos for MicroAgency AI site placeholders.\n\nUse \`src/data/placeholderImageLibrary.js\` from generation code. Use \`/placeholders/library.json\` for runtime or review tools.\n\n${byCategory}\n`;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';
}

function altText(title, category) {
  const clean = title.replace(/\b\d{4}\b/g, '').replace(/\s+/g, ' ').trim();
  return clean ? `${clean} for ${category.name.toLowerCase()} website imagery` : `${category.name} website placeholder image`;
}
