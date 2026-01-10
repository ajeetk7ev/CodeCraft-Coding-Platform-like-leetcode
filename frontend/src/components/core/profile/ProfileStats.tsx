import { useProfileStore } from "@/stores/profileStore";
import { Trophy, CheckCircle, TrendingUp, Circle } from "lucide-react";
import AnimatedCounter from "@/components/common/AnimatedCounter";

export default function ProfileStats() {
  const { profile } = useProfileStore();

  if (!profile) return null;

  const { stats } = profile;

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rank & Solved Summary */}
        <div className="bg-gradient-to-br from-indigo-900/40 via-gray-900 to-gray-900 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="h-32 w-32 text-indigo-400" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Trophy className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-200">Global Rank</h3>
            </div>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {stats.rank ? `#${stats.rank}` : "N/A"}
              </span>
              <span className="text-sm text-gray-400">Top 1%</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Problem Solving Progress</span>
                <span>
                  <span className="text-white font-bold">{stats.totalSolved}</span>
                  <span className="mx-1">/</span>
                  <span>{stats.totalQuestions ?? 2356}</span> Solved
                </span>
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${Math.min((stats.totalSolved / (stats.totalQuestions || 2356)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Solved Problems Breakdown */}
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg border border-gray-800/50">
            <div className="p-3 rounded-md bg-green-500/10 text-green-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-300">Easy</span>
                <span className="font-bold text-lg text-white"><AnimatedCounter to={stats.easySolved} /></span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }} /> {/* Placeholder percentage */}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg border border-gray-800/50">
            <div className="p-3 rounded-md bg-yellow-500/10 text-yellow-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-300">Medium</span>
                <span className="font-bold text-lg text-white"><AnimatedCounter to={stats.mediumSolved} /></span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-lg border border-gray-800/50">
            <div className="p-3 rounded-md bg-red-500/10 text-red-400">
              <Circle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-300">Hard</span>
                <span className="font-bold text-lg text-white"><AnimatedCounter to={stats.hardSolved} /></span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
