import DifficultyBadge from "./DifficultyBadge";
import ProblemTabs from "./ProblemTabs";

type Problem = {
  title: string;
  difficulty: string;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  tags: string[];
  companyTags: string[];
};

export default function ProblemDescription({
  problem,
}: {
  problem: Problem;
}) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <ProblemTabs />

      <div className="mt-6 space-y-6">
        {/* Title */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-800 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {problem.companyTags.map((c) => (
            <span
              key={c}
              className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full"
            >
              {c}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed">
          {problem.description}
        </p>

       

        {/* Examples */}
        <div>
          <h3 className="font-semibold mb-3">Examples</h3>
          {problem.examples.map((ex, i) => (
            <div
              key={i}
              className=" rounded-lg p-4 text-sm space-y-2"
            >
              <div>
                <b>Input:</b> {ex.input}
              </div>
              <div>
                <b>Output:</b> {ex.output}
              </div>
              <div className="text-gray-400">
                <b>Explanation:</b> {ex.explanation}
              </div>
            </div>
          ))}
        </div>

         {/* Constraints */}
        <div>
          <h3 className="font-semibold mb-2">Constraints</h3>
          <ul className="list-disc list-inside text-sm text-gray-400">
            {problem.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
