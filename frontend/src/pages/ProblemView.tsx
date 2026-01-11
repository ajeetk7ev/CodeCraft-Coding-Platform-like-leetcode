import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";


import CodePanel from "@/components/core/problem-view/CodePanel";
import TestcasePanel from "@/components/core/problem-view/TestcasePanel";
import SubmitResultModal from "@/components/core/problem-view/SubmitResultModal";

import { useProblemStore } from "@/stores/problemStore";
import { useSubmissionStore } from "@/stores/submissionStore";
import { useAuthStore } from "@/stores/authStore";
import ProblemDetails from "@/components/core/problem-view/ProblemDetails";

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

  useEffect(() => {
    return () => {
      cancelPolling(); // ✅ stop polling when leaving page
    };
  }, []);

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
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0f172a] z-[100]">
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
    <div ref={rootRef} className="fixed inset-0 flex flex-col md:flex-row bg-[#0f172a] text-gray-100">

      {/* MOBILE TABS HEADER (Optional: can be bottom nav too, let's do top for now or bottom) */}
      {/* Going with Mobile Bottom Nav approach or conditional rendering of huge chunks */}

      {/* LEFT PANEL (Problem Details) */}
      {(!isMobile || activeTab === "problem") && !isFullscreen && (
        <div
          style={{ width: isMobile ? "100%" : `${leftWidth}%` }}
          className={`flex flex-col bg-[#0f172a] ${isMobile ? "h-full pb-16" : "border-r border-[#1e293b] h-full"
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
          className={`flex-1 overflow-hidden flex flex-col ${isMobile ? "h-full pb-16" : ""}`}
        >
          <div ref={verticalAreaRef} className="h-full flex flex-col z-10 relative">
            <div style={{ height: isMobile || isFullscreen ? '100%' : `${editorHeight}%` }}>
              <CodePanel
                problemSlug={slug}
                boilerplates={problem.boilerplates}
                runCodeLoading={runCodeLoading}
                submitCodeLoading={submitCodeLoading}
                onRun={(code, language) =>
                  runCode({ slug, code, language, testcases: runTestcases })
                }
                onSubmit={(code, language) =>
                  submitCode({ problemId: problem._id, code, language })
                }
                preferences={problem.preferences}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
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
                  examples={problem.examples}
                  result={runResult}
                  onChange={setRunTestcases}
                />
              </>
            )}

            {/* Mobile Testcase Panel (Always shown below editor in mobile code view, or toggleable? 
                For now, let's keep it hidden or stacked. 
                Stacking might condense the editor too much. 
                Let's put it as a toggle or just stack with fixed ratio for now if space permits, 
                or better: just hide it for MVP mobile or make it a drawer.
                Actually, let's just stack it with 'flex-1' for editor and fixed for testcase or allow scroll.
            */}
            {isMobile && !isFullscreen && (
              <div className="flex-1 border-t border-[#1e293b] min-h-0 bg-[#0f172a]">
                <TestcasePanel
                  testcases={problem.testcases}
                  examples={problem.examples}
                  result={runResult}
                  onChange={setRunTestcases}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      {isMobile && !isFullscreen && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-950 border-t border-gray-800 flex items-center justify-around z-50 pb-safe">
          <button
            onClick={() => setActiveTab("problem")}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === "problem" ? "text-indigo-400" : "text-gray-500"
              }`}
          >
            <span className="text-sm font-medium">Description</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === "code" ? "text-indigo-400" : "text-gray-500"
              }`}
          >
            <span className="text-sm font-medium">Code</span>
          </button>
        </div>
      )}


      <SubmitResultModal
        open={showSubmitModal}
        result={submissionResult}
        onClose={() => {
          setShowSubmitModal(false);
          clearSubmission();
        }}
      />
    </div>
  );
}
