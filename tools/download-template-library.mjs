import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, 'tools', 'template-source-manifest.json');
const vendorRoot = join(root, 'template-library', 'vendor');
const allowedRoot = resolve(root, 'template-library');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const allowedLicenses = new Set(manifest.policy.allowedLicenses || []);
const repoSources = manifest.sources.filter((source) => source.type === 'repository');

await mkdir(vendorRoot, { recursive: true });

for (const source of repoSources) {
  const repo = githubRepoPath(source.url);
  const license = await githubLicense(repo) || manifestLicense(source);
  if (!allowedLicenses.has(license)) {
    console.log(`${source.id}: skipped, licence ${license || 'unknown'} is not allowed`);
    continue;
  }
  const target = resolve(vendorRoot, source.id);
  if (!target.startsWith(allowedRoot)) throw new Error(`Refusing to write outside template-library: ${target}`);
  if (existsSync(target)) await rm(target, { recursive: true, force: true });
  console.log(`${source.id}: cloning ${repo}`);
  await run('git', ['clone', '--depth', '1', source.url, target]);
  await rm(join(target, '.git'), { recursive: true, force: true });
  await writeFile(join(target, '.microagency-source.json'), JSON.stringify({
    ...source,
    repo,
    downloadedAt: new Date().toISOString(),
    verifiedLicense: license,
  }, null, 2));
}

function githubRepoPath(url) {
  return String(url || '').replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
}

async function githubLicense(repo) {
  const response = await fetch(`https://api.github.com/repos/${repo}/license`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'microagency-template-downloader',
    },
  });
  if (!response.ok) return '';
  const data = await response.json();
  return data.license?.spdx_id || '';
}

function manifestLicense(source) {
  const license = String(source.license || '').trim();
  return allowedLicenses.has(license) ? license : '';
}

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}
