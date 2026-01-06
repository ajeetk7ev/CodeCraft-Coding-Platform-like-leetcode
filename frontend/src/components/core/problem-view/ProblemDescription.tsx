import type { Problem } from "@/types";
import DifficultyBadge from "./DifficultyBadge";
export default function ProblemDescription({ problem }: { problem: Problem }) {
  return (
    <div className="h-full overflow-y-auto px-6 ">
    
    

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {problem.title}
            </h1>
          </div>

          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gray-700 bg-gray-800/60 px-3 py-1 text-xs text-gray-300"
            >
              {tag}
            </span>
          ))}

          {problem.companyTags.map((c) => (
            <span
              key={c}
              className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400"
            >
              {c}
            </span>
          ))}
        </div>

        {/* Description */}
        <div >
         
          <p className="text-sm leading-relaxed text-gray-300">
            {problem.description}
          </p>
        </div>

        {/* Examples */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-200">
            Examples
          </h3>

          <div className="space-y-4">
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-sm"
              >
                <div className="space-y-2 font-mono text-xs">
                  <div>
                    <span className="text-gray-400">Input:</span>{" "}
                    <span className="text-gray-200">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Output:</span>{" "}
                    <span className="text-gray-200">{ex.output}</span>
                  </div>
                </div>

                {ex.explanation && (
                  <div className="mt-3 border-t border-gray-800 pt-3 text-xs text-gray-400">
                    <span className="font-semibold text-gray-300">
                      Explanation:
                    </span>{" "}
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-200">
            Constraints
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
            {problem.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
