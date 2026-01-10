import { Code2, Trophy, Cpu, BarChart, Zap, Users } from "lucide-react";
import ScrollReveal from "@/components/common/ScrollReveal";
import { motion } from "framer-motion";

const features = [
  {
    icon: Code2,
    title: "Online Code Editor",
    desc: "Run code instantly with support for 15+ programming languages including C++, Java, Python, and JavaScript.",
    color: "text-indigo-400",
  },
  {
    icon: Cpu,
    title: "Real Test Cases",
    desc: "Validate your solutions against comprehensive test suites, including hidden edge cases and performance benchmarks.",
    color: "text-purple-400",
  },
  {
    icon: Trophy,
    title: "Weekly Contests",
    desc: "Compete with thousands of developers globally. Climb the leaderboard and earn badges and rewards.",
    color: "text-yellow-400",
  },
  {
    icon: BarChart,
    title: "Detailed Analytics",
    desc: "Track your progress with granular statistics. Visualize your improvement in algorithms and data structures.",
    color: "text-green-400",
  },
  {
    icon: Zap,
    title: "Fast Execution",
    desc: "Experience lightning-fast code execution in secure, isolated sandboxes designed for low latency.",
    color: "text-blue-400",
  },
  {
    icon: Users,
    title: "Community Discuss",
    desc: "Learn from others. Discuss problems, share optimized solutions, and ask questions in our active forum.",
    color: "text-pink-400",
  },
];

export default function Features() {
  return (
    <section className="bg-gray-950 py-24 text-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <ScrollReveal width="100%">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-6">
              Platform Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Everything you need to master coding interviews and build your career in tech.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -5 }}
                className="group bg-gray-900/40 border border-gray-800 p-8 rounded-2xl hover:bg-gray-900/60 hover:border-gray-700 transition-all duration-300 h-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`p-3 rounded-lg bg-gray-800/50 w-fit mb-6 ${f.color} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="h-6 w-6" />
                </div>

                <h3 className="font-bold text-xl mb-3 text-gray-100 group-hover:text-white transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {f.desc}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
