(() => {
  const S = window.MicroAgencySections;
  S.register({
    'testimonials-grid': S.renderers.testimonialsGrid,
    'testimonials-carousel': S.renderers.testimonialsCarousel,
    'logo-strip': S.renderers.logoStrip,
  });
  S.registerPlaceholders([
    'testimonials-featured', 'testimonials-video', 'reviews-list',
    'reviews-with-ratings', 'client-logos-grid', 'case-study-preview',
    'stats-proof-bar', 'certifications-strip', 'awards-section',
    'before-after-results',
  ]);
})();
