(() => {
  const S = window.MicroAgencySections;
  S.register({
    'cta-band': S.renderers.ctaBand,
    'cta-split': S.renderers.ctaSplit,
  });
  S.registerPlaceholders([
    'cta-centered', 'cta-card', 'cta-full-width', 'cta-with-background-image',
    'cta-with-form', 'cta-newsletter', 'cta-sticky-bottom',
    'cta-floating-button', 'cta-inline',
  ]);
})();
