(() => {
  const S = window.MicroAgencySections;
  S.register({
    'contact-form-split': S.renderers.contactFormSplit,
    'contact-details-cards': S.renderers.contactDetailsCards,
    'opening-hours': S.renderers.openingHours,
  });
  S.registerPlaceholders([
    'contact-form-centered', 'contact-map-split', 'contact-with-opening-hours',
    'contact-with-service-selector', 'contact-quote-form', 'contact-booking-form',
    'contact-newsletter', 'contact-callback-request',
  ]);
})();
