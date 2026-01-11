import ChartsSection from "@/components/admin/ChartsSection";
import { motion } from "framer-motion";

export default function Analytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-12 pb-12"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Platform Analytics</h1>
        <p className="text-slate-400 font-medium">Deep dive into submission patterns and solution trends</p>
      </div>

      <div className="pt-4">
        <ChartsSection />
      </div>
    </motion.div>
  );
}
