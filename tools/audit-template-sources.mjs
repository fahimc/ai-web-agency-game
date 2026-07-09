import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('./template-source-manifest.json', import.meta.url), 'utf8'));
const allowed = new Set(manifest.policy.allowedLicenses || []);
const repoSources = manifest.sources.filter((source) => source.type === 'repository' && source.url.includes('github.com/'));

for (const source of repoSources) {
  const repo = source.url.replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
  const response = await fetch(`https://api.github.com/repos/${repo}/license`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'microagency-template-auditor',
    },
  });
  if (!response.ok) {
    const fallback = String(source.license || '').trim();
    if (allowed.has(fallback)) {
      console.log(`${source.id}: ${fallback} -> allowed (manifest fallback, API ${response.status})`);
      continue;
    }
    console.log(`${source.id}: licence check failed (${response.status})`);
    continue;
  }
  const data = await response.json();
  const spdx = data.license?.spdx_id || 'NOASSERTION';
  const status = allowed.has(spdx) ? 'allowed' : 'review';
  console.log(`${source.id}: ${spdx} -> ${status}`);
}
