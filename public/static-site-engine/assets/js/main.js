(function () {
  const data = window.MicroAgencySiteData;
  const engine = window.MicroAgencyLayoutEngine;
  const root = document.getElementById('site-root');
  if (!data || !engine || !root) return;
  const pageId = document.body.dataset.page || new URLSearchParams(location.search).get('page') || 'home';
  const page = data.pages[pageId] || data.pages.home;
  root.innerHTML = engine.renderPage(page);
})();
