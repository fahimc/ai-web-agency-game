(() => {
  const S = window.MicroAgencySections;
  S.register({ 'comparison-table': S.renderers.pricingComparison });
  S.registerPlaceholders([
    'comparison-cards', 'comparison-before-after', 'comparison-us-vs-them',
    'comparison-feature-matrix', 'comparison-tabs',
  ]);
})();
