(() => {
  const S = window.MicroAgencySections;
  S.register({
    'features-grid': S.renderers.featuresGrid,
    'features-bento': S.renderers.featuresBento,
    'features-tabs': S.renderers.featuresTabs,
  });
  S.registerPlaceholders([
    'features-icon-list', 'features-split', 'features-comparison',
    'features-checklist', 'features-numbered', 'features-with-screenshots',
    'features-carousel',
  ]);
})();
