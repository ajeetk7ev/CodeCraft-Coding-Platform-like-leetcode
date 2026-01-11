import StatsCards from "@/components/admin/StatsCards";
import ChartsSection from "@/components/admin/ChartsSection";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-12 pb-12"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight">System Overview</h1>
        <p className="text-slate-400 font-medium">Real-time platform metrics and performance indicators</p>
      </div>

      <StatsCards />

      <div className="pt-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Analytical Insights</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <ChartsSection />
      </div>
    </motion.div>
  );
}
