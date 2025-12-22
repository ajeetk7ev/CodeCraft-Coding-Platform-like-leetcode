import DotBackground from "./DotBackground";
import TypewriterText from "./TypewriterText";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
      <DotBackground />

      <div className="relative z-10 max-w-4xl text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Master Coding.
          <br />
          <span className="text-yellow-400">
            <TypewriterText />
          </span>
        </h1>

        <p className="mt-6 text-gray-400 text-lg md:text-xl">
          A complete coding platform to <span className="text-gray-200">practice DSA</span>, 
          <span className="text-gray-200"> run code instantly</span>, 
          <span className="text-gray-200"> compete in contests</span>, and 
          <span className="text-gray-200"> crack interviews</span> at top product-based companies.
        </p>

        <p className="mt-4 text-gray-500">
          Built for students, freshers, and developers who want real interview-ready skills — not just theory.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button className="bg-yellow-400 cursor-pointer text-gray-900 hover:bg-yellow-500 font-semibold px-8 py-6 text-lg">
            Start Solving Now
          </Button>

          <Button
            variant="outline"
            className="bg-gray-900 text-gray-300 hover:text-gray-200 hover:bg-gray-800 px-8 py-6 text-lg"
          >
            Explore Problems
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          🚀 1000+ problems • ⚡ Real-time code execution • 🏆 Weekly contests
        </p>
      </div>
    </section>
  );
}
