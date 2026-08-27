import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl p-8 my-6 bg-rose-500/10 border border-rose-500/30 text-center max-w-xl mx-auto space-y-4">
          <div className="p-3 bg-rose-600 text-white rounded-2xl w-fit mx-auto shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-rose-700 dark:text-rose-300">
            Render Notice: {this.props.title || 'Component Recovering'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {this.state.error?.message || 'Recovering view state. Click below to reload view.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-cyan-500 transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
