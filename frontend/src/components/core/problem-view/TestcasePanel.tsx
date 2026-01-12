import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, Clock, ChevronRight } from "lucide-react";

/* ---------- types ---------- */

type Testcase = {
  input: string;
  output?: string;
  isCustom?: boolean;
};

type RunTestcase = {
  stdin: string;
  expectedOutput: string;
};

interface Props {
  testcases: Testcase[];
  result: any;
  onChange: (cases: RunTestcase[]) => void;
}

/* ====================================================== */

import { Plus, X } from "lucide-react";

export default function TestcasePanel({
  testcases,
  result,
  onChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [activeResultCase, setActiveResultCase] = useState(0);

  // Internal state for test cases (merged initial + custom)
  const [internalCases, setInternalCases] = useState<Testcase[]>([]);

  // Initialize internal state from props when they change (new problem)
  useEffect(() => {
    setInternalCases(testcases.map(tc => ({
      input: tc.input || "",
      output: tc.output || "",
      isCustom: false
    })));
    setActiveCase(0);
  }, [testcases]);

  // Sync parent with internal state changes
  useEffect(() => {
    onChange(
      internalCases.map((tc) => ({
        stdin: tc.input,
        expectedOutput: tc.output || "",
      }))
    );
  }, [internalCases, onChange]);

  useEffect(() => {
    if (result) {
      setActiveTab("result");
      setActiveResultCase(0);
    }
  }, [result]);

  const handleAddCase = () => {
    const newCase = { input: "", output: "", isCustom: true };
    setInternalCases([...internalCases, newCase]);
    setActiveCase(internalCases.length); // Switch to new case
  };

  const handleDeleteCase = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newCases = internalCases.filter((_, i) => i !== index);
    setInternalCases(newCases);
    if (activeCase >= index && activeCase > 0) {
      setActiveCase(activeCase - 1);
    }
  };

  const handleInputChange = (value: string) => {
    const newCases = [...internalCases];
    newCases[activeCase] = { ...newCases[activeCase], input: value };
    setInternalCases(newCases);
  };

  const handleOutputChange = (value: string) => {
    const newCases = [...internalCases];
    newCases[activeCase] = { ...newCases[activeCase], output: value };
    setInternalCases(newCases);
  };

  /* ---------- detect result type ---------- */
  const isRunResult = result?.results;
  const overallVerdict = result?.verdict || (isRunResult && result.results.every((r: any) => r.verdict === "ACCEPTED") ? "ACCEPTED" : "FAILED");

  return (
    <div className="flex-1 min-h-0 bg-[#0f172a] flex flex-col text-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center justify-between px-4 border-b border-[#1e293b] bg-[#1e293b] h-12 shrink-0">
        <div className="flex gap-6 h-full">
          {["testcase", "result"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`h-full px-1 text-xs font-semibold uppercase tracking-wider transition-all relative flex items-center ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
            >
              {tab === "testcase" ? "Testcase" : "Test Result"}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                />
              )}
            </button>
          ))}
        </div>

        {activeTab === "result" && result && (
          <div className={`text-xs font-bold px-2 py-0.5 rounded ${overallVerdict === "ACCEPTED" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            }`}>
            {overallVerdict}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative flex flex-col">
        {/* ================= TESTCASES ================= */}
        <AnimatePresence mode="wait">
          {activeTab === "testcase" && (
            <motion.div
              key="testcase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              {/* Case Tabs */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0f172a] overflow-x-auto no-scrollbar shrink-0 border-b border-[#1e293b]/50">
                {internalCases.map((tc, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveCase(idx)}
                    className={`shrink-0 group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${activeCase === idx
                      ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-sm"
                      : "bg-slate-900/50 border-transparent text-gray-500 hover:bg-slate-800 hover:text-gray-300"
                      }`}
                  >
                    <span>Case {idx + 1}</span>
                    {tc.isCustom && (
                      <button
                        onClick={(e) => handleDeleteCase(e, idx)}
                        className={`p-0.5 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors ${activeCase === idx ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={handleAddCase}
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all ml-1"
                  title="Add Custom Test Case"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-8">
                {internalCases.length > 0 ? (
                  <>
                    {/* Input Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest pl-1">
                        <ChevronRight size={12} className="text-indigo-500" />
                        <span>Input</span>
                      </div>
                      <textarea
                        value={internalCases[activeCase]?.input || ""}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-5 py-4 text-gray-200 font-mono text-sm shadow-inner outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none min-h-[120px]"
                        spellCheck={false}
                        placeholder="Enter custom input here"
                      />
                    </div>

                    {/* Expected Output Section */}
                    <div className="space-y-3 pb-6">
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest pl-1">
                        <ChevronRight size={12} className="text-emerald-500" />
                        <span>Expected Output</span>
                      </div>
                      <textarea
                        value={internalCases[activeCase]?.output || ""}
                        onChange={(e) => handleOutputChange(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-5 py-4 text-gray-300 font-mono text-sm shadow-inner outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none min-h-[100px]"
                        placeholder="Optional for custom cases"
                        spellCheck={false}
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3 italic border border-dashed border-gray-800/50 rounded-3xl">
                    <div className="bg-gray-800/20 p-4 rounded-full">
                      <Info size={32} className="text-gray-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium not-italic text-gray-400">No test cases available</p>
                      <button onClick={handleAddCase} className="text-indigo-400 text-xs hover:underline mt-1 font-semibold not-italic">Click here to add one</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= RESULTS ================= */}
          {activeTab === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 border border-dashed border-gray-800/50 m-6 rounded-3xl">
                  <div className="bg-gray-800/20 p-4 rounded-full">
                    <Clock size={32} className="text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">Run your code to see results</span>
                </div>
              ) : (
                <>
                  {/* Result Case Selector */}
                  <div className="flex flex-nowrap gap-2 px-4 py-3 bg-[#0f172a] border-b border-[#1e293b]/50 overflow-x-auto no-scrollbar shrink-0">
                    {isRunResult && result.results.map((r: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveResultCase(idx)}
                        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${activeResultCase === idx
                          ? "bg-slate-700 text-white shadow-lg border-slate-600"
                          : "bg-slate-800/30 text-gray-400 border-transparent hover:bg-slate-800 hover:text-gray-200"
                          }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${r.verdict === "ACCEPTED" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,44,44,0.5)]"
                          }`} />
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Active Result Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    {isRunResult && result.results[activeResultCase] && (() => {
                      const r = result.results[activeResultCase];
                      const isError = r.verdict === "COMPILE_ERROR" || r.verdict === "RUNTIME_ERROR";

                      return (
                        <div className="space-y-6 pb-6">
                          {/* Status Message */}
                          <div className="flex items-center justify-between bg-gray-900/40 p-4 rounded-2xl border border-gray-800/50 shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-xl ${r.verdict === "ACCEPTED" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                                {r.verdict === "ACCEPTED" ? (
                                  <CheckCircle2 className="text-green-500" size={24} />
                                ) : (
                                  <XCircle className="text-red-500" size={24} />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-xl font-black ${r.verdict === "ACCEPTED" ? "text-green-400" : "text-red-400"}`}>
                                  {r.verdict === "ACCEPTED" ? "Accepted" : (r.verdict === "WRONG_ANSWER" ? "Wrong Answer" : r.verdict)}
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Verdict Status</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-end bg-gray-800/40 px-3 py-1.5 rounded-xl border border-gray-700/30">
                                <span className="text-[10px] font-bold text-gray-500 leading-none mb-1">RUNTIME</span>
                                <span className="text-xs font-mono text-gray-300">{r.runtime}ms</span>
                              </div>
                              <div className="flex flex-col items-end bg-gray-800/40 px-3 py-1.5 rounded-xl border border-gray-700/30">
                                <span className="text-[10px] font-bold text-gray-500 leading-none mb-1">MEMORY</span>
                                <span className="text-xs font-mono text-gray-300">{r.memory}KB</span>
                              </div>
                            </div>
                          </div>

                          {/* Error block */}
                          {isError && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-red-400/80 font-bold text-[10px] uppercase tracking-widest pl-1">
                                <XCircle size={12} />
                                <span>Error Message</span>
                              </div>
                              <pre className="text-red-300 text-xs bg-red-950/20 border border-red-900/30 p-5 rounded-2xl overflow-x-auto font-mono leading-relaxed shadow-inner">
                                {r.compileOutput || r.stderr || "Unknown Error Output"}
                              </pre>
                            </div>
                          )}

                          {!isError && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              {/* Input */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest pl-1">
                                  <ChevronRight size={12} />
                                  <span>Input</span>
                                </div>
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl px-5 py-4 font-mono text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap shadow-inner">
                                  {r.input}
                                </div>
                              </div>

                              {/* Expected */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-emerald-500/70 font-bold text-[10px] uppercase tracking-widest pl-1">
                                  <CheckCircle2 size={12} />
                                  <span>Expected Output</span>
                                </div>
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl px-5 py-4 font-mono text-sm text-emerald-400 overflow-x-auto whitespace-pre-wrap shadow-inner">
                                  {r.expectedOutput || <span className="italic opacity-50">None</span>}
                                </div>
                              </div>

                              {/* Actual */}
                              <div className="space-y-3">
                                <div className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest pl-1 ${r.verdict === "ACCEPTED" ? "text-green-500/70" : "text-red-500/70"
                                  }`}>
                                  {r.verdict === "ACCEPTED" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                  <span>Your Output</span>
                                </div>
                                <div className={`border rounded-2xl px-5 py-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap shadow-inner ${r.verdict === "ACCEPTED"
                                  ? "bg-green-500/5 border-green-500/20 text-green-400"
                                  : "bg-red-500/5 border-red-500/20 text-red-400"
                                  }`}>
                                  {r.stdout || <span className="italic opacity-50 text-gray-600">No output</span>}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
