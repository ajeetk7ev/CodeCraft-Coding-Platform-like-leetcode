import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";


import CodePanel from "@/components/core/problem-view/CodePanel";
import TestcasePanel from "@/components/core/problem-view/TestcasePanel";
import SubmitResultModal from "@/components/core/problem-view/SubmitResultModal";
import { FileText, Code2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { useProblemStore } from "@/stores/problemStore";
import { useSubmissionStore } from "@/stores/submissionStore";
import { useAuthStore } from "@/stores/authStore";
import ProblemDetails from "@/components/core/problem-view/ProblemDetails";
import ArenaAssistant from "@/components/core/problem-view/ArenaAssistant";

type RunTestcase = {
  stdin: string;
  expectedOutput: string;
};

export default function ProblemView() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  const { problem, loading, error, fetchProblemBySlug, clearProblem } =
    useProblemStore();

  const { fetchUser } = useAuthStore();

  const {
    runCode,
    submitCode,
    runResult,
    submissionResult,
    cancelPolling,
    runCodeLoading,
    submitCodeLoading,
    clear: clearSubmission,
  } = useSubmissionStore();

  const rootRef = useRef<HTMLDivElement>(null);
  const verticalAreaRef = useRef<HTMLDivElement>(null);

  const [leftWidth, setLeftWidth] = useState(45);
  const [editorHeight, setEditorHeight] = useState(65);
  const [runTestcases, setRunTestcases] = useState<RunTestcase[]>([]);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);


  /* -------- mobile detection -------- */
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<"problem" | "code">("problem");
  const [isArenaOpen, setIsArenaOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* -------- fetch problem -------- */
  useEffect(() => {
    if (slug) fetchProblemBySlug(slug);
    return () => clearProblem();
  }, [slug]);

  /* -------- init testcases -------- */
  useEffect(() => {
    if (!problem) return;
    setRunTestcases(
      problem.testcases.map((t) => ({
        stdin: t.input,
        expectedOutput: t.output,
      }))
    );
  }, [problem]);

  /* -------- open submit modal when result received -------- */
  useEffect(() => {
    if (submissionResult) {
      setShowSubmitModal(true);
      if (submissionResult.verdict === "Accepted") {
        fetchUser();
      }
    }
  }, [submissionResult, fetchUser]);

  /* -------- watch for submission errors (e.g. contest timing) -------- */
  const submissionError = useSubmissionStore((state) => state.error);
  useEffect(() => {
    if (submissionError) {
      toast.error(submissionError);
      useSubmissionStore.getState().clear(); // Clear error after showing toast
    }
  }, [submissionError]);

  useEffect(() => {
    return () => {
      cancelPolling(); // ✅ stop polling when leaving page
    };
  }, []);

  /* -------- code context for arena -------- */
  const codeRef = useRef("");
  const languageRef = useRef("c++"); // Default, will be updated by CodePanel

  /* -------- layout drag -------- */
  const onVerticalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    const width = rootRef.current!.offsetWidth;

    const move = (ev: MouseEvent) =>
      setLeftWidth(
        Math.min(
          70,
          Math.max(25, startWidth + ((ev.clientX - startX) / width) * 100)
        )
      );

    document.addEventListener("mousemove", move);
    document.addEventListener(
      "mouseup",
      () => document.removeEventListener("mousemove", move),
      { once: true }
    );
  };

  const onHorizontalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = editorHeight;
    const height = verticalAreaRef.current!.offsetHeight;

    const move = (ev: MouseEvent) =>
      setEditorHeight(
        Math.min(
          80,
          Math.max(35, startHeight + ((ev.clientY - startY) / height) * 100)
        )
      );

    document.addEventListener("mousemove", move);
    document.addEventListener(
      "mouseup",
      () => document.removeEventListener("mousemove", move),
      { once: true }
    );
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0f172a] z-100">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-b-indigo-400/30 animate-pulse" />
        </div>
        <p className="mt-4 text-gray-400 font-medium animate-pulse tracking-wide italic">Preparing Workspace...</p>
      </div>
    );

  if (error)
    return (
      <div className="fixed inset-0 flex items-center justify-center text-red-400">
        {error}
      </div>
    );

  if (!problem) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 flex flex-col bg-[#0f172a] text-gray-100">

      {/* MOBILE TABS HEADER */}
      {isMobile && !isFullscreen && (
        <div className="px-4 py-3 shrink-0 bg-[#0f172a] border-b border-[#1e293b]">
          <div className="flex bg-gray-900/40 p-1 rounded-xl border border-gray-800/50">
            {[
              { id: "problem", label: "Description", icon: FileText },
              { id: "code", label: "Code", icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all border border-transparent ${isActive
                    ? "bg-gray-800 text-white shadow-sm border-gray-700/50"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                    }`}
                >
                  <Icon size={14} className={isActive ? "text-indigo-400" : "text-gray-500"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* LEFT PANEL (Problem Details) */}
        {(!isMobile || activeTab === "problem") && !isFullscreen && (
          <div
            style={{ width: isMobile ? "100%" : `${leftWidth}%` }}
            className={`flex flex-col bg-[#0f172a] ${isMobile ? "h-full" : "border-r border-[#1e293b] h-full"
              }`}
          >
            <ProblemDetails problem={problem} />
          </div>
        )}

        {/* RESIZER (Desktop Only) */}
        {!isMobile && !isFullscreen && (
          <div
            onMouseDown={onVerticalMouseDown}
            className="w-1 bg-[#1e293b] cursor-col-resize hover:bg-slate-700 transition-colors"
          />
        )}

        {/* RIGHT PANEL (Code & Testcases) */}
        {(!isMobile || activeTab === "code") && (
          <div
            className={`flex-1 overflow-hidden flex flex-col h-full`}
          >
            <div ref={verticalAreaRef} className="h-full flex flex-col z-10 relative">
              <div style={{ height: isFullscreen ? '100%' : (isMobile ? '55%' : `${editorHeight}%`) }}>
                <CodePanel
                  problemSlug={slug}
                  boilerplates={problem.boilerplates}
                  runCodeLoading={runCodeLoading}
                  submitCodeLoading={submitCodeLoading}
                  onRun={(code, language) =>
                    runCode({ slug, code, language, testcases: runTestcases })
                  }
                  onSubmit={(code, language) => {
                    const contestId = new URLSearchParams(window.location.search).get("contest") || undefined;
                    submitCode({ problemId: problem._id, code, language, contestId });
                  }}
                  preferences={problem.preferences}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                  isArenaOpen={isArenaOpen}
                  onToggleArena={() => setIsArenaOpen(!isArenaOpen)}
                  onCodeChange={(c) => (codeRef.current = c)}
                  onLanguageChange={(l) => (languageRef.current = l)}
                />
              </div>

              {!isFullscreen && !isMobile && (
                <>
                  <div
                    onMouseDown={onHorizontalMouseDown}
                    className="h-1 z-50 bg-[#0f172a] cursor-row-resize hover:bg-slate-700 transition-colors overflow-y-auto"
                  />
                  <TestcasePanel
                    testcases={problem.testcases}
                    result={runResult}
                    onChange={setRunTestcases}
                  />
                </>
              )}

              {isMobile && !isFullscreen && (
                <div className="flex-1 border-t border-[#1e293b] min-h-0 bg-[#0f172a] overflow-hidden flex flex-col">
                  <TestcasePanel
                    testcases={problem.testcases}
                    result={runResult}
                    onChange={setRunTestcases}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <SubmitResultModal
        open={showSubmitModal}
        result={submissionResult}
        onClose={() => {
          setShowSubmitModal(false);
          clearSubmission();
        }}
      />

      <ArenaAssistant
        isOpen={isArenaOpen}
        onClose={() => setIsArenaOpen(false)}
        problemContext={{
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
        }}
        getCurrentCode={() => codeRef.current}
        getCurrentLanguage={() => languageRef.current}
      />
    </div>
  );
}
