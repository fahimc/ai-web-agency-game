(() => {
  const S = window.MicroAgencySections;
  S.register({
    'services-grid': S.renderers.servicesGrid,
    'services-tabs': S.renderers.servicesTabs,
  });
  S.registerPlaceholders([
    'services-list', 'services-cards', 'services-icon-grid', 'services-with-image',
    'services-accordion', 'services-carousel', 'services-featured-main-plus-grid',
    'services-category-groups',
  ]);
})();
