(() => {
  const S = window.MicroAgencySections;
  S.register({ 'multi-step-form': S.renderers.multiStepForm });
  S.registerPlaceholders([
    'simple-form', 'quote-form', 'wizard-form', 'survey-form',
    'lead-magnet-form', 'newsletter-form', 'application-form', 'upload-form',
  ]);
})();
