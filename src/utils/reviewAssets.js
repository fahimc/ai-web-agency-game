export async function readReviewFile(file) {
  const type = file.type || fileTypeFromName(file.name);
  const isImage = String(type).startsWith('image/');
  const dataUrl = isImage ? await readImageDataUrl(file) : '';
  let text = '';
  if (isTextFile(file)) text = await readAsText(file);
  else if (/\.docx$/i.test(file.name)) text = await readDocxText(file);
  else if (/\.pdf$/i.test(file.name)) text = await readPdfLooseText(file);
  if (isImage && !dataUrl) {
    text = `Large image uploaded as reference only. File name: ${file.name}. Original size: ${Math.round(file.size / 1024)} KB. Ask the client for a smaller/compressed image if this exact file must be embedded.`;
  }
  return {
    id: `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    type,
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

async function readImageDataUrl(file) {
  if (file.size > 3000000) return '';
  if (/svg/i.test(file.type || file.name)) {
    return file.size <= 350000 ? readAsDataUrl(file) : '';
  }
  let objectUrl = '';
  try {
    objectUrl = URL.createObjectURL(file);
    const image = await loadImage(objectUrl);
    const max = 1400;
    const scale = Math.min(1, max / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return compressedImageDataUrl(canvas);
  } catch {
    return file.size <= 700000 ? readAsDataUrl(file) : '';
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function compressedImageDataUrl(canvas) {
  const qualities = [0.78, 0.66, 0.54, 0.42];
  for (const quality of qualities) {
    const value = canvas.toDataURL('image/jpeg', quality);
    if (value.length <= 650000) return value;
  }
  return canvas.toDataURL('image/jpeg', 0.36);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not read image.'));
    image.src = src;
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
    const bytes = new Uint8Array(await file.slice(0, 1200000).arrayBuffer());
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
