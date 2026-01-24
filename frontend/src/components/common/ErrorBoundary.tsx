import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-500/30">
          <div className="max-w-md w-full text-center space-y-8 relative">
             {/* Background Decoration */}
             <div className="absolute inset-0 -z-10 bg-indigo-500/10 blur-[120px] rounded-full" />
             
             <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-4 animate-pulse">
                <AlertCircle size={48} />
             </div>

             <div className="space-y-4">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">System <span className="text-rose-500">Critical</span></h1>
                <p className="text-slate-400 font-medium leading-relaxed">
                   A catastrophic rendering failure has occurred within the grid. The current workspace has been compromised.
                </p>
             </div>

             <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] text-left overflow-hidden">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-2">Error Log</span>
                <code className="text-xs text-rose-400 font-mono break-all leading-relaxed">
                   {this.state.error?.message || "Unknown anomaly detected"}
                </code>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/20"
                >
                  <RefreshCw size={16} />
                  Reboot System
                </button>
                <Link 
                  to="/"
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform hover:scale-105 active:scale-95"
                  onClick={() => this.setState({ hasError: false })}
                >
                  <Home size={16} />
                  Return to Core
                </Link>
             </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
