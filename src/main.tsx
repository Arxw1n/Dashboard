import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 text-center font-['Outfit']">
          <div className="max-w-md w-full bg-[#0e0f15] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-white font-['Orbitron']">Dashboard Notice</h2>
            <p className="text-xs text-slate-400">
              The application encountered an unexpected state. You can reload the page or return to the main dashboard.
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-[11px] text-red-400 font-mono text-left overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('dextercorp_selected_guild');
                    localStorage.removeItem('dextercorp_active_module');
                  } catch {}
                  window.location.href = '/dashboard';
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-3 rounded-xl bg-[#ff2b43] hover:bg-[#e02038] text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);