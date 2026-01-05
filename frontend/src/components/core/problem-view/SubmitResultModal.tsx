import { CheckCircle, XCircle, Trophy, X } from "lucide-react";

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
  if (!open || !result) return null;

  const passedCount = result.testcaseResults.filter(
    (t: any) => t.passed
  ).length;

  const total = result.testcaseResults.length;
  const isAccepted = result.verdict === "ACCEPTED";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div
        className={`relative w-105 rounded-2xl border p-6 text-center
        ${
          isAccepted
            ? "bg-emerald-950 border-emerald-500/30"
            : "bg-red-950 border-red-500/30"
        }`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isAccepted ? (
            <CheckCircle
              size={64}
              className="text-emerald-400"
            />
          ) : (
            <XCircle size={64} className="text-red-400" />
          )}
        </div>

        {/* Title */}
        <h2
          className={`text-2xl font-semibold ${
            isAccepted ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {isAccepted
            ? "Solution Accepted!"
            : "Submission Failed"}
        </h2>

        <p className="text-gray-400 mt-2">
          {isAccepted
            ? "Congratulations! Your solution passed all test cases."
            : "Your solution did not pass all test cases."}
        </p>

        {/* Testcase Summary */}
        <div
          className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm
          ${
            isAccepted
              ? "bg-emerald-900 text-emerald-300"
              : "bg-red-900 text-red-300"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          Test Cases: {passedCount}/{total} passed
        </div>

        {/* Runtime / Memory */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-black/30 rounded-xl p-3">
            <div className="text-gray-400 text-sm">
              Runtime
            </div>
            <div className="text-white font-semibold">
              {result.totalRuntime} ms
            </div>
          </div>

          <div className="bg-black/30 rounded-xl p-3">
            <div className="text-gray-400 text-sm">
              Memory
            </div>
            <div className="text-white font-semibold">
              {result.totalMemory} KB
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            className=" bg-emerald-500 hover:bg-emerald-600 text-black  rounded-xl font-medium flex items-center justify-center gap-1 px-2 py-1"
          >
            <Trophy size={18} />
            Solve More Problems
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-xl"
          >
            Continue Coding
          </button>
        </div>
      </div>
    </div>
  );
}
