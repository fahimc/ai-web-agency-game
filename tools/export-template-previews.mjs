import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const libraryPath = join(root, 'template-library', 'templates.json');
const vendorRoot = join(root, 'template-library', 'vendor');
const previewRoot = join(root, 'public', 'template-previews');

const library = JSON.parse(await readFile(libraryPath, 'utf8'));
const availableTemplates = library.templates.filter((template) => existsSync(sourceDirFor(template)));

if (!availableTemplates.length) {
  const existingManifest = join(previewRoot, 'manifest.json');
  if (existsSync(existingManifest)) {
    console.log('No local vendor template cache found; keeping existing public/template-previews output.');
    process.exit(0);
  }
  throw new Error('No local vendor template cache found and public/template-previews is missing.');
}

const manifest = {
  version: 1,
  generatedAt: library.generatedAt || null,
  count: library.templates.length,
  templates: [],
};

await rm(previewRoot, { recursive: true, force: true });
await mkdir(previewRoot, { recursive: true });

for (const template of library.templates) {
  const vendorDir = join(vendorRoot, template.id);
  const sourceDir = sourceDirFor(template);
  const targetDir = join(previewRoot, template.id);

  if (!existsSync(sourceDir)) {
    console.warn(`Skipping ${template.id}: source folder missing.`);
    continue;
  }

  await cp(sourceDir, targetDir, {
    recursive: true,
    filter: (source) => {
      const normalized = source.replace(/\\/g, '/');
      return !normalized.includes('/node_modules/')
        && !normalized.includes('/.git/')
        && !normalized.endsWith('/package-lock.json');
    },
  });

  const sourcePrefix = relative(vendorDir, sourceDir).replace(/\\/g, '/');
  const pages = (template.htmlFiles || [])
    .map((file) => file.replace(/\\/g, '/'))
    .filter((file) => !sourcePrefix || file === sourcePrefix || file.startsWith(`${sourcePrefix}/`))
    .map((file) => sourcePrefix ? file.slice(sourcePrefix.length + 1) : file)
    .filter(Boolean)
    .sort((a, b) => Number(b === 'index.html') - Number(a === 'index.html') || a.localeCompare(b))
    .map((file) => ({
      file,
      label: pageLabel(file),
      href: `/template-previews/${template.id}/${file}`,
    }));

  if (!pages.length && existsSync(join(targetDir, 'index.html'))) {
    pages.push({ file: 'index.html', label: 'Home', href: `/template-previews/${template.id}/index.html` });
  }

  manifest.templates.push({
    id: template.id,
    name: template.name,
    sourceUrl: template.sourceUrl,
    license: template.license,
    framework: template.framework,
    useCases: template.useCases || [],
    priority: template.priority || 'medium',
    description: cleanText(template.description),
    sectionPatterns: template.sectionPatterns || [],
    motionPatterns: template.motionPatterns || [],
    pages,
    previewHref: pages[0]?.href || `/template-previews/${template.id}/`,
  });
}

await writeFile(join(previewRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Exported ${manifest.templates.length} template previews to public/template-previews.`);

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function pageLabel(file) {
  const base = file.split('/').pop().replace(/\.html$/i, '');
  if (base === 'index') return 'Home';
  return base
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sourceDirFor(template) {
  const vendorDir = join(vendorRoot, template.id);
  const distDir = join(vendorDir, 'dist');
  return existsSync(distDir) ? distDir : vendorDir;
}
