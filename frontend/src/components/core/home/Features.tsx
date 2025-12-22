import { Code2, Trophy, Cpu, BarChart } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Online Code Editor",
    desc: "Run code instantly with multiple language support.",
  },
  {
    icon: Cpu,
    title: "Real Test Cases",
    desc: "Validate solutions using hidden & edge test cases.",
  },
  {
    icon: Trophy,
    title: "Weekly Contests",
    desc: "Compete with others and improve ranking.",
  },
  {
    icon: BarChart,
    title: "Progress Tracking",
    desc: "Track solved problems & performance.",
  },
];

export default function Features() {
  return (
    <section className="bg-gray-950 py-20 text-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Platform Features
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-indigo-500 transition"
            >
              <f.icon className="text-indigo-400 mb-4" />
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-gray-400 mt-2 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
