(() => {
  const S = window.MicroAgencySections;
  S.register({
    'thank-you-section': S.renderers.thankYou,
    '404-section': S.renderers.notFound,
  });
  S.registerPlaceholders([
    'confirmation-section', 'coming-soon-section', 'maintenance-section',
    'password-placeholder-section', 'empty-state-section', 'alert-section',
    'cookie-banner', 'privacy-notice', 'newsletter-popup', 'exit-intent-modal',
    'search-bar-section', 'filter-tabs-section', 'filter-sidebar-section',
    'category-pills', 'sort-dropdown', 'results-grid', 'no-results-section',
    'menu-list', 'menu-cards', 'menu-tabs', 'menu-category-sections',
    'menu-price-list', 'catalogue-grid', 'catalogue-filter-tabs',
    'event-hero', 'event-details', 'event-schedule', 'event-speakers',
    'event-pricing', 'event-registration-cta', 'event-faq', 'event-location-map',
  ]);
})();
