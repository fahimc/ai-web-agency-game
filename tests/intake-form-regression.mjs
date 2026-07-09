import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const cwd = dirname(dirname(fileURLToPath(import.meta.url)));
const port = 5182;
const baseUrl = `http://127.0.0.1:${port}`;

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

function intakeDraft() {
  return {
    projectId: 'intake_test',
    projectName: 'Static website project',
    projectModel: 'gpt-5.4-mini',
    projectPackage: 'launch',
    selectedDesignStyle: '',
    selectedDesignPalette: [],
    selectedSitePages: [],
    selectedSiteSections: [],
    designRecommendations: [],
    designRecommendationStatus: 'idle',
    reviewAssets: [],
    paid: false,
    phase: 'new_details',
    userName: 'Fahim',
    email: 'intake@example.com',
    clientDetails: '',
    brief: '',
    progress: 0,
    progressTask: 'Intake',
    activeEmployee: 'reception',
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
    pendingRun: '',
    pendingRevisionText: '',
    autoResumeAttempts: 0,
    speech: { employeeId: 'reception', text: 'Please complete the project form before the team starts work.', actions: ['openDetails'] },
  };
}

const server = await startServer();
let browser;
try {
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 430, height: 920 } });
  await context.addInitScript((draft) => {
    localStorage.clear();
    localStorage.setItem('tiny_office_draft_v2', JSON.stringify(draft));
  }, intakeDraft());
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.getByRole('button', { name: /continue/i }).click();
  await page.locator('.details-form').waitFor();

  assert.equal(await page.locator('.details-form textarea').count(), 1, 'intake should only have one optional textarea');
  assert.ok(await page.locator('.details-form select').count() >= 4, 'intake should use dropdowns for common answers');
  assert.equal(await page.getByRole('heading', { name: 'Pages' }).isVisible(), true, 'page selector should be labelled Pages');

  await page.getByLabel('Business name *').fill('Kaaz Studio');
  await page.getByLabel('Industry *').selectOption('Creative / portfolio');
  await page.getByLabel('Main offer or service').fill('Wedding photography');
  await page.getByLabel('Ideal customers *').selectOption('Couples');
  await page.getByLabel('Main goal *').selectOption('Show portfolio / work');
  await page.getByRole('button', { name: /Pricing/i }).click();
  await page.getByRole('button', { name: /Blog/i }).click();
  await page.getByRole('button', { name: /FAQ/i }).click();
  await page.getByRole('button', { name: /Services/i }).click();
  await page.getByRole('button', { name: /Save details and continue/i }).click();

  await page.locator('.package-modal').waitFor();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tiny_office_draft_v2')));
  assert.deepEqual(stored.selectedSitePages, ['Home', 'About', 'Contact', 'Pricing', 'Blog', 'FAQ']);
  assert.match(stored.clientDetails, /^Pages: Home, About, Contact, Pricing, Blog, FAQ$/m);
  console.log('Intake form regression tests passed.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
