import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  buildExampleSite,
  contrastRatio,
  normalizePalette,
  siteLayouts,
} from '../src/data/siteBlueprints.js';

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
    await page.getByRole('button', { name: /^User colours$/ }).click();
    await page.locator('.custom-palette-grid').waitFor();
    await page.getByRole('button', { name: /Modern mono/i }).click();
    assert.equal(await page.locator('.custom-palette-grid').count(), 0, 'preset selection should leave custom colour mode');
    await page.getByRole('button', { name: /^User colours$/ }).click();
    await page.locator('.custom-palette-grid input[type="color"]').first().evaluate((input) => {
      input.value = '#000000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.getByRole('button', { name: /Modern mono/i }).click();
    assert.equal(await page.locator('.custom-palette-grid').count(), 0, 'user should be able to return from custom colours to preset palettes');
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
  console.log('Design options regression tests passed.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
