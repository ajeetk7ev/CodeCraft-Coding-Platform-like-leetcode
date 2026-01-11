import { CheckCircle2, Trophy, Clock, ChevronRight, Terminal } from "lucide-react";
import { useProfileStore } from "@/stores/profileStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* ---------- Utils ---------- */
function getRelativeTime(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export default function RecentSolved() {
  const { profile } = useProfileStore();
  const navigate = useNavigate();

  if (!profile) return null;

  const { recentProblems } = profile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Terminal className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Recent <span className="text-indigo-400">Activity</span>
            </h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Your Latest Code Conquests</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          All Time: {profile.stats.totalSolved}
        </div>
      </div>

      <div className="space-y-4">
        {recentProblems.length > 0 ? (
          recentProblems.map((p, index) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              key={p.title + p.date}
              onClick={() => navigate(`/problems/${p.title.toLowerCase().replace(/\s+/g, '-')}`)}
              className="group relative flex items-center justify-between bg-slate-950/40 border border-white/5 rounded-[2rem] p-4 pr-6 cursor-pointer hover:bg-slate-900/60 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle Indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-all">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 group-hover:text-indigo-400 transition-colors" />
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 group-hover:text-white transition-colors">
                    {p.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(p.date)}
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-700" />
                    <DifficultyBadge difficulty={p.difficulty} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-600/20 transition-all duration-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-950/20 rounded-[2rem] border border-dashed border-white/5">
            <Terminal className="h-12 w-12 text-slate-800 mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active conquests found</p>
          </div>
        )}
      </div>

      {recentProblems.length > 0 && (
        <button className="w-full mt-10 py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 hover:text-white transition-all">
          View All Submissions
        </button>
      )}
    </motion.div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: any = {
    Easy: "text-emerald-400 bg-emerald-500/10",
    Medium: "text-indigo-400 bg-indigo-500/10",
    Hard: "text-rose-400 bg-rose-500/10"
  };

  return (
    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
