import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('0-Logik ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-mono text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center mb-4 text-cyan-400 text-2xl font-bold shadow-lg shadow-cyan-950">
            π
          </div>
          <h1 className="text-lg font-bold text-white mb-1">PI Studio 0-Logik</h1>
          <p className="text-xs text-cyan-400 mb-3">Automatische Kortex-Wiederherstellung aktiv</p>
          <p className="text-[11px] text-slate-400 max-w-sm mb-4 leading-relaxed">
            Die App läuft stabil. Tippe unten auf &bdquo;Neu laden&ldquo;, um die Anzeige zu synchronisieren.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md active:scale-95 transition"
          >
            App neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
