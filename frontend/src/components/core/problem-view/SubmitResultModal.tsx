import { CheckCircle2, XCircle, X, ArrowRight, Activity, Database } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  result: any;
}

export default function SubmitResultModal({
  open,
  onClose,
  result,
}: Props) {
  const [show, setShow] = useState(false);

  console.log("result ", result);
  console.log("open ", open);

  useEffect(() => {
    if (open) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open && !show) return null;
  if (!result) return null;

  const passedCount = result.testcaseResults.filter(
    (t: any) => t.passed
  ).length;

  const total = result.testcaseResults.length;
  const isAccepted = result.verdict === "ACCEPTED";

  // Calculate percentage for progress bar
  const percentage = total > 0 ? (passedCount / total) * 100 : 0;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${open ? "bg-black/80 backdrop-blur-sm" : "bg-black/0 pointer-events-none"
        }`}
    >
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl border bg-[#0a0a0a] shadow-2xl transition-all duration-500 ease-out ${open ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
          } ${isAccepted ? "border-green-500/20 shadow-green-500/10" : "border-red-500/20 shadow-red-500/10"}`}
      >
        {/* Background Gradients */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${isAccepted ? "bg-green-500" : "bg-red-500"
          }`} />
        <div className={`absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none ${isAccepted ? "bg-emerald-500" : "bg-orange-500"
          }`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="relative p-8 text-center">
          {/* Animated Icon */}
          <div className="flex justify-center mb-6">
            <div className={`relative rounded-full p-4 ${isAccepted ? "bg-green-500/10" : "bg-red-500/10"
              }`}>
              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isAccepted ? "bg-green-500" : "bg-red-500"
                }`} />
              {isAccepted ? (
                <CheckCircle2 size={48} className="text-green-400" />
              ) : (
                <XCircle size={48} className="text-red-400" />
              )}
            </div>
          </div>

          {/* Verdict Title */}
          <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isAccepted ? "text-green-400" : "text-red-400"
            }`}>
            {isAccepted ? "Accepted!" : "Wrong Answer"}
          </h2>

          {/* Subtext */}
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {isAccepted
              ? "Congratulations! You passed all test cases."
              : `You passed ${passedCount} out of ${total} test cases.`}
          </p>

          {/* Test Case Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              <span>Test Cases</span>
              <span>{passedCount}/{total}</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isAccepted ? "bg-green-500" : "bg-red-500"
                  }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Activity size={14} />
                <span>Runtime</span>
              </div>
              <div className="text-xl font-mono font-bold text-white">
                {result.totalRuntime} <span className="text-sm font-normal text-gray-500">ms</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Database size={14} />
                <span>Memory</span>
              </div>
              <div className="text-xl font-mono font-bold text-white">
                {result.totalMemory} <span className="text-sm font-normal text-gray-500">KB</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 ${isAccepted
                ? "bg-green-500 hover:bg-green-400 text-black shadow-green-500/20"
                : "bg-white hover:bg-gray-200 text-black shadow-white/10"
                }`}
            >
              {isAccepted ? (
                <>
                  Next Problem <ArrowRight size={18} strokeWidth={2.5} />
                </>
              ) : (
                <>
                  Try Again
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
