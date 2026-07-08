(() => {
  const S = window.MicroAgencySections;
  S.register({ 'portfolio-grid': S.renderers.portfolioGrid });
  S.registerPlaceholders([
    'portfolio-masonry', 'portfolio-filterable', 'portfolio-carousel',
    'portfolio-case-study-cards', 'portfolio-before-after',
    'portfolio-featured-project', 'portfolio-gallery-lightbox',
  ]);
})();
