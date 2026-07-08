import React from 'react';
import { AgencyInfoModal } from './components/AgencyInfoModal.jsx';
import { AssetUploadModal } from './components/AssetUploadModal.jsx';
import { ChatDock } from './components/ChatDock.jsx';
import { DesignOptionsModal } from './components/DesignOptionsModal.jsx';
import { DetailsModal } from './components/DetailsModal.jsx';
import { Hud } from './components/Hud.jsx';
import { MenuModal } from './components/MenuModal.jsx';
import { OfficeScene } from './components/OfficeScene.jsx';
import { OutputsModal } from './components/OutputsModal.jsx';
import { PackageModal } from './components/PackageModal.jsx';
import { PauseModal } from './components/PauseModal.jsx';
import { PaymentModal } from './components/PaymentModal.jsx';
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
      {modal === 'agencyInfo' && <AgencyInfoModal actions={actions} />}
      {modal === 'menu' && <MenuModal state={state} actions={actions} menuTab={menuTab} phaseLabel={phaseLabel} />}
      {modal === 'designOptions' && <DesignOptionsModal state={state} actions={actions} />}
      {modal === 'details' && <DetailsModal state={state} actions={actions} />}
      {modal === 'packages' && <PackageModal state={state} actions={actions} />}
      {modal === 'outputs' && <OutputsModal state={state} actions={actions} />}
      {modal === 'websitePreview' && <OutputsModal state={state} actions={actions} previewOnly />}
      {modal === 'payment' && <PaymentModal state={state} actions={actions} />}
      {modal === 'assetUpload' && <AssetUploadModal state={state} actions={actions} />}
      {modal === 'pause' && <PauseModal state={state} actions={actions} />}
      {modal === 'worker' && <WorkerModal state={state} actions={actions} />}
      <Toast message={toast} />
    </div>
  );
}
