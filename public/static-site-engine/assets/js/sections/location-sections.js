(() => {
  const S = window.MicroAgencySections;
  S.register({
    'areas-served': S.renderers.areasServed,
    'opening-hours': S.renderers.openingHours,
  });
  S.registerPlaceholders([
    'location-cards', 'location-detail-hero', 'location-service-list',
    'location-map', 'local-reviews', 'nearby-areas', 'directions-section',
  ]);
})();
