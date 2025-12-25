import { useRef, useState } from "react";
import ProblemDescription from "@/components/core/problem-view/ProblemDescription";
import CodePanel from "@/components/core/problem-view/CodePanel";
import TestcasePanel from "@/components/core/problem-view/TestcasePanel";

const mockProblem = {
  title: "Reverse Integer",
  difficulty: "medium",
  description:
    "Given a signed 32-bit integer x, return x with its digits reversed.",
  constraints: ["-2^31 <= x <= 2^31 - 1"],
  examples: [
    { input: "x = 123", output: "321", explanation: "Reverse digits" },
    { input: "x = 121", output: "121", explanation: "Palindrome" },
    { input: "x = 435", output: "534", explanation: "Reverse digits" },
  ],
  boilerplates: [
    {
      language: "cpp",
      userCodeTemplate: `class Solution {
public:
    int reverse(int x) {
        
    }
};`,
    },
  ],
  tags: ["math"],
  companyTags: ["Microsoft", "Apple"],
};

export default function ProblemView() {
  const rootRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const verticalAreaRef = useRef<HTMLDivElement>(null);

  const [leftWidth, setLeftWidth] = useState(45); // %
  const [editorHeight, setEditorHeight] = useState(65); // %

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

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 flex bg-gray-950 text-gray-100"
    >
      {/* LEFT PANEL */}
      <div
        className="border-r border-gray-800 overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        <ProblemDescription problem={mockProblem} />
      </div>

      {/* VERTICAL SPLITTER */}
      <div
        onMouseDown={onVerticalMouseDown}
        className="w-1 cursor-col-resize bg-gray-800 hover:bg-gray-700"
      />

      {/* RIGHT PANEL */}
      <div ref={rightRef} className="flex-1 overflow-hidden">
        {/* AREA USED FOR HEIGHT CALCULATION */}
        <div ref={verticalAreaRef} className="h-full flex flex-col">
          {/* CODE PANEL */}
          <div style={{ height: `${editorHeight}%` }}>
            <CodePanel boilerplates={mockProblem.boilerplates} />
          </div>

          {/* HORIZONTAL SPLITTER */}
          <div
            onMouseDown={onHorizontalMouseDown}
            className="h-1 cursor-row-resize bg-gray-800 hover:bg-gray-700 z-50"
          />

          {/* TESTCASE PANEL */}
          <div className="flex-1 overflow-y-auto bg-gray-900 z-40">
            <TestcasePanel testcases={mockProblem.examples} />
          </div>
        </div>
      </div>
    </div>
  );
}
