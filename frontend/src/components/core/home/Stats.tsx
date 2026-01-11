import AnimatedCounter from "@/components/common/AnimatedCounter";
import ScrollReveal from "@/components/common/ScrollReveal";

const stats = [
  { label: "Problems", value: 1500, suffix: "+" },
  { label: "Active Users", value: 50000, suffix: "+" },
  { label: "Submissions", value: 2, suffix: "M+" },
  { label: "Contests", value: 120, suffix: "+" },
];

export default function Stats() {
  return (
    <section className="bg-gray-900 border-y border-gray-800 py-20 text-gray-100 relative">
      <div className="absolute inset-0 bg-gray-950/50" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {stats.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="h-full p-6 rounded-xl bg-gray-950/40 border border-gray-800 hover:border-indigo-500/50 transition-colors duration-300 flex flex-col items-center justify-center text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 mb-2">
                  <AnimatedCounter from={0} to={s.value} duration={2} />
                  {s.suffix}
                </div>
                <p className="text-gray-400 font-medium tracking-wide uppercase text-xs md:text-sm">
                  {s.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
