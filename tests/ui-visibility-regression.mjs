import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { STATIC_VOUCHER_CODE } from '../src/utils/pricing.js';

const cwd = dirname(dirname(fileURLToPath(import.meta.url)));
const port = 5179;
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

function storedSession(overrides = {}) {
  return {
    projectId: 'ui_visibility_project',
    projectName: 'Visibility Test Site',
    projectModel: 'gpt-5.4-mini',
    projectPackage: 'growth',
    selectedDesignStyle: 'local-service',
    selectedDesignPalette: ['#173d35', '#18a058', '#fff7ed', '#eab308', '#ffffff'],
    selectedSitePages: ['Home', 'Services', 'About', 'FAQ', 'Contact'],
    selectedSiteSections: ['Hero', 'Services', 'Process', 'FAQ', 'Contact details'],
    designRecommendations: [],
    designRecommendationStatus: 'idle',
    reviewAssets: [],
    paid: true,
    phase: 'complete',
    userName: 'UI Tester',
    email: 'ui@example.com',
    clientDetails: 'Business: Visibility Test Site',
    brief: 'Business: Visibility Test Site\nIndustry: local services\nAudience: customers\nGoal: get enquiries\nOffer: useful services',
    progress: 100,
    progressTask: 'Complete',
    activeEmployee: 'reception',
    outputs: {
      WebsiteHTML: '<!doctype html><html><body><nav>Site</nav><main><section><h1>Site</h1></section></main></body></html>',
      QAReport: '# QA',
      ProjectPDF: 'data:application/pdf;base64,JVBERi0x',
    },
    quests: [],
    logs: [],
    convos: [],
    activeOutput: 'ProjectPDF',
    error: '',
    pendingRun: '',
    pendingRevisionText: '',
    autoResumeAttempts: 0,
    settings: {},
    running: false,
    approved: true,
    revisionCount: 0,
    ...overrides,
  };
}

async function pageWithDraft(browser, session) {
  const context = await browser.newContext({ viewport: { width: 430, height: 920 } });
  await context.addInitScript((stored) => {
    localStorage.clear();
    localStorage.setItem('tiny_office_draft_v2', JSON.stringify(stored));
  }, session);
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.locator('.game-speech').waitFor();
  return { context, page };
}

async function uiSnapshot(page) {
  return page.evaluate(() => {
    function info(selector) {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        text: element.textContent.replace(/\s+/g, ' ').trim(),
        className: element.className,
        visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
        inViewport: rect.bottom <= innerHeight && rect.top >= 0 && rect.right <= innerWidth && rect.left >= 0,
        top: rect.top,
        bottom: rect.bottom,
      };
    }
    return {
      phase: info('.phase-pill'),
      chat: info('.chat-dock'),
      speech: info('.game-speech'),
      speechActions: info('.speech-actions'),
      quickbar: info('.quickbar'),
      outputs: info('.quick-output-button'),
      info: info('.info-button'),
      menu: info('.menu-button'),
      continueButton: info('.continue-button'),
      viewport: { width: innerWidth, height: innerHeight },
    };
  });
}

async function testInitialChatVisible(browser) {
  const context = await browser.newContext({ viewport: { width: 430, height: 920 } });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  try {
    await page.goto(baseUrl);
    await page.locator('.chat-dock.show').waitFor();
    const ui = await uiSnapshot(page);
    assert.ok(ui.chat.inViewport, `chat dock should be visible in welcome phase: ${JSON.stringify(ui.chat)}`);
    assert.ok(ui.speech.text.includes('what should I call you'), 'welcome speech should ask for name');
    assert.ok(ui.info.inViewport, 'Info button should be visible');
    assert.ok(ui.menu.inViewport, 'Menu button should be visible');
  } finally {
    await context.close();
  }
}

async function testCompleteRestoreRepairsSpeechAndActions(browser) {
  const { context, page } = await pageWithDraft(browser, storedSession({ speech: null }));
  try {
    const ui = await uiSnapshot(page);
    assert.equal(ui.phase.text.includes('Complete'), true, 'phase should remain complete');
    assert.equal(ui.speech.text.includes('Before we start'), false, 'complete restore must not show welcome prompt');
    assert.ok(ui.speech.text.includes('complete'), `complete speech should explain completed project: ${ui.speech.text}`);
    assert.ok(ui.speechActions.text.includes('Open outputs'), 'complete speech should offer outputs');
    assert.ok(ui.speechActions.text.includes('New project'), 'complete speech should offer new project');
    assert.equal(ui.chat.className.includes('show'), false, 'complete phase should not show chat input');
    assert.ok(ui.outputs.inViewport, `output pill should be visible on mobile: ${JSON.stringify(ui.outputs)}`);
    assert.ok(ui.info.inViewport, 'Info button should be visible');
    assert.ok(ui.menu.inViewport, 'Menu button should be visible');
  } finally {
    await context.close();
  }
}

async function testPaymentRestoreRepairsSpeechAndContinue(browser) {
  const { context, page } = await pageWithDraft(browser, storedSession({
    phase: 'payment',
    progress: 5,
    progressTask: 'Payment',
    outputs: {},
    activeOutput: 'Plan',
    approved: false,
    speech: { employeeId: 'reception', text: 'Hi, I am Nova. Before we start, what should I call you?', actions: [] },
  }));
  try {
    const ui = await uiSnapshot(page);
    assert.ok(ui.phase.text.includes('Payment'), 'phase should remain payment');
    assert.equal(ui.speech.text.includes('Before we start'), false, 'payment restore must not show welcome prompt');
    assert.ok(ui.speech.text.includes('Payment'), `payment speech should explain payment: ${ui.speech.text}`);
    assert.ok(ui.speechActions.text.includes('Pay now'), 'payment speech should offer payment action');
    assert.ok(ui.continueButton.inViewport, 'Continue button should be visible for payment phase');
    assert.equal(ui.chat.className.includes('show'), false, 'payment phase should not show chat input');
  } finally {
    await context.close();
  }
}

async function testVoucherPaymentSkipsUpload(browser) {
  const { context, page } = await pageWithDraft(browser, storedSession({
    phase: 'payment',
    progress: 5,
    progressTask: 'Payment',
    outputs: {},
    activeOutput: 'Plan',
    approved: false,
    selectedDesignStyle: '',
    selectedDesignPalette: [],
    speech: { employeeId: 'reception', text: 'Payment is required before the team starts.', actions: ['openPayment'] },
  }));
  await page.route('**/.netlify/functions/paypal-config', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ configured: false, clientId: '' }),
  }));
  await page.route('**/.netlify/functions/openai-response', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      output_text: JSON.stringify({
        recommendations: [{
          layoutId: 'local-service',
          name: 'Trust-led service',
          tone: 'Clear and practical',
          rationale: 'Built around service clarity and fast enquiries.',
          paletteName: 'Fresh trust',
          palette: ['#173d35', '#18a058', '#fff7ed', '#eab308', '#ffffff'],
          pages: ['Home', 'Services', 'About', 'Contact'],
          sections: ['Hero', 'Services', 'Process', 'Contact details'],
        }],
      }),
    }),
  }));
  try {
    await page.getByRole('button', { name: /continue/i }).click();
    await page.locator('[role="dialog"][aria-label="Project Payment"]').waitFor();
    await page.getByLabel('Voucher code').fill(STATIC_VOUCHER_CODE);
    await page.getByRole('button', { name: /apply voucher/i }).click();
    await page.locator('[role="dialog"][aria-label="Choose Design Direction"]').waitFor();
    assert.equal(await page.getByText(/optional files|upload images|skip files|project files/i).count(), 0, 'voucher payment should go directly to design options, not file upload');
    assert.ok(await page.getByText(/Mira is preparing design directions|Pick a visual route/i).count(), 'design stage should be visible after voucher payment');
  } finally {
    await context.close();
  }
}

async function testPreviewContentEditorUpdatesWebsite(browser) {
  const { context, page } = await pageWithDraft(browser, storedSession({
    phase: 'approval',
    progress: 70,
    progressTask: 'Preview approval',
    activeOutput: 'WebsiteHTML',
    approved: false,
    outputs: {
      WebsiteHTML: '<!doctype html><html><body><nav>Site</nav><main><section><h1>Original headline</h1><p>Original paragraph for customers.</p><a class="button" href="#contact">Start an enquiry</a></section></main></body></html>',
    },
    speech: { employeeId: 'dev', text: 'Your website preview is ready. Review it, approve it, or request changes.', actions: ['openPreview', 'approve'] },
  }));
  try {
    await page.getByRole('button', { name: /continue/i }).click();
    await page.locator('[role="dialog"][aria-label="Website Preview"]').waitFor();
    await page.getByRole('button', { name: /edit content\/images/i }).click();
    await page.getByLabel('H1 heading').fill('Edited customer headline');
    await page.getByLabel('Paragraph 2').fill('Edited paragraph that the customer can approve before downloading.');
    await page.getByRole('button', { name: /save content changes/i }).click();
    await page.frameLocator('.preview-frame').getByRole('heading', { name: 'Edited customer headline' }).waitFor();
    await page.frameLocator('.preview-frame').getByText('Edited paragraph that the customer can approve before downloading.').waitFor();
  } finally {
    await context.close();
  }
}

const server = await startServer();
let browser;
try {
  browser = await chromium.launch();
  await testInitialChatVisible(browser);
  await testCompleteRestoreRepairsSpeechAndActions(browser);
  await testPaymentRestoreRepairsSpeechAndContinue(browser);
  await testVoucherPaymentSkipsUpload(browser);
  await testPreviewContentEditorUpdatesWebsite(browser);
  console.log('UI visibility regression tests passed.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
