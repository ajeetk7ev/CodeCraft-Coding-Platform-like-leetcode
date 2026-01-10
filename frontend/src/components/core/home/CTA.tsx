import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/common/ScrollReveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="bg-gray-950 py-24 text-center text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none" />

      <ScrollReveal className="max-w-4xl mx-auto px-6 relative z-10 w-full" width="100%">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Ready to level up your <span className="text-indigo-400">coding skills</span>?
        </h2>
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Join thousands of developers preparing for top tech companies. Start your journey today with our curated problems and contests.
        </p>

        <Button
          asChild
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
        >
          <Link to="/signup">
            Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </ScrollReveal>
    </section>
  );
}
