import { useProfileStore } from "@/stores/profileStore";
import { Trophy, Zap, Target, Award, BrainCircuit } from "lucide-react";
import AnimatedCounter from "@/components/common/AnimatedCounter";
import { motion } from "framer-motion";

export default function ProfileStats() {
  const { profile } = useProfileStore();

  if (!profile) return null;

  const { stats } = profile;

  // Calculate difficulty percentages
  const easyP = Math.min((stats.easySolved / 50) * 100, 100); // Target 50 for easy
  const mediumP = Math.min((stats.mediumSolved / 30) * 100, 100); // Target 30 for medium
  const hardP = Math.min((stats.hardSolved / 10) * 100, 100); // Target 10 for hard

  return (
    <div className="space-y-8">
      {/* Main Stats Header Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Global Rank Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative bg-indigo-600 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl shadow-indigo-600/30 group"
        >
          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-8">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm flex items-center gap-2">
                <BrainCircuit size={14} className="text-indigo-200" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{profile.user.rating || 1500} Rating</span>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-white/70 font-bold uppercase tracking-widest text-xs mb-3">Global Ranking</h3>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-black text-white tracking-tighter">
                  {stats.rank ? `#${stats.rank}` : "---"}
                </span>
                <div className="flex flex-col">
                  <span className="text-indigo-200 font-bold text-lg leading-tight">Top 0.8%</span>
                  <span className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-widest">Global Standings</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-white font-bold text-sm tracking-tight text-white/90">Path to Legend</span>
                  <span className="text-[10px] uppercase font-black text-indigo-200/50 tracking-widest">Master Level 4</span>
                </div>
                <span className="text-white font-black text-lg">
                  {stats.totalSolved} <span className="text-sm font-bold text-white/50">/ {stats.totalQuestions || 2500}</span>
                </span>
              </div>
              <div className="h-3 w-full bg-indigo-900/50 rounded-full overflow-hidden p-0.5 border border-white/10 backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stats.totalSolved / (stats.totalQuestions || 2500)) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-white via-indigo-100 to-indigo-200 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Breakdown Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 opacity-50" />

          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Mastery Breakdown</h3>
          </div>

          <div className="space-y-6">
            <StatRow
              color="emerald"
              label="Novice"
              diff="Easy"
              count={stats.easySolved}
              percent={easyP}
              icon={<Zap className="w-4 h-4" />}
            />
            <StatRow
              color="indigo"
              label="Veteran"
              diff="Medium"
              count={stats.mediumSolved}
              percent={mediumP}
              icon={<Target className="w-4 h-4" />}
            />
            <StatRow
              color="rose"
              label="Elite"
              diff="Hard"
              count={stats.hardSolved}
              percent={hardP}
              icon={<Award className="w-4 h-4" />}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-widest">Accuracy: <span className="text-slate-100">84.2%</span></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Consistency: <span className="text-slate-100">High</span></span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatRow({ color, label, diff, count, percent, icon }: any) {
  const colors: any = {
    emerald: "from-emerald-500 to-teal-400 text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    indigo: "from-indigo-500 to-blue-400 text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    rose: "from-rose-500 to-orange-400 text-rose-400 bg-rose-500/10 border-rose-500/20"
  };

  const gradient: any = {
    emerald: "bg-gradient-to-r from-emerald-500 to-teal-500",
    indigo: "bg-gradient-to-r from-indigo-500 to-blue-500",
    rose: "bg-gradient-to-r from-rose-500 to-orange-500"
  };

  return (
    <div className="group/row">
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${colors[color]} group-hover/row:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-slate-100 font-bold tracking-tight">{label}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest opacity-60`}>{diff}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-slate-100"><AnimatedCounter to={count} /></span>
        </div>
      </div>
      <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full ${gradient[color]} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
        />
      </div>
    </div>
  );
}
