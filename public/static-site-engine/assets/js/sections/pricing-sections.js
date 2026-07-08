(() => {
  const S = window.MicroAgencySections;
  S.register({
    'pricing-cards': S.renderers.pricingCards,
    'pricing-comparison': S.renderers.pricingComparison,
  });
  S.registerPlaceholders([
    'pricing-table', 'pricing-toggle-monthly-yearly', 'pricing-single-offer',
    'pricing-menu-style', 'pricing-service-packages', 'pricing-feature-matrix',
  ]);
})();
