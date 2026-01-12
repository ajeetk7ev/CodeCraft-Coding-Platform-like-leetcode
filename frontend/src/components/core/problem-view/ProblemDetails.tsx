import { useState } from "react";
import ProblemTabs from "./ProblemTabs";
import ProblemDescription from "./ProblemDescription";
import type { Problem } from "@/types";
import ProblemSubmission from "./ProblemSubmission";

import EditorialTab from "./EditorialTab";
import SolutionsTab from "./SolutionsTab";

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
        {active === "Editorial" && <EditorialTab />}
        {active === "Solutions" && <SolutionsTab />}
        {active === "Submissions" && <ProblemSubmission problemId={problem._id} />}
      </div>
    </div>
  );
}
