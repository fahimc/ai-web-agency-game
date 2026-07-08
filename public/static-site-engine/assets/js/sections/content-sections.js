(() => {
  const S = window.MicroAgencySections;
  S.register({
    'intro-centered': S.renderers.introCentered,
    'intro-two-column': S.renderers.introTwoColumn,
    'article-body': S.renderers.articleBody,
    'legal-content-section': S.renderers.legalPage,
    'article-content-section': S.renderers.articleBody,
  });
  S.registerPlaceholders([
    'intro-left-aligned', 'intro-with-eyebrow', 'intro-with-stats',
    'intro-with-cta', 'rich-text-section',
    'about-split', 'about-story', 'about-founder', 'about-mission-values',
    'about-timeline', 'about-stats', 'about-image-collage', 'about-company-profile',
  ]);
})();
