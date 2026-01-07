import { CheckCircle } from "lucide-react";
import { useProfileStore } from "@/stores/profileStore";
import { useNavigate } from "react-router-dom";

/* ---------- Utils ---------- */
function getRelativeTime(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

export default function RecentSolved() {
  const { profile } = useProfileStore();
  const navigate = useNavigate();

  if (!profile) return null;

  const { recentProblems } = profile;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">
        Recently Solved Problems
      </h3>

      <div className="space-y-3">
        {recentProblems.length > 0 ? recentProblems.map((p) => (
          <div
            key={p.title + p.date}
            onClick={() => navigate(`/problems/${p.title.toLowerCase().replace(/\s+/g, '-')}`)}
            className="
              flex items-center justify-between
              bg-linear-to-r from-gray-900 to-gray-800
              border border-gray-800
              rounded-lg px-4 py-3
              cursor-pointer
              hover:border-gray-700 hover:bg-gray-800/60
              transition
            "
          >
            {/* Left */}
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />

              <div>
                <p className="font-medium text-gray-100">
                  {p.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {getRelativeTime(p.date)}
                </p>
              </div>
            </div>

            {/* Right – Difficulty Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                ${
                  p.difficulty === "Easy"
                    ? "bg-green-500/10 text-green-400"
                    : p.difficulty === "Medium"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}
            >
              {p.difficulty}
            </span>
          </div>
        )) : (
          <p className="text-gray-400 text-center py-4">No problems solved yet</p>
        )}
      </div>
    </div>
  );
}
