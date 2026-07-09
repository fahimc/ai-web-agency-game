import { fileNameForPage, parseSitePackage } from './sitePackage.js';

const BAD_FINAL_SITE_LANGUAGE = [
  /example client site/i,
  /preview client site/i,
  /customer website/i,
  /visual direction/i,
  /design direction/i,
  /site concept/i,
  /this example shows/i,
  /finished site can explain/i,
  /placeholder packages/i,
  /component\s*\+\s*component/i,
];

export function evaluateWebsiteQuality(output, state = {}) {
  const sitePackage = parseSitePackage(output);
  const documents = sitePackage
    ? Object.entries(sitePackage.files || {})
    : [['index.html', String(output || '')]];
  const requiredPages = requiredSitePages(state);
  const requiredFiles = state.projectPackage === 'launch'
    ? []
    : requiredPages.map((page) => fileNameForPage(page));
  const documentReports = documents.map(([fileName, html]) => evaluateDocument(fileName, html, state));
  const failures = [];

  if (!documents.length) failures.push('No HTML document was produced.');
  if (state.projectPackage !== 'launch') {
    if (!sitePackage) failures.push('Growth and Signature packages must return a multi-file site package.');
    const missing = requiredFiles.filter((fileName) => !sitePackage?.files?.[fileName]);
    if (missing.length) failures.push(`Missing required pages: ${missing.join(', ')}.`);
  }

  documentReports.forEach((report) => {
    if (!report.hasNav) failures.push(`${report.fileName} has no navigation.`);
    if (!report.hasResponsiveNav) failures.push(`${report.fileName} has no Bootstrap mobile menu.`);
    if (report.badLanguage.length) failures.push(`${report.fileName} contains agency-facing wording.`);
    if (report.wordCount < minimumWordsFor(report.fileName, state)) failures.push(`${report.fileName} is too thin (${report.wordCount} words).`);
    if (report.sectionCount < minimumSectionsFor(report.fileName, state)) failures.push(`${report.fileName} has too few sections (${report.sectionCount}).`);
    if (report.headingCount < 3) failures.push(`${report.fileName} needs stronger heading structure.`);
    if (report.ctaCount < 2) failures.push(`${report.fileName} needs clearer calls to action.`);
  });

  const averageScore = documentReports.length
    ? Math.round(documentReports.reduce((total, report) => total + report.score, 0) / documentReports.length)
    : 0;
  const score = Math.max(0, averageScore - failures.length * 8);
  return {
    passed: failures.length === 0 && score >= 70,
    score,
    failures,
    documents: documentReports,
  };
}

export function hasProductionWebsiteQuality(output, state = {}) {
  return evaluateWebsiteQuality(output, state).passed;
}

function evaluateDocument(fileName, html, state) {
  const value = String(html || '');
  const text = visibleText(value);
  const sectionCount = countMatches(value, /<section\b/gi);
  const headingCount = countMatches(value, /<h[1-3]\b/gi);
  const paragraphCount = countMatches(value, /<p\b/gi);
  const ctaCount = countMatches(value, /<(a|button)\b[^>]*(btn|button|cta|href=)/gi);
  const imageCount = countMatches(value, /<img\b/gi);
  const formCount = countMatches(value, /<form\b/gi);
  const hasNav = /<nav[\s>]/i.test(value);
  const hasResponsiveNav = /navbar-toggler/i.test(value) && /navbar-collapse|offcanvas/i.test(value) && /bootstrap/i.test(value);
  const badLanguage = BAD_FINAL_SITE_LANGUAGE.filter((pattern) => pattern.test(value)).map((pattern) => pattern.source);
  const wordCount = text.split(/\s+/).filter((word) => /[a-z0-9]/i.test(word)).length;
  let score = 20;
  if (hasNav) score += 10;
  if (hasResponsiveNav) score += 10;
  score += Math.min(18, sectionCount * 4);
  score += Math.min(12, headingCount * 2);
  score += Math.min(12, paragraphCount);
  score += Math.min(10, ctaCount * 3);
  score += Math.min(8, imageCount * 4);
  score += Math.min(5, formCount * 5);
  if (wordCount >= minimumWordsFor(fileName, state)) score += 10;
  if (badLanguage.length) score -= 25;
  return {
    fileName,
    score: Math.max(0, Math.min(100, score)),
    wordCount,
    sectionCount,
    headingCount,
    paragraphCount,
    ctaCount,
    imageCount,
    formCount,
    hasNav,
    hasResponsiveNav,
    badLanguage,
  };
}

function requiredSitePages(state) {
  if (state.projectPackage === 'launch') return ['Home'];
  const pages = Array.isArray(state.selectedSitePages) && state.selectedSitePages.length
    ? state.selectedSitePages
    : ['Home', 'Services', 'About', 'FAQ', 'Contact'];
  return [...new Set(['Home', ...pages].map((page) => String(page || '').trim()).filter(Boolean))];
}

function minimumWordsFor(fileName, state) {
  if (state.projectPackage === 'launch') return 520;
  return fileName === 'index.html' ? 320 : 200;
}

function minimumSectionsFor(fileName, state) {
  if (state.projectPackage === 'launch') return 5;
  return fileName === 'index.html' ? 5 : 3;
}

function visibleText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMatches(value, pattern) {
  return String(value || '').match(pattern)?.length || 0;
}
