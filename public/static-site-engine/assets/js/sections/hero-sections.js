(() => {
  const S = window.MicroAgencySections;
  S.register({
    'hero-centered': S.renderers.heroCentered,
    'hero-split': S.renderers.heroSplit,
    'hero-with-form': S.renderers.heroWithForm,
  });
  S.registerPlaceholders([
    'hero-fullscreen', 'hero-with-video', 'hero-with-background-image',
    'hero-with-card', 'hero-with-search', 'hero-with-stats', 'hero-minimal',
    'hero-local-business', 'hero-saas', 'hero-event', 'hero-product',
  ]);
})();
