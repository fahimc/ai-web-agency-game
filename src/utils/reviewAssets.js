export async function readReviewFile(file) {
  const dataUrl = await readAsDataUrl(file);
  let text = '';
  if (isTextFile(file)) text = await readAsText(file);
  else if (/\.docx$/i.test(file.name)) text = await readDocxText(file);
  else if (/\.pdf$/i.test(file.name)) text = await readPdfLooseText(file);
  return {
    id: `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    type: file.type || fileTypeFromName(file.name),
    size: file.size,
    dataUrl,
    text,
  };
}

export function reviewAssetsPrompt(assets = []) {
  return assets.slice(-12).map((asset, index) => {
    const kind = String(asset.type || '').startsWith('image/') ? 'Image' : 'Document';
    const text = asset.text ? `\nNotes/text excerpt: ${String(asset.text).slice(0, 1200)}` : '';
    const imageNote = kind === 'Image' ? '\nUse this image as available site imagery when relevant. The app can embed the uploaded image data directly.' : '';
    return `${index + 1}. ${kind}: ${asset.name} (${asset.type || 'unknown'}, ${Math.round((asset.size || 0) / 1024)} KB)${imageNote}${text}`;
  }).join('\n\n');
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').slice(0, 12000));
    reader.onerror = () => reject(reader.error || new Error('Could not read file text.'));
    reader.readAsText(file);
  });
}

async function readDocxText(file) {
  try {
    const { default: JSZip } = await import('jszip');
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const xml = await zip.file('word/document.xml')?.async('string');
    return String(xml || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 12000);
  } catch {
    return '';
  }
}

async function readPdfLooseText(file) {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const decoded = new TextDecoder('latin1').decode(bytes);
    return decoded.replace(/[^\x20-\x7E\n\r]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);
  } catch {
    return '';
  }
}

function isTextFile(file) {
  return /^text\//i.test(file.type || '') || /\.(txt|md|csv|json)$/i.test(file.name);
}

function fileTypeFromName(name) {
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)) return 'image/*';
  if (/\.pdf$/i.test(name)) return 'application/pdf';
  if (/\.docx?$/i.test(name)) return 'application/msword';
  return 'application/octet-stream';
}
