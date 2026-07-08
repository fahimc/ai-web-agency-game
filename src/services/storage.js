const LS = {
  draft: 'tiny_office_draft_v2',
  last: 'tiny_office_last_email_v2',
  settings: 'tiny_office_settings_v2',
};

export const defaultSettings = {
  fastModel: 'gpt-4.1-mini',
  complexModel: 'gpt-4.1',
  autonomy: 'Balanced',
  selectedModel: 'gpt-5.4-mini',
  usdToGbp: 0.79,
  netlifySiteId: '',
  netlifyToken: '',
};

export function restoreDraft() {
  try {
    const raw = localStorage.getItem(LS.draft);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function restoreSettings() {
  try {
    const raw = localStorage.getItem(LS.settings);
    return raw ? normalizeSettings(JSON.parse(raw)) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  const next = normalizeSettings(settings);
  localStorage.setItem(LS.settings, JSON.stringify(next));
  return next;
}

export function sessionKey(email) {
  return `tiny_office_session_v2_${safeKey(email || 'draft')}`;
}

export function projectSessionKey(email, projectId) {
  return `tiny_office_project_v2_${safeKey(email || 'draft')}_${safeKey(projectId || 'default')}`;
}

export function projectIndexKey(email) {
  return `tiny_office_project_index_v2_${safeKey(email || 'draft')}`;
}

export function saveDraft(state) {
  const persistableProject = isPersistableProject(state);
  const projectId = state.projectId || (persistableProject ? createProjectId() : '');
  const snapshot = {
    projectId,
    projectName: state.projectName || deriveProjectName(state),
    projectModel: state.projectModel,
    projectPackage: state.projectPackage,
    selectedDesignStyle: state.selectedDesignStyle,
    selectedDesignPalette: state.selectedDesignPalette,
    selectedSitePages: state.selectedSitePages,
    selectedSiteSections: state.selectedSiteSections,
    designRecommendations: state.designRecommendations || [],
    designRecommendationStatus: state.designRecommendationStatus || 'idle',
    reviewAssets: state.reviewAssets || [],
    paid: state.paid,
    paymentEstimate: state.paymentEstimate,
    phase: state.phase,
    userName: state.userName,
    email: state.email,
    clientDetails: state.clientDetails,
    brief: state.brief,
    progress: state.progress,
    progressTask: state.progressTask,
    activeEmployee: state.activeEmployee,
    outputs: state.outputs,
    quests: state.quests,
    logs: state.logs,
    convos: state.convos,
    activeOutput: state.activeOutput,
    error: state.error,
    settings: state.settings,
    running: false,
    approved: state.approved,
    revisionCount: state.revisionCount,
    lastSaved: new Date().toLocaleString(),
  };
  localStorage.setItem(LS.draft, JSON.stringify(snapshot));
  if (snapshot.email && persistableProject) {
    localStorage.setItem(projectSessionKey(snapshot.email, projectId), JSON.stringify(snapshot));
    localStorage.setItem(sessionKey(snapshot.email), JSON.stringify(snapshot));
    upsertProjectIndex(snapshot.email, snapshot);
    localStorage.setItem(LS.last, snapshot.email);
  }
  return snapshot;
}

export function loadSession(email, projectId = '') {
  try {
    const raw = localStorage.getItem(projectId ? projectSessionKey(email, projectId) : sessionKey(email));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function exportProject(email, projectId) {
  return loadSession(email, projectId) || loadSession(email);
}

export function deleteProject(email, projectId) {
  if (!email || !projectId) return false;
  const projects = readProjectIndex(email);
  const nextProjects = projects.filter((project) => project.projectId !== projectId);
  const project = loadSession(email, projectId);
  const legacy = loadSession(email);
  localStorage.removeItem(projectSessionKey(email, projectId));
  if ((legacy?.projectId || 'legacy') === projectId) localStorage.removeItem(sessionKey(email));
  localStorage.setItem(projectIndexKey(email), JSON.stringify(nextProjects));
  return Boolean(project || projects.length !== nextProjects.length);
}

export function listProjects(email) {
  const projects = readProjectIndex(email);
  const legacy = loadSession(email);
  if (legacy) {
    const projectId = legacy.projectId || 'legacy';
    if (!projects.some((project) => project.projectId === projectId)) {
      projects.unshift(projectSummary({ ...legacy, projectId }));
    }
  }
  return projects
    .filter((project) => project.projectId)
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

export function clearDraft() {
  localStorage.removeItem(LS.draft);
}

export function createProjectId() {
  return `project_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function readProjectIndex(email) {
  try {
    const raw = localStorage.getItem(projectIndexKey(email));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function upsertProjectIndex(email, snapshot) {
  const projects = readProjectIndex(email);
  const summary = projectSummary(snapshot);
  const next = [summary, ...projects.filter((project) => project.projectId !== summary.projectId)].slice(0, 30);
  localStorage.setItem(projectIndexKey(email), JSON.stringify(next));
}

function projectSummary(snapshot) {
  return {
    projectId: snapshot.projectId || 'legacy',
    projectName: snapshot.projectName || deriveProjectName(snapshot),
    phase: snapshot.phase || 'unknown',
    progress: snapshot.progress || 0,
    updatedAt: new Date().toISOString(),
    lastSaved: snapshot.lastSaved || '',
    complete: snapshot.phase === 'complete' || snapshot.progress >= 100,
  };
}

function deriveProjectName(state) {
  const details = String(state.clientDetails || state.brief || '');
  const match = details.match(/Business \/ client name:\s*(.+)/i) || details.match(/Business[^:]*:\s*(.+)/i);
  if (match?.[1]) return match[1].trim().slice(0, 80);
  return state.projectName || 'Static website project';
}

function isPersistableProject(state) {
  return Boolean(
    state.clientDetails
    || state.brief
    || Object.keys(state.outputs || {}).length
    || ['running', 'approval', 'complete', 'error', 'brief'].includes(state.phase),
  );
}

function normalizeSettings(settings = {}) {
  const allowed = Object.keys(defaultSettings);
  return allowed.reduce((next, key) => {
    next[key] = settings[key] ?? defaultSettings[key];
    return next;
  }, {});
}

function safeKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
}
