import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { employees } from '../data/employees.js';
import { outputNames, outputOrder } from '../data/outputs.js';
import { completionSteps, previewSteps } from '../data/steps.js';
import { callModelInBackground } from '../services/modelClient.js';
import {
  clearDraft,
  createProjectId,
  defaultSettings,
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
      paid: Boolean(loaded.paid),
      paymentEstimate: loaded.paymentEstimate || null,
      availableProjects: listProjects(email),
      settings: { ...defaultSettings, ...(loaded.settings || {}) },
      running: false,
    };
    update(next);
    if (next.error) {
      speak(next.activeEmployee || 'reception', 'Welcome back. This project was paused, so press Resume work to continue.', ['resume']);
    } else if (next.phase === 'complete') {
      speak('reception', 'Welcome back. This project is complete. Open Outputs whenever you want to review it.', ['openPreview']);
    } else if (next.outputs.WebsiteHTML && !next.approved) {
      update((current) => ({ ...current, phase: 'approval' }));
      speak('dev', 'Welcome back. Your preview is ready for approval. Open Outputs when you want to review it.', ['openPreview', 'approve']);
    } else if (next.brief) {
      update((current) => ({ ...current, phase: ['running', 'brief'].includes(current.phase) ? current.phase : 'running' }));
      speak('reception', 'Welcome back. I found the project in progress. Press Resume work to continue where it left off.', ['resume']);
    } else {
      update((current) => ({ ...current, phase: 'new_details' }));
      speak('reception', 'Welcome back. This project still needs the project form before the team can work.', ['openDetails']);
    }
    setMenuTab('projects');
    setModal('menu');
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
      phase: 'running',
      progressTask: 'Payment received',
    }));
    setModal(null);
    addConvo('Nova', 'Payment received. The team is starting now.');
    speak('reception', 'Payment received. I am handing the brief to the team now.');
    window.setTimeout(() => startAgency(), 50);
  }, [addConvo, speak, update]);

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
    const result = await callModelInBackground({
      employee,
      task: step.task,
      context: buildContext(step.contextKeys || []),
      settings: current.settings,
      state: current,
      signal: aborter.current?.signal,
      complex: Boolean(step.complex),
    });

    const output = step.key === 'WebsiteHTML' ? cleanHTML(result) : String(result || '').trim();
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
    for (const step of previewSteps) await runStep(step);
    update((current) => ({
      ...current,
      phase: 'approval',
      running: false,
      progress: 70,
      progressTask: 'Preview approval',
      activeOutput: 'WebsiteHTML',
    }));
    log('Company', 'Preview ready. Paused for client approval.');
    speak('dev', 'The first preview is ready. Open Outputs to review it, then type approve or tell me the changes.', ['openPreview', 'approve']);
    addConvo('Nova', 'Preview ready. Chat is open for approval or change requests only.');
    setModal('outputs');
  }, [addConvo, log, runStep, speak, update]);

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
      setModal('outputs');
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
      speak('dev', 'Updated preview is ready. Open Outputs to check it, then approve or request another change.', ['openPreview', 'approve']);
      addConvo('Nova', 'Updated preview ready for approval.');
      setModal('outputs');
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
    if (current.outputs.WebsiteHTML && !current.approved) {
      update((stateNow) => ({ ...stateNow, phase: 'approval' }));
      speak('dev', 'Preview is ready. Approve it or request changes.', ['openPreview', 'approve']);
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

  const actions = useMemo(() => ({
    returningCustomer,
    newCustomer,
    resetToChoice,
    startFresh,
    submitChat,
    submitDetails,
    confirmPayment,
    selectPackage,
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
    openDetails: () => setModal('details'),
    openPackages: () => setModal('packages'),
    openPayment: () => setModal('payment'),
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
    approve: () => processApproval('approve'),
    notify,
  }), [
    copyCurrentOutput,
    downloadCurrentOutput,
    exportJSON,
    newCustomer,
    notify,
    openOutputs,
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

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
