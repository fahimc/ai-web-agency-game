import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  buildExampleSite,
  contrastRatio,
  fallbackDesignRecommendations,
  normalizeDesignRecommendations,
  normalizePalette,
  recommendedTemplateReferences,
  siteLayouts,
} from '../src/data/siteBlueprints.js';
import { evaluateWebsiteQuality } from '../src/utils/siteQuality.js';

const cwd = dirname(dirname(fileURLToPath(import.meta.url)));
const port = 5178;
const baseUrl = `http://127.0.0.1:${port}`;

const recommendations = [
  {
    id: 'test-local-service',
    layoutId: 'local-service',
    name: 'Local Service',
    tone: 'Practical, clear, trust-led',
    rationale: 'Built around enquiries, services, proof, and fast contact.',
    paletteName: 'Mira recommended',
    palette: ['#064e3b', '#2563eb', '#fff7ed', '#16a34a', '#ffffff'],
    pages: ['Home', 'Services', 'Gallery', 'About', 'Contact'],
    sections: ['Hero', 'Gallery', 'Services', 'Process', 'Testimonials'],
  },
  {
    id: 'test-portfolio',
    layoutId: 'portfolio-studio',
    name: 'Portfolio Studio',
    tone: 'Visual, calm, image-led',
    rationale: 'Makes the photography work the main decision point.',
    paletteName: 'Studio palette',
    palette: ['#111111', '#efe9e1', '#fff7ed', '#8a6a4f', '#ffffff'],
    pages: ['Home', 'Gallery', 'About', 'Contact'],
    sections: ['Hero', 'Gallery', 'Services', 'Contact details'],
  },
];

function baseSession(overrides = {}) {
  return {
    projectId: 'project_design_regression',
    projectName: 'Photo Bride',
    projectModel: 'gpt-5.4',
    projectPackage: 'growth',
    selectedDesignStyle: '',
    selectedDesignPalette: [],
    selectedSitePages: [],
    selectedSiteSections: [],
    designRecommendations: recommendations,
    designRecommendationStatus: 'ready',
    reviewAssets: [],
    paid: true,
    paymentEstimate: null,
    phase: 'design_options',
    userName: 'Regression Tester',
    email: 'client@example.com',
    clientDetails: '',
    brief: [
      'Business / client name: Photo Bride',
      'Industry: wedding photography',
      'Audience: brides',
      'Goal: showcase photography',
      'Offer: wedding photography',
    ].join('\n'),
    progress: 40,
    progressTask: 'Choose design direction',
    activeEmployee: 'design',
    outputs: {},
    quests: [],
    logs: [],
    convos: [],
    activeOutput: 'Plan',
    error: '',
    settings: {},
    running: false,
    approved: false,
    revisionCount: 0,
    speech: {
      employeeId: 'design',
      text: 'Choose a design direction.',
      actions: ['openDesignOptions'],
    },
    ...overrides,
  };
}

async function startServer() {
  const child = spawn(
    process.execPath,
    [join(cwd, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', String(port)],
    { cwd, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  child.stdout.on('data', () => {});
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return child;
    } catch {
      await delay(250);
    }
  }
  child.kill();
  throw new Error('Vite dev server did not start in time.');
}

async function openSavedProject(browser, session) {
  const context = await browser.newContext({ viewport: { width: 430, height: 920 } });
  await context.addInitScript((storedSession) => {
    localStorage.clear();
    localStorage.setItem('tiny_office_session_v2_client@example.com', JSON.stringify(storedSession));
  }, session);
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.getByPlaceholder('Your name...').fill('Tester');
  await page.getByRole('button', { name: /send/i }).click();
  await page.getByRole('button', { name: /^Returning$/ }).click();
  await page.getByPlaceholder('Your email...').fill('client@example.com');
  await page.getByRole('button', { name: /send/i }).click();
  await page.locator('select[aria-label="Choose previous project"]').waitFor();
  await page.getByRole('button', { name: /send/i }).click();
  await page.locator('[role="dialog"][aria-label="Choose Design Direction"]').waitFor();
  return { context, page };
}

async function testLoadingRecommendations(browser) {
  const session = baseSession({
    designRecommendations: [],
    designRecommendationStatus: 'loading',
    progressTask: 'Preparing design recommendations',
  });
  const { context, page } = await openSavedProject(browser, session);
  try {
    await page.getByText('Preparing recommendations...').waitFor();
    assert.equal(await page.locator('.palette-panel').count(), 0, 'palette controls should not render while recommendations are loading');
    assert.equal(await page.locator('.design-carousel-card').count(), 0, 'direction cards should not render while recommendations are loading');
    assert.equal(await page.locator('.design-preview-frame').count(), 0, 'preview iframe should not render while recommendations are loading');
    assert.equal(await page.getByText(/Option 1 of/i).count(), 0, 'option count should not appear while recommendations are loading');
  } finally {
    await context.close();
  }
}

async function testPaletteModeSwitching(browser) {
  const { context, page } = await openSavedProject(browser, baseSession());
  try {
    await page.locator('.palette-panel').waitFor();
    const previewTheme = async () => page.frameLocator('.design-preview-frame').locator('html').evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.getPropertyValue('--bg').trim(),
        accent: style.getPropertyValue('--accent').trim(),
      };
    });
    const initialTheme = await previewTheme();
    await page.getByRole('button', { name: /^User colours$/ }).click();
    await page.locator('.custom-palette-grid').waitFor();
    await page.getByRole('button', { name: /Modern mono/i }).click();
    assert.equal(await page.locator('.custom-palette-grid').count(), 0, 'preset selection should leave custom colour mode');
    assert.equal(await page.getByRole('button', { name: /Modern mono/i }).getAttribute('aria-pressed'), 'true', 'clicked palette should become selected');
    const monoTheme = await previewTheme();
    assert.notEqual(monoTheme.accent, initialTheme.accent, 'preview accent should change after selecting another palette');
    assert.equal(monoTheme.background, '#ffffff', 'modern mono should produce a white page background');
    await page.getByRole('button', { name: /^User colours$/ }).click();
    await page.locator('.custom-palette-grid input[type="color"]').first().evaluate((input) => {
      input.value = '#000000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.getByRole('button', { name: /Modern mono/i }).click();
    assert.equal(await page.locator('.custom-palette-grid').count(), 0, 'user should be able to return from custom colours to preset palettes');
    await page.locator('.modal-body').evaluate((element) => { element.scrollTop = 520; });
    await page.getByRole('button', { name: /Electric SaaS/i }).click();
    assert.equal(await page.getByRole('button', { name: /Electric SaaS/i }).getAttribute('aria-pressed'), 'true', 'lower palette presets should be selectable');
    const saasTheme = await previewTheme();
    assert.equal(saasTheme.accent, '#4f46e5', 'selected lower palette should update preview colours');
  } finally {
    await context.close();
  }
}

async function testGeneratedComponentContrast(browser) {
  const page = await browser.newPage({ viewport: { width: 430, height: 920 } });
  try {
    const html = buildExampleSite(
      siteLayouts.find((layout) => layout.id === 'local-service'),
      baseSession({
        projectPackage: 'growth',
        selectedSitePages: ['Home', 'Services', 'Gallery', 'About', 'Contact'],
        selectedSiteSections: ['Hero', 'Gallery', 'Services', 'Process', 'Testimonials'],
      }),
      normalizePalette(['#064e3b', '#2563eb', '#fff7ed', '#16a34a', '#ffffff']),
      { preview: true },
    );
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pairs = await page.evaluate(() => {
      function rgbToHex(value) {
        const match = String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!match) return '#000000';
        return `#${[match[1], match[2], match[3]].map((part) => Number(part).toString(16).padStart(2, '0')).join('')}`;
      }
      function pair(selector) {
        const element = document.querySelector(selector);
        const style = getComputedStyle(element);
        return {
          selector,
          foreground: rgbToHex(style.color),
          background: rgbToHex(style.backgroundColor),
        };
      }
      return [pair('.tag'), pair('.button'), pair('.card'), pair('.site-nav .nav-link')];
    });
    pairs.forEach((pair) => {
      const ratio = contrastRatio(pair.foreground, pair.background);
      assert.ok(ratio >= 4.5, `${pair.selector} contrast should be AA, got ${ratio.toFixed(2)} (${pair.foreground} on ${pair.background})`);
    });
  } finally {
    await page.close();
  }
}

function testFallbackWebsiteQuality() {
  const state = baseSession({
    projectPackage: 'growth',
    selectedDesignStyle: 'local-service',
    selectedDesignPalette: ['#064e3b', '#2563eb', '#fff7ed', '#16a34a', '#ffffff'],
    selectedSitePages: ['Home', 'Services', 'About', 'FAQ', 'Contact'],
    selectedSiteSections: ['Hero', 'Services', 'Process', 'Testimonials', 'FAQ', 'Contact details'],
  });
  const html = buildExampleSite(
    siteLayouts.find((layout) => layout.id === 'local-service'),
    state,
    state.selectedDesignPalette,
  );
  const report = evaluateWebsiteQuality(html, state);
  assert.equal(report.passed, true, `fallback website should pass quality gate: ${report.failures.join(' ')}`);
  const weakReport = evaluateWebsiteQuality('<!doctype html><html><body><nav>Home</nav><section><h1>Thin</h1><p>Too short.</p></section></body></html>', state);
  assert.equal(weakReport.passed, false, 'thin HTML should fail the production quality gate');
}

function testRestaurantRecommendationsDoNotMatchAppInsideWords() {
  const brief = [
    'Business: Oak Table Kitchen',
    'Industry: restaurant and private dining venue',
    'Audience: local diners and event organisers',
    'Goal: increase bookings',
    'Offer: seasonal British menu and private dining',
    'Tone: warm, appetising, polished',
  ].join('\n');
  const recommendation = fallbackDesignRecommendations({ brief, projectPackage: 'growth' }, 4)[0];
  assert.equal(recommendation.layoutId, 'restaurant-venue', 'restaurant brief should choose restaurant layout');
  assert.deepEqual(recommendation.pages, ['Home', 'Menu', 'Gallery', 'Events', 'Contact'], 'restaurant pages should not be replaced by SaaS pricing/case-study pages');
  assert.equal(recommendation.palette.includes('#2563eb'), false, 'restaurant fallback palette should not be padded with unrelated default blue');
}

function testTemplateBaseSelectionFromIntake() {
  const state = {
    projectPackage: 'growth',
    brief: [
      'Business / client name: Photo Bride',
      'Industry: Creative / portfolio',
      'Ideal customers / audience: Couples',
      'Project goal: Show portfolio / work',
      'Main offer / service: Wedding photography',
      'Template starting point: Visual portfolio / gallery style',
      'Pages: Home, Gallery, About, Contact',
    ].join('\n'),
  };
  const candidates = recommendedTemplateReferences(state, 4);
  assert.ok(candidates.some((template) => /portfolio/i.test(`${template.name} ${(template.useCases || []).join(' ')}`)), 'portfolio intake should rank portfolio templates');

  const raw = JSON.stringify({
    recommendations: [
    {
      layoutId: 'portfolio-studio',
      baseTemplateId: candidates[0].id,
      baseTemplateName: candidates[0].name,
      templateReason: 'Matches the portfolio-first intake and gallery-led page list.',
      name: 'Gallery-led Studio',
      tone: 'Editorial and selective',
      rationale: 'Puts the work first and keeps enquiries simple.',
      paletteName: 'Editorial mono',
      palette: ['#111111', '#efe9e1', '#fffaf5', '#8a6a4f', '#ffffff'],
      pages: ['Home', 'Gallery', 'About', 'Contact'],
      sections: ['Hero', 'Gallery', 'Services', 'Testimonials', 'Lead capture form'],
    },
    {
      layoutId: 'premium-editorial',
      baseTemplateId: candidates[1]?.id || candidates[0].id,
      baseTemplateName: candidates[1]?.name || candidates[0].name,
      templateReason: 'Supports an editorial service story.',
      name: 'Editorial Story',
      tone: 'Premium and calm',
      rationale: 'Balances imagery and trust.',
      paletteName: 'Soft editorial',
      palette: ['#111111', '#8a6a4f', '#fffaf5', '#d8c3ad', '#ffffff'],
      pages: ['Home', 'Gallery', 'About', 'Contact'],
      sections: ['Hero', 'Gallery', 'Process', 'Testimonials', 'Lead capture form'],
    },
    {
      layoutId: 'conversion-classic',
      baseTemplateId: candidates[2]?.id || candidates[0].id,
      baseTemplateName: candidates[2]?.name || candidates[0].name,
      templateReason: 'Keeps the enquiry path direct.',
      name: 'Conversion Portfolio',
      tone: 'Clear and practical',
      rationale: 'Makes the offer easy to compare.',
      paletteName: 'Clean contrast',
      palette: ['#0f172a', '#2563eb', '#f8fafc', '#0f766e', '#ffffff'],
      pages: ['Home', 'Gallery', 'About', 'Contact'],
      sections: ['Hero', 'Gallery', 'Services', 'FAQ', 'Lead capture form'],
    }],
  });
  const normalized = normalizeDesignRecommendations(raw, state, 4);
  assert.equal(normalized[0].baseTemplateId, candidates[0].id);
  assert.equal(normalized[0].baseTemplateName, candidates[0].name);

  const html = buildExampleSite(siteLayouts.find((layout) => layout.id === 'portfolio-studio'), {
    ...state,
    selectedTemplateId: normalized[0].baseTemplateId,
    selectedSitePages: normalized[0].pages,
    selectedSiteSections: normalized[0].sections,
    outputs: {},
  }, normalized[0].palette);
  assert.match(html, /microagency-template-base/i, 'generated package should record the template base in each HTML file');
  assert.match(html, new RegExp(normalized[0].baseTemplateId), 'generated package should include the selected template id');
}

async function testPendingDraftAutoResume(browser) {
  const session = baseSession({
    phase: 'running',
    running: false,
    pendingRun: 'preview',
    selectedDesignStyle: 'local-service',
    selectedDesignPalette: ['#064e3b', '#2563eb', '#fff7ed', '#16a34a', '#ffffff'],
    selectedSitePages: ['Home', 'Services', 'About', 'Contact'],
    selectedSiteSections: ['Hero', 'Services', 'Process', 'Testimonials', 'Contact details'],
    outputs: {
      SelectedDesign: 'Selected layout: Local Service\nPalette: #064e3b, #2563eb, #fff7ed, #16a34a, #ffffff',
    },
    progress: 25,
    progressTask: 'Agency working',
    speech: {
      employeeId: 'dev',
      text: 'The team is building the preview.',
      actions: [],
    },
  });
  const context = await browser.newContext({ viewport: { width: 430, height: 920 } });
  await context.addInitScript((storedSession) => {
    localStorage.clear();
    localStorage.setItem('tiny_office_draft_v2', JSON.stringify(storedSession));
  }, session);
  const page = await context.newPage();
  await page.route('**/.netlify/functions/openai-response', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ output_text: 'Resume-safe model response for the restored draft.' }),
  }));
  try {
    await page.goto(baseUrl);
    await page.locator('[role="dialog"][aria-label="Website Preview"]').waitFor({ timeout: 45000 });
    assert.equal(await page.getByRole('dialog', { name: 'Agency paused' }).count(), 0, 'resumable draft should not show the paused modal');
    assert.ok(await page.getByText('Approve preview').count(), 'auto-resumed draft should reach preview approval');
  } finally {
    await context.close();
  }
}

const server = await startServer();
let browser;
try {
  browser = await chromium.launch();
  console.log('Running loading-state regression...');
  await testLoadingRecommendations(browser);
  console.log('Running palette-switching regression...');
  await testPaletteModeSwitching(browser);
  console.log('Running generated contrast regression...');
  await testGeneratedComponentContrast(browser);
  console.log('Running fallback quality regression...');
  testFallbackWebsiteQuality();
  console.log('Running recommendation fit regression...');
  testRestaurantRecommendationsDoNotMatchAppInsideWords();
  console.log('Running template base selection regression...');
  testTemplateBaseSelectionFromIntake();
  console.log('Running pending-draft auto-resume regression...');
  await testPendingDraftAutoResume(browser);
  console.log('Design options regression tests passed.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
