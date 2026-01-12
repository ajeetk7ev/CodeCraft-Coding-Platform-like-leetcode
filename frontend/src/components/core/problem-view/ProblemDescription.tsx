import type { Problem } from "@/types";
import DifficultyBadge from "./DifficultyBadge";
export default function ProblemDescription({ problem }: { problem: Problem }) {
  return (
    <div className="h-full overflow-y-auto px-6 pb-20 scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mt-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              {problem.title}
              {problem.isSolved && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Solved
                </div>
              )}
            </h1>
          </div>

          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-gray-800/60 border border-gray-700/50 px-3 py-1 text-xs font-medium text-gray-300 hover:text-white cursor-pointer hover:border-gray-600 transition-colors"
            >
              {tag}
            </span>
          ))}

          {problem.companyTags.map((c) => (
            <span
              key={c}
              className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer"
            >
              {c}
            </span>
          ))}
        </div>

        {/* Description */}
        <div className="prose prose-invert prose-sm max-w-none">
          <div
            className="text-gray-300 leading-relaxed text-[15px]"
            dangerouslySetInnerHTML={{ __html: problem.description }}
          />
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            Examples
          </h3>

          <div className="space-y-4">
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl bg-gray-900/50 border border-gray-800 transition-all hover:border-gray-700"
              >
                <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">Example {i + 1}</span>
                </div>

                <div className="p-4 space-y-3 font-mono text-sm">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold select-none">Input</span>
                    <div className="bg-gray-800/50 p-3 rounded-lg text-gray-200 border border-gray-700/50 shadow-inner">
                      {ex.input}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold select-none">Output</span>
                    <div className="bg-gray-800/50 p-3 rounded-lg text-gray-200 border border-gray-700/50 shadow-inner">
                      {ex.output}
                    </div>
                  </div>

                  {ex.explanation && (
                    <div className="pt-2">
                      <div className="text-xs text-gray-400 leading-relaxed bg-gray-800/20 p-3 rounded-lg border border-gray-800/50">
                        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider mr-2">Explanation:</span>
                        {ex.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-200">Constraints</h3>
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/20 p-4">
            <ul className="space-y-2">
              {problem.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 font-mono bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-500 mt-2" />
                  <span dangerouslySetInnerHTML={{ __html: c }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
