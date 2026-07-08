import React, { useEffect, useRef, useState } from 'react';
import { Modal } from './Modal.jsx';
import { packageOption, STATIC_VOUCHER_CODE } from '../utils/pricing.js';

export function PaymentModal({ state, actions }) {
  const [error, setError] = useState('');
  const [voucher, setVoucher] = useState('');
  const [paypalConfig, setPaypalConfig] = useState({ configured: false, clientId: '' });
  const buttonsRef = useRef(null);
  const selectedPackage = packageOption(state.projectPackage);
  const packageId = selectedPackage.id;

  function submitVoucher(event) {
    event.preventDefault();
    const code = voucher.trim().toUpperCase();
    if (code !== STATIC_VOUCHER_CODE) {
      setError('Voucher code was not recognised.');
      return;
    }
    setError('');
    actions.confirmPayment({
      provider: 'voucher',
      voucherCode: code,
      amountGbp: 0,
      packageId,
      modelId: selectedPackage.modelId,
    });
  }

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
              body: JSON.stringify({ packageId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not create PayPal order.');
            return data.id;
          },
          onApprove: async (data) => {
            const response = await fetch('/.netlify/functions/paypal-capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID, packageId }),
            });
            const capture = await response.json();
            if (!response.ok) throw new Error(capture.error || 'Could not capture PayPal order.');
            actions.confirmPayment({
              provider: 'paypal',
              orderId: capture.id,
              amountGbp: capture.amountGbp,
              packageId: capture.packageId || packageId,
              modelId: capture.modelId || selectedPackage.modelId,
            });
          },
          onError: (err) => setError(err?.message || 'PayPal checkout failed.'),
        }).render(buttonsRef.current);
      })
      .catch((err) => setError(err?.message || 'Could not load PayPal checkout.'));
    return () => {
      cancelled = true;
    };
  }, [actions, packageId, paypalConfig.clientId, selectedPackage.modelId]);

  return (
    <Modal title="Project Payment" onClose={actions.closeModal} className="details-modal">
      <div className="modal-body">
        <div className="payment-grid">
          <div className="card">
            <h3>Secure checkout</h3>
            <p><b>{selectedPackage.name}</b> - GBP {selectedPackage.priceGbp}</p>
            <p className="small muted">Includes the selected website generation package and up to 3 revisions.</p>
            {paypalConfig.configured ? <div ref={buttonsRef} /> : (
              <div className="empty">Checkout is temporarily unavailable. Please try again shortly.</div>
            )}
            {error && <p className="small danger-text">{error}</p>}
          </div>
          <form className="card voucher-form" onSubmit={submitVoucher}>
            <h3>Voucher</h3>
            <p className="small muted">Use an approved voucher code to continue without PayPal.</p>
            <label>Voucher code
              <input value={voucher} onChange={(event) => setVoucher(event.target.value)} placeholder="Enter voucher code" />
            </label>
            <button type="submit" className="secondary">Apply voucher</button>
          </form>
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
