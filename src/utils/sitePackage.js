export const SITE_PACKAGE_KIND = 'microagency-site-package-v1';

export function createSitePackage(files, entry = 'index.html') {
  const cleanFiles = Object.entries(files || {}).reduce((next, [name, content]) => {
    const fileName = normalizeFileName(name);
    if (fileName && typeof content === 'string' && content.trim()) next[fileName] = content;
    return next;
  }, {});
  return {
    kind: SITE_PACKAGE_KIND,
    entry: cleanFiles[entry] ? entry : Object.keys(cleanFiles)[0] || 'index.html',
    files: cleanFiles,
  };
}

export function createSitePackageString(files, entry = 'index.html') {
  return JSON.stringify(createSitePackage(files, entry), null, 2);
}

export function parseSitePackage(value) {
  if (!value || typeof value !== 'string') return null;
  const parsed = tryParseJson(value.trim());
  if (!parsed || parsed.kind !== SITE_PACKAGE_KIND || !parsed.files || typeof parsed.files !== 'object') return null;
  const sitePackage = createSitePackage(parsed.files, parsed.entry || 'index.html');
  return Object.keys(sitePackage.files).length ? sitePackage : null;
}

export function isSitePackage(value) {
  return Boolean(parseSitePackage(value));
}

export function fileNameForPage(page) {
  const slug = slugify(page);
  return slug === 'home' ? 'index.html' : `${slug}.html`;
}

export function normalizeFileName(value) {
  const name = String(value || '').replace(/^\/+/, '').trim();
  if (!name || name.includes('..') || /[\\]/.test(name)) return '';
  return name.toLowerCase().endsWith('.html') ? name.toLowerCase() : `${slugify(name)}.html`;
}

export function slugify(value) {
  return String(value || 'page').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page';
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
