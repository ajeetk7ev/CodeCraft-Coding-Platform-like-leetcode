import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import ProblemDescription from "@/components/core/problem-view/ProblemDescription";
import CodePanel from "@/components/core/problem-view/CodePanel";
import TestcasePanel from "@/components/core/problem-view/TestcasePanel";
import SubmitResultModal from "@/components/core/problem-view/SubmitResultModal";

import { useProblemStore } from "@/stores/problemStore";
import { useSubmissionStore } from "@/stores/submissionStore";
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

  const {
    runCode,
    submitCode,
    runResult,
    submissionResult,
    cancelPolling,
    runCodeLoading,
    submitCodeLoading,
  } = useSubmissionStore();

  const rootRef = useRef<HTMLDivElement>(null);
  const verticalAreaRef = useRef<HTMLDivElement>(null);

  const [leftWidth, setLeftWidth] = useState(45);
  const [editorHeight, setEditorHeight] = useState(65);
  const [runTestcases, setRunTestcases] = useState<RunTestcase[]>([]);

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    if (submissionResult) {
      setShowSubmitModal(true);
    }
  }, [submissionResult]);

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
      <div className="fixed inset-0 flex items-center justify-center">
        Loading...
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
    <div ref={rootRef} className="fixed inset-0 flex bg-gray-900 text-gray-100">
      {/* LEFT */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="border-r border-gray-800"
      >
        <ProblemDetails problem={problem} />
      </div>

      <div
        onMouseDown={onVerticalMouseDown}
        className="w-1 bg-gray-800 cursor-col-resize"
      />

      {/* RIGHT */}
      <div className="flex-1 overflow-hidden">
        <div ref={verticalAreaRef} className="h-full flex flex-col z-10">
          <div style={{ height: `${editorHeight}%` }}>
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
            />
          </div>

          <div
            onMouseDown={onHorizontalMouseDown}
            className="h-1 z-50 bg-gray-900 cursor-row-resize overflow-y-auto "
          />

          <TestcasePanel
            testcases={problem.testcases}
            examples={problem.examples}
            result={runResult}
            onChange={setRunTestcases}
          />
        </div>
      </div>

      <SubmitResultModal
        open={showSubmitModal}
        result={submissionResult}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
