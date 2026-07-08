(() => {
  const S = window.MicroAgencySections;
  S.register({ 'faq-accordion': S.renderers.faqAccordion });
  S.registerPlaceholders([
    'faq-two-column', 'faq-categorised-tabs', 'faq-searchable',
    'faq-list', 'faq-with-contact-cta',
  ]);
})();
