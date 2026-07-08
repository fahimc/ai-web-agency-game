(() => {
  const S = window.MicroAgencySections;
  S.register({ 'legal-page': S.renderers.legalPage });
  S.registerPlaceholders([
    'privacy-policy', 'cookie-policy', 'terms-page',
    'accessibility-statement', 'returns-policy', 'disclaimer',
  ]);
})();
