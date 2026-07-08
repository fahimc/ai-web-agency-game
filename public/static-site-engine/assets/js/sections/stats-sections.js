(() => {
  const S = window.MicroAgencySections;
  S.register({ 'stats-bar': S.renderers.statsBar });
  S.registerPlaceholders([
    'stats-grid', 'stats-with-text', 'stats-cards',
    'stats-animated-counters', 'stats-case-study-results',
  ]);
})();
