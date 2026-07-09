import React, { useMemo, useState } from 'react';
import { downloadedTemplateLibrary } from '../data/templateLibrary.js';

function previewPages(template) {
  const pages = (template.htmlFiles || [])
    .map((file) => String(file).replace(/\\/g, '/'))
    .map((file) => file.startsWith('dist/') ? file.slice(5) : file)
    .filter((file) => file.endsWith('.html'))
    .sort((a, b) => Number(b === 'index.html') - Number(a === 'index.html') || a.localeCompare(b))
    .map((file) => ({
      file,
      label: pageLabel(file),
      href: `/template-previews/${template.id}/${file}`,
    }));
  return pages.length ? pages : [{ file: 'index.html', label: 'Home', href: `/template-previews/${template.id}/index.html` }];
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

function cleanDescription(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function TemplateReviewPage() {
  const [query, setQuery] = useState('');
  const templates = useMemo(() => downloadedTemplateLibrary.map((template) => ({
    ...template,
    pages: previewPages(template),
    description: cleanDescription(template.description),
  })), []);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return templates;
    return templates.filter((template) => [
      template.name,
      template.id,
      template.description,
      ...(template.useCases || []),
      ...(template.sectionPatterns || []),
      ...(template.motionPatterns || []),
    ].join(' ').toLowerCase().includes(needle));
  }, [query, templates]);

  return (
    <main className="template-review-page">
      <header className="template-review-hero">
        <a className="template-back-link" href="/">Back to MicroAgency AI</a>
        <div>
          <p className="template-eyebrow">Template review library</p>
          <h1>Review every template available to the website builder</h1>
          <p>
            These are licence-checked source references used by MicroAgency AI for layout, section,
            motion, and Bootstrap composition guidance. Open any preview to inspect the template.
          </p>
        </div>
        <div className="template-review-stats" aria-label="Template library summary">
          <span><b>{templates.length}</b> templates</span>
          <span><b>{templates.reduce((total, template) => total + template.pages.length, 0)}</b> preview pages</span>
        </div>
      </header>

      <section className="template-toolbar" aria-label="Template filters">
        <label>
          <span>Search templates</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try SaaS, portfolio, restaurant, pricing, blog..."
          />
        </label>
        <a className="template-secondary-link" href="/template-previews/manifest.json">Open preview manifest</a>
      </section>

      <section className="template-grid" aria-label="Available template previews">
        {filtered.map((template) => (
          <article className="template-card" key={template.id}>
            <div className="template-card-head">
              <div>
                <p className="template-eyebrow">{template.framework} / {template.license}</p>
                <h2>{template.name}</h2>
              </div>
              <span className={`template-priority ${template.priority || 'medium'}`}>{template.priority || 'medium'}</span>
            </div>
            <p>{template.description}</p>
            <div className="template-tags">
              {(template.useCases || []).slice(0, 6).map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="template-patterns">
              <b>Useful patterns</b>
              <span>{(template.sectionPatterns || []).join(', ') || 'General page structure'}</span>
            </div>
            <div className="template-actions">
              <a className="template-primary-link" href={template.pages[0].href} target="_blank" rel="noreferrer">Open preview</a>
              <a className="template-secondary-link" href={template.sourceUrl} target="_blank" rel="noreferrer">Source</a>
            </div>
            <details className="template-pages">
              <summary>{template.pages.length} page{template.pages.length === 1 ? '' : 's'} available</summary>
              <div>
                {template.pages.map((page) => (
                  <a key={page.file} href={page.href} target="_blank" rel="noreferrer">{page.label}</a>
                ))}
              </div>
            </details>
          </article>
        ))}
      </section>
    </main>
  );
}
