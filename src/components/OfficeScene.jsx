import React, { useEffect, useMemo, useRef, useState } from 'react';
import { employees } from '../data/employees.js';
import { outputOrder } from '../data/outputs.js';
import { OfficeCanvasEngine } from '../game/OfficeCanvasEngine.js';
import { phaseLabel as getPhaseLabel } from '../utils/text.js';

export function OfficeScene({ state, actions }) {
  const hostRef = useRef(null);
  const speechRef = useRef(null);
  const gameRef = useRef(null);
  const sceneRef = useRef(null);
  const [speechPos, setSpeechPos] = useState({ left: 16, top: 16, arrowLeft: 48, ready: false });
  const outputCount = outputOrder.filter((key) => state.outputs[key]).length;
  const speechEmployee = employees[state.speech?.employeeId] || employees.reception;
  const speechActions = useMemo(() => actionButtons(state.speech?.actions || [], actions), [actions, state.speech?.actions]);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return undefined;
    const engine = new OfficeCanvasEngine(hostRef.current);
    sceneRef.current = engine;
    gameRef.current = engine;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.max(320, Math.floor(entry.contentRect.width));
      const height = Math.max(320, Math.floor(entry.contentRect.height));
      sceneRef.current?.resize(width, height);
    });
    resizeObserver.observe(hostRef.current);

    return () => {
      resizeObserver.disconnect();
      engine.destroy();
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateFromReact(state);
  }, [state.activeEmployee, state.outputs, state.phase, state.progressTask, state.running]);

  useEffect(() => {
    function onInspect(event) {
      actions.inspectEmployee(event.detail.employeeId);
    }
    window.addEventListener('office-employee-inspect', onInspect);
    return () => window.removeEventListener('office-employee-inspect', onInspect);
  }, [actions]);

  useEffect(() => {
    let frame;
    const sync = () => {
      const pos = sceneRef.current?.getEmployeeScreenPosition(state.speech?.employeeId || state.activeEmployee);
      const host = hostRef.current;
      const bubble = speechRef.current;
      if (pos && host) {
        const bubbleWidth = bubble?.offsetWidth || Math.min(520, host.clientWidth - 32);
        const bubbleHeight = bubble?.offsetHeight || 132;
        const idealLeft = pos.x - bubbleWidth / 2;
        const idealTop = pos.y - bubbleHeight - 20;
        const left = Math.max(12, Math.min(host.clientWidth - bubbleWidth - 12, idealLeft));
        const top = Math.max(12, Math.min(host.clientHeight - bubbleHeight - 96, idealTop));
        setSpeechPos({
          left,
          top,
          arrowLeft: Math.max(28, Math.min(bubbleWidth - 28, pos.x - left)),
          ready: true,
        });
      }
      frame = requestAnimationFrame(sync);
    };
    frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [state.activeEmployee, state.speech?.employeeId]);

  return (
    <section className="office-card game-office-card" aria-label="Virtual office game scene">
      <div className="game-canvas-host" ref={hostRef} />
      <div className="game-vignette" aria-hidden="true" />
      <div className="game-help" aria-hidden="true">Drag to pan | Wheel to zoom | Tap a desk to inspect</div>
      <div
        className="game-speech"
        ref={speechRef}
        role="status"
        aria-live="polite"
        style={speechPos.ready ? { left: `${speechPos.left}px`, top: `${speechPos.top}px`, '--speech-arrow-left': `${speechPos.arrowLeft}px` } : undefined}
      >
        <small>{speechEmployee.name} - {speechEmployee.role}</small>
        <div>{state.speech?.text || 'Welcome.'}</div>
        {speechActions.length > 0 && <div className="speech-actions">{speechActions}</div>}
      </div>
      <div className="quickbar" aria-label="Quick status">
        <div className="quick-chip">Mode: {getPhaseLabel(state.phase).toLowerCase()}</div>
        <div className="quick-chip">Client: {state.email || 'No client loaded'}</div>
        <button type="button" className="quick-chip quick-output-button" onClick={() => actions.openOutputs(state.activeOutput || 'Plan')}>
          <b>{outputCount}</b> outputs
        </button>
      </div>
    </section>
  );
}

function actionButtons(actionIds, actions) {
  const config = {
    returning: { label: 'Returning', onClick: actions.returningCustomer },
    new: { label: 'New customer', onClick: actions.newCustomer },
    openDetails: { label: 'Open form', onClick: actions.openDetails },
    openPackages: { label: 'View packages', onClick: actions.openPackages },
    openPayment: { label: 'Pay now', onClick: actions.openPayment },
    openAssetUpload: { label: 'Project files', onClick: actions.openAssetUpload },
    openDesignOptions: { label: 'See options', onClick: actions.openDesignOptions },
    openPreview: { label: 'Open preview', onClick: actions.openWebsitePreview },
    openOutputs: { label: 'Open outputs', onClick: () => actions.openOutputs() },
    approve: { label: 'Approve', onClick: actions.approve },
    resume: { label: 'Resume work', onClick: actions.resumeWork },
    reset: { label: 'New project', onClick: actions.startFresh },
  };
  return actionIds.map((id) => config[id]).filter(Boolean).map((item) => (
    <button type="button" className="tiny" key={item.label} onClick={item.onClick}>{item.label}</button>
  ));
}
