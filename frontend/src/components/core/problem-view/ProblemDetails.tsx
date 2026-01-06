import { useState } from "react";
import ProblemTabs from "./ProblemTabs";
import ProblemDescription from "./ProblemDescription";
import type { Problem } from "@/types";

export default function ProblemDetails({problem}:{problem:Problem}) {
  const [active, setActive] = useState("Description");

  return (
    <div className="h-full overflow-y-auto p-6">
      <ProblemTabs active={active} setActive={setActive} />

      {/* Tab Content */}
      <div className="mt-6">
        {active === "Description" && <ProblemDescription problem={problem}/>}
        {active === "Editorial" && <div>Editorial Comming Soon</div>}
        {active === "Solutions" && <div>Solutions Comming Soon</div>}
        {active === "Submissions" && <div>Submissions Content</div>}
      </div>
    </div>
  );
}
