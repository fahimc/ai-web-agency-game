import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { employees } from '../data/employees.js';
import { outputNames, outputOrder } from '../data/outputs.js';
import {
  siteLayouts,
  buildDesignSelectionMarkdown,
  buildExampleSite,
  designRecommendationsTask,
  fallbackDesignRecommendations,
  normalizePalette,
  normalizeDesignRecommendations,
} from '../data/siteBlueprints.js';
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
import { createSitePackageString, fileNameForPage, parseSitePackage } from '../utils/sitePackage.js';
import { reviewAssetsPrompt } from '../utils/reviewAssets.js';
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
  designRecommendations: [],
  designRecommendationStatus: 'idle',
  reviewAssets: [],
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
      designRecommendations: saved.designRecommendations || next.designRecommendations,
      designRecommendationStatus: saved.designRecommendationStatus || next.designRecommendationStatus,
      reviewAssets: saved.reviewAssets || next.reviewAssets,
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
      designRecommendations: [],
      designRecommendationStatus: 'idle',
      reviewAssets: [],
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
      designRecommendations: loaded.designRecommendations || [],
      designRecommendationStatus: loaded.designRecommendationStatus || 'idle',
      reviewAssets: loaded.reviewAssets || [],
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
    } else if (next.phase === 'assets') {
      update((current) => ({ ...current, phase: 'assets', activeEmployee: 'pm' }));
      speak('pm', 'Welcome back. You can upload optional project files now, or skip this step and move to design.', ['openAssetUpload']);
      window.setTimeout(() => setModal('assetUpload'), 120);
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
      designRecommendations: [],
      designRecommendationStatus: 'idle',
      reviewAssets: [],
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
    update((current) => ({ ...current, email, projectId: current.projectId || createProjectId(), projectName: current.projectName || 'Static website project', projectModel: current.projectModel || current.settings.selectedModel || 'gpt-5.4-mini', projectPackage: current.projectPackage || packageForModel(current.projectModel || current.settings.selectedModel || 'gpt-5.4-mini').id, paid: false, paymentEstimate: null, reviewAssets: [], availableProjects: listProjects(email), phase: 'new_details' }));
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
      designRecommendations: [],
      designRecommendationStatus: 'idle',
      reviewAssets: [],
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
      designRecommendations: [],
      designRecommendationStatus: 'idle',
      reviewAssets: [],
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
      phase: 'assets',
      activeEmployee: 'pm',
      progress: Math.max(current.progress || 0, 6),
      progressTask: 'Optional project files',
      designRecommendationStatus: current.designRecommendations?.length ? 'ready' : 'idle',
    }));
    setModal('assetUpload');
    addConvo('Nova', 'Payment received. Rin will ask for optional project files before design starts.');
    speak('pm', 'Payment received. You can optionally upload images, logos, copy notes, menus, PDFs, or documents for the team. If you do not have any files, skip this and Mira will prepare design options.', ['openAssetUpload']);
  }, [addConvo, speak, update]);

  const buildContext = useCallback((keys) => {
    const current = stateRef.current;
    return keys.map((key) => `## ${outputNames[key] || key}\n${current.outputs[key] || ''}`).filter(Boolean).join('\n\n---\n\n').slice(-30000);
  }, []);

  const generateDesignRecommendations = useCallback(async (force = false) => {
    const current = stateRef.current;
    if (!force && current.designRecommendations?.length) return current.designRecommendations;
    update((stateNow) => ({
      ...stateNow,
      phase: 'design_options',
      activeEmployee: 'design',
      designRecommendationStatus: 'loading',
      progressTask: 'Preparing design recommendations',
    }));
    speak('design', 'I am reviewing the brief and asking the model to recommend the strongest design routes.');
    try {
      const raw = await callModelInBackground({
        employee: employees.design,
        task: designRecommendationsTask(current),
        context: buildContext(['Plan', 'TaskBoard']),
        settings: current.settings,
        state: current,
        complex: true,
      });
      const recommendations = normalizeDesignRecommendations(raw, current, 4);
      update((stateNow) => ({
        ...stateNow,
        designRecommendations: recommendations,
        designRecommendationStatus: 'ready',
        progressTask: 'Choose design direction',
      }));
      log('Mira Sol', recommendations[0]?.source === 'llm'
        ? 'LLM design recommendations prepared from the client brief.'
        : 'Fallback design recommendations used because the LLM response could not be used.');
      speak('design', 'I have prepared recommended directions from the brief. Compare them and choose the route you like.');
      return recommendations;
    } catch (error) {
      const recommendations = fallbackDesignRecommendations(current, 4);
      update((stateNow) => ({
        ...stateNow,
        designRecommendations: recommendations,
        designRecommendationStatus: 'fallback',
        progressTask: 'Choose design direction',
      }));
      log('Mira Sol', `Fallback design recommendations used after model error: ${error?.message || error}`);
      speak('design', 'I could not get model recommendations this time, so I prepared safe design routes from the brief.');
      return recommendations;
    }
  }, [buildContext, log, speak, update]);

  const skipAssetUpload = useCallback(() => {
    update((current) => ({
      ...current,
      phase: 'design_options',
      activeEmployee: 'design',
      progressTask: current.designRecommendations?.length ? 'Choose design direction' : 'Preparing design recommendations',
    }));
    setModal('designOptions');
    addConvo('Nova', stateRef.current.reviewAssets?.length ? 'Project files saved. Mira will use them for design recommendations.' : 'File upload skipped. Mira will continue from the brief.');
    speak('design', 'I have the brief and any uploaded files. I will prepare design directions with colour palettes for you to choose from.', ['openDesignOptions']);
    window.setTimeout(() => generateDesignRecommendations(), 50);
  }, [addConvo, generateDesignRecommendations, speak, update]);

  const openDesignOptions = useCallback(() => {
    update((current) => ({ ...current, phase: 'design_options', activeEmployee: 'design', progressTask: current.designRecommendations?.length ? 'Choose design direction' : 'Preparing design recommendations' }));
    setModal('designOptions');
    window.setTimeout(() => {
      const current = stateRef.current;
      if (!current.designRecommendations?.length && current.designRecommendationStatus !== 'loading') {
        generateDesignRecommendations();
      }
    }, 50);
  }, [generateDesignRecommendations, update]);

  useEffect(() => {
    const current = stateRef.current;
    if (modal !== 'designOptions') return;
    if (current.designRecommendations?.length || current.designRecommendationStatus === 'loading') return;
    generateDesignRecommendations();
  }, [generateDesignRecommendations, modal]);

  const selectDesignStyle = useCallback((layoutId, palette = [], structure = {}) => {
    const layout = siteLayouts.find((item) => item.id === layoutId) || siteLayouts[0];
    const selectedDesign = buildDesignSelectionMarkdown(layout, palette, structure);
    const recommendationNote = structure.recommendation
      ? [
        '',
        'LLM recommendation:',
        `Name: ${structure.recommendation.name}`,
        `Rationale: ${structure.recommendation.rationale}`,
        `Source: ${structure.recommendation.source === 'llm' ? 'Mira model recommendation' : 'Mira fallback recommendation'}`,
      ].join('\n')
      : '';
    update((current) => ({
      ...current,
      selectedDesignStyle: layout.id,
      selectedDesignPalette: palette,
      selectedSitePages: structure.pages || [],
      selectedSiteSections: structure.sections || [],
      outputs: { ...current.outputs, SelectedDesign: `${selectedDesign}${recommendationNote}` },
      activeOutput: 'SelectedDesign',
      phase: 'running',
      progress: Math.max(current.progress || 0, 8),
      progressTask: 'Design direction selected',
    }));
    const selectedName = structure.recommendation?.name || layout.name;
    addConvo('Nova', `${selectedName} selected as the design direction.`);
    log('Client', `Selected design direction: ${selectedName}`);
    speak('design', `${selectedName} selected. I will now turn that direction into the final design plan before Kai builds the site.`);
    setModal(null);
    window.setTimeout(() => startAgency(), 50);
  }, [addConvo, log, speak, update]);

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

    let output = step.key === 'WebsiteHTML' ? cleanWebsiteOutput(result, current) : String(result || '').trim();
    if (step.key === 'DesignDirection' && !hasUsefulDesignDirection(output)) {
      output = fallbackDesignDirection(current);
      log(employee.name, 'Design direction fallback used because the returned output was incomplete.');
    }
    if (step.key === 'WebsiteHTML' && (!isCompleteHtml(output) || !hasRequiredSiteStructure(output, current) || !hasResponsiveMobileNav(output) || hasPreviewLanguage(output))) {
      output = fallbackWebsiteHtml(current);
      log(employee.name, 'Website preview fallback used because the returned HTML was incomplete, missed required pages, missed mobile navigation, or used preview wording.');
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
    const revisionPalette = paletteFromRevision(changeText);
    update((current) => ({
      ...current,
      phase: 'running',
      running: true,
      approved: false,
      revisionCount,
      selectedDesignPalette: revisionPalette || current.selectedDesignPalette,
      activeEmployee: 'design',
      progressTask: 'Design revision',
    }));
    log('Client', `Requested preview changes: ${changeText}`);
    speak('design', 'Got it. I am taking the revision back through design first, then Kai will rebuild the preview.');
    try {
      aborter.current = new AbortController();
      if (!stateRef.current.outputs.PageContent) await producePageContent();
      const assetContext = reviewAssetsPrompt(stateRef.current.reviewAssets || []);
      await runStep({
        key: 'DesignDirection',
        employee: 'design',
        progress: 56,
        quest: `Design revision ${revisionCount}`,
        replace: true,
        contextKeys: ['Plan', 'TaskBoard', 'SelectedDesign', 'DesignDirection', 'PageContent', 'WebsiteHTML'],
        task: `Think like the visual designer reviewing an existing customer website. Use the original selected design, the previous design direction, the current page content, and the current website output as context. Client revision request: "${changeText}". ${revisionPalette ? `The client asked for a full colour-scheme change. Use this exact palette across the whole site: ${revisionPalette.join(', ')}.` : ''}${assetContext ? `\n\nClient supplied files and context:\n${assetContext}` : ''}\n\nReturn an updated REVISION DESIGN PLAN for the developer. Include: 1. what changes, 2. what stays, 3. exact colour tokens for text, primary, background, accent, and surface, 4. content/copy changes required, 5. image changes required, 6. page-by-page developer instructions, 7. mobile/accessibility checks. Be specific enough that Kai can rebuild the website without guessing.`,
      });
      const revisedOutput = await runStep({
        key: 'WebsiteHTML',
        employee: 'dev',
        progress: 70,
        quest: `Preview revision ${revisionCount}`,
        complex: true,
        replace: true,
        contextKeys: ['Plan', 'TaskBoard', 'DesignDirection', 'PageContent', 'WebsiteHTML'],
        task: stateRef.current.projectPackage === 'launch'
          ? `Implement the revised DesignDirection exactly. The DesignDirection is Mira's revision plan and is the source of truth. Client revision request: "${changeText}". ${revisionPalette ? `Apply this exact palette across the whole site: ${revisionPalette.join(', ')}. Update CSS variables, Bootstrap overrides, buttons, links, cards, nav, backgrounds, borders, headings, and forms so no old scheme remains.` : ''}${assetContext ? `\n\nClient supplied files and context:\n${assetContext}` : ''}\n\nReturn only the complete corrected single-file HTML starting with <!doctype html>. Keep previous good parts that Mira kept, rebuild every requested part, and ensure responsive accessible markup. Use Bootstrap 5.3 CSS and bootstrap.bundle JS, and keep a Bootstrap responsive navbar with navbar-toggler/collapse so mobile shows a hamburger menu.`
          : `Implement the revised DesignDirection exactly. The DesignDirection is Mira's revision plan and is the source of truth. Client revision request: "${changeText}". ${revisionPalette ? `Apply this exact palette across every file in the site: ${revisionPalette.join(', ')}. Update CSS variables, Bootstrap overrides, buttons, links, cards, nav, backgrounds, borders, headings, and forms so no old scheme remains.` : ''}${assetContext ? `\n\nClient supplied files and context:\n${assetContext}` : ''}\n\nReturn JSON only with kind "microagency-site-package-v1", entry "index.html", and a files object containing one separate full HTML document per approved page. Keep normal file links such as href="about.html" and href="contact.html"; do not use hash routes or #/ routes. Use Bootstrap 5.3 CSS and bootstrap.bundle JS in every file, and keep a Bootstrap responsive navbar with navbar-toggler/collapse so mobile shows a hamburger menu.`,
      });
      if (revisionPalette) {
        const paletteOutput = applyPaletteToWebsiteOutput(revisedOutput, revisionPalette);
        update((current) => ({
          ...current,
          outputs: { ...current.outputs, WebsiteHTML: paletteOutput },
          activeOutput: 'WebsiteHTML',
          selectedDesignPalette: revisionPalette,
        }));
      }
      update((current) => ({ ...current, phase: 'approval', running: false, progress: 70, progressTask: 'Preview approval' }));
      speak('dev', 'Updated preview is ready. Check it, then approve or request another change.', ['openPreview', 'approve']);
      addConvo('Nova', 'Updated preview ready for approval.');
      setModal('websitePreview');
    } catch (error) {
      handleRunError(error);
    }
  }, [addConvo, handleRunError, log, notify, producePageContent, runStep, speak, update]);

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
    if (current.phase === 'assets') {
      update((stateNow) => ({ ...stateNow, phase: 'assets', activeEmployee: 'pm', progressTask: 'Optional project files' }));
      speak('pm', 'You can upload optional project files now, or skip this step and move to design.', ['openAssetUpload']);
      setModal('assetUpload');
      return;
    }
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
    update((current) => {
      const outputs = current.phase === 'approval' && (client.clientDetails || client.brief)
        ? { ...current.outputs, PageContent: '' }
        : current.outputs;
      return { ...current, ...client, outputs, brief: client.clientDetails || client.brief || current.brief };
    });
    notify('Client info saved.');
  }, [notify, update]);

  const addReviewAssets = useCallback((assets = []) => {
    const cleanAssets = assets
      .filter((asset) => asset?.name && (asset.dataUrl || asset.text))
      .map((asset) => ({
        id: asset.id || `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        name: asset.name,
        type: asset.type || 'application/octet-stream',
        size: asset.size || 0,
        dataUrl: asset.dataUrl || '',
        text: asset.text || '',
        addedAt: new Date().toISOString(),
      }));
    if (!cleanAssets.length) return;
    update((current) => ({
      ...current,
      reviewAssets: [...(current.reviewAssets || []), ...cleanAssets].slice(-30),
    }));
    notify(`${cleanAssets.length} file${cleanAssets.length === 1 ? '' : 's'} added.`);
  }, [notify, update]);

  const removeReviewAsset = useCallback((assetId) => {
    update((current) => ({
      ...current,
      reviewAssets: (current.reviewAssets || []).filter((asset) => asset.id !== assetId),
    }));
    notify('File removed.');
  }, [notify, update]);

  const updateWebsitePageHtml = useCallback((fileName, html) => {
    update((current) => ({
      ...current,
      outputs: {
        ...current.outputs,
        WebsiteHTML: updateWebsiteOutputFile(current.outputs.WebsiteHTML || '', fileName, html),
      },
      activeOutput: 'WebsiteHTML',
      approved: false,
    }));
    notify('Page updated.');
  }, [notify, update]);

  const replaceWebsiteImage = useCallback((assetId, fileName = 'index.html', scope = 'page') => {
    const current = stateRef.current;
    const asset = (current.reviewAssets || []).find((item) => item.id === assetId);
    if (!asset?.dataUrl || !String(asset.type || '').startsWith('image/')) {
      notify('Choose an uploaded image first.');
      return;
    }
    update((stateNow) => ({
      ...stateNow,
      outputs: {
        ...stateNow.outputs,
        WebsiteHTML: replaceImageInWebsiteOutput(stateNow.outputs.WebsiteHTML || '', asset, fileName, scope),
      },
      activeOutput: 'WebsiteHTML',
      approved: false,
    }));
    notify(scope === 'site' ? 'Image applied across site.' : 'Image applied to page.');
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

  const downloadCurrentOutput = useCallback(async () => {
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
    if (key === 'WebsiteHTML') {
      const sitePackage = parseSitePackage(current.outputs.WebsiteHTML || '');
      if (sitePackage) {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        Object.entries(sitePackage.files).forEach(([fileName, content]) => zip.file(fileName, content));
        const blob = await zip.generateAsync({ type: 'blob' });
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = `${safeFileName(current.projectName || current.email || 'website')}.zip`;
        document.body.appendChild(anchor);
        anchor.click();
        setTimeout(() => {
          URL.revokeObjectURL(anchor.href);
          anchor.remove();
        }, 100);
        return;
      }
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
    if (current.phase === 'assets') {
      setModal('assetUpload');
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
    skipAssetUpload,
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
    openAssetUpload: () => setModal('assetUpload'),
    openAgencyInfo: () => setModal('agencyInfo'),
    openMenu: (tab = 'status') => {
      setMenuTab(tab);
      setModal('menu');
    },
    closeModal: () => setModal(null),
    setMenuTab,
    setActiveOutput: (key) => update((current) => ({ ...current, activeOutput: key })),
    saveClientEdits,
    addReviewAssets,
    removeReviewAsset,
    updateWebsitePageHtml,
    replaceWebsiteImage,
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
    addReviewAssets,
    processApproval,
    removeReviewAsset,
    replaceWebsiteImage,
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
    skipAssetUpload,
    selectPackage,
    openDesignOptions,
    selectDesignStyle,
    updateWebsitePageHtml,
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

function paletteFromRevision(text) {
  const value = String(text || '').toLowerCase();
  if (/(black\s*(and|&|\+)\s*white|white\s*(and|&|\+)\s*black|monochrome|grayscale|greyscale)/i.test(value)) {
    return normalizePalette(['#0a0a0a', '#111111', '#ffffff', '#404040', '#f7f7f7']);
  }
  const hexColors = String(text || '').match(/#[0-9a-f]{6}\b/ig);
  if (hexColors?.length >= 2) return normalizePalette(hexColors);
  if (/\b(colou?r|palette|scheme|theme|brand)\b/i.test(value)) {
    const namedColors = {
      black: '#0a0a0a',
      white: '#ffffff',
      grey: '#6b7280',
      gray: '#6b7280',
      navy: '#0f172a',
      blue: '#2563eb',
      sky: '#0ea5e9',
      teal: '#14b8a6',
      green: '#16a34a',
      lime: '#84cc16',
      yellow: '#eab308',
      gold: '#b7791f',
      orange: '#f97316',
      red: '#dc2626',
      pink: '#ec4899',
      rose: '#f43f5e',
      purple: '#7c3aed',
      violet: '#8b5cf6',
      brown: '#92400e',
      cream: '#fff7ed',
      beige: '#f5f0e6',
    };
    const matches = Object.entries(namedColors)
      .filter(([name]) => new RegExp(`\\b${name}\\b`, 'i').test(value))
      .map(([, color]) => color);
    if (matches.length >= 2) return normalizePalette(matches);
    if (matches.length === 1) return normalizePalette(['#111827', matches[0], '#ffffff', '#64748b', '#f8fafc']);
  }
  return null;
}

function applyPaletteToWebsiteOutput(output, palette) {
  const colors = normalizePalette(palette);
  const sitePackage = parseSitePackage(output);
  if (sitePackage) {
    const files = Object.fromEntries(Object.entries(sitePackage.files).map(([fileName, html]) => [fileName, applyPaletteToHtml(html, colors)]));
    return createSitePackageString(files, sitePackage.entry);
  }
  return applyPaletteToHtml(output, colors);
}

function applyPaletteToHtml(html, palette) {
  const [ink, accent, bg, secondary, surface] = normalizePalette(palette);
  let value = String(html || '');
  const replacements = [
    ['--ink', ink],
    ['--accent', accent],
    ['--bg', bg],
    ['--secondary', secondary],
    ['--card', surface],
  ];
  replacements.forEach(([name, color]) => {
    value = value.replace(new RegExp(`${name}:\\s*#[0-9a-f]{3,6}`, 'ig'), `${name}:${color}`);
  });
  const override = `:root{--ink:${ink};--accent:${accent};--bg:${bg};--secondary:${secondary};--card:${surface};--bs-body-color:${ink};--bs-body-bg:${bg};--bs-primary:${accent};--bs-secondary:${secondary};--muted:#5f6368;--line:rgba(10,10,10,.14)}html,body{background:var(--bg)!important;color:var(--ink)!important}.site-nav,.navbar{background:color-mix(in srgb,var(--bg) 92%,white)!important;color:var(--ink)!important}.navbar-brand,.nav-link,h1,h2,h3,h4,h5,h6,strong{color:var(--ink)!important}.nav-link.active,.nav-link:hover{background:var(--card)!important;border-color:var(--line)!important;color:var(--ink)!important}.button,.btn-primary,[class*="btn-primary"]{background:var(--accent)!important;border-color:var(--accent)!important;color:#fff!important}.button.secondary,.btn-secondary{background:var(--ink)!important;border-color:var(--ink)!important;color:var(--bg)!important}.card,.panel,.tag,.input,.form-control,.accordion-item,.list-group-item{background:var(--card)!important;color:var(--ink)!important;border-color:var(--line)!important}.page-kicker,.eyebrow,a:not(.button):not(.btn){color:var(--accent)!important}.hero,.section,main,header,footer{background-color:transparent!important}`;
  if (/<\/style>/i.test(value)) return value.replace(/<\/style>/i, `${override}</style>`);
  return value.replace(/<\/head>/i, `<style>${override}</style></head>`);
}

function updateWebsiteOutputFile(output, fileName, html) {
  const sitePackage = parseSitePackage(output);
  if (sitePackage) {
    const targetFile = sitePackage.files[fileName] ? fileName : sitePackage.entry;
    return createSitePackageString({ ...sitePackage.files, [targetFile]: html }, sitePackage.entry);
  }
  return html;
}

function replaceImageInWebsiteOutput(output, asset, fileName, scope) {
  const sitePackage = parseSitePackage(output);
  if (sitePackage) {
    const files = Object.fromEntries(Object.entries(sitePackage.files).map(([name, html]) => {
      if (scope !== 'site' && name !== fileName) return [name, html];
      return [name, replaceFirstImageSource(html, asset)];
    }));
    return createSitePackageString(files, sitePackage.entry);
  }
  return replaceFirstImageSource(output, asset);
}

function replaceFirstImageSource(html, asset) {
  const alt = asset.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
  const replacement = `<img src="${asset.dataUrl}" alt="${escapeHtmlAttr(alt)}">`;
  if (/<img\b[^>]*>/i.test(html)) {
    return String(html || '').replace(/<img\b[^>]*>/i, replacement);
  }
  return String(html || '').replace(/<\/main>/i, `<section class="section"><img src="${asset.dataUrl}" alt="${escapeHtmlAttr(alt)}" style="width:100%;border-radius:20px"></section></main>`);
}

function escapeHtmlAttr(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
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
      : '- Build separate HTML files for each page: index.html for Home, then files such as services.html, about.html, and contact.html. Navigation should use normal .html file links, not hash routes.',
    '- Use dummy production copy where the brief is missing specifics.',
    '- Include local placeholder imagery where useful.',
    '- Keep forms, buttons, headings, and section ids accessible.',
  ].join('\n');
}

function hasUsefulDesignDirection(text) {
  const value = String(text || '').trim();
  return value.length > 160 && /visual|layout|section|colour|color|responsive|cta|navigation/i.test(value);
}

function cleanWebsiteOutput(result, state) {
  const value = String(result || '').trim();
  const sitePackage = parseSitePackage(value);
  if (state.projectPackage !== 'launch' && sitePackage) return JSON.stringify(sitePackage, null, 2);
  return cleanHTML(value);
}

function isCompleteHtml(html) {
  const sitePackage = parseSitePackage(html);
  if (sitePackage) {
    return Object.values(sitePackage.files).every((value) => isCompleteHtmlDocument(value));
  }
  return isCompleteHtmlDocument(html);
}

function isCompleteHtmlDocument(html) {
  const value = String(html || '').trim();
  return /^<!doctype html/i.test(value)
    && /<html[\s>]/i.test(value)
    && /<body[\s>]/i.test(value)
    && /<\/body>/i.test(value)
    && /<\/html>/i.test(value);
}

function hasRequiredSiteStructure(html, state) {
  const sitePackage = parseSitePackage(html);
  if (state.projectPackage !== 'launch') {
    if (!sitePackage) return false;
    return hasRequiredSiteFiles(sitePackage, state);
  }
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
    const expectedHref = `href="#${slug}"`;
    return hasHtmlId(value, slug) && value.includes(expectedHref);
  });
}

function hasRequiredSiteFiles(sitePackage, state) {
  const selectedPages = Array.isArray(state.selectedSitePages) && state.selectedSitePages.length
    ? state.selectedSitePages
    : ['Home', 'Services', 'About', 'FAQ', 'Contact'];
  const pages = [...new Set(['Home', ...selectedPages].map((page) => String(page || '').trim()).filter(Boolean))];
  return pages.every((page) => {
    const fileName = fileNameForPage(page);
    const html = sitePackage.files[fileName] || '';
    if (!isCompleteHtmlDocument(html) || !/<nav[\s>]/i.test(html)) return false;
    const value = html.toLowerCase();
    return pages.every((navPage) => value.includes(`href="${fileNameForPage(navPage)}"`));
  }) && !Object.values(sitePackage.files).some((html) => /href="#\/|href="#[a-z0-9-]+"/i.test(html));
}

function hasResponsiveMobileNav(html) {
  const sitePackage = parseSitePackage(html);
  const documents = sitePackage ? Object.values(sitePackage.files) : [html];
  return documents.every((documentHtml) => {
    const value = String(documentHtml || '').toLowerCase();
    return value.includes('navbar-toggler')
      && value.includes('data-bs-toggle="collapse"')
      && value.includes('navbar-collapse')
      && value.includes('bootstrap');
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
