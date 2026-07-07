import JSZip from 'jszip';

export async function createNetlifyZip(html) {
  const zip = new JSZip();
  zip.file('index.html', html || '<!doctype html><html><body></body></html>');
  zip.file('_headers', '/*\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n');
  return zip.generateAsync({ type: 'blob' });
}

export async function deployToNetlify({ html, siteId, token }) {
  if (!html) throw new Error('Website preview is not ready yet.');
  if (!siteId || !token) throw new Error('Add a Netlify site ID and personal access token in Settings first.');

  const deploy = await fetch(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}/deploys`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/zip',
    },
    body: await createNetlifyZip(html),
  });

  if (!deploy.ok) {
    const message = await deploy.text().catch(() => '');
    throw new Error(`Netlify deploy failed (${deploy.status}). ${message}`.trim());
  }

  return deploy.json();
}
