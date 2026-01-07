// src/components/profile/RecentSolved.tsx
import { recentProblems } from "@/data/profile.mock";

export default function RecentSolved() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Solved Problems</h3>

      <div className="space-y-3">
        {recentProblems.map((p) => (
          <div
            key={p.title}
            className="flex justify-between items-center border-b border-gray-800 pb-2"
          >
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-gray-400">{p.date}</p>
            </div>
            <span
              className={`text-sm font-semibold ${
                p.difficulty === "Easy"
                  ? "text-green-400"
                  : p.difficulty === "Medium"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {p.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
