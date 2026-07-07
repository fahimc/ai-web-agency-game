import React from 'react';
import { ChatDock } from './components/ChatDock.jsx';
import { DetailsModal } from './components/DetailsModal.jsx';
import { Hud } from './components/Hud.jsx';
import { MenuModal } from './components/MenuModal.jsx';
import { OfficeScene } from './components/OfficeScene.jsx';
import { OutputsModal } from './components/OutputsModal.jsx';
import { PauseModal } from './components/PauseModal.jsx';
import { Toast } from './components/Toast.jsx';
import { WorkerModal } from './components/WorkerModal.jsx';
import { useAgencyController } from './hooks/useAgencyController.js';
import { needsChat } from './utils/text.js';

export function App() {
  const { state, actions, modal, menuTab, toast, phaseLabel } = useAgencyController();
  const chatOpen = needsChat(state);

  return (
    <div className={`app ${chatOpen ? 'chat-open' : ''}`}>
      <Hud state={state} phaseLabel={phaseLabel} actions={actions} />
      <main className="stage-shell">
        <OfficeScene state={state} actions={actions} phaseLabel={phaseLabel} />
      </main>
      <ChatDock state={state} onSubmit={actions.submitChat} />
      {modal === 'menu' && <MenuModal state={state} actions={actions} menuTab={menuTab} phaseLabel={phaseLabel} />}
      {modal === 'details' && <DetailsModal state={state} actions={actions} />}
      {modal === 'outputs' && <OutputsModal state={state} actions={actions} />}
      {modal === 'pause' && <PauseModal state={state} actions={actions} />}
      {modal === 'worker' && <WorkerModal state={state} actions={actions} />}
      <Toast message={toast} />
    </div>
  );
}
