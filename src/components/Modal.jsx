import React from 'react';

export function Modal({ title, children, onClose, className = '' }) {
  return (
    <div className="overlay show" aria-hidden="false">
      <section className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="secondary tiny" type="button" onClick={onClose}>Close</button>
        </header>
        {children}
      </section>
    </div>
  );
}
