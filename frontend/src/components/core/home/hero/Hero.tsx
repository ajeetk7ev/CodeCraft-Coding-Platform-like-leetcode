import { motion } from "framer-motion";
import { ArrowRight, Code, Terminal, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import TypewriterText from "./TypewriterText";
import DotBackground from "./DotBackground";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-gray-950 text-gray-100 overflow-hidden pt-24">
      {/* Background Elements */}
      <DotBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-gray-950 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 sm:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/50 border border-gray-800 text-sm text-gray-400 mb-6 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Join 10,000+ developers coding daily
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6"
        >
          Master Data Structures
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            & Algorithms
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-12 md:h-16 mb-6 flex items-center justify-center"
        >
          <span className="text-2xl md:text-4xl font-bold text-gray-300 mr-2">
            Learn to
          </span>
          <span className="text-2xl md:text-4xl font-bold text-indigo-400">
            <TypewriterText />
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed"
        >
          The ultimate platform to practice coding problems, compete in contests,
          and prepare for technical interviews at top tech companies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            asChild
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Link to="/problems">
              Start Solving <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-gray-800 bg-gray-900/50 hover:bg-gray-800 text-gray-300 hover:text-gray-200 px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all hover:scale-105"
          >
            <Link to="/contests">View Contests</Link>
          </Button>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-gray-400 text-sm"
        >
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-900/30 border border-gray-800/50">
            <Code className="h-5 w-5 text-indigo-400" />
            <span>1000+ Problems</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-900/30 border border-gray-800/50">
            <Terminal className="h-5 w-5 text-purple-400" />
            <span>Real-time Execution</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-900/30 border border-gray-800/50">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>Weekly Contests</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
