import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { employees } from '../data/employees.js';
import { outputNames, outputOrder } from '../data/outputs.js';
import { siteLayouts, buildDesignSelectionMarkdown, buildExampleSite } from '../data/siteBlueprints.js';
import { completionSteps, previewSteps } from '../data/steps.js';
import { callModelInBackground } from '../services/modelClient.js';
import {
  clearDraft,
  createProjectId,
  defaultSettings,
  deleteProject,
  exportProject,
  listProjects,
  loadSession,
  restoreSettings,
  saveDraft,
} from '../services/storage.js';
import { cleanHTML, downloadText, extractEmail, phaseLabel, safeFileName } from '../utils/text.js';
import { createProjectPdf } from '../utils/pdf.js';
import { MAX_REVISIONS, estimateAiCost, packageForModel, packageOption } from '../utils/pricing.js';

const emptyState = {
  phase: 'name',
  projectId: '',
  projectName: '',
  projectModel: 'gpt-5.4-mini',
  projectPackage: 'launch',
  selectedDesignStyle: '',
  selectedDesignPalette: [],
  selectedSitePages: [],
  selectedSiteSections: [],
  paid: false,
  paymentEstimate: null,
  availableProjects: [],
  userName: '',
  email: '',
  clientDetails: '',
  brief: '',
  progress: 0,
  progressTask: 'Waiting',
  activeEmployee: 'reception',
  outputs: {},
  quests: [],
  logs: [],
  convos: [],
  activeOutput: 'Plan',
  error: '',
  settings: defaultSettings,
  running: false,
  approved: false,
  revisionCount: 0,
  lastSaved: '',
  speech: {
    employeeId: 'reception',
    text: 'Hi, I am Nova. Before we start, what should I call you?',
    actions: [],
  },
};

export function useAgencyController() {
  const [state, setState] = useState(() => {
    const settings = restoreSettings();
    return { ...emptyState, settings };
  });
  const [menuTab, setMenuTab] = useState('status');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const aborter = useRef(null);
  const startAgencyRef = useRef(null);
  const stateRef = useRef(state);

  const update = useCallback((updater, persist = true) => {
    const current = stateRef.current;
    const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    if (persist) {
      const saved = saveDraft(next);
      const nextWithSaveTime = {
        ...next,
        projectId: saved.projectId || next.projectId,
        projectName: saved.projectName || next.projectName,
        projectModel: saved.projectModel || next.projectModel,
      projectPackage: saved.projectPackage || next.projectPackage,
      selectedDesignStyle: saved.selectedDesignStyle || next.selectedDesignStyle,
      selectedDesignPalette: saved.selectedDesignPalette || next.selectedDesignPalette,
      selectedSitePages: saved.selectedSitePages || next.selectedSitePages,
      selectedSiteSections: saved.selectedSiteSections || next.selectedSiteSections,
        paid: saved.paid ?? next.paid,
        paymentEstimate: saved.paymentEstimate || next.paymentEstimate,
        lastSaved: saved.lastSaved,
      };
      stateRef.current = nextWithSaveTime;
      setState(nextWithSaveTime);
      return;
    }
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(''), 2400);
  }, []);

  const speak = useCallback((employeeId, text, actions = []) => {
    update((current) => ({
      ...current,
      activeEmployee: employeeId,
      speech: { employeeId, text, actions },
    }));
  }, [update]);

  const addConvo = useCallback((who, text) => {
    update((current) => ({
      ...current,
      convos: [...current.convos.slice(-199), { who, text, time: new Date().toLocaleTimeString() }],
    }));
  }, [update]);

  const log = useCallback((who, text) => {
    update((current) => ({
      ...current,
      logs: [{ who, text, time: new Date().toLocaleTimeString() }, ...current.logs].slice(0, 250),
    }));
  }, [update]);

  const addQuest = useCallback((title, employeeId, status) => {
    update((current) => {
      const existing = current.quests.find((quest) => quest.title === title);
      const quests = existing
        ? current.quests.map((quest) => quest.title === title ? { ...quest, status, updated: new Date().toISOString() } : quest)
        : [{ title, employeeId, status, updated: new Date().toISOString() }, ...current.quests];
      return { ...current, quests };
    });
  }, [update]);

  const resetToChoice = useCallback((clear = false) => {
    if (clear) clearDraft();
    update({
      ...emptyState,
      settings: stateRef.current.settings,
      speech: emptyState.speech,
    });
  }, [update]);

  const startFresh = useCallback(() => {
    clearDraft();
    update({
      ...emptyState,
      settings: stateRef.current.settings,
      speech: emptyState.speech,
    });
    setModal(null);
  }, [update]);

  useEffect(() => {
    if (state.phase === 'choice' && !state.lastSaved) resetToChoice(false);
  }, [resetToChoice, state.lastSaved, state.phase]);

  const returningCustomer = useCallback(() => {
    update((current) => ({ ...current, phase: 'returning_email', activeEmployee: 'reception' }));
    speak('reception', 'Welcome back. Type the email address you used before and I will load the saved job.');
    addConvo('Nova', 'Returning customer selected. Please enter your email address.');
  }, [addConvo, speak, update]);

  const newCustomer = useCallback(() => {
    update((current) => ({
      ...current,
      phase: 'new_email',
      projectId: createProjectId(),
      projectName: 'Static website project',
      projectModel: current.settings.selectedModel || 'gpt-5.4-mini',
      projectPackage: packageForModel(current.settings.selectedModel || 'gpt-5.4-mini').id,
      selectedDesignStyle: '',
      selectedDesignPalette: [],
      selectedSitePages: [],
      selectedSiteSections: [],
      paid: false,
      paymentEstimate: null,
      availableProjects: [],
      userName: current.userName,
      email: '',
      clientDetails: '',
      brief: '',
      progress: 0,
      progressTask: 'Intake',
      outputs: {},
      quests: [],
      logs: [],
      convos: [],
      activeOutput: 'Plan',
      error: '',
      running: false,
      approved: false,
      revisionCount: 0,
    }));
    speak('reception', 'New project. First, what email address should this job be saved under?');
    addConvo('Nova', 'Please enter your email address.');
  }, [addConvo, speak, update]);

  const processName = useCallback((text) => {
    const name = text.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (name.length < 2) {
      speak('reception', 'I missed your name. What should I call you?');
      return;
    }
    update((current) => ({ ...current, userName: name, phase: 'choice' }));
    speak('reception', `Lovely to meet you, ${name}. Are you a new customer or a returning customer?`, ['returning', 'new']);
    addConvo('Nova', `Nice to meet you, ${name}. Are you a new customer or a returning customer?`);
  }, [addConvo, speak, update]);

  const processCustomerChoice = useCallback((text) => {
    if (/\b(returning|old|existing|saved|resume)\b/i.test(text)) {
      returningCustomer();
      return;
    }
    if (/\b(new|first|start|fresh)\b/i.test(text)) {
      newCustomer();
      return;
    }
    speak('reception', 'Are you a new customer or a returning customer?', ['returning', 'new']);
  }, [newCustomer, returningCustomer, speak]);

  const processReturningEmail = useCallback((text) => {
    const email = extractEmail(text);
    if (!email) {
      speak('reception', 'I need a valid email address so I can find the saved session.');
      return;
    }
    const loaded = loadSession(email);
    const projects = listProjects(email);
    if (!projects.length && !loaded) {
      update((current) => ({ ...current, email, projectId: createProjectId(), projectName: 'Static website project', phase: 'new_details', availableProjects: [] }));
      speak('reception', 'I could not find a saved project for that email, so I opened the project form to start a new one.', ['openDetails']);
      addConvo('Nova', 'No saved project found. We will start a new project using that email.');
      window.setTimeout(() => setModal('details'), 120);
      return;
    }
    update((current) => ({ ...current, email, phase: 'project_choice', availableProjects: projects }));
    speak('reception', 'Is this for a previous project? Choose one from the dropdown, or choose Start a new project.');
    addConvo('Nova', 'Saved projects found. Choose a previous project or start a new one.');
  }, [addConvo, speak, update]);

  const loadProject = useCallback((email, projectId) => {
    const loaded = loadSession(email, projectId) || loadSession(email);
    if (!loaded) {
      update((current) => ({ ...current, email, projectId: createProjectId(), projectName: 'Static website project', phase: 'new_details', availableProjects: [] }));
      speak('reception', 'I could not open that project, so I started a new project form instead.', ['openDetails']);
      window.setTimeout(() => setModal('details'), 120);
      return;
    }
    const next = {
      ...emptyState,
      ...loaded,
      email,
      projectId: loaded.projectId || projectId,
      projectName: loaded.projectName || 'Static website project',
      projectModel: loaded.projectModel || loaded.settings?.selectedModel || 'gpt-5.4-mini',
      projectPackage: loaded.projectPackage || packageForModel(loaded.projectModel || loaded.settings?.selectedModel || 'gpt-5.4-mini').id,
      selectedDesignStyle: loaded.selectedDesignStyle || '',
      selectedDesignPalette: loaded.selectedDesignPalette || [],
      selectedSitePages: loaded.selectedSitePages || [],
      selectedSiteSections: loaded.selectedSiteSections || [],
      paid: Boolean(loaded.paid),
      paymentEstimate: loaded.paymentEstimate || null,
      availableProjects: listProjects(email),
      settings: { ...defaultSettings, ...(loaded.settings || {}) },
      running: false,
    };
    update(next);
    setModal(null);
    if (next.error) {
      speak(next.activeEmployee || 'reception', 'Welcome back. This project was paused, so press Resume work to continue.', ['resume']);
      window.setTimeout(() => setModal('pause'), 120);
    } else if (next.phase === 'complete') {
      speak('reception', 'Welcome back. This project is complete. Open Outputs whenever you want to review it.', ['openPreview']);
      window.setTimeout(() => setModal('websitePreview'), 120);
    } else if (next.outputs.WebsiteHTML && !next.approved) {
      update((current) => ({ ...current, phase: 'approval' }));
      speak('dev', 'Welcome back. Your website preview is ready for approval.', ['openPreview', 'approve']);
      window.setTimeout(() => setModal('websitePreview'), 120);
    } else if (next.paid && next.brief && !next.selectedDesignStyle) {
      update((current) => ({ ...current, phase: 'design_options', activeEmployee: 'design' }));
      speak('design', 'Welcome back. Payment is complete. Choose a design direction so the team can start production.', ['openDesignOptions']);
      window.setTimeout(() => setModal('designOptions'), 120);
    } else if (next.brief) {
      update((current) => ({ ...current, phase: ['running', 'brief'].includes(current.phase) ? current.phase : 'running' }));
      speak('reception', 'Welcome back. I found the project in progress and I am resuming it now.');
      window.setTimeout(() => startAgencyRef.current?.(), 120);
    } else {
      update((current) => ({ ...current, phase: 'new_details' }));
      speak('reception', 'Welcome back. This project still needs the project form before the team can work.', ['openDetails']);
      window.setTimeout(() => setModal('details'), 120);
    }
    addConvo('Nova', 'Saved project loaded.');
  }, [addConvo, speak, update]);

  const startNewProjectForEmail = useCallback((email = stateRef.current.email) => {
    update((current) => ({
      ...emptyState,
      settings: current.settings,
      userName: current.userName,
      email,
      projectId: createProjectId(),
      projectName: 'Static website project',
      projectModel: current.settings.selectedModel || 'gpt-5.4-mini',
      projectPackage: packageForModel(current.settings.selectedModel || 'gpt-5.4-mini').id,
      selectedDesignStyle: '',
      selectedDesignPalette: [],
      selectedSitePages: [],
      selectedSiteSections: [],
      paid: false,
      paymentEstimate: null,
      availableProjects: listProjects(email),
      phase: 'new_details',
      speech: {
        employeeId: 'reception',
        text: `Thanks${current.userName ? `, ${current.userName}` : ''}. Please fill in this form and the team will treat it as the full brief.`,
        actions: ['openDetails'],
      },
    }));
    addConvo('Nova', 'Starting a new project for this email.');
    window.setTimeout(() => setModal('details'), 120);
  }, [addConvo, update]);

  const processProjectChoice = useCallback((value) => {
    const email = stateRef.current.email;
    if (!email) {
      returningCustomer();
      return;
    }
    if (value === '__new__') {
      startNewProjectForEmail(email);
      return;
    }
    loadProject(email, value);
  }, [loadProject, returningCustomer, startNewProjectForEmail]);

  const processNewEmail = useCallback((text) => {
    const email = extractEmail(text);
    if (!email) {
      speak('reception', 'That does not look like an email address. Try again.');
      return;
    }
    update((current) => ({ ...current, email, projectId: current.projectId || createProjectId(), projectName: current.projectName || 'Static website project', projectModel: current.projectModel || current.settings.selectedModel || 'gpt-5.4-mini', projectPackage: current.projectPackage || packageForModel(current.projectModel || current.settings.selectedModel || 'gpt-5.4-mini').id, paid: false, paymentEstimate: null, availableProjects: listProjects(email), phase: 'new_details' }));
    speak('reception', `Thanks, ${stateRef.current.userName || 'there'}. Please fill in this form and the team will treat it as the full brief.`, ['openDetails']);
    addConvo('Nova', 'Email saved. Please complete the project form.');
    window.setTimeout(() => setModal('details'), 120);
  }, [addConvo, speak, update]);

  const submitDetails = useCallback((details, options = {}) => {
    if (details.length < 8) {
      speak('reception', 'Give me a little more detail so the team has enough context.', ['openDetails']);
      return;
    }
    update((current) => ({
      ...current,
      clientDetails: details,
      brief: details,
      paid: false,
      paymentEstimate: null,
      phase: 'packages',
      progress: 2,
      progressTask: 'Package selection',
    }));
    setModal('packages');
    addConvo('You', 'Submitted client details form.');
    addConvo('Nova', 'Project form saved. Package selection is next.');
    speak('reception', `Perfect${stateRef.current.userName ? `, ${stateRef.current.userName}` : ''}. I have the brief. Here is what we offer. Choose a package and then I will take you to payment.`, ['openPackages']);
  }, [addConvo, speak, update]);

  const selectPackage = useCallback((packageId) => {
    const selectedPackage = packageOption(packageId);
    const paymentEstimate = estimateAiCost(selectedPackage.modelId, stateRef.current.settings.usdToGbp, MAX_REVISIONS);
    update((current) => ({
      ...current,
      projectPackage: selectedPackage.id,
      projectModel: selectedPackage.modelId,
      paymentEstimate: {
        ...paymentEstimate,
        publicPriceGbp: selectedPackage.priceGbp,
        package: selectedPackage,
      },
      paid: false,
      phase: 'payment',
      progressTask: 'Payment required',
    }));
    addConvo('Nova', `${selectedPackage.name} selected. Payment is required before the team starts.`);
    speak('reception', `${selectedPackage.name} selected. I will take you to secure checkout now.`);
    setModal('payment');
  }, [addConvo, speak, update]);

  const confirmPayment = useCallback((details = {}) => {
    update((current) => ({
      ...current,
      paid: true,
      projectModel: details.modelId || current.projectModel,
      projectPackage: details.packageId || current.projectPackage,
      paymentEstimate: details.modelId ? { ...estimateAiCost(details.modelId, current.settings.usdToGbp, MAX_REVISIONS), publicPriceGbp: details.amountGbp ?? packageOption(details.packageId || current.projectPackage).priceGbp, package: packageOption(details.packageId || current.projectPackage) } : current.paymentEstimate,
      paymentDetails: {
        ...details,
        amountGbp: details.amountGbp ?? packageOption(details.packageId || current.projectPackage).priceGbp,
      },
      phase: 'design_options',
      activeEmployee: 'design',
      progress: Math.max(current.progress || 0, 6),
      progressTask: 'Choose design direction',
    }));
    setModal(null);
    addConvo('Nova', 'Payment received. Mira will show design directions before production starts.');
    speak('design', 'Payment received. I have reviewed the brief and prepared design directions with colour palettes. Click to see the options and choose the route you like.', ['openDesignOptions']);
  }, [addConvo, speak, update]);

  const openDesignOptions = useCallback(() => {
    update((current) => ({ ...current, phase: 'design_options', activeEmployee: 'design', progressTask: 'Choose design direction' }));
    setModal('designOptions');
  }, [update]);

  const selectDesignStyle = useCallback((layoutId, palette = [], structure = {}) => {
    const layout = siteLayouts.find((item) => item.id === layoutId) || siteLayouts[0];
    const selectedDesign = buildDesignSelectionMarkdown(layout, palette, structure);
    update((current) => ({
      ...current,
      selectedDesignStyle: layout.id,
      selectedDesignPalette: palette,
      selectedSitePages: structure.pages || [],
      selectedSiteSections: structure.sections || [],
      outputs: { ...current.outputs, SelectedDesign: selectedDesign },
      activeOutput: 'SelectedDesign',
      phase: 'running',
      progress: Math.max(current.progress || 0, 8),
      progressTask: 'Design direction selected',
    }));
    addConvo('Nova', `${layout.name} selected as the design direction.`);
    log('Client', `Selected design direction: ${layout.name}`);
    speak('design', `${layout.name} selected. I will now turn that direction into the final design plan before Kai builds the site.`);
    setModal(null);
    window.setTimeout(() => startAgency(), 50);
  }, [addConvo, log, speak, update]);

  const buildContext = useCallback((keys) => {
    const current = stateRef.current;
    return keys.map((key) => `## ${outputNames[key] || key}\n${current.outputs[key] || ''}`).filter(Boolean).join('\n\n---\n\n').slice(-30000);
  }, []);

  const runStep = useCallback(async (step) => {
    let current = stateRef.current;
    if (current.outputs[step.key] && !step.replace) {
      update((stateNow) => ({
        ...stateNow,
        progress: Math.max(stateNow.progress, step.progress),
        progressTask: `${step.quest} complete`,
      }));
      return current.outputs[step.key];
    }

    const employee = employees[step.employee];
    addQuest(step.quest, employee.id, 'working');
    update((stateNow) => ({
      ...stateNow,
      activeEmployee: employee.id,
      progress: Math.max(stateNow.progress, step.progress - 7),
      progressTask: step.quest,
    }));
    speak(employee.id, stepSpeech(employee.id, step.quest));
    log(employee.name, `Started: ${step.quest}`);
    await sleep(250);

    current = stateRef.current;
    let result = '';
    try {
      result = await callModelInBackground({
        employee,
        task: step.task,
        context: buildContext(step.contextKeys || []),
        settings: current.settings,
        state: current,
        signal: aborter.current?.signal,
        complex: Boolean(step.complex),
      });
    } catch (error) {
      if (aborter.current?.signal?.aborted) throw error;
      if (step.key === 'WebsiteHTML') {
        result = fallbackWebsiteHtml(current);
        log(employee.name, `Website preview fallback used after model error: ${error?.message || error}`);
      } else if (step.key === 'DesignDirection') {
        result = fallbackDesignDirection(current);
        log(employee.name, `Design direction fallback used after model error: ${error?.message || error}`);
      } else {
        throw error;
      }
    }

    let output = step.key === 'WebsiteHTML' ? cleanHTML(result) : String(result || '').trim();
    if (step.key === 'DesignDirection' && !hasUsefulDesignDirection(output)) {
      output = fallbackDesignDirection(current);
      log(employee.name, 'Design direction fallback used because the returned output was incomplete.');
    }
    if (step.key === 'WebsiteHTML' && (!isCompleteHtml(output) || !hasRequiredSiteStructure(output, current) || hasPreviewLanguage(output))) {
      output = fallbackWebsiteHtml(current);
      log(employee.name, 'Website preview fallback used because the returned HTML was incomplete, missed required pages, or used preview wording.');
    }
    addQuest(step.quest, employee.id, 'done');
    update((stateNow) => ({
      ...stateNow,
      outputs: { ...stateNow.outputs, [step.key]: output },
      activeOutput: step.key,
      progress: step.progress,
      progressTask: `${step.quest} complete`,
    }));
    log(employee.name, `Finished: ${step.quest}`);
    await sleep(350);
    return output;
  }, [addQuest, buildContext, log, speak, update]);

  const producePageContent = useCallback(async () => {
    const current = stateRef.current;
    if (current.outputs.PageContent) return current.outputs.PageContent;

    const employee = employees.design;
    const pages = contentPagesForState(current);
    addQuest('Page content pack', employee.id, 'working');
    update((stateNow) => ({
      ...stateNow,
      activeEmployee: employee.id,
      progress: Math.max(stateNow.progress, 57),
      progressTask: 'Page content pack',
    }));
    speak(employee.id, 'I am writing a detailed content brief for each approved page before the site is built.');
    log(employee.name, `Started: Page content pack (${pages.join(', ')})`);

    const pageOutputs = [];
    for (const page of pages) {
      let pageContent = '';
      try {
        pageContent = await callModelInBackground({
          employee,
          task: pageContentTask(page, pages, current),
          context: buildContext(['Plan', 'TaskBoard', 'SelectedDesign', 'DesignDirection']),
          settings: current.settings,
          state: current,
          signal: aborter.current?.signal,
          complex: current.projectPackage !== 'launch',
        });
      } catch (error) {
        if (aborter.current?.signal?.aborted) throw error;
        log(employee.name, `${page} content fallback used after model error: ${error?.message || error}`);
      }
      const cleaned = String(pageContent || '').trim();
      pageOutputs.push(`## ${page}\n${hasUsefulPageContent(cleaned) ? cleaned : fallbackPageContent(page, current)}`);
    }

    const output = pageOutputs.join('\n\n---\n\n');
    addQuest('Page content pack', employee.id, 'done');
    update((stateNow) => ({
      ...stateNow,
      outputs: { ...stateNow.outputs, PageContent: output },
      activeOutput: 'PageContent',
      progress: Math.max(stateNow.progress, 62),
      progressTask: 'Page content pack complete',
    }));
    log(employee.name, 'Finished: Page content pack');
    await sleep(250);
    return output;
  }, [addQuest, buildContext, log, speak, update]);

  const handleRunError = useCallback((error) => {
    const message = error?.message || String(error || 'Unknown error');
    update((current) => ({
      ...current,
      running: false,
      phase: 'error',
      error: message,
      progressTask: 'Paused',
    }));
    speak(stateRef.current.activeEmployee || 'reception', 'Something interrupted the run, but the session is saved. Press Resume work to try again.');
    log('Error', message);
    setModal('pause');
  }, [log, speak, update]);

  const produceUntilPreview = useCallback(async () => {
    for (const step of previewSteps) {
      if (step.key === 'WebsiteHTML') await producePageContent();
      await runStep(step);
    }
    update((current) => ({
      ...current,
      phase: 'approval',
      running: false,
      progress: 70,
      progressTask: 'Preview approval',
      activeOutput: 'WebsiteHTML',
    }));
    log('Company', 'Preview ready. Paused for client approval.');
    speak('dev', 'The first website preview is ready. Review it, then approve or request changes.', ['openPreview', 'approve']);
    addConvo('Nova', 'Preview ready. Chat is open for approval or change requests only.');
    setModal('websitePreview');
  }, [addConvo, log, producePageContent, runStep, speak, update]);

  const startAgency = useCallback(async () => {
    const current = stateRef.current;
    if (current.running) return;
    if (!current.userName) {
      update((stateNow) => ({ ...stateNow, phase: 'name' }));
      speak('reception', 'Before I brief the team, what should I call you?');
      return;
    }
    if (!current.email) {
      update((stateNow) => ({ ...stateNow, phase: 'email' }));
      speak('reception', 'I need the email first so the session can be saved.');
      return;
    }
    if (!current.brief) {
      update((stateNow) => ({ ...stateNow, phase: 'brief' }));
      speak('reception', 'Please complete the project form first. That gives the team the brief.', ['openDetails']);
      return;
    }
    if (!current.paid) {
      if (!current.projectPackage || !current.paymentEstimate) {
        update((stateNow) => ({ ...stateNow, phase: 'packages', running: false, progressTask: 'Package selection' }));
        speak('reception', 'Before payment, choose the package that matches what the customer wants to receive.', ['openPackages']);
        setModal('packages');
        return;
      }
      update((stateNow) => ({ ...stateNow, phase: 'payment', running: false, progressTask: 'Payment required' }));
      speak('reception', 'Payment is required before the team starts. Please complete PayPal checkout.', ['openPayment']);
      setModal('payment');
      return;
    }
    if (!current.selectedDesignStyle || !current.outputs.SelectedDesign) {
      update((stateNow) => ({ ...stateNow, phase: 'design_options', running: false, activeEmployee: 'design', progressTask: 'Choose design direction' }));
      speak('design', 'Before I write the final design direction, choose one of the prepared website layout options.', ['openDesignOptions']);
      setModal('designOptions');
      return;
    }
    update((stateNow) => ({
      ...stateNow,
      phase: 'running',
      running: true,
      error: '',
      approved: false,
      progress: Math.max(stateNow.progress, 3),
      progressTask: 'Agency working',
    }));
    addConvo('Nova', 'Project form received. Chat is now closed while the office works.');
    log('System', 'Project form passed to agency. Autonomous run started.');
    speak('reception', 'The team has the form. No more questions until the preview needs approval.');
    await sleep(500);
    try {
      aborter.current = new AbortController();
      await produceUntilPreview();
    } catch (error) {
      handleRunError(error);
    }
  }, [addConvo, handleRunError, log, produceUntilPreview, speak, update]);

  useEffect(() => {
    startAgencyRef.current = startAgency;
  }, [startAgency]);

  const processBrief = useCallback((text) => {
    if (text.length < 20) {
      speak('reception', 'The team needs a proper brief. Add goals, pages or sections, tone, audience, and any constraints.');
      return;
    }
    update((current) => ({ ...current, brief: text, progress: 2, progressTask: 'Brief received' }));
    startAgency();
  }, [speak, startAgency, update]);

  const continueAfterApproval = useCallback(async () => {
    update((current) => ({ ...current, phase: 'running', running: true, progressTask: 'Finishing agency pack' }));
      speak('qa', 'Preview approved. I will finish the QA notes and package the project handover PDF.');
    try {
      aborter.current = new AbortController();
      for (const step of completionSteps) await runStep(step);
      const pdfData = createProjectPdf(stateRef.current);
      update((current) => ({ ...current, outputs: { ...current.outputs, ProjectPDF: pdfData }, activeOutput: 'ProjectPDF', phase: 'complete', running: false, progress: 100, progressTask: 'Complete' }));
      speak('reception', 'All done. Your preview, QA notes, and project handover PDF are in Outputs. You can start a fresh project whenever you are ready.', ['openPreview', 'reset']);
      addConvo('Nova', 'Project complete. Open Outputs to view or download the work.');
      log('Company', 'All deliverables completed.');
      setModal('websitePreview');
    } catch (error) {
      handleRunError(error);
    }
  }, [addConvo, handleRunError, log, notify, runStep, speak, update]);

  const requestRevision = useCallback(async (changeText) => {
    if (!stateRef.current.outputs.WebsiteHTML) {
      addConvo('Nova', 'There is no preview to revise yet.');
      return;
    }
    if (stateRef.current.revisionCount >= MAX_REVISIONS) {
      notify(`Maximum revisions reached (${MAX_REVISIONS}). Approve the preview or start a new project.`);
      speak('reception', `You have used all ${MAX_REVISIONS} included revisions. Approve the preview or start a new project.`);
      return;
    }
    const revisionCount = stateRef.current.revisionCount + 1;
    update((current) => ({
      ...current,
      phase: 'running',
      running: true,
      approved: false,
      revisionCount,
      activeEmployee: 'design',
      progressTask: 'Design revision',
    }));
    log('Client', `Requested preview changes: ${changeText}`);
    speak('design', 'Got it. I am taking the revision back through design first, then Kai will rebuild the preview.');
    try {
      aborter.current = new AbortController();
      await runStep({
        key: 'DesignDirection',
        employee: 'design',
        progress: 56,
        quest: `Design revision ${revisionCount}`,
        replace: true,
        contextKeys: ['Plan', 'TaskBoard', 'DesignDirection', 'WebsiteHTML'],
        task: `Revise the design direction using this client change request: "${changeText}". Return a concise updated design direction with layout, visual, content, and responsive instructions for the developer. Keep strong existing choices that still fit.`,
      });
      await runStep({
        key: 'WebsiteHTML',
        employee: 'dev',
        progress: 70,
        quest: `Preview revision ${revisionCount}`,
        complex: true,
        replace: true,
        contextKeys: ['Plan', 'TaskBoard', 'DesignDirection', 'WebsiteHTML'],
        task: `Revise the existing website HTML using this client change request: "${changeText}". Return only the complete corrected single-file HTML starting with <!doctype html>. Keep previous good parts, improve the requested parts, and ensure responsive accessible markup.`,
      });
      update((current) => ({ ...current, phase: 'approval', running: false, progress: 70, progressTask: 'Preview approval' }));
      speak('dev', 'Updated preview is ready. Check it, then approve or request another change.', ['openPreview', 'approve']);
      addConvo('Nova', 'Updated preview ready for approval.');
      setModal('websitePreview');
    } catch (error) {
      handleRunError(error);
    }
  }, [addConvo, handleRunError, log, runStep, speak, update]);

  const processApproval = useCallback((text) => {
    if (/^(approve|approved|yes|go ahead|looks good|ship|done)\b/i.test(text)) {
      update((current) => ({ ...current, approved: true }));
      addConvo('Nova', 'Preview approved. The agency will finish QA, handover notes and the project PDF without more input.');
      continueAfterApproval();
    } else {
      requestRevision(text);
    }
  }, [addConvo, continueAfterApproval, requestRevision, update]);

  const resumeWork = useCallback(() => {
    setModal(null);
    const current = stateRef.current;
    if (current.running) {
      notify('The agency is already working.');
      return;
    }
    if (!current.brief) {
      update((stateNow) => ({ ...stateNow, phase: 'new_details', error: '', running: false }));
      speak('reception', 'Please fill in the project form and I will restart the team.', ['openDetails']);
      return;
    }
    update((stateNow) => ({ ...stateNow, error: '', running: false }));
    if (current.paid && (!current.selectedDesignStyle || !current.outputs.SelectedDesign)) {
      update((stateNow) => ({ ...stateNow, phase: 'design_options', activeEmployee: 'design' }));
      speak('design', 'Choose a design direction first, then I will start the production run.', ['openDesignOptions']);
      setModal('designOptions');
      return;
    }
    if (current.outputs.WebsiteHTML && !current.approved) {
      update((stateNow) => ({ ...stateNow, phase: 'approval' }));
      speak('dev', 'Preview is ready. Approve it or request changes.', ['openPreview', 'approve']);
      setModal('websitePreview');
      return;
    }
    if (current.approved || current.outputs.QAReport || current.outputs.ProjectPDF) continueAfterApproval();
    else startAgency();
  }, [continueAfterApproval, notify, speak, startAgency, update]);

  const submitChat = useCallback((text) => {
    const value = text.trim();
    if (!value) return;
    addConvo('You', value);
    const phase = stateRef.current.phase;
    if (phase === 'name') processName(value);
    if (phase === 'choice') processCustomerChoice(value);
    if (phase === 'returning_email') processReturningEmail(value);
    if (phase === 'project_choice') processProjectChoice(value);
    if (phase === 'email' || phase === 'new_email') processNewEmail(value);
    if (phase === 'approval') processApproval(value);
    if (phase === 'error' && /resume|continue|start/i.test(value)) resumeWork();
  }, [addConvo, processApproval, processCustomerChoice, processName, processNewEmail, processProjectChoice, processReturningEmail, resumeWork]);

  const saveClientEdits = useCallback((client) => {
    update((current) => ({ ...current, ...client, brief: client.clientDetails || client.brief || current.brief }));
    notify('Client info saved.');
  }, [notify, update]);

  const stopRun = useCallback(() => {
    aborter.current?.abort();
    update((current) => ({ ...current, running: false, phase: 'error', error: 'Run stopped. Session saved.', progressTask: 'Paused' }));
    setModal('pause');
  }, [update]);

  const openOutputs = useCallback((key = stateRef.current.activeOutput || 'Plan') => {
    update((current) => ({ ...current, activeOutput: key }));
    setModal('outputs');
  }, [update]);

  const openWebsitePreview = useCallback(() => {
    update((current) => ({ ...current, activeOutput: 'WebsiteHTML' }));
    setModal('websitePreview');
  }, [update]);

  const copyCurrentOutput = useCallback(async () => {
    const current = stateRef.current;
    const text = current.outputs[current.activeOutput] || '';
    try {
      await navigator.clipboard.writeText(text);
      notify('Copied.');
    } catch {
      notify('Copy failed.');
    }
  }, [notify]);

  const downloadCurrentOutput = useCallback(() => {
    const current = stateRef.current;
    const key = current.activeOutput;
    if (key === 'ProjectPDF' && current.outputs.ProjectPDF) {
      const anchor = document.createElement('a');
      anchor.href = current.outputs.ProjectPDF;
      anchor.download = `${safeFileName(current.email || 'project-pack')}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return;
    }
    const extension = key === 'WebsiteHTML' ? 'html' : 'md';
    downloadText(`${safeFileName(current.email || key)}.${extension}`, current.outputs[key] || '');
  }, []);

  const exportJSON = useCallback(() => {
    downloadText(`${safeFileName(stateRef.current.email || 'tiny-office-session')}.json`, JSON.stringify(stateRef.current, null, 2));
  }, []);

  const exportSavedProject = useCallback((email, projectId) => {
    const project = exportProject(email, projectId);
    if (!project) {
      notify('Project export failed.');
      return;
    }
    const name = safeFileName(project.projectName || project.email || projectId || 'project');
    downloadText(`${name}.json`, JSON.stringify(project, null, 2));
  }, [notify]);

  const deleteSavedProject = useCallback((email, projectId) => {
    const project = exportProject(email, projectId);
    const label = project?.projectName || 'this project';
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    const removed = deleteProject(email, projectId);
    if (!removed) {
      notify('Project delete failed.');
      return;
    }
    notify('Project deleted.');
    update((current) => {
      const availableProjects = listProjects(current.email);
      if (current.email === email && current.projectId === projectId) {
        return {
          ...emptyState,
          settings: current.settings,
          userName: current.userName,
          email,
          availableProjects,
          phase: 'choice',
          speech: {
            employeeId: 'reception',
            text: 'That project was deleted. You can start a new project or choose another saved one.',
            actions: ['new', 'returning'],
          },
        };
      }
      return { ...current, availableProjects };
    });
  }, [notify, update]);

  const openCurrentStep = useCallback(() => {
    const current = stateRef.current;
    if (['new_details', 'brief'].includes(current.phase)) {
      setModal('details');
      return;
    }
    if (current.phase === 'packages') {
      setModal('packages');
      return;
    }
    if (current.phase === 'payment') {
      setModal('payment');
      return;
    }
    if (current.phase === 'design_options') {
      setModal('designOptions');
      return;
    }
    if (current.phase === 'approval') {
      openWebsitePreview();
      return;
    }
    setModal('menu');
  }, [openWebsitePreview]);

  const actions = useMemo(() => ({
    returningCustomer,
    newCustomer,
    resetToChoice,
    startFresh,
    submitChat,
    submitDetails,
    confirmPayment,
    selectPackage,
    openDesignOptions,
    selectDesignStyle,
    processCustomerChoice,
    processProjectChoice,
    loadProject,
    startNewProjectForEmail,
    startAgency,
    resumeWork,
    inspectEmployee: (employeeId) => {
      const employee = employees[employeeId] || employees.reception;
      const quest = stateRef.current.quests.find((item) => item.employeeId === employeeId && item.status === 'working');
      update((current) => ({ ...current, activeEmployee: employeeId }));
      speak(employeeId, quest ? `${employee.name} is working on ${quest.title}. Thinking: ${stepSpeech(employeeId, quest.title)}` : `${employee.name} is ready. ${employee.role} will pick up the next relevant task.`);
      setModal('worker');
    },
    processApproval,
    requestRevision,
    openOutputs,
    openWebsitePreview,
    openDetails: () => setModal('details'),
    openPackages: () => setModal('packages'),
    openDesignOptions,
    openPayment: () => setModal('payment'),
    openAgencyInfo: () => setModal('agencyInfo'),
    openMenu: (tab = 'status') => {
      setMenuTab(tab);
      setModal('menu');
    },
    closeModal: () => setModal(null),
    setMenuTab,
    setActiveOutput: (key) => update((current) => ({ ...current, activeOutput: key })),
    saveClientEdits,
    stopRun,
    copyCurrentOutput,
    downloadCurrentOutput,
    exportJSON,
    exportSavedProject,
    deleteSavedProject,
    openCurrentStep,
    approve: () => processApproval('approve'),
    notify,
  }), [
    copyCurrentOutput,
    downloadCurrentOutput,
    exportJSON,
    exportSavedProject,
    deleteSavedProject,
    openCurrentStep,
    newCustomer,
    notify,
    openOutputs,
    openWebsitePreview,
    processApproval,
    requestRevision,
    resetToChoice,
    startFresh,
    resumeWork,
    returningCustomer,
    saveClientEdits,
    startAgency,
    stopRun,
    submitChat,
    submitDetails,
    confirmPayment,
    selectPackage,
    openDesignOptions,
    selectDesignStyle,
    processCustomerChoice,
    processProjectChoice,
    loadProject,
    startNewProjectForEmail,
    processName,
    update,
  ]);

  return { state, actions, modal, menuTab, toast, phaseLabel: phaseLabel(state.phase) };
}

function stepSpeech(id, quest) {
  const lines = {
    director: 'I am setting the commercial direction so the work has a point.',
    pm: 'I am turning the brief into a clean task board.',
    design: 'I am shaping the look, layout, and user journey.',
    dev: 'I am building the real HTML preview now.',
    qa: 'I am checking the pack and preparing the project PDF.',
  };
  return lines[id] || `Working on ${quest}...`;
}

function contentPagesForState(state) {
  if (state.projectPackage === 'launch') {
    const sections = (state.selectedSiteSections?.length ? state.selectedSiteSections : ['Services', 'About', 'FAQ', 'Contact details', 'Final CTA'])
      .filter((item) => !/^hero$/i.test(String(item || '')));
    return uniqueStateItems(['Home', ...sections]).slice(0, 10);
  }
  const pages = state.selectedSitePages?.length
    ? state.selectedSitePages
    : ['Home', 'Services', 'About', 'FAQ', 'Contact'];
  return uniqueStateItems(['Home', ...pages]).slice(0, 8);
}

function pageContentTask(page, pages, state) {
  const brief = state.brief || state.clientDetails || '';
  const packageLabel = state.projectPackage === 'launch' ? 'Launch Site' : state.projectPackage === 'signature' ? 'Signature Site' : 'Growth Site';
  return [
    `Write production-ready website content for the "${page}" page only.`,
    `Package: ${packageLabel}.`,
    `Approved site map: ${pages.join(', ')}.`,
    `Client brief: ${brief || 'The brief is thin. Use sensible common industry information and polished dummy production copy.'}`,
    'Return markdown only. Include: page objective, visitor intent, hero headline, hero support copy, 3 to 6 detailed content blocks with headings and body copy, trust/proof ideas, CTA copy, and any form fields or practical details needed.',
    'Do not use agency-facing labels such as example, sample, concept, preview, customer website, visual direction, design direction, placeholder packages, or final content.',
    'Make it specific enough that a developer can build a real production page, not a generic card list.',
  ].join('\n');
}

function hasUsefulPageContent(text) {
  const value = String(text || '').trim();
  return value.length > 650 && /headline|objective|block|cta|proof|trust|copy|section/i.test(value);
}

function fallbackPageContent(page, state) {
  const brief = parseStateBrief(state.brief || state.clientDetails || '');
  const business = brief.businessName || state.projectName || 'the business';
  const industry = brief.industry || 'the service';
  const audience = brief.audience || 'customers';
  const offer = brief.offer || industry;
  const goal = brief.goal || 'make an enquiry';
  const lower = String(page || '').toLowerCase();
  const blocks = pageBlocksFor(lower, { business, industry, audience, offer, goal });

  return [
    `Page objective: Help ${audience} understand ${offer} and move confidently toward ${goal}.`,
    `Visitor intent: The visitor wants plain-language information, reassurance, and a clear next action from ${business}.`,
    `Hero headline: ${heroHeadlineForPage(lower, business, offer, goal)}`,
    `Hero support copy: ${business} explains ${offer} clearly, answers the practical questions ${audience} usually have, and makes the next step easy.`,
    '',
    ...blocks.map((block, index) => [
      `Content block ${index + 1}: ${block.title}`,
      block.body,
      `CTA idea: ${block.cta}`,
    ].join('\n')),
    '',
    `Trust and proof: Add short testimonials, common customer questions, process reassurance, clear response times, and practical signals that ${business} is credible.`,
    `Primary CTA: ${ctaForGoal(goal)}`,
  ].join('\n');
}

function pageBlocksFor(page, context) {
  const { business, industry, audience, offer, goal } = context;
  if (page.includes('service')) {
    return serviceBlocks(context);
  }
  if (page.includes('about')) {
    return [
      { title: `Why ${business} exists`, body: `${business} focuses on ${offer} for ${audience}. This section should explain the practical problem the business solves, the standard it works to, and the kind of customer it is best suited for.`, cta: 'See how we can help' },
      { title: 'How we work', body: 'Explain the working style in simple stages: first conversation, recommendation, delivery, review, and support. Keep it concrete so visitors know what happens after they enquire.', cta: 'Start with a quick enquiry' },
      { title: 'What customers can expect', body: `Set expectations around communication, quality, timing, and the details ${audience} should prepare before contacting ${business}.`, cta: 'Ask a question' },
    ];
  }
  if (page.includes('pricing')) {
    return [
      { title: 'Simple starting options', body: `Present a starter, standard, and complete route for ${offer}. Each option should explain who it suits, what is included, and what affects the final price.`, cta: 'Request the right option' },
      { title: 'What changes the quote', body: `Mention scope, timing, location, quantity, support level, and any choices that commonly change the cost in ${industry}.`, cta: 'Send your details' },
      { title: 'No-pressure next step', body: 'Reassure visitors that an enquiry is used to understand the request and recommend the right route, not to force an immediate purchase.', cta: 'Get a clear recommendation' },
    ];
  }
  if (page.includes('case')) {
    return [
      { title: 'Typical customer challenge', body: `Describe a common situation ${audience} face before choosing ${business}: uncertainty, comparison, timing pressure, or needing confidence before committing.`, cta: 'Talk through your situation' },
      { title: 'What changed', body: `Show how clearer information, better structure, and focused ${offer} helped the customer decide what to do next.`, cta: 'See if this fits' },
      { title: 'Result and lesson', body: `Connect the outcome to ${goal}, using believable dummy metrics or qualitative results where the brief does not provide real data.`, cta: 'Start your enquiry' },
    ];
  }
  if (page.includes('faq')) {
    return [
      { title: 'Before you enquire', body: `Answer what ${business} offers, who it is for, how quickly the team replies, and what information helps the first response.`, cta: 'Send the essentials' },
      { title: 'Choosing the right option', body: `Explain how ${audience} can compare options, understand fit, and avoid paying for more than they need.`, cta: 'Ask for guidance' },
      { title: 'Timings and practical details', body: 'Cover lead times, availability, preparation, and what happens after the first message.', cta: 'Check availability' },
    ];
  }
  if (page.includes('contact') || page.includes('book')) {
    return [
      { title: 'What to send', body: `Ask for name, email, what the customer needs, approximate timing, location if relevant, and any important preferences for ${offer}.`, cta: 'Send enquiry' },
      { title: 'What happens next', body: `${business} reviews the message, asks any missing questions, and replies with the clearest recommended next step.`, cta: 'Start the conversation' },
      { title: 'Reassurance', body: 'Make response expectations clear and keep the form short enough to complete on mobile.', cta: 'Contact us today' },
    ];
  }
  return [
    { title: `What ${business} offers`, body: `${business} helps ${audience} with ${offer}. The page should explain the offer in plain language, show who it is best for, and connect it to ${goal}.`, cta: 'Find the right next step' },
    { title: 'Why it matters', body: `Explain the customer problem, the practical benefit, and the outcome visitors can expect from a good ${industry} provider.`, cta: 'Compare the options' },
    { title: 'How to get started', body: 'Give a short process from first enquiry to recommendation, delivery, and follow-up.', cta: 'Start an enquiry' },
  ];
}

function serviceBlocks({ business, industry, audience, offer, goal }) {
  const wedding = /wedding|bride|bridal|groom|venue|event/i.test(`${industry} ${audience} ${offer}`);
  if (wedding) {
    return [
      { title: 'Wedding planning and coordination', body: `${business} can explain planning support, supplier coordination, timelines, and how the team keeps the day organised for couples and families.`, cta: 'Plan the day' },
      { title: 'Styling, setup, and guest experience', body: 'Describe how the service can cover the look, feel, arrival experience, key moments, and details that guests notice throughout the day.', cta: 'Discuss the style' },
      { title: 'Packages for different levels of support', body: 'Show a light-touch planning option, a fuller coordination option, and a complete support route so brides can choose the level that fits.', cta: 'Compare options' },
      { title: 'Clear next steps', body: `Guide visitors toward ${goal} with a short enquiry form asking for date, venue, guest count, style, and what support they need.`, cta: 'Check availability' },
    ];
  }
  return [
    { title: `Core ${offer} support`, body: `${business} should explain the main service clearly: what is included, who it suits, what problem it solves, and what the customer receives.`, cta: 'Ask about this service' },
    { title: 'Tailored recommendation', body: `Give ${audience} a way to understand which option fits their situation, budget, timeline, and level of support needed.`, cta: 'Get a recommendation' },
    { title: 'Delivery and communication', body: 'Explain how the work is planned, confirmed, delivered, and checked so customers know what will happen after they enquire.', cta: 'Start the process' },
    { title: 'Aftercare and confidence', body: `Add reassurance around response times, support, guarantees, FAQs, or proof that makes ${business} feel dependable.`, cta: 'Contact the team' },
  ];
}

function heroHeadlineForPage(page, business, offer, goal) {
  if (page.includes('service')) return `${offer} from ${business}, explained clearly`;
  if (page.includes('about')) return `A clearer way to choose ${business}`;
  if (page.includes('pricing')) return `Choose the right level of support`;
  if (page.includes('case')) return `Real situations, clear outcomes`;
  if (page.includes('faq')) return `Questions answered before you enquire`;
  if (page.includes('contact') || page.includes('book')) return `Start with a simple enquiry`;
  return `${business} built to help you ${goal}`;
}

function ctaForGoal(goal) {
  return /book|call|appointment/i.test(goal) ? 'Book a call' : /buy|order|shop/i.test(goal) ? 'Start an order' : 'Start an enquiry';
}

function parseStateBrief(text) {
  const fields = {};
  String(text || '').split('\n').forEach((line) => {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) return;
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key.includes('business') || key.includes('client name')) fields.businessName = value;
    else if (key.includes('industry')) fields.industry = value;
    else if (key.includes('audience') || key.includes('customer')) fields.audience = value;
    else if (key.includes('goal')) fields.goal = value;
    else if (key.includes('offer') || key.includes('service')) fields.offer = value;
  });
  return fields;
}

function uniqueStateItems(items) {
  return [...new Set((items || []).map((item) => String(item || '').trim()).filter(Boolean))];
}

function fallbackWebsiteHtml(state) {
  const layout = siteLayouts.find((item) => item.id === state.selectedDesignStyle) || siteLayouts[0];
  const palette = state.selectedDesignPalette?.length ? state.selectedDesignPalette : layout.palette;
  return buildExampleSite(layout, state, palette);
}

function fallbackDesignDirection(state) {
  const layout = siteLayouts.find((item) => item.id === state.selectedDesignStyle) || siteLayouts[0];
  const palette = state.selectedDesignPalette?.length ? state.selectedDesignPalette : layout.palette;
  const pages = state.projectPackage === 'launch'
    ? ['Home']
    : (state.selectedSitePages?.length ? state.selectedSitePages : ['Home', 'Services', 'About', 'FAQ', 'Contact']);
  const sections = state.selectedSiteSections?.length
    ? state.selectedSiteSections
    : ['Hero', 'Services', 'Benefits', 'Process', 'Testimonials', 'FAQ', 'Contact details', 'Final CTA'];

  return [
    `# ${layout.name} design direction`,
    '',
    '## Purpose',
    'Create the final customer website from the approved design route, brief, package, colour palette, and content structure. Keep the site production-facing and do not label it as an example or sample.',
    '',
    '## Visual Style',
    `Use the ${layout.name} direction with a ${layout.tone.toLowerCase()} feel. Prioritise clear hierarchy, scannable content, strong calls to action, and responsive spacing.`,
    '',
    '## Colour Palette',
    palette.map((color, index) => `- Colour ${index + 1}: ${color}`).join('\n'),
    '',
    '## Approved Structure',
    `Package: ${state.projectPackage === 'launch' ? 'Launch Site, one-page section-based site' : 'Multi-page customer website with routed page views'}`,
    `Pages: ${pages.join(', ')}`,
    `Sections: ${sections.join(', ')}`,
    '',
    '## Build Notes',
    '- Include visible navigation.',
    state.projectPackage === 'launch'
      ? '- Navigation should link to sections on the same page, not separate pages.'
      : '- Navigation should link to separate page views using routes such as #/pricing, not same-page section anchors.',
    '- Use dummy production copy where the brief is missing specifics.',
    '- Include local placeholder imagery where useful.',
    '- Keep forms, buttons, headings, and section ids accessible.',
  ].join('\n');
}

function hasUsefulDesignDirection(text) {
  const value = String(text || '').trim();
  return value.length > 160 && /visual|layout|section|colour|color|responsive|cta|navigation/i.test(value);
}

function isCompleteHtml(html) {
  const value = String(html || '').trim();
  return /^<!doctype html/i.test(value)
    && /<html[\s>]/i.test(value)
    && /<body[\s>]/i.test(value)
    && /<\/body>/i.test(value)
    && /<\/html>/i.test(value);
}

function hasRequiredSiteStructure(html, state) {
  const value = String(html || '').toLowerCase();
  if (!/<nav[\s>]/i.test(html)) return false;
  const selectedPages = Array.isArray(state.selectedSitePages) && state.selectedSitePages.length
    ? state.selectedSitePages
    : ['Services', 'About', 'FAQ', 'Contact'];
  const requiredItems = state.projectPackage === 'launch'
    ? ['Home', ...(state.selectedSiteSections || []).filter((item) => !/^hero$/i.test(String(item || '')))]
    : ['Home', ...selectedPages];
  const pages = requiredItems
    .map((page) => String(page || '').trim())
    .filter(Boolean);
  const uniquePages = [...new Set(pages)];
  return uniquePages.every((page) => {
    const slug = page.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
    const expectedHref = state.projectPackage === 'launch' ? `href="#${slug}"` : `href="#/${slug}"`;
    return hasHtmlId(value, slug) && value.includes(expectedHref);
  });
}

function hasHtmlId(html, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`id=(["'])${escaped}\\1|id=${escaped}(\\s|>)`, 'i').test(html);
}

function hasPreviewLanguage(html) {
  return /example client site|preview client site|customer website|visual direction|design direction sample|design direction|site concept|this example shows|finished site can explain|placeholder packages|final content/i.test(String(html || ''));
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
