import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import ProblemDescription from "@/components/core/problem-view/ProblemDescription";
import CodePanel from "@/components/core/problem-view/CodePanel";
import TestcasePanel from "@/components/core/problem-view/TestcasePanel";

import { useProblemStore } from "@/stores/problemStore";

export default function ProblemView() {
  const { slug } = useParams<{ slug: string }>();

  const {
    problem,
    loading,
    error,
    fetchProblemBySlug,
    clearProblem,
  } = useProblemStore();

  const rootRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const verticalAreaRef = useRef<HTMLDivElement>(null);

  const [leftWidth, setLeftWidth] = useState(45); // %
  const [editorHeight, setEditorHeight] = useState(65); // %

  /* ---------------- Fetch problem by slug ---------------- */
  useEffect(() => {
    if (slug) {
      fetchProblemBySlug(slug);
    }

    return () => {
      clearProblem(); // cleanup on unmount / slug change
    };
  }, [slug, fetchProblemBySlug, clearProblem]);

  /* ---------------- Vertical Drag (LEFT ↔ RIGHT) ---------------- */
  const onVerticalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.userSelect = "none";

    const startX = e.clientX;
    const startWidth = leftWidth;
    const containerWidth = rootRef.current!.offsetWidth;

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const next = startWidth + (deltaX / containerWidth) * 100;
      setLeftWidth(Math.min(70, Math.max(25, next)));
    };

    const onMouseUp = () => {
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  /* ---------------- Horizontal Drag (EDITOR ↕ TESTCASE) ---------------- */
  const onHorizontalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.userSelect = "none";

    const startY = e.clientY;
    const startHeight = editorHeight;
    const containerHeight = verticalAreaRef.current!.offsetHeight;

    const onMouseMove = (ev: MouseEvent) => {
      const deltaY = ev.clientY - startY;
      const next = startHeight + (deltaY / containerHeight) * 100;
      setEditorHeight(Math.min(80, Math.max(35, next)));
    };

    const onMouseUp = () => {
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  /* ---------------- Loading / Error States ---------------- */
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950 text-gray-300">
        Loading problem...
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950 text-red-400">
        {error}
      </div>
    );
  }

  if (!problem) return null;

  /* ---------------- Main Layout ---------------- */
  return (
    <div ref={rootRef} className="fixed inset-0 flex bg-gray-950 text-gray-100">
      {/* LEFT PANEL */}
      <div
        className="border-r border-gray-800 overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        <ProblemDescription problem={problem} />
      </div>

      {/* VERTICAL SPLITTER */}
      <div
        onMouseDown={onVerticalMouseDown}
        className="w-1 cursor-col-resize bg-gray-800 hover:bg-gray-700"
      />

      {/* RIGHT PANEL */}
      <div ref={rightRef} className="flex-1 overflow-hidden">
        <div ref={verticalAreaRef} className="h-full flex flex-col">
          {/* CODE PANEL */}
          <div style={{ height: `${editorHeight}%` }}>
            <CodePanel boilerplates={problem.boilerplates} />
          </div>

          {/* HORIZONTAL SPLITTER */}
          <div
            onMouseDown={onHorizontalMouseDown}
            className="h-1 cursor-row-resize bg-gray-800 hover:bg-gray-700 z-50"
          />

          {/* TESTCASE PANEL */}
          <div className="flex-1 overflow-y-auto bg-gray-900 z-40">
            <TestcasePanel
              testcases={problem.testcases}
              examples={problem.examples}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
