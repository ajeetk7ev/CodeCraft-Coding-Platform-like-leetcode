import { Code2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center mb-10">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-center items-center gap-3 mb-6"
      >
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Code2 className="text-white h-7 w-7" />
        </div>
        <div className="flex flex-col items-start translate-y-0.5">
          <span className="text-2xl font-black tracking-tighter text-white leading-none">
            CODECRAFT
          </span>
          <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none mt-1.5 ml-0.5">
            Arena
          </span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-3xl font-black text-slate-100 tracking-tight mb-2"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-slate-400 font-medium"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
