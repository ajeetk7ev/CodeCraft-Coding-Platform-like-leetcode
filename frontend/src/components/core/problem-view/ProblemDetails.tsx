import { useState } from "react";
import ProblemTabs from "./ProblemTabs";
import ProblemDescription from "./ProblemDescription";
import type { Problem } from "@/types";
import ProblemSubmission from "./ProblemSubmission";

export default function ProblemDetails({ problem }: { problem: Problem }) {
  const [active, setActive] = useState("Description");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 shrink-0 z-10 bg-[#0f172a]">
        <ProblemTabs active={active} setActive={setActive} />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        {active === "Description" && <ProblemDescription problem={problem} />}
        {active === "Editorial" && <div className="p-6 text-gray-400">Editorial Coming Soon</div>}
        {active === "Solutions" && <div className="p-6 text-gray-400">Solutions Coming Soon</div>}
        {active === "Submissions" && <ProblemSubmission problemId={problem._id} />}
      </div>
    </div>
  );
}
