import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Book Scout ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#012415] p-6 text-slate-900 dark:text-slate-100 font-sans">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Application Runtime Diagnostic
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Huntington Book Scout 2.0 &bull; Exception Boundary Intercept
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                An unexpected interface exception occurred. The runtime state has been safely captured to prevent state corruption across banking queues.
              </p>

              {this.state.error && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-rose-700 dark:text-rose-300 overflow-x-auto">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#006738] hover:bg-[#1B5630] text-white text-xs font-bold transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                Attempt View Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
