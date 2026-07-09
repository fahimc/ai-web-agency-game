import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const cwd = dirname(dirname(fileURLToPath(import.meta.url)));
const port = 5181;
const baseUrl = `http://127.0.0.1:${port}`;
const manifestPath = join(cwd, 'public', 'template-previews', 'manifest.json');

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

async function assertHtmlAvailable(path) {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.ok, true, `${path} should be served`);
  const html = await response.text();
  assert.match(html, /<!doctype html|<html/i, `${path} should be an HTML page`);
}

if (!existsSync(manifestPath)) {
  throw new Error('Template preview manifest is missing. Run npm run templates:previews first.');
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
assert.equal(manifest.count, 25, 'all downloaded templates should be exported');
assert.equal(manifest.templates.length, 25, 'manifest should list all exported templates');
for (const template of manifest.templates) {
  assert.ok(template.previewHref, `${template.id} should have a previewHref`);
  assert.ok(template.pages.length >= 1, `${template.id} should have at least one page`);
  assert.ok(existsSync(join(cwd, 'public', template.previewHref.replace(/^\//, ''))), `${template.previewHref} should exist on disk`);
}

const server = await startServer();
let browser;
try {
  await assertHtmlAvailable('/template-previews/startbootstrap-agency/index.html');
  await assertHtmlAvailable('/template-previews/startbootstrap-modern-business/contact.html');
  await assertHtmlAvailable('/template-previews/startbootstrap-portfolio-item/index.html');

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${baseUrl}/templates`);
  await page.locator('.template-card').first().waitFor();
  const cardCount = await page.locator('.template-card').count();
  assert.equal(cardCount, 25, 'template review page should list every template');
  const firstPreview = await page.locator('.template-primary-link').first().getAttribute('href');
  assert.ok(firstPreview?.startsWith('/template-previews/'), 'template cards should link to exported previews');
  await page.fill('.template-toolbar input', 'restaurant');
  const filteredCount = await page.locator('.template-card').count();
  assert.ok(filteredCount >= 1 && filteredCount < 25, 'search should filter templates');
  console.log('Template review regression tests passed.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
