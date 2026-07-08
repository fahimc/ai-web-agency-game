import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('MicroAgency app error', error, info);
  }

  resetSession() {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('tiny_office_'))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // Ignore storage cleanup errors; reload is still the safest recovery.
    }
    window.location.reload();
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="app-fallback">
        <section className="card">
          <h1>MicroAgency AI</h1>
          <h2>Session recovery needed</h2>
          <p>The browser had trouble opening this saved session. Clear the local session data and reopen the studio.</p>
          <button type="button" className="green" onClick={() => this.resetSession()}>Reset local session</button>
        </section>
      </main>
    );
  }
}
