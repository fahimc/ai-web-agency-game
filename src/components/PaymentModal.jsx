import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MODEL_OPTIONS, STATIC_VOUCHER_CODE, estimateAiCost } from '../utils/pricing.js';
import { Modal } from './Modal.jsx';

export function PaymentModal({ state, actions }) {
  const [modelId, setModelId] = useState(state.projectModel || state.settings.selectedModel || MODEL_OPTIONS[0].id);
  const [voucher, setVoucher] = useState('');
  const [error, setError] = useState('');
  const [paypalConfig, setPaypalConfig] = useState({ configured: false, clientId: '' });
  const buttonsRef = useRef(null);
  const estimate = useMemo(() => estimateAiCost(modelId, state.settings.usdToGbp), [modelId, state.settings.usdToGbp]);

  useEffect(() => {
    let cancelled = false;
    fetch('/.netlify/functions/paypal-config')
      .then((response) => response.json())
      .then((config) => {
        if (!cancelled) setPaypalConfig(config);
      })
      .catch(() => {
        if (!cancelled) setPaypalConfig({ configured: false, clientId: '' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!paypalConfig.clientId || !buttonsRef.current) return undefined;
    let cancelled = false;
    buttonsRef.current.innerHTML = '';
    loadPayPal(paypalConfig.clientId)
      .then((paypal) => {
        if (cancelled || !buttonsRef.current) return;
        paypal.Buttons({
          style: { layout: 'vertical', shape: 'pill', label: 'pay' },
          createOrder: async () => {
            const response = await fetch('/.netlify/functions/paypal-create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ modelId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not create PayPal order.');
            return data.id;
          },
          onApprove: async (data) => {
            const response = await fetch('/.netlify/functions/paypal-capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID, modelId }),
            });
            const capture = await response.json();
            if (!response.ok) throw new Error(capture.error || 'Could not capture PayPal order.');
            actions.confirmPayment({ provider: 'paypal', orderId: capture.id, amountGbp: capture.amountGbp || estimate.publicPriceGbp, modelId: capture.modelId || modelId });
          },
          onError: (err) => setError(err?.message || 'PayPal checkout failed.'),
        }).render(buttonsRef.current);
      })
      .catch((err) => setError(err?.message || 'Could not load PayPal checkout.'));
    return () => {
      cancelled = true;
    };
  }, [actions, estimate.publicPriceGbp, modelId, paypalConfig.clientId]);

  function applyVoucher(event) {
    event.preventDefault();
    if (voucher.trim().toUpperCase() !== STATIC_VOUCHER_CODE) {
      setError('Voucher code not recognised.');
      return;
    }
    actions.confirmPayment({ provider: 'voucher', voucherCode: STATIC_VOUCHER_CODE, amountGbp: 0, modelId });
  }

  return (
    <Modal title="Project Payment" onClose={actions.closeModal} className="details-modal">
      <div className="modal-body">
        <div className="payment-grid">
          <div className="card">
            <h3>Choose package</h3>
            <div className="model-price-list">
              {MODEL_OPTIONS.map((model) => {
                const modelEstimate = estimateAiCost(model.id, state.settings.usdToGbp);
                return (
                  <button type="button" className={`model-price-option ${modelId === model.id ? 'active' : ''}`} key={model.id} onClick={() => setModelId(model.id)}>
                    <span>{model.label}</span>
                    <b>&pound;{modelEstimate.publicPriceGbp}</b>
                  </button>
                );
              })}
            </div>
            <p className="small muted">Includes the project build and up to 3 revisions.</p>
          </div>
          <div className="card">
            <h3>Pay with PayPal</h3>
            <p className="price-total">GBP &pound;{estimate.publicPriceGbp}</p>
            <form className="voucher-form" onSubmit={applyVoucher}>
              <label>Voucher code
                <input value={voucher} onChange={(event) => {
                  setVoucher(event.target.value);
                  setError('');
                }} placeholder="Enter voucher code" />
              </label>
              <button type="submit" className="secondary">Apply voucher</button>
            </form>
            {paypalConfig.configured ? <div ref={buttonsRef} /> : (
              <div className="empty">PayPal is not configured yet. Add PayPal credentials to Netlify environment variables.</div>
            )}
            {error && <p className="small danger-text">{error}</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function loadPayPal(clientId) {
  if (window.paypal) return Promise.resolve(window.paypal);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=GBP`;
    script.async = true;
    script.onload = () => window.paypal ? resolve(window.paypal) : reject(new Error('PayPal SDK did not initialise.'));
    script.onerror = () => reject(new Error('Could not load PayPal SDK.'));
    document.head.appendChild(script);
  });
}
