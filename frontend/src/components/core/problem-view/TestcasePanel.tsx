import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, Clock, Database, ChevronRight } from "lucide-react";

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

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ================= TESTCASES ================= */}
        <AnimatePresence mode="wait">
          {activeTab === "testcase" && (
            <motion.div
              key="testcase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col overflow-hidden"
            >

              {/* Case Tabs */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0f172a] overflow-x-auto no-scrollbar shrink-0">
                {internalCases.map((tc, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveCase(idx)}
                    className={`shrink-0 group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${activeCase === idx
                      ? "bg-slate-800 border-indigo-500/50 text-white shadow-sm"
                      : "bg-slate-900/50 border-transparent text-gray-400 hover:bg-slate-800 hover:text-gray-200"
                      }`}
                  >
                    <span>Case {idx + 1}</span>
                    {tc.isCustom && (
                      <div
                        onClick={(e) => handleDeleteCase(e, idx)}
                        className={`p-0.5 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors ${activeCase === idx ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        <X size={12} />
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={handleAddCase}
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-gray-700 text-gray-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all"
                  title="Add Custom Test Case"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {internalCases.length > 0 ? (
                  <>
                    {/* Input Section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400 font-medium text-xs">
                        <ChevronRight size={14} className="text-indigo-400" />
                        <span>Input</span>
                      </div>
                      <textarea
                        value={internalCases[activeCase]?.input || ""}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 text-gray-200 font-mono text-sm shadow-inner outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none min-h-[100px]"
                        spellCheck={false}
                        placeholder="Enter custom input here"
                      />
                    </div>

                    {/* Expected Output Section (Editable optionally) */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400 font-medium text-xs">
                        <ChevronRight size={14} className="text-emerald-400" />
                        <span>Expected Output</span>
                      </div>
                      <textarea
                        value={internalCases[activeCase]?.output || ""}
                        onChange={(e) => handleOutputChange(e.target.value)}
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 text-gray-400 font-mono text-sm shadow-inner outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none min-h-[80px]"
                        placeholder="Optional for custom cases"
                        spellCheck={false}
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 italic">
                    <Info size={24} />
                    <span>No test cases available</span>
                    <button onClick={handleAddCase} className="text-indigo-400 text-xs hover:underline">Add one</button>
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
              className="flex-1 flex flex-col overflow-hidden"
            >
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3 border-dashed border-2 border-gray-800/30 m-4 rounded-2xl">
                  <div className="p-4 bg-gray-800/30 rounded-full">
                    <Clock size={32} className="text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">Run your code to see results</span>
                </div>
              ) : (
                <>
                  {/* Result Case Selector */}
                  <div className="flex flex-nowrap gap-2 px-4 py-3 bg-[#0f172a] border-b border-[#1e293b] overflow-x-auto no-scrollbar">
                    {isRunResult && result.results.map((r: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveResultCase(idx)}
                        className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${activeResultCase === idx
                          ? "bg-slate-700 text-white shadow-lg"
                          : "bg-slate-800/50 text-gray-400 hover:bg-slate-800 hover:text-gray-200"
                          }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${r.verdict === "ACCEPTED" ? "bg-green-500" : "bg-red-500"
                          }`} />
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Active Result Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {isRunResult && result.results[activeResultCase] && (() => {
                      const r = result.results[activeResultCase];
                      const isError = r.verdict === "COMPILE_ERROR" || r.verdict === "RUNTIME_ERROR";

                      return (
                        <div className="space-y-6">
                          {/* Status Message */}
                          <div className="flex items-center justify-between bg-gray-800/20 p-3 rounded-xl border border-gray-800/50">
                            <div className="flex items-center gap-3">
                              {r.verdict === "ACCEPTED" ? (
                                <CheckCircle2 className="text-green-500" size={20} />
                              ) : (
                                <XCircle className="text-red-500" size={20} />
                              )}
                              <span className={`text-lg font-bold ${r.verdict === "ACCEPTED" ? "text-green-400" : "text-red-400"
                                }`}>
                                {r.verdict === "ACCEPTED" ? "Passed" : r.verdict}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-tighter">
                              <div className="flex items-center gap-1.5 bg-gray-800/40 px-2 py-1 rounded">
                                <Clock size={12} />
                                <span>{r.runtime}ms</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-gray-800/40 px-2 py-1 rounded">
                                <Database size={12} />
                                <span>{r.memory}KB</span>
                              </div>
                            </div>
                          </div>

                          {/* Error block */}
                          {isError && (
                            <div className="space-y-2">
                              <div className="text-red-400 font-bold text-xs uppercase tracking-widest">Error Output</div>
                              <pre className="text-red-300 text-xs bg-red-950/20 border border-red-900/30 p-4 rounded-xl overflow-x-auto font-mono leading-relaxed">
                                {r.compileOutput || r.stderr || "Unknown Error"}
                              </pre>
                            </div>
                          )}

                          {!isError && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              {/* Input */}
                              <div className="space-y-2">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Input</span>
                                <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                  {r.input}
                                </div>
                              </div>

                              {/* Expected */}
                              <div className="space-y-2">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Expected Output</span>
                                <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 font-mono text-green-400/80 overflow-x-auto whitespace-pre-wrap">
                                  {r.expectedOutput}
                                </div>
                              </div>

                              {/* Actual */}
                              <div className="space-y-2">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Your Output</span>
                                <div className={`border rounded-xl px-4 py-3 font-mono overflow-x-auto whitespace-pre-wrap ${r.verdict === "ACCEPTED"
                                  ? "bg-green-500/5 border-green-500/20 text-green-400"
                                  : "bg-red-500/5 border-red-500/20 text-red-400"
                                  }`}>
                                  {r.stdout || <span className="italic opacity-50">Empty response</span>}
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
