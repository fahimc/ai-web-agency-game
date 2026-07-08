(() => {
  const S = window.MicroAgencySections;
  S.register({
    'process-numbered-cards': S.renderers.processNumberedCards,
    'process-timeline': S.renderers.processTimeline,
  });
  S.registerPlaceholders([
    'process-horizontal', 'process-vertical', 'process-zigzag',
    'process-accordion', 'process-tabs',
  ]);
})();
